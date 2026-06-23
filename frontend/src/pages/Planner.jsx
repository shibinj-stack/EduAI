import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { api } from '../lib/api.js'
export default function Planner() {
  const [subj,setSubj]=useState(''); const [date,setDate]=useState(''); const [plan,setPlan]=useState(''); const [l,setL]=useState(false)
  return (
    <div className="space-y-4">
      <div className="glass p-4 space-y-2">
        <input className="input" placeholder="Subjects (Math, Physics, Chem)" value={subj} onChange={e=>setSubj(e.target.value)}/>
        <input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)}/>
        <button className="btn btn-primary" onClick={async()=>{setL(true);try{const r=await api('/plan',{method:'POST',body:{subjects:subj,exam_date:date}});setPlan(r.plan)}finally{setL(false)}}}>{l?'...':'Generate Plan'}</button>
      </div>
      {plan && <div className="glass p-4 prose dark:prose-invert max-w-none"><ReactMarkdown>{plan}</ReactMarkdown></div>}
    </div>
  )
}
