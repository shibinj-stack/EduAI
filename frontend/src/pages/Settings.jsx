import { useEffect, useState } from 'react'
import { useTheme } from '../context/ThemeContext.jsx'
import { api } from '../lib/api.js'

// Heuristic: pick the best Male/Female voice (English).
const FEMALE_HINTS = ['female', 'samantha', 'victoria', 'zira', 'susan', 'karen', 'tessa', 'fiona', 'moira', 'aria', 'jenny', 'libby', 'sonia']
const MALE_HINTS   = ['male', 'daniel', 'alex', 'david', 'mark', 'fred', 'george', 'oliver', 'ryan', 'guy', 'tony']

export function pickVoice(gender) {
  const voices = window.speechSynthesis?.getVoices?.() || []
  if (!voices.length) return null
  const hints = gender === 'male' ? MALE_HINTS : FEMALE_HINTS
  const pool = voices.filter(v => v.lang?.toLowerCase().startsWith('en'))
  const search = pool.length ? pool : voices
  const byHint = search.find(v => hints.some(h => v.name.toLowerCase().includes(h)))
  if (byHint) return byHint
  const idx = gender === 'male' ? Math.min(search.length - 1, 1) : 0
  return search[idx]
}

export default function Settings() {
  const { theme, toggle } = useTheme()
  const [autoRead, setAutoRead] = useState(localStorage.getItem('autoRead') === 'true')
  const [gender, setGender] = useState(localStorage.getItem('voiceGender') || 'female')
  const [clearing, setClearing] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const load = () => window.speechSynthesis?.getVoices?.()
    load()
    if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = load
  }, [])

  useEffect(() => {
    localStorage.setItem('autoRead', autoRead)
    localStorage.setItem('voiceGender', gender)
    api('/settings', { method: 'POST', body: { theme, autoRead, voiceGender: gender } }).catch(() => {})
  }, [autoRead, gender, theme])

  const preview = () => {
    const v = pickVoice(gender)
    const u = new SpeechSynthesisUtterance(
      gender === 'male' ? 'Hello, I am your male study buddy.' : 'Hello, I am your female study buddy.'
    )
    if (v) { u.voice = v; u.lang = v.lang } else { u.lang = 'en-US' }
    speechSynthesis.cancel()
    speechSynthesis.speak(u)
  }

  const clearChat = async () => {
    if (!confirm('Delete your entire AI Tutor chat history? This cannot be undone.')) return
    setClearing(true); setMsg('')
    try {
      await api('/tutor/history', { method: 'DELETE' })
      setMsg('Chat history cleared.')
    } catch (e) {
      setMsg('Failed: ' + e.message)
    } finally { setClearing(false) }
  }

  return (
    <div className="glass p-6 space-y-5 max-w-xl">
      <h2 className="font-bold text-violet-600 dark:text-violet-300">Settings</h2>

      <div className="flex justify-between items-center">
        <span>Theme</span>
        <button className="btn btn-primary" onClick={toggle}>{theme === 'dark' ? '🌙 Dark' : '☀️ Light'}</button>
      </div>

      <div className="flex justify-between items-center">
        <span>Auto-read AI answers</span>
        <input type="checkbox" checked={autoRead} onChange={e => setAutoRead(e.target.checked)} />
      </div>

      <div>
        <label className="text-sm">Voice</label>
        <div className="flex gap-2 mt-1">
          <button
            type="button"
            onClick={() => setGender('female')}
            className={`btn flex-1 ${gender === 'female' ? 'btn-primary' : 'glass'}`}
          >👩 Female</button>
          <button
            type="button"
            onClick={() => setGender('male')}
            className={`btn flex-1 ${gender === 'male' ? 'btn-primary' : 'glass'}`}
          >👨 Male</button>
          <button type="button" onClick={preview} className="btn glass">🔊 Preview</button>
        </div>
        <p className="text-xs opacity-60 mt-1">Used by the “Read answer” button in AI Tutor.</p>
      </div>

      <div className="border-t border-violet-200 dark:border-violet-400/15 pt-4">
        <h3 className="font-semibold mb-2">Chat History</h3>
        <p className="text-xs opacity-70 mb-2">Delete all messages exchanged with the AI Tutor.</p>
        <button onClick={clearChat} disabled={clearing} className="btn glass text-red-500">
          {clearing ? 'Clearing…' : '🗑 Clear chat history'}
        </button>
        {msg && <p className="text-xs mt-2 opacity-80">{msg}</p>}
      </div>
    </div>
  )
}
