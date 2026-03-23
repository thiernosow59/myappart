const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Vérifie le Bearer token et retourne le user Supabase.
 * Lance une erreur si le token est absent ou invalide.
 */
async function requireAuth(event) {
  const auth = event.headers['authorization'] || event.headers['Authorization'] || ''
  const token = auth.replace(/^Bearer\s+/i, '').trim()
  if (!token) throw new Error('Non authentifié')

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) throw new Error('Token invalide')
  return user
}

module.exports = { requireAuth }
