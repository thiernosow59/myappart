import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { profileApi } from '../lib/api'

export default function ComptePage() {
  const navigate = useNavigate()
  const { user, profile, signOut, loadProfile } = useAuth()

  const [form, setForm] = useState({
    nom:    profile?.nom    || '',
    prenom: profile?.prenom || '',
    phone:  profile?.phone  || '',
    role:   profile?.role   || 'utilisateur',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  if (!user) {
    navigate('/connexion')
    return null
  }

  async function handleSave(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await profileApi.create({ supabase_uid: user.id, ...form })
      await loadProfile(user)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const ROLE_LABELS = { utilisateur: '🔍 Utilisateur', proprietaire: '🏠 Propriétaire', agence: '🏢 Agence' }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-800 mb-8">Mon compte</h1>

      {/* Infos compte */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-navy-900 flex items-center justify-center text-white text-2xl font-bold">
            {profile?.prenom?.[0] || profile?.nom?.[0] || '?'}
          </div>
          <div>
            <div className="font-bold text-slate-800">{profile?.prenom} {profile?.nom}</div>
            <div className="text-sm text-slate-400">{profile?.email || user.email}</div>
            <div className="text-xs bg-navy-50 text-navy-900 border border-navy-100 px-2 py-0.5 rounded-full inline-block mt-1">
              {ROLE_LABELS[profile?.role] || profile?.role}
            </div>
          </div>
        </div>

        {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-lg mb-4">Profil mis à jour !</div>}
        {error   && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Nom *</label>
              <input className="input-field" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Prénom *</label>
              <input className="input-field" value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} required />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Téléphone</label>
            <div className="flex gap-2">
              <span className="input-field w-auto px-3 text-slate-500 bg-slate-50 shrink-0">+224</span>
              <input className="input-field" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))} placeholder="6XXXXXXXX" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-2 block">Rôle</label>
            <div className="input-field bg-slate-50 text-slate-500 cursor-not-allowed">
              {ROLE_LABELS[profile?.role] || profile?.role}
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>
      </div>

      <button onClick={async () => { await signOut(); navigate('/') }}
        className="text-sm text-red-500 hover:text-red-700 font-medium">
        Se déconnecter
      </button>
    </div>
  )
}
