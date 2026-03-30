import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import AnnonceCard from '../components/ui/AnnonceCard'
import { annoncesApi, statsApi, favorisApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'

const QUICK_FILTERS = [
  { label: 'Tous',           params: {} },
  { label: '🏘️ Maisons',     params: { bien: 'maison' } },
  { label: '🏢 Appartements',params: { bien: 'appartement' } },
  { label: '🌿 Terrains',    params: { bien: 'terrain' } },
  { label: '🏷️ Vendre',      params: { type: 'vente' } },
  { label: '🔑 Louer',       params: { type: 'location' } },
  { label: '🛒 Acheter',     params: { type: 'vente' } },
]

export default function HomePage() {
  const navigate = useNavigate()
  const { user, getToken } = useAuth()
  const [annonces, setAnnonces]       = useState([])
  const [favoris, setFavoris]         = useState(new Set())
  const [loading, setLoading]         = useState(true)
  const [activeFilter, setActiveFilter] = useState(0)
  const [stats, setStats]             = useState({ annonces: 0, proprietaires: 0, agences: 0 })

  // Search state
  const [searchType, setSearchType]      = useState('vente')
  const [searchBien, setSearchBien]      = useState('')
  const [searchQuery, setSearchQuery]    = useState('')
  const [searchQuartier, setSearchQuartier] = useState('')

  useEffect(() => {
    loadAnnonces(QUICK_FILTERS[activeFilter].params)
  }, [activeFilter])

  useEffect(() => {
    statsApi.get().then(setStats).catch(() => {})
  }, [])

  useEffect(() => {
    if (!user) return
    getToken().then(token => favorisApi.list(token).then(data => setFavoris(new Set(data.map(f => f.annonce_id)))).catch(() => {}))
  }, [user])

  async function toggleFavori(id) {
    if (!user) return navigate('/connexion')
    const token = await getToken()
    await favorisApi.toggle(id, token)
    setFavoris(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  async function loadAnnonces(params = {}) {
    setLoading(true)
    try {
      const data = await annoncesApi.list({ limit: 8, ...params })
      setAnnonces(Array.isArray(data) ? data : data.annonces || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchType)     params.set('type', searchType)
    if (searchBien)     params.set('bien', searchBien)
    if (searchQuery)    params.set('q', searchQuery)
    if (searchQuartier) params.set('quartier', searchQuartier)
    navigate(`/annonces?${params}`)
  }

  return (
    <div className="relative">
      {/* Background pattern */}
      <div className="bg-pattern" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" opacity="0.06">
          <defs>
            <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#1A3D6E" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" opacity="0.04">
          <defs>
            <pattern id="diamonds" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              <path d="M60 4 L116 60 L60 116 L4 60 Z"  fill="none" stroke="#1A3D6E" strokeWidth="1.2" />
              <path d="M60 22 L98 60 L60 98 L22 60 Z"  fill="none" stroke="#1A3D6E" strokeWidth="1" />
              <path d="M60 40 L80 60 L60 80 L40 60 Z"  fill="none" stroke="#1A3D6E" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diamonds)" />
        </svg>
      </div>

      {/* ── HERO ── */}
      <section className="relative z-10 bg-gradient-to-br from-navy-900 to-[#2563EB] px-4 py-20 text-center overflow-hidden">
        <span className="inline-block bg-white/15 border border-white/30 text-white text-xs font-medium px-4 py-1.5 rounded-full mb-5">
          🏠 N°1 de l'immobilier en Guinée
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
          Trouvez votre bien<br />idéal en <span className="text-orange">Guinée</span>
        </h1>
        <p className="text-white/80 text-base md:text-lg mb-10 max-w-xl mx-auto">
          Des milliers d'annonces de maisons, appartements et terrains à Conakry et dans tout le pays.
        </p>

        {/* Search box */}
        <form onSubmit={handleSearch} className="inline-flex flex-wrap gap-2 bg-white rounded-2xl p-2 shadow-2xl max-w-3xl w-full mx-auto items-center">
          <select
            value={searchType}
            onChange={e => setSearchType(e.target.value)}
            className="flex-1 min-w-[110px] px-3 py-2.5 border-2 border-slate-200 rounded-lg text-sm font-['Inter'] focus:outline-none focus:border-navy-900 cursor-pointer"
          >
            <option value="vente">Acheter</option>
            <option value="location">Louer</option>
          </select>
          <select
            value={searchBien}
            onChange={e => setSearchBien(e.target.value)}
            className="flex-1 min-w-[120px] px-3 py-2.5 border-2 border-slate-200 rounded-lg text-sm font-['Inter'] focus:outline-none focus:border-navy-900 cursor-pointer"
          >
            <option value="">Tout type</option>
            <option value="maison">Maison</option>
            <option value="appartement">Appartement</option>
            <option value="terrain">Terrain</option>
          </select>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Commune, ville..."
            className="flex-[2] min-w-[140px] px-3 py-2.5 border-2 border-slate-200 rounded-lg text-sm font-['Inter'] focus:outline-none focus:border-navy-900"
          />
          <input
            type="text"
            value={searchQuartier}
            onChange={e => setSearchQuartier(e.target.value)}
            placeholder="Quartier..."
            className="flex-[1] min-w-[120px] px-3 py-2.5 border-2 border-slate-200 rounded-lg text-sm font-['Inter'] focus:outline-none focus:border-navy-900"
          />
          <button type="submit" className="btn-orange flex items-center gap-2 whitespace-nowrap">
            <Search size={15} /> Rechercher
          </button>
        </form>

        {/* Stats */}
        <div className="flex gap-10 justify-center mt-10">
          {[
            [stats.annonces,      'Annonces actives'],
            [stats.proprietaires, 'Propriétaires'],
            [stats.agences,       'Agences'],
          ].map(([n, l]) => (
            <div key={l} className="text-white text-center">
              <strong className="block text-2xl font-extrabold">{n > 0 ? `${n}+` : n}</strong>
              <span className="text-xs opacity-70">{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FILTRES RAPIDES ── */}
      <div className="relative z-10 flex gap-2.5 justify-center px-4 pt-7 pb-2 flex-wrap">
        {QUICK_FILTERS.map((f, i) => (
          <button
            key={i}
            className={`filter-chip${activeFilter === i ? ' active' : ''}`}
            onClick={() => setActiveFilter(i)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── ANNONCES RÉCENTES ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Annonces récentes</h2>
          <button onClick={() => navigate('/annonces')} className="text-navy-900 text-sm font-semibold hover:underline">
            Voir tout →
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : annonces.length === 0 ? (
          <div className="text-center text-slate-400 py-16">Aucune annonce pour le moment.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {annonces.map(a => (
              <AnnonceCard key={a.id} annonce={a} isFav={favoris.has(a.id)} onFavToggle={toggleFavori} />
            ))}
          </div>
        )}
      </div>

      {/* ── CTA PUBLIER ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 mb-16">
        <div className="bg-gradient-to-r from-orange to-orange-dark rounded-2xl p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
            Vous avez un bien à vendre ou à louer ?
          </h2>
          <p className="text-white/85 text-base mb-7">
            Publiez votre annonce et touchez des milliers d'acheteurs potentiels.
          </p>
          <button
            onClick={() => navigate('/inscription')}
            className="bg-white text-orange font-bold px-8 py-3.5 rounded-xl text-sm hover:bg-slate-50 transition-colors"
          >
            Publier gratuitement
          </button>
        </div>
      </div>
    </div>
  )
}
