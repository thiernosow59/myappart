const { getPool } = require('./_db')

function ok(data) { return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(data) } }
function err(msg, s = 500) { return { statusCode: s, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: msg }) } }

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return ok({})
  try {
    const pool = getPool()
    const [r1, r2, r3] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM annonces WHERE statut = 'active'"),
      pool.query("SELECT COUNT(*) FROM profiles WHERE role = 'proprietaire'"),
      pool.query("SELECT COUNT(*) FROM profiles WHERE role = 'agence'"),
    ])
    return ok({
      annonces:      parseInt(r1.rows[0].count),
      proprietaires: parseInt(r2.rows[0].count),
      agences:       parseInt(r3.rows[0].count),
    })
  } catch (e) {
    console.error('stats error:', e)
    return err(e.message)
  }
}
