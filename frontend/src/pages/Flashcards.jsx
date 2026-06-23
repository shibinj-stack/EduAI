import { useState } from 'react'
import { api } from '../lib/api.js'
export default function Flashcards() {
  const [notes, setNotes] = useState(''); const [cards, setCards] = useState([]); const [flip, setFlip] = useState({}); const [loading, setLoading] = useState(false)
  const gen = async () => { setLoading(true); try { const r = await api('/flashcards', {method:'POST', body:{notes, num:8}}); setCards(r.cards||[]) } finally { setLoading(false) } }
  return (
    <div className="space-y-4">
      <div className="glass p-4 space-y-2">
        <textarea className="input min-h-24" placeholder="Paste your notes" value={notes} onChange={e=>setNotes(e.target.value)}/>
        <button className="btn btn-primary" onClick={gen} disabled={loading}>{loading?'...':'Generate Flashcards'}</button>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        {cards.map((c,i)=>(
          <div key={i} onClick={()=>setFlip({...flip,[i]:!flip[i]})} className="glass p-4 h-40 cursor-pointer flex items-center justify-center text-center transition-transform hover:scale-105">
            <p>{flip[i] ? c.back : c.front}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
