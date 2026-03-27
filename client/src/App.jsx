import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HomePage          from './pages/HomePage'
import AnnoncesPage      from './pages/AnnoncesPage'
import AnnonceDetailPage from './pages/AnnonceDetailPage'
import AuthPage          from './pages/AuthPage'
import PublierPage       from './pages/PublierPage'
import MessagesPage      from './pages/MessagesPage'
import ComptePage        from './pages/ComptePage'
import MesAnnoncesPage   from './pages/MesAnnoncesPage'
import MentionsLegales   from './pages/MentionsLegales'
import Confidentialite   from './pages/Confidentialite'
import CompleterProfil   from './pages/CompleterProfil'

function AppContent() {
  const { needsProfile } = useAuth()

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-1">
        {needsProfile ? (
          <CompleterProfil />
        ) : (
          <Routes>
            <Route path="/"              element={<HomePage />} />
            <Route path="/annonces"      element={<AnnoncesPage />} />
            <Route path="/annonces/:id"  element={<AnnonceDetailPage />} />
            <Route path="/connexion"     element={<AuthPage mode="login" />} />
            <Route path="/inscription"   element={<AuthPage mode="register" />} />
            <Route path="/publier"       element={<PublierPage />} />
            <Route path="/messages"      element={<MessagesPage />} />
            <Route path="/compte"        element={<ComptePage />} />
            <Route path="/mes-annonces"     element={<MesAnnoncesPage />} />
            <Route path="/mentions-legales" element={<MentionsLegales />} />
            <Route path="/confidentialite"  element={<Confidentialite />} />
            <Route path="*" element={<div className="text-center py-24 text-slate-400">Page introuvable (404)</div>} />
          </Routes>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  )
}
