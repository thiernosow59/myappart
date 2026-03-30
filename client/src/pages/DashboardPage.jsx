import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { dashboardApi, clientsApi, annoncesApi } from '../lib/api'
import { Eye, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Users, X, AlertTriangle } from 'lucide-react'

const STATUT_LABEL = { active: 'Active', inactive: 'Inactive', vendu: 'Vendu', loue: 'Loué' }
const STATUT_COLOR = { active: 'bg-emerald-100 text-emerald-700', inactive: 'bg-slate-100 text-slate-500', vendu: 'bg-blue-100 text-blue-700', loue: 'bg-purple-100 text-purple-700' }
const TYPE_LABEL   = { maison: 'Maison', appartement: 'Appart.', terrain: 'Terrain', villa: 'Villa', bureau: 'Bureau', magasin: 'Magasin', immeuble: 'Immeuble' }
const TRANS_LABEL  = { vente: 'Vente', location: 'Location' }

function StatCard({ label, value, sub, color = 'text-navy-900' }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-sm font-semibold text-slate-700 mt-1">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  )
}

/* ── Modal double confirmation suppression annonce ── */
function DeleteAnnonceModal({ annonce, onConfirm, onCancel, loading }) {
  const [step, setStep] = useState(1)
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Supprimer l'annonce</h3>
        </div>
        {step === 1 ? (
          <>
            <p className="text-sm text-slate-600 mb-1">Vous allez supprimer :</p>
            <p className="text-sm font-semibold text-slate-800 mb-4">« {annonce.titre} »</p>
            <p className="text-sm text-slate-500 mb-5">Cette action est <strong>irréversible</strong>. Les photos associées seront également supprimées.</p>
            <div className="flex gap-3">
              <button onClick={onCancel} className="flex-1 btn-outline py-2.5 text-sm">Annuler</button>
              <button onClick={() => setStep(2)} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors">Continuer</button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-600 mb-4">Confirmez la suppression définitive de cette annonce. <strong>Impossible de revenir en arrière.</strong></p>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 btn-outline py-2.5 text-sm">Retour</button>
              <button onClick={onConfirm} disabled={loading} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors disabled:opacity-60">
                {loading ? 'Suppression...' : 'Supprimer définitivement'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ── Modal client (créer / modifier) ── */
function ClientModal({ client, onSave, onClose, saving }) {
  const [form, setForm] = useState({ nom: client?.nom || '', prenom: client?.prenom || '', phone: client?.phone || '', email: client?.email || '', notes: client?.notes || '' })
  const [error, setError] = useState('')
  function setF(k, v) { setForm(f => ({ ...f, [k]: v })); setError('') }
  function submit(e) {
    e.preventDefault()
    if (!form.nom.trim())    return setError('Le nom est requis')
    if (!form.prenom.trim()) return setError('Le prénom est requis')
    onSave(form)
  }
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-slate-800">{client ? 'Modifier le client' : 'Nouveau client'}</h3>
          <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg mb-4">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Nom *</label>
              <input className="input-field" value={form.nom} onChange={e => setF('nom', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Prénom *</label>
              <input className="input-field" value={form.prenom} onChange={e => setF('prenom', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Téléphone</label>
            <div className="flex gap-2">
              <span className="input-field w-auto px-3 text-slate-500 bg-slate-50 shrink-0">+224</span>
              <input className="input-field" value={form.phone} onChange={e => setF('phone', e.target.value.replace(/\D/g, '').slice(0, 9))} placeholder="6XXXXXXXX" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Email</label>
            <input type="email" className="input-field" value={form.email} onChange={e => setF('email', e.target.value)} placeholder="client@email.com" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Notes (privées)</label>
            <textarea className="input-field" rows={2} value={form.notes} onChange={e => setF('notes', e.target.value)} placeholder="Observations, préférences..." />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 btn-outline py-2.5 text-sm">Annuler</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary py-2.5 text-sm">
              {saving ? 'Enregistrement...' : client ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Modal double confirmation suppression client ── */
function DeleteClientModal({ client, onConfirm, onCancel, loading }) {
  const [step, setStep] = useState(1)
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Supprimer le client</h3>
        </div>
        {step === 1 ? (
          <>
            <p className="text-sm text-slate-600 mb-1">Vous allez supprimer le client :</p>
            <p className="text-sm font-semibold text-slate-800 mb-2">{client.prenom} {client.nom}</p>
            <p className="text-sm text-slate-500 mb-5">Les annonces liées ne seront pas supprimées, mais perdront l'association avec ce client.</p>
            <div className="flex gap-3">
              <button onClick={onCancel} className="flex-1 btn-outline py-2.5 text-sm">Annuler</button>
              <button onClick={() => setStep(2)} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors">Continuer</button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-600 mb-4">Confirmer la suppression définitive de ce client.</p>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 btn-outline py-2.5 text-sm">Retour</button>
              <button onClick={onConfirm} disabled={loading} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors disabled:opacity-60">
                {loading ? 'Suppression...' : 'Supprimer définitivement'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, profile, getToken } = useAuth()

  const isAgence = profile?.role === 'agence'
  const canPublish = profile?.role === 'proprietaire' || isAgence

  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  // Modals annonces
  const [deleteAnnonce, setDeleteAnnonce] = useState(null)
  const [deletingAnnonce, setDeletingAnnonce] = useState(false)
  const [togglingId, setTogglingId]       = useState(null)
  const [disponibiliteId, setDisponibiliteId] = useState(null)

  // Modals clients
  const [clientModal, setClientModal]     = useState(null) // null | 'new' | client_obj
  const [deleteClient, setDeleteClient]   = useState(null)
  const [deletingClient, setDeletingClient] = useState(false)
  const [savingClient, setSavingClient]   = useState(false)

  useEffect(() => {
    if (!user) { navigate('/connexion'); return }
    if (!canPublish) { navigate('/'); return }
    load()
  }, [user])

  async function load() {
    setLoading(true)
    try {
      const token = await getToken()
      const res = await dashboardApi.get(token)
      setData(res)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function toggleStatut(annonce) {
    setTogglingId(annonce.id)
    try {
      const token = await getToken()
      const newStatut = annonce.statut === 'active' ? 'inactive' : 'active'
      await annoncesApi.update(annonce.id, { statut: newStatut }, token)
      setData(d => ({
        ...d,
        annonces: d.annonces.map(a => a.id === annonce.id ? { ...a, statut: newStatut } : a),
        stats: {
          ...d.stats,
          actives:   newStatut === 'active' ? d.stats.actives + 1 : d.stats.actives - 1,
          inactives: newStatut === 'inactive' ? d.stats.inactives + 1 : d.stats.inactives - 1,
        },
      }))
    } catch (e) {
      setError(e.message)
    } finally {
      setTogglingId(null)
    }
  }

  async function changeDisponibilite(annonce, val) {
    setDisponibiliteId(annonce.id)
    try {
      const token = await getToken()
      await annoncesApi.update(annonce.id, { disponibilite: val }, token)
      setData(d => ({ ...d, annonces: d.annonces.map(a => a.id === annonce.id ? { ...a, disponibilite: val } : a) }))
    } catch (e) {
      setError(e.message)
    } finally {
      setDisponibiliteId(null)
    }
  }

  async function confirmDeleteAnnonce() {
    setDeletingAnnonce(true)
    try {
      const token = await getToken()
      await annoncesApi.delete(deleteAnnonce.id, token)
      setData(d => ({ ...d, annonces: d.annonces.filter(a => a.id !== deleteAnnonce.id) }))
      setDeleteAnnonce(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setDeletingAnnonce(false)
    }
  }

  async function saveClient(form) {
    setSavingClient(true)
    try {
      const token = await getToken()
      if (clientModal === 'new') {
        const created = await clientsApi.create(form, token)
        setData(d => ({ ...d, clients: [...(d.clients || []), { ...created, nb_annonces: '0' }] }))
      } else {
        const updated = await clientsApi.update(clientModal.id, form, token)
        setData(d => ({ ...d, clients: d.clients.map(c => c.id === clientModal.id ? { ...updated, nb_annonces: c.nb_annonces } : c) }))
      }
      setClientModal(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setSavingClient(false)
    }
  }

  async function confirmDeleteClient() {
    setDeletingClient(true)
    try {
      const token = await getToken()
      await clientsApi.delete(deleteClient.id, token)
      setData(d => ({ ...d, clients: d.clients.filter(c => c.id !== deleteClient.id) }))
      setDeleteClient(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setDeletingClient(false)
    }
  }

  if (loading) return <div className="text-center py-24 text-slate-400">Chargement...</div>
  if (error)   return <div className="text-center py-24 text-red-500">{error}</div>
  if (!data)   return null

  const { stats, annonces, clients } = data

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isAgence ? 'Dashboard Agence' : 'Dashboard Propriétaire'}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {profile?.prenom} {profile?.nom}
          </p>
        </div>
        <Link to="/publier" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} /> Nouvelle annonce
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Annonces actives"  value={stats.actives}    color="text-emerald-600" />
        <StatCard label="Annonces inactives" value={stats.inactives}  color="text-slate-500" />
        <StatCard label="Vendues / Louées"  value={stats.terminees}  color="text-blue-600" />
        <StatCard label="Vues totales"      value={stats.total_vues} color="text-navy-900" sub="sur toutes les annonces" />
      </div>

      {/* Mes annonces */}
      <div className="bg-white rounded-2xl shadow-sm mb-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">Mes annonces ({annonces.length})</h2>
        </div>

        {annonces.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="mb-4">Aucune annonce publiée</p>
            <Link to="/publier" className="btn-primary text-sm">Publier ma première annonce</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 uppercase tracking-wide border-b border-slate-100">
                  <th className="text-left px-6 py-3">Annonce</th>
                  {isAgence && <th className="text-left px-4 py-3">Client</th>}
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-right px-4 py-3">Prix</th>
                  <th className="text-center px-4 py-3">Vues</th>
                  <th className="text-center px-4 py-3">Statut</th>
                  <th className="text-center px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {annonces.map(a => (
                  <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="font-medium text-slate-800 max-w-[200px] truncate">{a.titre}</div>
                      <div className="text-xs text-slate-400">{a.commune}</div>
                    </td>
                    {isAgence && (
                      <td className="px-4 py-3">
                        {a.client ? (
                          <span className="text-xs bg-navy-50 text-navy-900 border border-navy-100 px-2 py-0.5 rounded-full">
                            {a.client.prenom} {a.client.nom}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {TYPE_LABEL[a.type_bien]} · {TRANS_LABEL[a.transaction]}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-700 whitespace-nowrap">
                      {a.prix.toLocaleString('fr-FR')} GNF
                    </td>
                    <td className="px-4 py-3 text-center text-slate-500">
                      <span className="flex items-center justify-center gap-1"><Eye size={13} /> {a.nb_vues}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUT_COLOR[a.statut]}`}>
                        {STATUT_LABEL[a.statut]}
                      </span>
                      <div className="mt-1.5">
                        <select
                          value={a.disponibilite || 'disponible'}
                          onChange={e => changeDisponibilite(a, e.target.value)}
                          disabled={disponibiliteId === a.id}
                          className="text-xs border border-slate-200 rounded-lg px-1.5 py-0.5 text-slate-600 bg-white disabled:opacity-50"
                        >
                          <option value="disponible">Disponible</option>
                          {a.transaction === 'location'
                            ? <option value="loue">Loué</option>
                            : <option value="vendu">Vendu</option>
                          }
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Link to={`/annonces/${a.id}`} className="text-slate-400 hover:text-navy-900 transition-colors" title="Voir">
                          <Eye size={15} />
                        </Link>
                        <button
                          onClick={() => toggleStatut(a)}
                          disabled={togglingId === a.id || a.statut === 'vendu' || a.statut === 'loue'}
                          className="text-slate-400 hover:text-emerald-600 transition-colors disabled:opacity-30"
                          title={a.statut === 'active' ? 'Désactiver' : 'Activer'}
                        >
                          {a.statut === 'active' ? <ToggleRight size={17} className="text-emerald-500" /> : <ToggleLeft size={17} />}
                        </button>
                        <button
                          onClick={() => setDeleteAnnonce(a)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section Clients — agence uniquement */}
      {isAgence && (
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <Users size={17} /> Mes clients ({clients?.length || 0})
            </h2>
            <button onClick={() => setClientModal('new')} className="btn-primary text-sm flex items-center gap-1.5 py-2">
              <Plus size={14} /> Ajouter un client
            </button>
          </div>

          {(!clients || clients.length === 0) ? (
            <div className="text-center py-12 text-slate-400">
              <Users size={32} className="mx-auto mb-3 opacity-30" />
              <p className="mb-2">Aucun client enregistré</p>
              <p className="text-xs">Ajoutez vos clients pour les associer à vos annonces</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {clients.map(c => (
                <div key={c.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-navy-900 flex items-center justify-center text-white text-xs font-bold">
                      {c.prenom[0]}{c.nom[0]}
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">{c.prenom} {c.nom}</div>
                      <div className="text-xs text-slate-400 flex gap-3">
                        {c.phone && <span>+224 {c.phone}</span>}
                        {c.email && <span>{c.email}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-400">{c.nb_annonces} annonce{c.nb_annonces > 1 ? 's' : ''}</span>
                    <button onClick={() => setClientModal(c)} className="text-slate-400 hover:text-navy-900 transition-colors" title="Modifier">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleteClient(c)} className="text-slate-400 hover:text-red-500 transition-colors" title="Supprimer">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {deleteAnnonce && (
        <DeleteAnnonceModal
          annonce={deleteAnnonce}
          onConfirm={confirmDeleteAnnonce}
          onCancel={() => setDeleteAnnonce(null)}
          loading={deletingAnnonce}
        />
      )}
      {clientModal && (
        <ClientModal
          client={clientModal === 'new' ? null : clientModal}
          onSave={saveClient}
          onClose={() => setClientModal(null)}
          saving={savingClient}
        />
      )}
      {deleteClient && (
        <DeleteClientModal
          client={deleteClient}
          onConfirm={confirmDeleteClient}
          onCancel={() => setDeleteClient(null)}
          loading={deletingClient}
        />
      )}
    </div>
  )
}
