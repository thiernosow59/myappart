import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react'
import AnnonceCard from '../components/ui/AnnonceCard'
import { annoncesApi, favorisApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'

const COMMUNES = ['Kaloum', 'Matam', 'Ratoma', 'Dixinn', 'Matoto']

export default function AnnoncesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, getToken } = useAuth()

  const [annonces, setAnnonces] = useState([])
  const [loading, setLoading]   = useState(true)
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [favoris, setFavoris]   = useState(new Set())
  const [showFilters, setShowFilters] = useState(false)

  // Filtres
  const [filters, setFilters] = useState({
    type:     searchParams.get('type')     || '',
    bien:     searchParams.get('bien')     || '',
    commune:  searchParams.get('commune')  || '',
    quartier: searchParams.get('quartier') || '',
    q:        searchParams.get('q')        || '',
    prix_min: '', prix_max: '',
    surface_min: '',
    nb_chambres: '',
  })

  useEffect(() => { loadAnnonces() }, [page, filters])
  useEffect(() => { if (user) loadFavoris() }, [user])

  async function loadAnnonces() {
    setLoading(true)
    try {
      const params = { limit: 12, offset: (page - 1) * 12 }
      if (filters.type)       params.type = filters.type
      if (filters.bien)       params.bien = filters.bien
      if (filters.commune)    params.commune  = filters.commune
      if (filters.quartier)   params.quartier = filters.quartier
      if (filters.q)          params.q = filters.q
      if (filters.prix_min)   params.prix_min = filters.prix_min
      if (filters.prix_max)   params.prix_max = filters.prix_max
      if (filters.surface_min) params.surface_min = filters.surface_min
      if (filters.nb_chambres) params.nb_chambres = filters.nb_chambres

      const data = await annoncesApi.list(params)
      setAnnonces(Array.isArray(data) ? data : data.annonces || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function loadFavoris() {
    try {
      const token = await getToken()
      const data  = await favorisApi.list(token)
      setFavoris(new Set(data.map(f => f.annonce_id)))
    } catch {}
  }

  async function toggleFavori(id) {
    if (!user) return
    const token = await getToken()
    await favorisApi.toggle(id, token)
    setFavoris(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function setFilter(key, val) {
    setFilters(f => ({ ...f, [key]: val }))
    setPage(1)
  }

  const totalPages = Math.ceil(total / 12)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Annonces immobilières</h1>
          {total > 0 && <p className="text-sm text-slate-500 mt-1">{total} résultat{total > 1 ? 's' : ''}</p>}
        </div>
        <button onClick={() => setShowFilters(s => !s)} className="flex items-center gap-2 btn-outline text-sm">
          <SlidersHorizontal size={15} /> Filtres
        </button>
      </div>

      {/* Filtres */}
      {showFilters && (
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Transaction</label>
            <select className="input-field" value={filters.type} onChange={e => setFilter('type', e.target.value)}>
              <option value="">Toutes</option>
              <option value="vente">Vente</option>
              <option value="location">Location</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Type de bien</label>
            <select className="input-field" value={filters.bien} onChange={e => setFilter('bien', e.target.value)}>
              <option value="">Tous</option>
              <option value="maison">Maison</option>
              <option value="appartement">Appartement</option>
              <option value="terrain">Terrain</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Commune</label>
            <select className="input-field" value={filters.commune} onChange={e => setFilter('commune', e.target.value)}>
              <option value="">Toutes</option>
              {COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Quartier</label>
            <input type="text" className="input-field" placeholder="ex: Kipé, Taouyah..." value={filters.quartier} onChange={e => setFilter('quartier', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Chambres (min)</label>
            <select className="input-field" value={filters.nb_chambres} onChange={e => setFilter('nb_chambres', e.target.value)}>
              <option value="">Toutes</option>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}+</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Prix min (GNF)</label>
            <input type="number" className="input-field" placeholder="ex: 1000000" value={filters.prix_min} onChange={e => setFilter('prix_min', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Prix max (GNF)</label>
            <input type="number" className="input-field" placeholder="ex: 50000000" value={filters.prix_max} onChange={e => setFilter('prix_max', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Surface min (m²)</label>
            <input type="number" className="input-field" placeholder="ex: 80" value={filters.surface_min} onChange={e => setFilter('surface_min', e.target.value)} />
          </div>
          <div className="flex items-end">
            <button onClick={() => { setFilters({ type:'', bien:'', commune:'', quartier:'', q:'', prix_min:'', prix_max:'', surface_min:'', nb_chambres:'' }); setPage(1) }}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700">
              <X size={14} /> Réinitialiser
            </button>
          </div>
        </div>
      )}

      {/* Grille */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-72 animate-pulse" />)}
        </div>
      ) : annonces.length === 0 ? (
        <div className="text-center text-slate-400 py-24">Aucune annonce trouvée.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {annonces.map(a => (
            <AnnonceCard key={a.id} annonce={a} isFav={favoris.has(a.id)} onFavToggle={toggleFavori} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1.5 mt-10">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="w-9 h-9 rounded-lg flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors">
            <ChevronLeft size={16} />
          </button>
          {(() => {
            const pages = []
            const add = (p) => pages.push(p)
            if (totalPages <= 7) {
              for (let i = 1; i <= totalPages; i++) add(i)
            } else {
              add(1)
              if (page > 3) add('...')
              for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) add(i)
              if (page < totalPages - 2) add('...')
              add(totalPages)
            }
            return pages.map((p, i) => p === '...'
              ? <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm">…</span>
              : <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${page === p ? 'bg-navy-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>
                  {p}
                </button>
            )
          })()}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="w-9 h-9 rounded-lg flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
