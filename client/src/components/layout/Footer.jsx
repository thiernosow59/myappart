import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-white/70 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img src="/logo/MyAppart.png" alt="MyAppart" className="h-8" style={{ mixBlendMode: 'screen' }} />
            <span className="text-white font-bold text-lg tracking-tight" translate="no">My Appart</span>
          </div>
          <p className="text-xs leading-relaxed">N°1 de l'immobilier en Guinée. Achat, vente, location.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Rechercher</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/annonces?type=vente"    className="hover:text-white transition-colors">Acheter</Link></li>
            <li><Link to="/annonces?type=location" className="hover:text-white transition-colors">Louer</Link></li>
            <li><Link to="/publier"  className="hover:text-white transition-colors">Vendre</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Compte</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/inscription" className="hover:text-white transition-colors">Inscription</Link></li>
            <li><Link to="/connexion"   className="hover:text-white transition-colors">Connexion</Link></li>
            <li><Link to="/publier"     className="hover:text-white transition-colors">Publier une annonce</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="mailto:contact@ts-group.fr" className="hover:text-white transition-colors">contact@ts-group.fr</a></li>
            <li><a href="tel:+224600000000" className="hover:text-white transition-colors">+224 6XX XX XX XX</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 text-center text-xs py-4 px-6">
        © {new Date().getFullYear()} <span className="text-white font-semibold">MyAppart</span> · TS Group · Guinée · Tous droits réservés
      </div>
    </footer>
  )
}
