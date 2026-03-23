const { requireAuth } = require('./_auth')
const { getPool }     = require('./_db')

const CF_ACCOUNT = process.env.CF_ACCOUNT_ID
const CF_TOKEN   = process.env.CF_API_TOKEN
const BUCKET     = process.env.CF_BUCKET || 'myappart-media'

// Tailles max et types autorisés
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 Mo
const ALLOWED_TYPES  = ['image/jpeg', 'image/png', 'image/webp']

function ok(data, status = 200)  { return { statusCode: status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(data) } }
function err(msg, status = 400)  { return { statusCode: status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: msg }) } }

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return ok({})
  if (event.httpMethod !== 'POST') return err('Méthode non supportée', 405)

  try {
    const user = await requireAuth(event)
    const pool = getPool()

    const { rows: pRows } = await pool.query(
      'SELECT id, role FROM profiles WHERE supabase_uid = $1', [user.id]
    )
    const profile = pRows[0]
    if (!profile) return err('Profil introuvable', 404)
    if (!['proprietaire', 'agence'].includes(profile.role)) return err('Non autorisé', 403)

    const body = JSON.parse(event.body || '{}')
    const { annonce_id, filename, content_type, size, data: base64data, photo_type = 'galerie' } = body

    // Validations
    if (!annonce_id)    return err('annonce_id requis')
    if (!filename)      return err('filename requis')
    if (!base64data)    return err('data (base64) requis')
    if (!ALLOWED_TYPES.includes(content_type)) return err('Type de fichier non autorisé (jpeg, png, webp uniquement)')
    if (size > MAX_SIZE_BYTES) return err('Fichier trop volumineux (5 Mo max)')

    // Vérifier que l'annonce appartient bien au profil
    const { rows: own } = await pool.query(
      'SELECT id FROM annonces WHERE id = $1 AND profile_id = $2', [annonce_id, profile.id]
    )
    if (!own[0]) return err('Non autorisé', 403)

    // Clé R2 : annonces/{annonce_id}/{timestamp}-{filename}
    const ext = filename.split('.').pop().toLowerCase()
    const key = `annonces/${annonce_id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    // Upload vers R2 via API REST Cloudflare
    const buffer = Buffer.from(base64data, 'base64')
    const r2Res  = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/r2/buckets/${BUCKET}/objects/${key}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${CF_TOKEN}`,
          'Content-Type': content_type,
          'Content-Length': buffer.length.toString(),
        },
        body: buffer,
      }
    )

    if (!r2Res.ok) {
      const errBody = await r2Res.text()
      console.error('R2 upload error:', errBody)
      return err('Erreur upload R2', 500)
    }

    // URL publique
    const publicUrl = `https://pub-${CF_ACCOUNT}.r2.dev/${key}`

    // Sauvegarder dans la table photos
    const { rows } = await pool.query(
      `INSERT INTO photos (annonce_id, url, type, ordre)
       VALUES ($1, $2, $3, (SELECT COALESCE(MAX(ordre),0)+1 FROM photos WHERE annonce_id = $1))
       RETURNING *`,
      [annonce_id, publicUrl, photo_type]
    )

    // Si c'est la première photo ou type=principale → mettre à jour annonce
    if (photo_type === 'principale') {
      await pool.query('UPDATE annonces SET updated_at = NOW() WHERE id = $1', [annonce_id])
    }

    return ok({ photo: rows[0], url: publicUrl }, 201)

  } catch (e) {
    console.error('upload error:', e)
    if (e.message === 'Non authentifié' || e.message === 'Token invalide') return err(e.message, 401)
    return err(e.message, 500)
  }
}
