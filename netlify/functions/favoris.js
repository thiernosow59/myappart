const { getPool }    = require('./_db')
const { requireAuth } = require('./_auth')

function ok(data, status = 200)  { return { statusCode: status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(data) } }
function err(msg, status = 400)  { return { statusCode: status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: msg }) } }

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return ok({})
  const pool = getPool()

  try {
    const user = await requireAuth(event)
    const { rows: pRows } = await pool.query('SELECT id FROM profiles WHERE supabase_uid = $1', [user.id])
    if (!pRows[0]) return err('Profil introuvable', 404)
    const profileId = pRows[0].id

    /* ── GET : liste des favoris ── */
    if (event.httpMethod === 'GET') {
      const { rows } = await pool.query(`
        SELECT f.*, a.titre, a.prix, a.commune, a.type_bien, a.transaction, a.reference
        FROM favoris f JOIN annonces a ON a.id = f.annonce_id
        WHERE f.profile_id = $1
        ORDER BY f.created_at DESC
      `, [profileId])
      return ok(rows)
    }

    /* ── POST : toggle favori ── */
    if (event.httpMethod === 'POST') {
      const { annonce_id } = JSON.parse(event.body || '{}')
      if (!annonce_id) return err('annonce_id requis')

      // Si déjà en favori → supprimer
      const { rows: existing } = await pool.query(
        'SELECT id FROM favoris WHERE profile_id = $1 AND annonce_id = $2',
        [profileId, annonce_id]
      )
      if (existing[0]) {
        await pool.query('DELETE FROM favoris WHERE id = $1', [existing[0].id])
        return ok({ action: 'removed' })
      }
      // Sinon → ajouter
      await pool.query('INSERT INTO favoris (profile_id, annonce_id) VALUES ($1,$2)', [profileId, annonce_id])
      return ok({ action: 'added' }, 201)
    }

    return err('Méthode non supportée', 405)
  } catch (e) {
    console.error('favoris error:', e)
    if (e.message === 'Non authentifié' || e.message === 'Token invalide') return err(e.message, 401)
    return err(e.message, 500)
  }
}
