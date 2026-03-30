import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { messagesApi } from '../lib/api'
import { Send, Check, CheckCheck } from 'lucide-react'

const QUICK_REPLIES_ACHETEUR = [
  'Toujours disponible ?',
  'Je suis intéressé(e)',
  'Quand puis-je visiter ?',
  'Quel est le prix final ?',
  'Y a-t-il une négociation possible ?',
  'Merci pour l\'info',
]

const QUICK_REPLIES_PROPRIETAIRE = [
  'Oui, toujours disponible !',
  'Le bien est déjà réservé',
  'Visite possible, contactez-moi',
  'Prix ferme, non négociable',
  'Je vous recontacte sous 24h',
  'D\'accord, à bientôt',
]

function containsContact(text) {
  const phoneRegex    = /(\+?[\d\s\-.()\u0660-\u0669\u06F0-\u06F9]{7,})/
  const phoneWordsRegex = /\b(z[eé]ro|un|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|treize|quatorze|quinze|seize|vingt|trente|quarante|cinquante|soixante|cent|mille)(\s+(z[eé]ro|un|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|treize|quatorze|quinze|seize|vingt|trente|quarante|cinquante|soixante|cent|mille)){3,}/i
  const emailRegex    = /[a-zA-Z0-9._%+\-]+\s*[@＠]\s*[a-zA-Z0-9.\-]+\s*\.\s*[a-zA-Z]{2,}/
  return phoneRegex.test(text) || phoneWordsRegex.test(text) || emailRegex.test(text)
}

export default function MessagesPage() {
  const navigate = useNavigate()
  const { user, profile, getToken } = useAuth()

  const [conversations, setConversations] = useState([])
  const [selected, setSelected]           = useState(null)
  const [messages, setMessages]           = useState([])
  const [newMsg, setNewMsg]               = useState('')
  const [sending, setSending]             = useState(false)
  const [contactError, setContactError]   = useState(false)
  const bottomRef  = useRef(null)
  const pollRef    = useRef(null)
  const selectedId = useRef(null)

  useEffect(() => {
    if (!user) { navigate('/connexion'); return }
    loadConversations()
  }, [user])

  useEffect(() => {
    if (selected) {
      selectedId.current = selected.id
      loadMessages(selected.id)
      // Polling toutes les 3 secondes
      clearInterval(pollRef.current)
      pollRef.current = setInterval(() => {
        if (selectedId.current) loadMessages(selectedId.current, true)
      }, 3000)
    }
    return () => clearInterval(pollRef.current)
  }, [selected])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadConversations() {
    const token = await getToken()
    const data  = await messagesApi.listConversations(token)
    setConversations(data || [])
    if (data?.length > 0 && !selectedId.current) setSelected(data[0])
  }

  async function loadMessages(convId, silent = false) {
    try {
      const token = await getToken()
      const data  = await messagesApi.getMessages(convId, token)
      setMessages(prev => {
        // Ne scroller que si nouveau message
        if (silent && prev.length === data?.length) return prev
        return data || []
      })
      // Rafraîchir les badges non-lus
      if (!silent) loadConversations()
    } catch (_) {}
  }

  async function sendMsg(e) {
    e.preventDefault()
    if (!newMsg.trim()) return
    if (containsContact(newMsg)) { setContactError(true); return }
    setContactError(false)
    setSending(true)
    try {
      const token = await getToken()
      await messagesApi.sendMessage({ conversation_id: selected.id, contenu: newMsg }, token)
      setNewMsg('')
      await loadMessages(selected.id)
    } catch (err) {
      alert(err.message)
    } finally {
      setSending(false)
    }
  }

  function selectConversation(conv) {
    setSelected(conv)
    // Marquer comme lu visuellement
    setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, non_lus: '0' } : c))
  }

  if (!user) return null

  const totalNonLus = conversations.reduce((sum, c) => sum + parseInt(c.non_lus || 0), 0)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Messages</h1>
        {totalNonLus > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {totalNonLus}
          </span>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex h-[600px]">

        {/* Liste conversations */}
        <div className="w-72 border-r border-slate-100 overflow-y-auto shrink-0">
          {conversations.length === 0 ? (
            <div className="text-center text-slate-400 text-sm py-10 px-4">Aucune conversation.</div>
          ) : conversations.map(conv => {
            const nonLus = parseInt(conv.non_lus || 0)
            return (
              <button key={conv.id} onClick={() => selectConversation(conv)}
                className={`w-full text-left px-4 py-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${selected?.id === conv.id ? 'bg-navy-50 border-l-2 border-l-navy-900' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-800 line-clamp-1 flex-1">{conv.annonce_titre || 'Annonce'}</div>
                  {nonLus > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shrink-0 ml-1">
                      {nonLus}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{conv.interlocuteur || '—'}</div>
                {conv.dernier_message && (
                  <div className="text-xs text-slate-400 mt-1 line-clamp-1">{conv.dernier_message}</div>
                )}
              </button>
            )
          })}
        </div>

        {/* Zone messages */}
        <div className="flex-1 flex flex-col min-w-0">
          {selected ? (
            <>
              {/* Header */}
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-800">{selected.annonce_titre || 'Annonce'}</div>
                  <div className="text-xs text-slate-400">{selected.interlocuteur}</div>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400" title="Actualisation automatique" />
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {messages.map(msg => {
                  const isMe = msg.sender_id === profile?.id
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-navy-900 text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'}`}>
                        {msg.contenu}
                        <div className={`flex items-center gap-1 justify-end mt-1 ${isMe ? 'text-white/60' : 'text-slate-400'}`}>
                          <span className="text-[10px]">
                            {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && (
                            msg.lu
                              ? <CheckCheck size={12} className="text-sky-300" />
                              : <Check size={12} className="text-white/50" />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>

              {/* Réponses rapides */}
              <div className="px-4 pt-2 flex gap-1.5 flex-wrap border-t border-slate-50">
                {(profile?.role === 'proprietaire' || profile?.role === 'agence' ? QUICK_REPLIES_PROPRIETAIRE : QUICK_REPLIES_ACHETEUR).map(r => (
                  <button key={r} type="button"
                    onClick={() => setNewMsg(r)}
                    className="text-xs bg-slate-100 hover:bg-navy-50 hover:text-navy-900 hover:border-navy-200 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full transition-colors">
                    {r}
                  </button>
                ))}
              </div>

              {/* Input */}
              <form onSubmit={sendMsg} className="px-4 py-3">
                {contactError && (
                  <p className="text-xs text-red-500 mb-2">⚠️ Les numéros de téléphone et emails ne sont pas autorisés.</p>
                )}
                <div className="flex gap-2">
                  <input
                    className="input-field flex-1"
                    placeholder="Votre message..."
                    value={newMsg}
                    onChange={e => { setNewMsg(e.target.value); setContactError(false) }}
                    disabled={sending}
                  />
                  <button type="submit" disabled={sending || !newMsg.trim()} className="btn-primary px-4">
                    <Send size={15} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
              Sélectionnez une conversation
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
