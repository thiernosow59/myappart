import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

const BG_COLORS = {
  maison:      'from-blue-100 to-blue-200',
  appartement: 'from-violet-100 to-violet-200',
  terrain:     'from-yellow-100 to-yellow-200',
}
const ICONS = { maison: '🏠', appartement: '🏢', terrain: '🌿' }

function formatPrice(prix) {
  if (!prix) return '—'
  return new Intl.NumberFormat('fr-FR').format(prix) + ' GNF'
}

export default function AnnonceCard({ annonce, onFavToggle, isFav }) {
  const bg   = BG_COLORS[annonce.type_bien] || 'from-slate-100 to-slate-200'
  const icon = ICONS[annonce.type_bien] || '🏠'

  return (
    <Link to={`/annonces/${annonce.id}`} className="card-annonce block">
      {/* Image / placeholder */}
      <div className={`relative h-48 bg-gradient-to-br ${bg} flex items-center justify-center text-5xl`}>
        {annonce.photo_principale
          ? <img src={annonce.photo_principale} alt={annonce.titre} className="w-full h-full object-cover" />
          : icon
        }
        {/* Badge transaction */}
        <div className={`absolute top-3 left-3 ${annonce.transaction === 'location' ? 'badge-location' : 'badge-vente'}`}>
          {annonce.transaction === 'location' ? 'Location' : 'Vente'}
        </div>
        {/* Badge disponibilité */}
        {annonce.disponibilite && annonce.disponibilite !== 'disponible' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`text-white text-base font-extrabold px-5 py-2 rounded-full rotate-[-8deg] shadow-lg ${annonce.disponibilite === 'vendu' ? 'bg-red-500/90' : 'bg-orange-500/90'}`}>
              {annonce.disponibilite === 'vendu' ? 'Vendu' : 'Loué'}
            </div>
          </div>
        )}
        {/* Favori */}
        <button
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
          onClick={(e) => { e.preventDefault(); onFavToggle?.(annonce.id) }}
        >
          <Heart size={15} className={isFav ? 'fill-red-500 text-red-500' : 'text-slate-400'} />
        </button>
        {/* Référence */}
        <div className="absolute bottom-3 left-3 bg-black/40 text-white text-[10px] font-mono px-2 py-0.5 rounded">
          {annonce.reference}
        </div>
      </div>

      {/* Contenu */}
      <div className="p-4">
        <div className="text-xl font-extrabold text-navy-900">
          {formatPrice(annonce.prix)}
          {annonce.transaction === 'location' && <span className="text-xs font-normal text-slate-400 ml-1">/mois</span>}
        </div>
        <div className="text-sm font-semibold text-slate-800 mt-1.5 line-clamp-1">{annonce.titre}</div>
        <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
          📍 {annonce.commune && `${annonce.commune}, `}{annonce.ville || 'Conakry'}
        </div>

        {/* Features */}
        <div className="flex gap-3 mt-3 pt-3 border-t border-slate-100 flex-wrap">
          {annonce.surface_m2 && (
            <span className="text-xs text-slate-500 flex items-center gap-1">📐 {annonce.surface_m2} m²</span>
          )}
          {annonce.nb_chambres > 0 && (
            <span className="text-xs text-slate-500 flex items-center gap-1">🛏 {annonce.nb_chambres} ch.</span>
          )}
          {annonce.nb_salles_bain > 0 && (
            <span className="text-xs text-slate-500 flex items-center gap-1">🚿 {annonce.nb_salles_bain} sdb</span>
          )}
          {annonce.type_bien === 'terrain' && annonce.disponible && (
            <span className="text-xs text-emerald-600 flex items-center gap-1">✅ Disponible</span>
          )}
        </div>
      </div>
    </Link>
  )
}
