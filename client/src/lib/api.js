const BASE = import.meta.env.VITE_API_URL || '/.netlify/functions'

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

/* ── Profils ── */
export const profileApi = {
  create: (body) => req('/profile', { method: 'POST', body: JSON.stringify(body) }),
  get: (uid)   => req(`/profile?uid=${uid}`),
}

/* ── Annonces ── */
export const annoncesApi = {
  list:   (params = {}) => req('/annonces?' + new URLSearchParams(params)),
  get:    (id)          => req(`/annonces?id=${id}`),
  create: (body, token) => req('/annonces', { method: 'POST', body: JSON.stringify(body), headers: { Authorization: `Bearer ${token}` } }),
  update: (id, body, token) => req('/annonces', { method: 'PUT', body: JSON.stringify({ id, ...body }), headers: { Authorization: `Bearer ${token}` } }),
  delete: (id, token) => req('/annonces', { method: 'DELETE', body: JSON.stringify({ id }), headers: { Authorization: `Bearer ${token}` } }),
}

/* ── Messagerie ── */
export const messagesApi = {
  getOrCreateConversation: (body, token) =>
    req('/messages', { method: 'POST', body: JSON.stringify({ action: 'get_or_create_conversation', ...body }), headers: { Authorization: `Bearer ${token}` } }),
  listConversations: (token) =>
    req('/messages?action=list_conversations', { headers: { Authorization: `Bearer ${token}` } }),
  getMessages: (convId, token) =>
    req(`/messages?action=get_messages&conversation_id=${convId}`, { headers: { Authorization: `Bearer ${token}` } }),
  sendMessage: (body, token) =>
    req('/messages', { method: 'POST', body: JSON.stringify({ action: 'send_message', ...body }), headers: { Authorization: `Bearer ${token}` } }),
}

/* ── Upload photos ── */
export const uploadApi = {
  uploadPhoto: async (annonce_id, file, photo_type = 'galerie', token) => {
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result.split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
    return req('/upload', {
      method: 'POST',
      body: JSON.stringify({
        annonce_id,
        filename: file.name,
        content_type: file.type,
        size: file.size,
        data: base64,
        photo_type,
      }),
      headers: { Authorization: `Bearer ${token}` },
    })
  },
}

/* ── Stats ── */
export const statsApi = {
  get: () => req('/stats'),
}

/* ── Favoris ── */
export const favorisApi = {
  list:   (token) => req('/favoris', { headers: { Authorization: `Bearer ${token}` } }),
  toggle: (annonce_id, token) => req('/favoris', { method: 'POST', body: JSON.stringify({ annonce_id }), headers: { Authorization: `Bearer ${token}` } }),
}

/* ── Dashboard ── */
export const dashboardApi = {
  get: (token) => req('/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
}

/* ── Clients agence ── */
export const clientsApi = {
  list:   (token)              => req('/clients', { headers: { Authorization: `Bearer ${token}` } }),
  create: (body, token)        => req('/clients', { method: 'POST', body: JSON.stringify(body), headers: { Authorization: `Bearer ${token}` } }),
  update: (id, body, token)    => req('/clients', { method: 'PUT',  body: JSON.stringify({ id, ...body }), headers: { Authorization: `Bearer ${token}` } }),
  delete: (id, token)          => req('/clients', { method: 'DELETE', body: JSON.stringify({ id }), headers: { Authorization: `Bearer ${token}` } }),
}
