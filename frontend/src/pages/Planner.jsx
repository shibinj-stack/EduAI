import { useState } from 'react'
import remarkGfm from "remark-gfm";
import ReactMarkdown from 'react-markdown'
import { api } from '../lib/api.js'


export default function Planner() {
  const [subj, setSubj] = useState('')
  const [days, setDays] = useState('')
  const [plan, setPlan] = useState('')
  const [l, setL] = useState(false)

  const generatePlan = async () => {
    if (!subj.trim() || !days) return

    setL(true)
    try {
      const r = await api('/plan', {
        method: 'POST',
        body: {
          subjects: subj,
          days_left: Number(days)
        }
      })

      setPlan(r.plan)
    } finally {
      setL(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="glass p-4 space-y-3">
        <input
          className="input"
          placeholder="Subjects (Math, Physics, Chemistry)"
          value={subj}
          onChange={e => setSubj(e.target.value)}
        />

        <input
          className="input"
          type="number"
          min="1"
          max="365"
          placeholder="Number of days left (e.g. 30)"
          value={days}
          onChange={e => setDays(e.target.value)}
        />

        <button
          className="btn btn-primary"
          onClick={generatePlan}
          disabled={l}
        >
          {l ? 'Generating...' : 'Generate Study Plan'}
        </button>
      </div>

      {plan && (
        <div className="glass p-4 prose dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
  {plan}
</ReactMarkdown>
        </div>
      )}
    </div>
  )
}
