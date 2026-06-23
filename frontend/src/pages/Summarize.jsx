import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { api } from '../lib/api.js'
export default function Summarize() {
  const [t,setT]=useState(''); const [s,setS]=useState(''); const [l,setL]=useState(false)
  return (
    <div className="space-y-4">
      <div className="glass p-4 space-y-2">
        <textarea className="input min-h-32" placeholder="Paste long notes" value={t} onChange={e=>setT(e.target.value)}/>
        <button className="btn btn-primary" onClick={async()=>{setL(true);try{const r=await api('/summarize',{method:'POST',body:{text:t}});setS(r.summary)}finally{setL(false)}}}>{l?'...':'Summarize'}</button>
      </div>
      {s && <div className="glass p-4 prose dark:prose-invert max-w-none"><ReactMarkdown>{s}</ReactMarkdown></div>}
    </div>
  )
}
