import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { annoncesApi } from '../lib/api'
import { Plus, Pencil, Trash2 } from 'lucide-react'

const STATUT_COLORS = {
  active:   'bg-emerald-100 text-emerald-700',
  inactive: 'bg-slate-100 text-slate-500',
  suspendue:'bg-orange-100 text-orange-700',
  vendu:    'bg-blue-100 text-blue-700',
  loue:     'bg-purple-100 text-purple-700',
}

export default function MesAnnoncesPage() {
  const navigate = useNavigate()
  const { user, profile, getToken } = useAuth()

  const [annonces, setAnnonces] = useState([])
  const [loading, setLoading]   = useState(true)

  const canPublish = profile?.role === 'proprietaire' || profile?.role === 'agence'

  useEffect(() => {
    if (!user) { navigate('/connexion'); return }
    if (!canPublish) return
    load()
  }, [user])

  async function load() {
    setLoading(true)
    try {
      const token = await getToken()
      const data  = await annoncesApi.list({ mine: true }, token)
      setAnnonces(Array.isArray(data) ? data : data.annonces || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function deleteAnnonce(id) {
    if (!confirm('Supprimer cette annonce ?')) return
    const token = await getToken()
    await annoncesApi.delete(id, token)
    setAnnonces(a => a.filter(x => x.id !== id))
  }

  if (!canPublish) return (
    <div className="text-center py-20 px-4">
      <p className="text-slate-500 mb-4">Seuls les propriétaires et agences peuvent gérer des annonces.</p>
      <button onClick={() => navigate('/compte')} className="btn-primary">Modifier mon profil</button>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Mes annonces</h1>
        <Link to="/publier" className="btn-orange flex items-center gap-2 text-sm">
          <Plus size={15} /> Nouvelle annonce
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" />)}
        </div>
      ) : annonces.length === 0 ? (
        <div className="text-center text-slate-400 py-16">
          <div className="text-5xl mb-4">🏠</div>
          <p>Aucune annonce pour le moment.</p>
          <Link to="/publier" className="btn-primary mt-4 inline-block">Publier ma première annonce</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {annonces.map(a => (
            <div key={a.id} className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="text-3xl shrink-0">
                {a.type_bien === 'terrain' ? '🌿' : a.type_bien === 'appartement' ? '🏢' : '🏠'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-800 line-clamp-1">{a.titre}</div>
                <div className="text-xs text-slate-400 mt-0.5">{a.reference} · {a.commune}, {a.ville}</div>
                <div className="text-sm font-bold text-navy-900 mt-1">
                  {new Intl.NumberFormat('fr-FR').format(a.prix)} GNF
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUT_COLORS[a.statut] || 'bg-slate-100 text-slate-500'}`}>
                  {a.statut}
                </span>
                <Link to={`/annonces/${a.id}`} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <Pencil size={15} className="text-slate-400" />
                </Link>
                <button onClick={() => deleteAnnonce(a.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={15} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
