import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'

// Read a File as a base64 data URL so we don't depend on Firebase Storage
// (rules/CORS misconfig was preventing avatars from updating).
const readAsDataURL = (file) => new Promise((resolve, reject) => {
  const r = new FileReader()
  r.onload = () => resolve(r.result)
  r.onerror = reject
  r.readAsDataURL(file)
})

export default function Profile() {
  const { user } = useAuth()
  const [p, setP] = useState({})
  const [stats, setStats] = useState({})
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    api('/profile').then(setP).catch(() => {})
    api('/stats').then(setStats).catch(() => {})
  }, [])

  const upload = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setErr('')
    if (f.size > 700 * 1024) {
      setErr('Image too large (max 700 KB). Please choose a smaller picture.')
      return
    }
    setUploading(true)
    try {
      const dataUrl = await readAsDataURL(f)
      const next = { ...p, photo: dataUrl, email: user.email }
      setP(next) // instant UI update
      await api('/profile', { method: 'POST', body: next })
    } catch (e) {
      setErr('Upload failed: ' + (e?.message || 'unknown error'))
    } finally {
      setUploading(false)
      e.target.value = '' // allow re-uploading same file
    }
  }

  const badges = []
  if ((stats.quizzes_completed || 0) >= 5) badges.push('🧠 Quiz Master')
  if ((stats.flashcards_generated || 0) >= 20) badges.push('📚 Flashcard Pro')
  if ((stats.streak || 0) >= 7) badges.push('🔥 Week Streak')

  return (
    <div className="space-y-4">
      <div className="glass p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <label className="cursor-pointer relative">
          <img
            key={p.photo || 'default'}
            src={p.photo || 'https://api.dicebear.com/9.x/initials/svg?seed=' + (user?.email || 'U')}
            className="w-20 h-20 rounded-full border-2 border-violet-500 dark:border-violet-400/60 object-cover"
            alt="avatar"
          />
          {uploading && <span className="absolute inset-0 flex items-center justify-center text-xs bg-black/40 text-white rounded-full">…</span>}
          <input type="file" accept="image/*" hidden onChange={upload} />
        </label>
        <div className="flex-1 w-full min-w-0">
          <input
            className="input mb-1"
            placeholder="Name"
            value={p.name || ''}
            onChange={e => setP({ ...p, name: e.target.value })}
            onBlur={() => api('/profile', { method: 'POST', body: p }).catch(() => {})}
          />
          <p className="text-sm opacity-70">{user?.email}</p>
          <p className="text-xs opacity-50 mt-1">Click the avatar to upload a new picture (max 700 KB).</p>
          {err && <p className="text-xs text-red-500 mt-1">{err}</p>}
        </div>
      </div>

      <div className="glass p-4">
        <h3 className="font-bold mb-2">Learning Stats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[['Quizzes', stats.quizzes_completed], ['Flashcards', stats.flashcards_generated], ['PDFs', stats.pdfs_uploaded], ['Questions', stats.ai_questions_asked]].map(([k, v]) => (
            <div key={k} className="text-center p-3 border border-violet-200 dark:border-violet-400/20 rounded-lg">
              <p className="text-2xl font-bold text-violet-600 dark:text-violet-300">{v || 0}</p>
              <p className="text-xs opacity-60">{k}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass p-4">
        <h3 className="font-bold mb-2">Achievements</h3>
        <div className="flex flex-wrap gap-2">
          {badges.length
            ? badges.map(b => <span key={b} className="px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-500/10">{b}</span>)
            : <span className="opacity-60 text-sm">Keep learning to unlock badges!</span>}
        </div>
      </div>
    </div>
  )
}
