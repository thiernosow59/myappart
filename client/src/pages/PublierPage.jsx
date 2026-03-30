import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { annoncesApi, uploadApi, clientsApi } from '../lib/api'
import { ImagePlus, X as XIcon } from 'lucide-react'

const EQUIPEMENTS = [
  { key: 'eau_courante', label: 'Eau courante' },
  { key: 'electricite',  label: 'Électricité' },
  { key: 'cloture',      label: 'Clôture' },
  { key: 'parking',      label: 'Parking' },
  { key: 'piscine',      label: 'Piscine' },
  { key: 'gardien',      label: 'Gardien' },
  { key: 'ascenseur',    label: 'Ascenseur' },
  { key: 'climatisation',label: 'Climatisation' },
  { key: 'groupe_electrogene', label: 'Groupe électrogène' },
  { key: 'internet',     label: 'Internet' },
  { key: 'autres',       label: 'Autres' },
]
const COMMUNES = ['Kaloum', 'Matam', 'Ratoma', 'Dixinn', 'Matoto', 'Autres']

export default function PublierPage() {
  const navigate = useNavigate()
  const { user, profile, getToken } = useAuth()

  const canPublish = profile?.role === 'proprietaire' || profile?.role === 'agence'
  const isAgence   = profile?.role === 'agence'

  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [photos, setPhotos]     = useState([]) // { file, preview, type }
  const [uploading, setUploading] = useState(false)
  const [clients, setClients]   = useState([])

  const [form, setForm] = useState({
    type_bien: 'maison', transaction: 'vente',
    titre: '', description: '',
    prix: '', negotiable: false,
    ville: 'Conakry', commune: '', quartier: '', adresse: '',
    surface_m2: '', nb_pieces: '', nb_chambres: '', nb_salles_bain: '',
    nb_etages: '', etage: '', nb_etages_total: '',
    etat: 'bon_etat', equipements: [], equipements_autres: '',
    client_id: '',
  })

  useEffect(() => {
    if (isAgence) {
      getToken().then(token => clientsApi.list(token).then(setClients).catch(() => {}))
    }
  }, [isAgence])

  function setF(k, v) { setForm(f => ({ ...f, [k]: v })); setError('') }

  function toggleEquip(key) {
    setForm(f => ({
      ...f,
      equipements: f.equipements.includes(key)
        ? f.equipements.filter(e => e !== key)
        : [...f.equipements, key],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.titre.trim()) return setError('Le titre est requis')
    if (!form.prix || isNaN(form.prix)) return setError('Le prix est requis (nombre entier en GNF)')
    if (!form.commune) return setError('La commune est requise')
    setLoading(true)
    try {
      const token = await getToken()
      const equips = form.equipements.filter(e => e !== 'autres')
      const annonce = await annoncesApi.create({
        ...form,
        prix: parseInt(form.prix),
        surface_m2: form.surface_m2 ? parseInt(form.surface_m2) : null,
        nb_pieces: form.nb_pieces ? parseInt(form.nb_pieces) : null,
        nb_chambres: form.nb_chambres ? parseInt(form.nb_chambres) : null,
        nb_salles_bain: form.nb_salles_bain ? parseInt(form.nb_salles_bain) : null,
        nb_etages: form.nb_etages ? parseInt(form.nb_etages) : null,
        etage: form.etage ? parseInt(form.etage) : null,
        nb_etages_total: form.nb_etages_total ? parseInt(form.nb_etages_total) : null,
        equipements: equips,
      }, token)

      // Upload des photos
      if (photos.length > 0) {
        setUploading(true)
        for (let i = 0; i < photos.length; i++) {
          const p = photos[i]
          await uploadApi.uploadPhoto(annonce.id, p.file, i === 0 ? 'principale' : 'galerie', token)
        }
        setUploading(false)
      }

      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return (
    <div className="text-center py-20">
      <p className="text-slate-500 mb-4">Vous devez être connecté pour publier.</p>
      <button onClick={() => navigate('/connexion')} className="btn-primary">Se connecter</button>
    </div>
  )

  if (!canPublish) return (
    <div className="max-w-lg mx-auto text-center py-20 px-4">
      <div className="text-5xl mb-4">🔒</div>
      <h2 className="text-xl font-bold text-slate-800 mb-3">Compte Propriétaire requis</h2>
      <p className="text-slate-500 mb-6">Seuls les propriétaires et agences peuvent publier des annonces. Modifiez votre profil pour continuer.</p>
      <button onClick={() => navigate('/compte')} className="btn-primary">Modifier mon profil</button>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Publier une annonce</h1>
      <p className="text-slate-500 text-sm mb-8">Renseignez les informations de votre bien.</p>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type bien + transaction */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-slate-700 mb-4">Type de bien</h2>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[['maison','🏠 Maison'],['appartement','🏢 Appartement'],['terrain','🌿 Terrain']].map(([v,l]) => (
              <button type="button" key={v} onClick={() => setF('type_bien', v)}
                className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${form.type_bien === v ? 'border-navy-900 bg-navy-50 text-navy-900' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                {l}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[['vente','🏷️ Vente'],['location','🔑 Location']].map(([v,l]) => (
              <button type="button" key={v} onClick={() => setF('transaction', v)}
                disabled={v === 'location' && form.type_bien === 'terrain'}
                className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${form.transaction === v ? 'border-navy-900 bg-navy-50 text-navy-900' : 'border-slate-200 text-slate-500 hover:border-slate-300'} disabled:opacity-40 disabled:cursor-not-allowed`}>
                {l}
              </button>
            ))}
          </div>
          {form.type_bien === 'terrain' && <p className="text-xs text-slate-400 mt-2">⚠️ Un terrain ne peut pas être mis en location.</p>}
        </div>

        {/* Client (agence uniquement) */}
        {isAgence && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-slate-700 mb-3">Client associé <span className="text-xs font-normal text-slate-400">(visible uniquement par vous)</span></h2>
            {clients.length === 0 ? (
              <p className="text-sm text-slate-400">Aucun client enregistré — <a href="/dashboard" className="text-navy-900 underline">ajoutez-en un depuis le dashboard</a>.</p>
            ) : (
              <select className="input-field" value={form.client_id} onChange={e => setF('client_id', e.target.value)}>
                <option value="">— Aucun client (bien propre à l'agence) —</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.prenom} {c.nom}{c.phone ? ` · +224 ${c.phone}` : ''}</option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Titre + description */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-700">Présentation</h2>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Titre de l'annonce *</label>
            <input className="input-field" placeholder="Villa F5 avec jardin, Ratoma" value={form.titre} onChange={e => setF('titre', e.target.value)} required />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Description</label>
            <textarea className="input-field resize-none" rows={4} placeholder="Décrivez votre bien..." value={form.description} onChange={e => setF('description', e.target.value)} />
          </div>
        </div>

        {/* Prix */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-700">Prix</h2>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Prix en GNF *</label>
            <div className="flex gap-2 items-center">
              <input type="number" className="input-field" placeholder="185000000" value={form.prix} onChange={e => setF('prix', e.target.value)} required />
              <span className="text-sm font-semibold text-slate-500 shrink-0">GNF{form.transaction === 'location' ? '/mois' : ''}</span>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.negotiable} onChange={e => setF('negotiable', e.target.checked)} className="accent-navy-900" />
            <span className="text-sm text-slate-600">Prix négociable</span>
          </label>
        </div>

        {/* Localisation */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-700">Localisation</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Ville</label>
              <input className="input-field" value={form.ville} onChange={e => setF('ville', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Commune *</label>
              <select className="input-field" value={form.commune} onChange={e => setF('commune', e.target.value)} required>
                <option value="">Sélectionner</option>
                {COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Quartier</label>
            <input className="input-field" placeholder="ex: Kipé" value={form.quartier} onChange={e => setF('quartier', e.target.value)} />
          </div>
        </div>

        {/* Surface + caractéristiques */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-700">Caractéristiques</h2>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Surface (m²)</label>
            <input type="number" className="input-field" placeholder="120" value={form.surface_m2} onChange={e => setF('surface_m2', e.target.value)} />
          </div>
          {form.type_bien !== 'terrain' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Nombre de pièces</label>
                <input type="number" className="input-field" placeholder="5" value={form.nb_pieces} onChange={e => setF('nb_pieces', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Chambres</label>
                <input type="number" className="input-field" placeholder="3" value={form.nb_chambres} onChange={e => setF('nb_chambres', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Salles de bain</label>
                <input type="number" className="input-field" placeholder="2" value={form.nb_salles_bain} onChange={e => setF('nb_salles_bain', e.target.value)} />
              </div>
              {form.type_bien === 'maison' && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Nbre d'étages</label>
                  <input type="number" className="input-field" placeholder="2" value={form.nb_etages} onChange={e => setF('nb_etages', e.target.value)} />
                </div>
              )}
              {form.type_bien === 'appartement' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Étage</label>
                    <input type="number" className="input-field" placeholder="3" value={form.etage} onChange={e => setF('etage', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Nbre d'étages total</label>
                    <input type="number" className="input-field" placeholder="6" value={form.nb_etages_total} onChange={e => setF('nb_etages_total', e.target.value)} />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* État + équipements */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-700">État & équipements</h2>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-2 block">État du bien</label>
            <div className="grid grid-cols-3 gap-2">
              {[['neuf','✨ Neuf'],['bon_etat','👍 Bon état'],['a_renover','🔨 À rénover']].map(([v,l]) => (
                <button type="button" key={v} onClick={() => setF('etat', v)}
                  className={`py-2.5 rounded-xl border-2 text-xs font-semibold transition-all ${form.etat === v ? 'border-navy-900 bg-navy-50 text-navy-900' : 'border-slate-200 text-slate-500'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-2 block">Équipements</label>
            <div className="flex flex-wrap gap-2">
              {EQUIPEMENTS.map(eq => (
                <button type="button" key={eq.key} onClick={() => toggleEquip(eq.key)}
                  className={`px-3 py-1.5 rounded-full border-2 text-xs font-medium transition-all ${form.equipements.includes(eq.key) ? 'border-navy-900 bg-navy-50 text-navy-900' : 'border-slate-200 text-slate-500'}`}>
                  {eq.label}
                </button>
              ))}
            </div>
          </div>
          {form.equipements.includes('autres') && (
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Précisez les autres équipements</label>
              <input className="input-field" placeholder="ex: Citerne, Fosse septique..." value={form.equipements_autres} onChange={e => setF('equipements_autres', e.target.value)} />
            </div>
          )}
        </div>

        {/* Photos */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-700">Photos <span className="text-xs font-normal text-slate-400">(max 5 Mo par photo, jpeg/png/webp)</span></h2>
          <div className="flex flex-wrap gap-3">
            {photos.map((p, i) => (
              <div key={i} className="relative w-24 h-24">
                <img src={p.preview} alt="" className="w-24 h-24 object-cover rounded-xl border-2 border-slate-200" />
                {i === 0 && <span className="absolute bottom-1 left-1 bg-navy-900 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">PRINCIPALE</span>}
                <button type="button" onClick={() => setPhotos(ps => ps.filter((_, j) => j !== i))}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <XIcon size={10} className="text-white" />
                </button>
              </div>
            ))}
            {photos.length < 10 && (
              <label className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-navy-900 transition-colors">
                <ImagePlus size={20} className="text-slate-400" />
                <span className="text-xs text-slate-400 mt-1">Ajouter</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
                  onChange={e => {
                    const files = Array.from(e.target.files || [])
                    const newPhotos = files.map(f => ({ file: f, preview: URL.createObjectURL(f) }))
                    setPhotos(ps => [...ps, ...newPhotos].slice(0, 10))
                    e.target.value = ''
                  }}
                />
              </label>
            )}
          </div>
          {photos.length === 0 && <p className="text-xs text-slate-400">La première photo sera la photo principale.</p>}
        </div>

        <button type="submit" disabled={loading || uploading} className="btn-orange w-full py-4 text-base">
          {uploading ? '📷 Upload photos...' : loading ? 'Publication en cours...' : '📤 Publier l\'annonce'}
        </button>
      </form>
    </div>
  )
}
