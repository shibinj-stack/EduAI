import { useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { api } from '../lib/api.js'
export default function PDFPack() {
  const [r,setR]=useState(null); const [l,setL]=useState(false)
  const fileRef = useRef(null)
  const up = async (e) => { const f = e.target.files[0]; if(!f) return; const fd = new FormData(); fd.append('pdf', f); setL(true); try { setR(await api('/pdf-pack',{method:'POST',formData:fd})) } finally { setL(false) } }
  return (
    <div className="space-y-4">
      <div className="glass p-4 space-y-2">
        <input type="file" accept="application/pdf" ref={fileRef} onChange={up} hidden />
        <button onClick={() => fileRef.current?.click()} className="btn btn-primary">
          Choose File
        </button>
        {l && <p className="mt-2">Processing PDF…</p>}
      </div>
      {r && <>
        <div className="glass p-4"><h3 className="font-bold mb-2">Summary</h3><ReactMarkdown>{r.summary}</ReactMarkdown></div>
        <div className="glass p-4"><h3 className="font-bold mb-2">Flashcards</h3><div className="grid sm:grid-cols-2 gap-2">{r.flashcards.map((c,i)=><div key={i} className="p-3 border border-violet-200 dark:border-violet-400/20 rounded"><b>{c.front}</b><p className="text-sm opacity-70">{c.back}</p></div>)}</div></div>
        <div className="glass p-4"><h3 className="font-bold mb-2">Quiz</h3>{r.quiz.map((q,i)=>(<div key={i} className="mb-3"><p>{i+1}. {q.q}</p><ul className="ml-4 text-sm opacity-80">{q.options.map((o,oi)=><li key={oi}>{oi===q.answer?'✅ ':'• '}{o}</li>)}</ul></div>))}</div>
      </>}
    </div>
  )
}
