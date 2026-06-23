import { useState } from 'react'
import { api } from '../lib/api.js'
export default function Quiz() {
  const [topic, setTopic] = useState(''); const [q, setQ] = useState(null); const [picks, setPicks] = useState({}); const [loading, setLoading] = useState(false); const [show, setShow] = useState(false)
  const gen = async () => { setLoading(true); setShow(false); setPicks({}); try { const r = await api('/quiz', {method:'POST', body:{topic, num:5}}); setQ(r.questions) } finally { setLoading(false) } }
  const score = q ? q.reduce((a,x,i)=> a + (picks[i]===x.answer?1:0),0) : 0
  return (
    <div className="space-y-4">
      <div className="glass p-4 flex flex-col sm:flex-row gap-2">
        <input className="input flex-1" placeholder="Topic e.g. Photosynthesis" value={topic} onChange={e=>setTopic(e.target.value)}/>
        <button className="btn btn-primary" onClick={gen} disabled={loading}>{loading?'...':'Generate'}</button>
      </div>
      {q && q.map((x,i)=>(
        <div key={i} className="glass p-4">
          <p className="font-medium mb-2">{i+1}. {x.q}</p>
          <div className="space-y-1">
            {x.options.map((o,oi)=>(
              <label key={oi} className={`block p-2 rounded cursor-pointer ${show && oi===x.answer ? 'bg-green-200 dark:bg-green-500/30' : show && picks[i]===oi ? 'bg-red-200 dark:bg-red-500/30' : 'hover:bg-violet-50 dark:hover:bg-violet-500/15'}`}>
                <input type="radio" name={'q'+i} className="mr-2" disabled={show} checked={picks[i]===oi} onChange={()=>setPicks({...picks,[i]:oi})}/>
                {o}
              </label>
            ))}
          </div>
          {show && <p className="text-sm mt-2 opacity-70">💡 {x.explanation}</p>}
        </div>
      ))}
      {q && <button className="btn btn-primary" onClick={()=>setShow(true)}>Submit ({score}/{q.length})</button>}
    </div>
  )
}
