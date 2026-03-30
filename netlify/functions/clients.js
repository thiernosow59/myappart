const { getPool }     = require('./_db')
const { requireAuth } = require('./_auth')

function ok(data, s = 200) { return { statusCode: s, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(data) } }
function err(msg, s = 400) { return { statusCode: s, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: msg }) } }

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return ok({})

  try {
    const user = await requireAuth(event)
    const pool = getPool()

    // Vérifier que l'utilisateur est une agence
    const { rows: pRows } = await pool.query(
      'SELECT id, role FROM profiles WHERE supabase_uid = $1', [user.id]
    )
    const profile = pRows[0]
    if (!profile) return err('Profil introuvable', 404)
    if (profile.role !== 'agence') return err('Réservé aux agences', 403)

    const agence_id = profile.id

    /* ── GET : liste des clients de l'agence ── */
    if (event.httpMethod === 'GET') {
      const { rows } = await pool.query(
        'SELECT * FROM clients_agence WHERE agence_id = $1 ORDER BY nom, prenom',
        [agence_id]
      )
      return ok(rows)
    }

    /* ── POST : créer un client ── */
    if (event.httpMethod === 'POST') {
      const b = JSON.parse(event.body || '{}')
      if (!b.nom?.trim())    return err('Le nom est requis')
      if (!b.prenom?.trim()) return err('Le prénom est requis')

      const { rows } = await pool.query(
        `INSERT INTO clients_agence (agence_id, nom, prenom, phone, email, notes)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [agence_id, b.nom.trim(), b.prenom.trim(), b.phone || null, b.email || null, b.notes || null]
      )
      return ok(rows[0], 201)
    }

    /* ── PUT : modifier un client ── */
    if (event.httpMethod === 'PUT') {
      const b = JSON.parse(event.body || '{}')
      if (!b.id) return err('id requis')

      // Vérifier que le client appartient bien à cette agence
      const { rows: own } = await pool.query(
        'SELECT id FROM clients_agence WHERE id = $1 AND agence_id = $2', [b.id, agence_id]
      )
      if (!own[0]) return err('Non autorisé', 403)

      const { rows } = await pool.query(
        `UPDATE clients_agence SET nom = $1, prenom = $2, phone = $3, email = $4, notes = $5
         WHERE id = $6 RETURNING *`,
        [b.nom?.trim(), b.prenom?.trim(), b.phone || null, b.email || null, b.notes || null, b.id]
      )
      return ok(rows[0])
    }

    /* ── DELETE : supprimer un client ── */
    if (event.httpMethod === 'DELETE') {
      const { id } = JSON.parse(event.body || '{}')
      if (!id) return err('id requis')

      const { rows: own } = await pool.query(
        'SELECT id FROM clients_agence WHERE id = $1 AND agence_id = $2', [id, agence_id]
      )
      if (!own[0]) return err('Non autorisé', 403)

      // Les annonces liées auront client_id mis à NULL (ON DELETE SET NULL)
      await pool.query('DELETE FROM clients_agence WHERE id = $1', [id])
      return ok({ success: true })
    }

    return err('Méthode non supportée', 405)
  } catch (e) {
    console.error('clients error:', e)
    if (e.message === 'Non authentifié' || e.message === 'Token invalide') return err(e.message, 401)
    return err(e.message, 500)
  }
}
