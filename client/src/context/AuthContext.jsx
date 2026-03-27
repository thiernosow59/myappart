import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { profileApi } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]             = useState(null)
  const [profile, setProfile]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [needsProfile, setNeedsProfile] = useState(false)

  /* ── Chargement profil Neon ── */
  async function loadProfile(sbUser) {
    if (!sbUser) { setProfile(null); setNeedsProfile(false); return }
    try {
      const data = await profileApi.get(sbUser.id)
      setProfile(data)
      setNeedsProfile(false)
    } catch (err) {
      if (err.message.includes('403') || err.message.toLowerCase().includes('désactivé')) {
        // Compte désactivé → déconnexion
        setProfile(null)
        setNeedsProfile(false)
        await supabase.auth.signOut()
        setUser(null)
      } else {
        // Pas de profil MyAppart → demander de compléter le profil
        setProfile(null)
        setNeedsProfile(true)
      }
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      loadProfile(session?.user ?? null).finally(() => setLoading(false))
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      loadProfile(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  /* ── Inscription ── */
  async function signUp({ email, password, nom, prenom, phone, role }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nom, prenom, phone, role, app_id: 'myappart' },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error

    // Créer profil Neon
    await profileApi.create({
      supabase_uid: data.user.id,
      email,
      nom,
      prenom,
      phone: phone || null,
      role,
    })

    return data
  }

  /* ── Connexion email ── */
  async function signInEmail({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  /* ── Connexion téléphone ── */
  async function signInPhone({ phone, password }) {
    // Email fictif pattern : phone@myappart.local
    const fakeEmail = `${phone.replace(/\D/g, '')}@myappart.local`
    return signInEmail({ email: fakeEmail, password })
  }

  /* ── Déconnexion ── */
  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  /* ── Token pour les appels API ── */
  async function getToken() {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token || null
  }

  const value = { user, profile, loading, needsProfile, setNeedsProfile, signUp, signInEmail, signInPhone, signOut, getToken, loadProfile }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
