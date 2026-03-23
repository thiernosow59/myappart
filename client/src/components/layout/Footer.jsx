import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-white/70 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img src="/logo/MyAppart.png" alt="MyAppart" className="h-8 brightness-0 invert" />
            <span className="text-white font-bold text-base">My Appart</span>
          </div>
          <p className="text-xs leading-relaxed">N°1 de l'immobilier en Guinée. Achat, vente, location.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Rechercher</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/annonces?type=vente"    className="hover:text-white transition-colors">Acheter</Link></li>
            <li><Link to="/annonces?type=location" className="hover:text-white transition-colors">Louer</Link></li>
            <li><Link to="/annonces?bien=terrain"  className="hover:text-white transition-colors">Terrains</Link></li>
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
          <h4 className="text-white font-semibold text-sm mb-3">TS Group</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="https://ts-group.fr" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">ts-group.fr</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 text-center text-xs py-4 px-6">
        © {new Date().getFullYear()} <span className="text-white font-semibold">MyAppart</span> · TS Group · Guinée · Tous droits réservés
      </div>
    </footer>
  )
}
