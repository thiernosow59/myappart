const { getPool } = require('./_db')

function ok(data, status = 200)  { return { statusCode: status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(data) } }
function err(msg, status = 400)  { return { statusCode: status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: msg }) } }

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return ok({})
  const pool = getPool()

  try {
    /* ── GET /profile?uid=xxx ── */
    if (event.httpMethod === 'GET') {
      const uid = event.queryStringParameters?.uid
      if (!uid) return err('uid requis')
      const { rows } = await pool.query('SELECT * FROM profiles WHERE supabase_uid = $1 LIMIT 1', [uid])
      if (!rows[0]) return err('Profil introuvable', 404)
      if (!rows[0].is_active) return err('Compte désactivé', 403)
      return ok(rows[0])
    }

    /* ── POST /profile (créer uniquement si n'existe pas) ── */
    if (event.httpMethod === 'POST') {
      const { supabase_uid, nom, prenom, phone, role, email } = JSON.parse(event.body || '{}')
      if (!supabase_uid) return err('supabase_uid requis')

      const { rows } = await pool.query(
        `INSERT INTO profiles (supabase_uid, nom, prenom, phone, role, email)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (supabase_uid) DO UPDATE SET
           nom    = CASE WHEN profiles.is_active THEN EXCLUDED.nom    ELSE profiles.nom    END,
           prenom = CASE WHEN profiles.is_active THEN EXCLUDED.prenom ELSE profiles.prenom END,
           phone  = CASE WHEN profiles.is_active THEN COALESCE(EXCLUDED.phone, profiles.phone) ELSE profiles.phone END,
           role   = CASE WHEN profiles.is_active THEN profiles.role   ELSE profiles.role   END,
           email  = COALESCE(EXCLUDED.email, profiles.email),
           updated_at = NOW()
         RETURNING *`,
        [supabase_uid, nom || 'Utilisateur', prenom || '', phone || null, role || 'utilisateur', email || null]
      )
      if (!rows[0].is_active) return err('Compte désactivé', 403)
      return ok(rows[0])
    }

    /* ── DELETE /profile?uid=xxx (soft delete) ── */
    if (event.httpMethod === 'DELETE') {
      const uid = event.queryStringParameters?.uid
      if (!uid) return err('uid requis')
      const { rows } = await pool.query(
        'UPDATE profiles SET is_active = false, updated_at = NOW() WHERE supabase_uid = $1 RETURNING *',
        [uid]
      )
      if (!rows[0]) return err('Profil introuvable', 404)
      return ok({ message: 'Compte désactivé' })
    }

    return err('Méthode non supportée', 405)
  } catch (e) {
    console.error('profile error:', e)
    return err(e.message, 500)
  }
}
