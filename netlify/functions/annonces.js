const { getPool }    = require('./_db')
const { requireAuth } = require('./_auth')

function ok(data, status = 200)  { return { statusCode: status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(data) } }
function err(msg, status = 400)  { return { statusCode: status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: msg }) } }

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return ok({})
  const pool = getPool()
  const q    = event.queryStringParameters || {}

  try {
    /* ── GET : liste ou détail ── */
    if (event.httpMethod === 'GET') {

      // Détail d'une annonce
      if (q.id) {
        const { rows } = await pool.query(`
          SELECT a.*, array_agg(json_build_object('url', p.url, 'type', p.type) ORDER BY p.ordre) FILTER (WHERE p.id IS NOT NULL) AS photos
          FROM annonces a
          LEFT JOIN photos p ON p.annonce_id = a.id
          WHERE a.id = $1 AND a.statut = 'active'
          GROUP BY a.id
        `, [q.id])
        if (!rows[0]) return err('Annonce introuvable', 404)
        // Incrémenter les vues
        await pool.query('UPDATE annonces SET nb_vues = nb_vues + 1 WHERE id = $1', [q.id])
        return ok(rows[0])
      }

      // Liste avec filtres
      const conditions = ['a.statut = \'active\'']
      const params     = []
      let   idx        = 1

      if (q.type)    { conditions.push(`a.transaction = $${idx++}`); params.push(q.type) }
      if (q.bien)    { conditions.push(`a.type_bien = $${idx++}`);   params.push(q.bien) }
      if (q.commune)  { conditions.push(`a.commune ILIKE $${idx++}`);  params.push(q.commune) }
      if (q.quartier) { conditions.push(`a.quartier ILIKE $${idx++}`); params.push(`%${q.quartier}%`) }
      if (q.q)       {
        conditions.push(`(a.titre ILIKE $${idx} OR a.description ILIKE $${idx} OR a.quartier ILIKE $${idx})`)
        params.push(`%${q.q}%`); idx++
      }
      if (q.prix_min)    { conditions.push(`a.prix >= $${idx++}`);        params.push(parseInt(q.prix_min)) }
      if (q.prix_max)    { conditions.push(`a.prix <= $${idx++}`);        params.push(parseInt(q.prix_max)) }
      if (q.surface_min) { conditions.push(`a.surface_m2 >= $${idx++}`);  params.push(parseInt(q.surface_min)) }
      if (q.nb_chambres) { conditions.push(`a.nb_chambres >= $${idx++}`); params.push(parseInt(q.nb_chambres)) }

      // Mes annonces (propriétaire connecté)
      if (q.mine === 'true') {
        const user = await requireAuth(event)
        const { rows: pRows } = await pool.query('SELECT id FROM profiles WHERE supabase_uid = $1', [user.id])
        if (!pRows[0]) return err('Profil introuvable', 404)
        conditions.push(`a.profile_id = $${idx++}`)
        params.push(pRows[0].id)
        // Pour mes annonces, inclure tous les statuts
        conditions.splice(0, 1) // retirer statut = active
      }

      const limit  = Math.min(parseInt(q.limit  || 12), 50)
      const offset = parseInt(q.offset || 0)

      const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''

      const [countRes, dataRes] = await Promise.all([
        pool.query(`SELECT COUNT(*) FROM annonces a ${where}`, params),
        pool.query(`
          SELECT a.*,
            (SELECT url FROM photos WHERE annonce_id = a.id AND type = 'principale' LIMIT 1) AS photo_principale
          FROM annonces a
          ${where}
          ORDER BY a.mise_en_avant DESC, a.created_at DESC
          LIMIT $${idx} OFFSET $${idx + 1}
        `, [...params, limit, offset]),
      ])

      return ok({ annonces: dataRes.rows, total: parseInt(countRes.rows[0].count) })
    }

    /* ── POST : créer annonce ── */
    if (event.httpMethod === 'POST') {
      const user = await requireAuth(event)
      const { rows: pRows } = await pool.query('SELECT id, role FROM profiles WHERE supabase_uid = $1', [user.id])
      const profile = pRows[0]
      if (!profile) return err('Profil introuvable', 404)
      if (!['proprietaire', 'agence'].includes(profile.role)) return err('Seuls les propriétaires et agences peuvent publier', 403)

      const b = JSON.parse(event.body || '{}')

      // Règle : terrain non louable
      if (b.type_bien === 'terrain' && b.transaction === 'location') return err('Un terrain ne peut pas être mis en location', 400)
      if (!b.titre)     return err('Le titre est requis')
      if (!b.prix)      return err('Le prix est requis')
      if (!b.commune)   return err('La commune est requise')

      // Vérifier que le client_id appartient bien à cette agence
      let client_id = null
      if (profile.role === 'agence' && b.client_id) {
        const { rows: cRows } = await pool.query(
          'SELECT id FROM clients_agence WHERE id = $1 AND agence_id = $2', [b.client_id, profile.id]
        )
        if (!cRows[0]) return err('Client introuvable', 404)
        client_id = b.client_id
      }

      const { rows } = await pool.query(`
        INSERT INTO annonces
          (profile_id, type_bien, transaction, titre, description, prix, negotiable,
           ville, commune, quartier, adresse, surface_m2,
           nb_pieces, nb_chambres, nb_salles_bain, nb_etages, etage, nb_etages_total,
           etat, equipements, equipements_autres, client_id)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
        RETURNING *
      `, [
        profile.id, b.type_bien, b.transaction, b.titre, b.description || null, b.prix, b.negotiable || false,
        b.ville || 'Conakry', b.commune, b.quartier || null, b.adresse || null, b.surface_m2 || null,
        b.nb_pieces || null, b.nb_chambres || null, b.nb_salles_bain || null, b.nb_etages || null,
        b.etage || null, b.nb_etages_total || null,
        b.etat || 'bon_etat', b.equipements || [], b.equipements_autres || null, client_id,
      ])
      return ok(rows[0], 201)
    }

    /* ── PUT : mettre à jour ── */
    if (event.httpMethod === 'PUT') {
      const user = await requireAuth(event)
      const b    = JSON.parse(event.body || '{}')
      if (!b.id) return err('id requis')

      // Vérifier que l'annonce appartient bien au profil
      const { rows: own } = await pool.query(
        'SELECT a.id FROM annonces a JOIN profiles p ON p.id = a.profile_id WHERE a.id = $1 AND p.supabase_uid = $2',
        [b.id, user.id]
      )
      if (!own[0]) return err('Non autorisé', 403)

      const updates = []
      const params  = []
      let   idx     = 1
      const fields  = ['titre','description','prix','negotiable','ville','commune','quartier',
                        'surface_m2','nb_pieces','nb_chambres','nb_salles_bain','etat','equipements',
                        'equipements_autres','statut','disponible','disponibilite','client_id']
      fields.forEach(f => {
        if (b[f] !== undefined) { updates.push(`${f} = $${idx++}`); params.push(b[f]) }
      })
      if (!updates.length) return err('Rien à mettre à jour')
      params.push(b.id)
      const { rows } = await pool.query(
        `UPDATE annonces SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
        params
      )
      return ok(rows[0])
    }

    /* ── DELETE ── */
    if (event.httpMethod === 'DELETE') {
      const user = await requireAuth(event)
      const { id } = JSON.parse(event.body || '{}')
      if (!id) return err('id requis')
      const { rows: own } = await pool.query(
        'SELECT a.id FROM annonces a JOIN profiles p ON p.id = a.profile_id WHERE a.id = $1 AND p.supabase_uid = $2',
        [id, user.id]
      )
      if (!own[0]) return err('Non autorisé', 403)
      await pool.query('DELETE FROM annonces WHERE id = $1', [id])
      return ok({ success: true })
    }

    return err('Méthode non supportée', 405)
  } catch (e) {
    console.error('annonces error:', e)
    if (e.message === 'Non authentifié' || e.message === 'Token invalide') return err(e.message, 401)
    return err(e.message, 500)
  }
}
