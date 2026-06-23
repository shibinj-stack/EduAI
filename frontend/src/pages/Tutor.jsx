import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Mic, Send, Volume2, Square, Plus } from 'lucide-react'
import { api } from '../lib/api.js'
import { pickVoice } from './Settings.jsx'

export default function Tutor() {
  const [msgs, setMsgs] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [speakingIdx, setSpeakingIdx] = useState(-1)
  const recRef = useRef(null)

  useEffect(() => { api('/tutor/history').then(setMsgs).catch(() => {}) }, [])

  useEffect(() => {
    const load = () => window.speechSynthesis?.getVoices?.()
    load()
    if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = load
  }, [])

  const speak = (t, idx = -1) => {
    if (!('speechSynthesis' in window)) return
    speechSynthesis.cancel()
    const gender = localStorage.getItem('voiceGender') || 'female'
    const v = pickVoice(gender)
    const u = new SpeechSynthesisUtterance(t)
    if (v) { u.voice = v; u.lang = v.lang } else { u.lang = 'en-US' }
    u.onend = () => setSpeakingIdx(-1)
    u.onerror = () => setSpeakingIdx(-1)
    setSpeakingIdx(idx)
    speechSynthesis.speak(u)
  }

  const stop = () => { speechSynthesis.cancel(); setSpeakingIdx(-1) }

  const send = async (msg) => {
    if (!msg.trim()) return
    setMsgs(m => [...m, { role: 'user', content: msg }])
    setText(''); setLoading(true)
    try {
      const { reply } = await api('/tutor', { method: 'POST', body: { message: msg } })
      setMsgs(m => {
        const next = [...m, { role: 'assistant', content: reply }]
        if (localStorage.getItem('autoRead') === 'true') {
          setTimeout(() => speak(reply, next.length - 1), 50)
        }
        return next
      })
    } catch (e) {
      setMsgs(m => [...m, { role: 'assistant', content: 'Error: ' + e.message }])
    }
    setLoading(false)
  }

  const newChat = async () => {
    if (msgs.length && !confirm('Start a new chat? Current conversation history will be deleted.')) return
    stop()
    setMsgs([])
    try { await api('/tutor/history', { method: 'DELETE' }) } catch {}
  }

  const mic = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return alert('Speech recognition not supported')
    const r = new SR(); r.lang = 'en-US'
    r.onresult = (e) => setText(e.results[0][0].transcript)
    r.start(); recRef.current = r
  }

  const suggestions = ['Explain photosynthesis', 'Solve x²+5x+6=0', 'What is recursion?']

  return (
    <div className="glass p-3 sm:p-4 h-[calc(100vh-7rem)] sm:h-[80vh] flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold text-violet-600 dark:text-violet-300">AI Tutor</h2>
        <button onClick={newChat} className="btn btn-primary text-sm inline-flex items-center gap-1">
          <Plus size={16}/> New Chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 p-2">
        {msgs.length === 0 && (
          <div className="flex gap-2 flex-wrap">
            {suggestions.map(s => <button key={s} onClick={() => send(s)} className="btn glass text-sm">{s}</button>)}
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`max-w-[90%] sm:max-w-[80%] p-3 rounded-2xl break-words ${m.role === 'user' ? 'ml-auto bg-violet-600 text-white dark:bg-violet-500 dark:text-black' : 'glass'}`}>
            <ReactMarkdown>{m.content}</ReactMarkdown>
            {m.role === 'assistant' && (
              <button
                type="button"
                onClick={() => (speakingIdx === i ? stop() : speak(m.content, i))}
                className="mt-2 inline-flex items-center gap-1 text-xs opacity-80 hover:opacity-100"
                title={speakingIdx === i ? 'Stop' : 'Read answer'}
              >
                {speakingIdx === i ? <><Square size={14}/> Stop</> : <><Volume2 size={14}/> Read answer</>}
              </button>
            )}
          </div>
        ))}
        {loading && <p className="text-sm opacity-60">Thinking…</p>}
      </div>
      <form onSubmit={e => { e.preventDefault(); send(text) }} className="flex gap-2 mt-2">
        <button type="button" onClick={mic} className="btn glass"><Mic size={18}/></button>
        <input className="input flex-1" value={text} onChange={e => setText(e.target.value)} placeholder="Ask anything..."/>
        <button className="btn btn-primary"><Send size={18}/></button>
      </form>
    </div>
  )
}
