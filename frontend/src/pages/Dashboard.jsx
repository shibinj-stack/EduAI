import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
export default function Dashboard() {
  const [s, setS] = useState({})
  useEffect(()=>{ api('/stats').then(setS).catch(()=>{}) },[])
  const cards = [
    ['Quizzes', s.quizzes_completed||0],
    ['AI Questions', s.ai_questions_asked||0],
    ['Flashcards', s.flashcards_generated||0],
    ['PDFs', s.pdfs_uploaded||0],
    ['Study Streak', s.streak||0],
    ['Study Hours', s.hours||0],
  ]
  return (
    <div className="space-y-6">
      <div className="glass p-6">
        <h2 className="text-2xl font-bold text-violet-600 dark:text-violet-300">Welcome back 👋</h2>
        <p className="opacity-70">Keep up your streak.</p>
        <div className="mt-4 h-2 bg-violet-100 dark:bg-violet-500/20 rounded-full overflow-hidden">
          <div className="h-full bg-violet-600 dark:bg-violet-400" style={{width: `${Math.min(100,(s.hours||0)*10)}%`}}/>
        </div>
        <p className="text-xs mt-1 opacity-60">Weekly goal progress</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map(([k,v]) => (
          <div key={k} className="glass p-4">
            <p className="text-sm opacity-60">{k}</p>
            <p className="text-3xl font-bold text-violet-600 dark:text-violet-300">{v}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
