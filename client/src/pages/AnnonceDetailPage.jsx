import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Heart, MessageSquare, Share2, ChevronLeft, CheckCircle } from 'lucide-react'
import { annoncesApi, messagesApi, favorisApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'

const EQUIP_LABELS = {
  eau_courante: '💧 Eau courante', electricite: '⚡ Électricité', cloture: '🔒 Clôture',
  parking: '🚗 Parking', piscine: '🏊 Piscine', gardien: '👮 Gardien',
  ascenseur: '🛗 Ascenseur', climatisation: '❄️ Climatisation',
  groupe_electrogene: '🔋 Groupe électrogène', internet: '📶 Internet',
}

function formatPrice(prix, transaction) {
  if (!prix) return '—'
  const fmt = new Intl.NumberFormat('fr-FR').format(prix) + ' GNF'
  return transaction === 'location' ? `${fmt} / mois` : fmt
}

export default function AnnonceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile, getToken } = useAuth()

  const [annonce, setAnnonce]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [isFav, setIsFav]           = useState(false)
  const [photoIdx, setPhotoIdx]     = useState(0)
  const [msgText, setMsgText]       = useState('')
  const [sending, setSending]       = useState(false)
  const [msgSent, setMsgSent]       = useState(false)

  useEffect(() => {
    annoncesApi.get(id).then(data => { setAnnonce(data); setLoading(false) }).catch(() => setLoading(false))
  }, [id])

  async function toggleFav() {
    if (!user) return navigate('/connexion')
    const token = await getToken()
    await favorisApi.toggle(id, token)
    setIsFav(f => !f)
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!msgText.trim()) return
    if (!user) return navigate('/connexion')
    setSending(true)
    try {
      const token = await getToken()
      // Obtenir ou créer la conversation
      const { conversation_id } = await messagesApi.getOrCreateConversation(
        { annonce_id: id, proprietaire_id: annonce.profile_id }, token
      )
      await messagesApi.sendMessage({ conversation_id, contenu: msgText }, token)
      setMsgText('')
      setMsgSent(true)
      setTimeout(() => setMsgSent(false), 4000)
    } catch (err) {
      alert(err.message)
    } finally {
      setSending(false)
    }
  }

  if (loading) return <div className="flex justify-center items-center min-h-[50vh]"><div className="w-8 h-8 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" /></div>
  if (!annonce) return <div className="text-center py-20 text-slate-400">Annonce introuvable.</div>

  const photos = annonce.photos || []
  const equips = annonce.equipements || []

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Retour */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-900 mb-5 transition-colors">
        <ChevronLeft size={16} /> Retour aux annonces
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* ── Colonne principale ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photos */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="relative h-72 md:h-96 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-7xl">
              {photos.length > 0
                ? <img src={photos[photoIdx]?.url} alt={annonce.titre} className="w-full h-full object-cover" />
                : (annonce.type_bien === 'terrain' ? '🌿' : annonce.type_bien === 'appartement' ? '🏢' : '🏠')
              }
              {/* Badge */}
              <div className={`absolute top-4 left-4 ${annonce.transaction === 'location' ? 'badge-location' : 'badge-vente'}`}>
                {annonce.transaction === 'location' ? 'Location' : 'Vente'}
              </div>
              {/* Référence */}
              <div className="absolute bottom-4 left-4 bg-black/40 text-white text-xs font-mono px-2 py-1 rounded">
                {annonce.reference}
              </div>
            </div>
            {/* Miniatures */}
            {photos.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {photos.map((p, i) => (
                  <img key={i} src={p.url} alt="" onClick={() => setPhotoIdx(i)}
                    className={`h-16 w-20 object-cover rounded-lg cursor-pointer border-2 transition-all ${photoIdx === i ? 'border-navy-900' : 'border-transparent'}`} />
                ))}
              </div>
            )}
          </div>

          {/* Infos principales */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-800">{annonce.titre}</h1>
                <p className="text-slate-500 text-sm mt-1">📍 {[annonce.quartier, annonce.commune, annonce.ville].filter(Boolean).join(', ')}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={toggleFav} className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center hover:border-red-300 transition-colors">
                  <Heart size={18} className={isFav ? 'fill-red-500 text-red-500' : 'text-slate-400'} />
                </button>
                <button className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center hover:border-navy-900 transition-colors">
                  <Share2 size={18} className="text-slate-400" />
                </button>
              </div>
            </div>

            <div className="mt-4 text-3xl font-extrabold text-navy-900">
              {formatPrice(annonce.prix, annonce.transaction)}
              {annonce.negotiable && <span className="text-sm font-normal text-emerald-600 ml-2">· Négociable</span>}
            </div>

            {/* Caractéristiques */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              {annonce.surface_m2 && (
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <div className="text-xl">📐</div>
                  <div className="text-sm font-bold text-slate-700">{annonce.surface_m2} m²</div>
                  <div className="text-xs text-slate-400">Surface</div>
                </div>
              )}
              {annonce.nb_chambres > 0 && (
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <div className="text-xl">🛏</div>
                  <div className="text-sm font-bold text-slate-700">{annonce.nb_chambres}</div>
                  <div className="text-xs text-slate-400">Chambres</div>
                </div>
              )}
              {annonce.nb_salles_bain > 0 && (
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <div className="text-xl">🚿</div>
                  <div className="text-sm font-bold text-slate-700">{annonce.nb_salles_bain}</div>
                  <div className="text-xs text-slate-400">Salles de bain</div>
                </div>
              )}
              {annonce.nb_pieces > 0 && (
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <div className="text-xl">🏠</div>
                  <div className="text-sm font-bold text-slate-700">F{annonce.nb_pieces}</div>
                  <div className="text-xs text-slate-400">Pièces</div>
                </div>
              )}
            </div>

            {/* État */}
            {annonce.etat && (
              <div className="mt-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">État : </span>
                <span className="text-sm font-medium text-slate-700">
                  {annonce.etat === 'neuf' ? '✨ Neuf' : annonce.etat === 'bon_etat' ? '👍 Bon état' : '🔨 À rénover'}
                </span>
              </div>
            )}

            {/* Description */}
            {annonce.description && (
              <div className="mt-5">
                <h3 className="font-semibold text-slate-700 mb-2">Description</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{annonce.description}</p>
              </div>
            )}

            {/* Équipements */}
            {equips.length > 0 && (
              <div className="mt-5">
                <h3 className="font-semibold text-slate-700 mb-3">Équipements</h3>
                <div className="flex flex-wrap gap-2">
                  {equips.map(eq => (
                    <span key={eq} className="bg-navy-50 text-navy-900 text-xs font-medium px-3 py-1.5 rounded-full border border-navy-100">
                      {EQUIP_LABELS[eq] || eq}
                    </span>
                  ))}
                  {annonce.equipements_autres && (
                    <span className="bg-navy-50 text-navy-900 text-xs font-medium px-3 py-1.5 rounded-full border border-navy-100">
                      ➕ {annonce.equipements_autres}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Colonne latérale ── */}
        <div className="space-y-4">
          {/* Contact / Message */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <MessageSquare size={17} /> Contacter le propriétaire
            </h3>

            {msgSent ? (
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium py-3">
                <CheckCircle size={16} /> Message envoyé !
              </div>
            ) : (
              <form onSubmit={sendMessage} className="space-y-3">
                <textarea
                  value={msgText}
                  onChange={e => setMsgText(e.target.value)}
                  placeholder="Bonjour, je suis intéressé par ce bien..."
                  rows={4}
                  className="input-field resize-none"
                  disabled={sending}
                />
                <button type="submit" disabled={sending || !msgText.trim()} className="btn-orange w-full justify-center flex items-center gap-2">
                  {sending ? 'Envoi...' : '📤 Envoyer le message'}
                </button>
                {!user && (
                  <p className="text-xs text-slate-400 text-center">
                    <button type="button" onClick={() => navigate('/connexion')} className="text-navy-900 font-semibold hover:underline">Connectez-vous</button> pour envoyer un message.
                  </p>
                )}
              </form>
            )}
          </div>

          {/* Infos annonce */}
          <div className="bg-white rounded-2xl p-5 shadow-sm text-sm space-y-3">
            <h3 className="font-bold text-slate-800 mb-2">Détails de l'annonce</h3>
            <div className="flex justify-between"><span className="text-slate-500">Référence</span><span className="font-mono text-xs">{annonce.reference}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Type</span><span className="capitalize">{annonce.type_bien}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Transaction</span><span className="capitalize">{annonce.transaction}</span></div>
            {annonce.nb_vues > 0 && <div className="flex justify-between"><span className="text-slate-500">Vues</span><span>{annonce.nb_vues}</span></div>}
            <div className="flex justify-between"><span className="text-slate-500">Publié le</span>
              <span>{annonce.created_at ? new Date(annonce.created_at).toLocaleDateString('fr-FR') : '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
