import { useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { api } from '../lib/api.js'
export default function Solver() {
  const [a,setA]=useState(''); const [l,setL]=useState(false); const [hint,setHint]=useState('')
  const fileRef = useRef(null)
  const up = async e => { const f = e.target.files[0]; if(!f) return; const fd=new FormData(); fd.append('image',f); fd.append('hint',hint); setL(true); try{ const r=await api('/solve-image',{method:'POST',formData:fd}); setA(r.answer)} finally{setL(false)} }
  return (
    <div className="space-y-4">
      <div className="glass p-4 space-y-2">
        <input className="input w-full" placeholder="Optional hint" value={hint} onChange={e=>setHint(e.target.value)}/>
        <input type="file" accept="image/*" ref={fileRef} onChange={up} hidden />
        <button onClick={() => fileRef.current?.click()} className="btn btn-primary">
          Choose File
        </button>
        {l && <p>Analyzing…</p>}
      </div>
      {a && <div className="glass p-4 prose dark:prose-invert max-w-none"><ReactMarkdown>{a}</ReactMarkdown></div>}
    </div>
  )
}
