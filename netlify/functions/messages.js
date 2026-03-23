const { getPool }    = require('./_db')
const { requireAuth } = require('./_auth')

function ok(data, status = 200)  { return { statusCode: status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(data) } }
function err(msg, status = 400)  { return { statusCode: status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: msg }) } }

// Blocage numéros et emails dans les messages
function containsContact(text) {
  const phone = /(\+?[\d\s\-.()\u0660-\u0669\u06F0-\u06F9]{7,})/
  const words = /\b(z[eé]ro|un|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|treize|quatorze|quinze|seize|vingt|trente|quarante|cinquante|soixante|cent|mille)(\s+(z[eé]ro|un|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|treize|quatorze|quinze|seize|vingt|trente|quarante|cinquante|soixante|cent|mille)){3,}/i
  const email = /[a-zA-Z0-9._%+\-]+\s*[@＠]\s*[a-zA-Z0-9.\-]+\s*\.\s*[a-zA-Z]{2,}/
  return phone.test(text) || words.test(text) || email.test(text)
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return ok({})
  const pool = getPool()
  const q    = event.queryStringParameters || {}

  try {
    const user = await requireAuth(event)
    const { rows: pRows } = await pool.query('SELECT id FROM profiles WHERE supabase_uid = $1', [user.id])
    if (!pRows[0]) return err('Profil introuvable', 404)
    const profileId = pRows[0].id

    /* ── GET ── */
    if (event.httpMethod === 'GET') {

      // Liste des conversations de l'utilisateur
      if (q.action === 'list_conversations') {
        const { rows } = await pool.query(`
          SELECT c.*,
            a.titre AS annonce_titre,
            CASE
              WHEN c.utilisateur_id = $1 THEN (SELECT nom || ' ' || COALESCE(prenom,'') FROM profiles WHERE id = c.proprietaire_id)
              ELSE (SELECT nom || ' ' || COALESCE(prenom,'') FROM profiles WHERE id = c.utilisateur_id)
            END AS interlocuteur,
            (SELECT contenu FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS dernier_message,
            (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND lu = false AND sender_id != $1) AS non_lus
          FROM conversations c
          JOIN annonces a ON a.id = c.annonce_id
          WHERE c.utilisateur_id = $1 OR c.proprietaire_id = $1
          ORDER BY c.created_at DESC
        `, [profileId])
        return ok(rows)
      }

      // Messages d'une conversation
      if (q.action === 'get_messages' && q.conversation_id) {
        // Vérifier accès
        const { rows: conv } = await pool.query(
          'SELECT id FROM conversations WHERE id = $1 AND (utilisateur_id = $2 OR proprietaire_id = $2)',
          [q.conversation_id, profileId]
        )
        if (!conv[0]) return err('Non autorisé', 403)
        // Marquer comme lus
        await pool.query('UPDATE messages SET lu = true WHERE conversation_id = $1 AND sender_id != $2', [q.conversation_id, profileId])
        const { rows } = await pool.query(
          'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
          [q.conversation_id]
        )
        return ok(rows)
      }

      return err('action non reconnue')
    }

    /* ── POST ── */
    if (event.httpMethod === 'POST') {
      const b = JSON.parse(event.body || '{}')

      // Obtenir ou créer une conversation
      if (b.action === 'get_or_create_conversation') {
        const { annonce_id, proprietaire_id } = b
        if (!annonce_id || !proprietaire_id) return err('annonce_id et proprietaire_id requis')

        // Chercher une conversation existante
        const { rows: existing } = await pool.query(
          'SELECT * FROM conversations WHERE annonce_id = $1 AND utilisateur_id = $2',
          [annonce_id, profileId]
        )
        if (existing[0]) return ok(existing[0])

        // Créer une nouvelle conversation
        const { rows } = await pool.query(
          'INSERT INTO conversations (annonce_id, utilisateur_id, proprietaire_id) VALUES ($1,$2,$3) RETURNING *',
          [annonce_id, profileId, proprietaire_id]
        )
        return ok(rows[0], 201)
      }

      // Envoyer un message
      if (b.action === 'send_message') {
        const { conversation_id, contenu } = b
        if (!conversation_id || !contenu?.trim()) return err('conversation_id et contenu requis')

        // Vérifier accès
        const { rows: conv } = await pool.query(
          'SELECT * FROM conversations WHERE id = $1 AND (utilisateur_id = $2 OR proprietaire_id = $2)',
          [conversation_id, profileId]
        )
        if (!conv[0]) return err('Non autorisé', 403)

        // Bloquer contenu sensible
        if (containsContact(contenu)) return err('Les numéros de téléphone et emails ne sont pas autorisés dans les messages', 422)

        const { rows } = await pool.query(
          'INSERT INTO messages (conversation_id, sender_id, contenu) VALUES ($1,$2,$3) RETURNING *',
          [conversation_id, profileId, contenu.trim()]
        )
        return ok(rows[0], 201)
      }

      return err('action non reconnue')
    }

    return err('Méthode non supportée', 405)
  } catch (e) {
    console.error('messages error:', e)
    if (e.message === 'Non authentifié' || e.message === 'Token invalide') return err(e.message, 401)
    return err(e.message, 500)
  }
}
