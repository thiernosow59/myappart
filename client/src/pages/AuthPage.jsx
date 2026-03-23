import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLES = [
  { value: 'utilisateur',   label: '🔍 Utilisateur',   desc: 'Je cherche un bien à acheter ou louer' },
  { value: 'proprietaire',  label: '🏠 Propriétaire',  desc: 'Je publie mes propres biens' },
  { value: 'agence',        label: '🏢 Agence',        desc: 'Je publie pour le compte de clients' },
]

export default function AuthPage({ mode = 'login' }) {
  const navigate = useNavigate()
  const { signUp, signInEmail, signInPhone } = useAuth()

  const [isLogin, setIsLogin] = useState(mode === 'login')
  const [loginMethod, setLoginMethod] = useState('email') // email | phone
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  // Formulaire
  const [form, setForm] = useState({
    email: '', phone: '', password: '', nom: '', prenom: '',
    role: 'utilisateur', confirmPassword: '',
  })

  function setF(k, v) { setForm(f => ({ ...f, [k]: v })); setError('') }

  function validatePhone(phone) {
    const digits = phone.replace(/\D/g, '')
    return digits.length >= 8 && digits.length <= 12
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        if (loginMethod === 'email') {
          await signInEmail({ email: form.email, password: form.password })
        } else {
          if (!validatePhone(form.phone)) throw new Error('Numéro de téléphone invalide')
          await signInPhone({ phone: form.phone, password: form.password })
        }
        navigate('/')
      } else {
        // Inscription
        if (!form.nom.trim()) throw new Error('Le nom est requis')
        if (form.password.length < 12) throw new Error('Le mot de passe doit faire au moins 12 caractères')
        if (form.password.length > 20) throw new Error('Le mot de passe ne doit pas dépasser 20 caractères')
        if (form.password !== form.confirmPassword) throw new Error('Les mots de passe ne correspondent pas')
        if (!form.email && !form.phone) throw new Error('Email ou téléphone requis')

        let email = form.email
        if (!email && form.phone) {
          const digits = form.phone.replace(/\D/g, '')
          email = `${digits}@myappart.local`
        }

        await signUp({
          email,
          password: form.password,
          nom: form.nom,
          prenom: form.prenom,
          phone: form.phone || null,
          role: form.role,
        })
        setSuccess('Compte créé ! Vérifiez votre email pour confirmer.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-7">
            <img src="/logo/MyAppart.png" alt="MyAppart" className="h-10 mx-auto mb-3" />
            <h1 className="text-xl font-bold text-slate-800">
              {isLogin ? 'Connexion' : 'Créer un compte'}
            </h1>
          </div>

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-lg mb-5">
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Login : toggle email/phone */}
            {isLogin && (
              <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm">
                <button type="button" onClick={() => setLoginMethod('email')}
                  className={`flex-1 py-2 font-medium transition-colors ${loginMethod === 'email' ? 'bg-navy-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                  Email
                </button>
                <button type="button" onClick={() => setLoginMethod('phone')}
                  className={`flex-1 py-2 font-medium transition-colors ${loginMethod === 'phone' ? 'bg-navy-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                  Téléphone
                </button>
              </div>
            )}

            {/* Inscription : nom + prénom */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Nom *</label>
                  <input className="input-field" placeholder="SOW" value={form.nom} onChange={e => setF('nom', e.target.value)} required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Prénom</label>
                  <input className="input-field" placeholder="Thierno" value={form.prenom} onChange={e => setF('prenom', e.target.value)} />
                </div>
              </div>
            )}

            {/* Email */}
            {(loginMethod === 'email' || !isLogin) && (
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Email {!isLogin && '(ou téléphone ci-dessous)'}</label>
                <input type="email" className="input-field" placeholder="thierno@email.com"
                  value={form.email} onChange={e => setF('email', e.target.value)}
                  required={isLogin && loginMethod === 'email'} />
              </div>
            )}

            {/* Téléphone */}
            {(loginMethod === 'phone' || !isLogin) && (
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">
                  Téléphone {!isLogin && '(optionnel si email renseigné)'}
                </label>
                <div className="flex gap-2">
                  <span className="input-field w-auto px-3 text-slate-500 bg-slate-50 shrink-0">+224</span>
                  <input type="tel" className="input-field" placeholder="6XXXXXXXX"
                    value={form.phone} onChange={e => setF('phone', e.target.value.replace(/\D/g, ''))}
                    required={isLogin && loginMethod === 'phone'} />
                </div>
              </div>
            )}

            {/* Rôle (inscription) */}
            {!isLogin && (
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-2 block">Vous êtes *</label>
                <div className="space-y-2">
                  {ROLES.map(r => (
                    <label key={r.value} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.role === r.value ? 'border-navy-900 bg-navy-50' : 'border-slate-200 hover:border-slate-300'}`}>
                      <input type="radio" name="role" value={r.value} checked={form.role === r.value}
                        onChange={() => setF('role', r.value)} className="accent-navy-900" />
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{r.label}</div>
                        <div className="text-xs text-slate-400">{r.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Mot de passe */}
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">
                Mot de passe {!isLogin && '(12–20 caractères)'}
              </label>
              <input type="password" className="input-field" placeholder="••••••••••••"
                value={form.password} onChange={e => setF('password', e.target.value)} required />
            </div>

            {/* Confirmation */}
            {!isLogin && (
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Confirmer le mot de passe</label>
                <input type="password" className="input-field" placeholder="••••••••••••"
                  value={form.confirmPassword} onChange={e => setF('confirmPassword', e.target.value)} required />
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm mt-2">
              {loading ? 'Chargement...' : isLogin ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}{' '}
            <button onClick={() => { setIsLogin(l => !l); setError(''); setSuccess('') }}
              className="text-navy-900 font-semibold hover:underline">
              {isLogin ? "S'inscrire" : 'Se connecter'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
