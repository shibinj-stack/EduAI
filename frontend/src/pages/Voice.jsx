import { useRef, useState } from 'react'
import { Mic } from 'lucide-react'
import { api } from '../lib/api.js'

export default function Voice() {
  const [lang, setLang] = useState(localStorage.getItem('lang')||'en-US')
  const [log, setLog] = useState([])
  const [listening, setListening] = useState(false)
  const recRef = useRef(null)

  const speak = (t) => { const u = new SpeechSynthesisUtterance(t); u.lang = lang; speechSynthesis.speak(u) }
  const start = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return alert('Speech recognition not supported in this browser')
    const r = new SR(); r.lang = lang; r.continuous = false
    setListening(true)
    r.onresult = async (e) => {
      const text = e.results[0][0].transcript
      setLog(l => [...l, {role:'user', content:text}])
      try { const { reply } = await api('/voice', {method:'POST', body:{message:text, language:lang}}); setLog(l => [...l, {role:'assistant', content:reply}]); speak(reply) } catch(x){}
    }
    r.onend = () => setListening(false)
    r.start(); recRef.current = r
  }
  return (
    <div className="glass p-6 space-y-4">
      <h2 className="font-bold text-violet-600 dark:text-violet-300">Voice Assistant</h2>
      <select className="input max-w-xs" value={lang} onChange={e=>{setLang(e.target.value); localStorage.setItem('lang', e.target.value)}}>
        <option value="en-US">English (US)</option>
        <option value="en-IN">English (India)</option>
        <option value="hi-IN">Hindi</option>
        <option value="es-ES">Spanish</option>
        <option value="fr-FR">French</option>
      </select>
      <button onClick={start} className={`btn btn-primary flex items-center gap-2 ${listening?'animate-pulse':''}`}><Mic size={18}/> {listening?'Listening…':'Tap to speak'}</button>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {log.map((m,i)=>(<div key={i} className={`p-3 rounded-xl ${m.role==='user'?'bg-violet-100 dark:bg-violet-500/10':'glass'}`}><b>{m.role==='user'?'You':'AI'}:</b> {m.content}</div>))}
      </div>
    </div>
  )
}
