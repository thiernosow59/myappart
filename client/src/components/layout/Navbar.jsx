import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Menu, X, User, LogOut, Plus, MessageSquare, Heart } from 'lucide-react'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate  = useNavigate()
  const [open, setOpen]       = useState(false)
  const [dropdown, setDropdown] = useState(false)

  const canPublish = profile?.role === 'proprietaire' || profile?.role === 'agence'

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo/MyAppart.png" alt="MyAppart" className="h-9" />
        </Link>

        {/* Nav links — desktop */}
        <div className="hidden md:flex items-center gap-7">
          <Link to="/annonces?type=vente"    className="text-slate-500 text-sm font-medium hover:text-navy-900 transition-colors">Acheter</Link>
          <Link to="/annonces?type=location" className="text-slate-500 text-sm font-medium hover:text-navy-900 transition-colors">Louer</Link>
          <Link to="/annonces?bien=terrain"  className="text-slate-500 text-sm font-medium hover:text-navy-900 transition-colors">Terrains</Link>
        </div>

        {/* Right */}
        <div className="hidden md:flex items-center gap-3">
          {canPublish && (
            <Link to="/publier" className="btn-orange flex items-center gap-1.5 text-sm">
              <Plus size={15} /> Publier
            </Link>
          )}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdown(d => !d)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-navy-900 flex items-center justify-center text-white text-xs font-bold">
                  {profile?.prenom?.[0] || profile?.nom?.[0] || '?'}
                </div>
                <span className="text-sm font-medium text-slate-700">{profile?.prenom || 'Mon compte'}</span>
              </button>
              {dropdown && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                  <Link to="/compte" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setDropdown(false)}>
                    <User size={15} /> Mon compte
                  </Link>
                  <Link to="/messages" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setDropdown(false)}>
                    <MessageSquare size={15} /> Messages
                  </Link>
                  <Link to="/favoris" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setDropdown(false)}>
                    <Heart size={15} /> Favoris
                  </Link>
                  {canPublish && (
                    <Link to="/mes-annonces" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setDropdown(false)}>
                      <Plus size={15} /> Mes annonces
                    </Link>
                  )}
                  <hr className="my-1 border-slate-100" />
                  <button onClick={handleSignOut} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full text-left">
                    <LogOut size={15} /> Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/connexion" className="btn-outline text-sm">Connexion</Link>
              <Link to="/inscription" className="btn-primary text-sm">Inscription</Link>
            </>
          )}
        </div>

        {/* Mobile burger */}
        <button className="md:hidden p-2" onClick={() => setOpen(o => !o)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-3 flex flex-col gap-3">
          <Link to="/annonces?type=vente"    className="text-slate-600 text-sm py-1" onClick={() => setOpen(false)}>Acheter</Link>
          <Link to="/annonces?type=location" className="text-slate-600 text-sm py-1" onClick={() => setOpen(false)}>Louer</Link>
          <Link to="/annonces?bien=terrain"  className="text-slate-600 text-sm py-1" onClick={() => setOpen(false)}>Terrains</Link>
          {!user && (
            <div className="flex gap-2 pt-2">
              <Link to="/connexion"   className="btn-outline flex-1 text-center text-sm" onClick={() => setOpen(false)}>Connexion</Link>
              <Link to="/inscription" className="btn-primary flex-1 text-center text-sm" onClick={() => setOpen(false)}>Inscription</Link>
            </div>
          )}
          {user && (
            <button onClick={handleSignOut} className="text-red-500 text-sm py-1 text-left">Déconnexion</button>
          )}
        </div>
      )}
    </nav>
  )
}
