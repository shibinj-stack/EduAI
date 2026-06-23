import { auth } from './firebase'
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

async function token() {
  const u = auth.currentUser
  if (!u) throw new Error('Not signed in')
  return await u.getIdToken()
}

export async function api(path, { method='GET', body, formData } = {}) {
  const headers = { Authorization: `Bearer ${await token()}` }
  let payload
  if (formData) payload = formData
  else if (body !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body) }
  const res = await fetch(`${BASE}${path}`, { method, headers, body: payload })
  if (!res.ok) throw new Error((await res.text()) || res.statusText)
  return res.json()
}
