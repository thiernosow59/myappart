const { getPool }     = require('./_db')
const { requireAuth } = require('./_auth')

function ok(data) { return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(data) } }
function err(msg, s = 400) { return { statusCode: s, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: msg }) } }

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return ok({})
  if (event.httpMethod !== 'GET') return err('Méthode non supportée', 405)

  try {
    const user = await requireAuth(event)
    const pool = getPool()

    const { rows: pRows } = await pool.query(
      'SELECT id, role FROM profiles WHERE supabase_uid = $1', [user.id]
    )
    const profile = pRows[0]
    if (!profile) return err('Profil introuvable', 404)
    if (!['proprietaire', 'agence'].includes(profile.role)) return err('Accès refusé', 403)

    const pid = profile.id

    const [statsRes, annoncesRes, clientsRes] = await Promise.all([
      // Stats globales du profil
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE statut = 'active')    AS actives,
          COUNT(*) FILTER (WHERE statut = 'inactive')  AS inactives,
          COUNT(*) FILTER (WHERE statut = 'vendu' OR statut = 'loue') AS terminees,
          COALESCE(SUM(nb_vues), 0)                    AS total_vues
        FROM annonces WHERE profile_id = $1
      `, [pid]),

      // Liste des annonces avec photo principale et client si agence
      pool.query(`
        SELECT
          a.id, a.titre, a.type_bien, a.transaction, a.prix, a.commune,
          a.statut, a.disponible, a.nb_vues, a.created_at, a.client_id,
          (SELECT url FROM photos WHERE annonce_id = a.id AND type = 'principale' LIMIT 1) AS photo_principale,
          CASE WHEN $2 = 'agence' THEN
            (SELECT json_build_object('id', c.id, 'nom', c.nom, 'prenom', c.prenom, 'phone', c.phone, 'email', c.email)
             FROM clients_agence c WHERE c.id = a.client_id)
          ELSE NULL END AS client
        FROM annonces a
        WHERE a.profile_id = $1
        ORDER BY a.created_at DESC
      `, [pid, profile.role]),

      // Clients de l'agence (null pour propriétaire)
      profile.role === 'agence'
        ? pool.query(
            `SELECT c.*, COUNT(a.id) AS nb_annonces
             FROM clients_agence c
             LEFT JOIN annonces a ON a.client_id = c.id
             WHERE c.agence_id = $1
             GROUP BY c.id ORDER BY c.nom, c.prenom`,
            [pid]
          )
        : { rows: null },
    ])

    const stats = statsRes.rows[0]

    return ok({
      stats: {
        actives:   parseInt(stats.actives),
        inactives: parseInt(stats.inactives),
        terminees: parseInt(stats.terminees),
        total_vues: parseInt(stats.total_vues),
      },
      annonces: annoncesRes.rows,
      clients:  clientsRes.rows,
    })
  } catch (e) {
    console.error('dashboard error:', e)
    if (e.message === 'Non authentifié' || e.message === 'Token invalide') return err(e.message, 401)
    return err(e.message, 500)
  }
}
