import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { profileApi } from '../lib/api'

const ROLES = [
  { value: 'utilisateur',  label: '🔍 Utilisateur',  desc: 'Je cherche un bien à acheter ou louer' },
  { value: 'proprietaire', label: '🏠 Propriétaire', desc: 'Je publie mes propres biens' },
  { value: 'agence',       label: '🏢 Agence',       desc: 'Je publie pour le compte de clients' },
]

export default function CompleterProfil() {
  const { user, loadProfile, signOut } = useAuth()
  const [form, setForm] = useState({ nom: '', prenom: '', phone: '', role: 'utilisateur' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function setF(k, v) { setForm(f => ({ ...f, [k]: v })); setError('') }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nom.trim())    return setError('Le nom est requis')
    if (!form.prenom.trim()) return setError('Le prénom est requis')
    setLoading(true)
    try {
      await profileApi.create({
        supabase_uid: user.id,
        email: user.email?.endsWith('@myappart.local') ? null : user.email,
        nom:    form.nom,
        prenom: form.prenom,
        phone:  form.phone || null,
        role:   form.role,
      })
      await loadProfile(user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-7">
            <img src="/logo/MyAppart.png" alt="MyAppart" className="h-10 mx-auto mb-3" />
            <h1 className="text-xl font-bold text-slate-800">Compléter votre profil</h1>
            <p className="text-sm text-slate-400 mt-1">Vous avez un compte existant. Renseignez vos informations pour accéder à MyAppart.</p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-5">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Nom *</label>
                <input className="input-field" placeholder="Votre nom" value={form.nom} onChange={e => setF('nom', e.target.value)} required />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Prénom *</label>
                <input className="input-field" placeholder="Votre prénom" value={form.prenom} onChange={e => setF('prenom', e.target.value)} required />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Téléphone</label>
              <div className="flex gap-2">
                <span className="input-field w-auto px-3 text-slate-500 bg-slate-50 shrink-0">+224</span>
                <input type="tel" className="input-field" placeholder="6XXXXXXXX" maxLength={9}
                  value={form.phone} onChange={e => setF('phone', e.target.value.replace(/\D/g, '').slice(0, 9))} />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 mb-2 block">Vous êtes *</label>
              <div className="space-y-2">
                {ROLES.map(r => (
                  <label key={r.value} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.role === r.value ? 'border-navy-900 bg-navy-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input type="radio" name="role" value={r.value} checked={form.role === r.value} onChange={() => setF('role', r.value)} className="accent-navy-900" />
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{r.label}</div>
                      <div className="text-xs text-slate-400">{r.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm mt-2">
              {loading ? 'Enregistrement...' : 'Accéder à MyAppart'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-4">
            <button onClick={signOut} className="hover:underline">Se déconnecter</button>
          </p>
        </div>
      </div>
    </div>
  )
}
