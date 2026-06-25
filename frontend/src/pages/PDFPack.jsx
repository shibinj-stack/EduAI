import { useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { api } from '../lib/api.js'

export default function PDFPack() {
  const [r, setR] = useState(null)
  const [l, setL] = useState(false)
  const [err, setErr] = useState('')
  const [name, setName] = useState('')
  const fileRef = useRef(null)

  const up = async (e) => {
    const f = e.target.files[0]
    if (!f) return

    setName(f.name)
    setErr('')
    setR(null)
    setL(true)

    const fd = new FormData()
    fd.append('pdf', f)

    try {
      const res = await api('/pdf-pack', { method: 'POST', formData: fd })
      if (res.error) setErr(res.error)
      else setR(res)
    } catch (x) {
      setErr(x.message || 'Failed to process PDF.')
    } finally {
      setL(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <div className="glass p-4 space-y-2">
        <input
          type="file"
          accept="application/pdf"
          ref={fileRef}
          onChange={up}
          hidden
        />

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => fileRef.current?.click()}
            className="btn btn-primary"
            disabled={l}
          >
            {l ? 'Processing…' : 'Choose PDF'}
          </button>

          {name && <span className="text-sm opacity-70">{name}</span>}
        </div>

        {l && (
          <p className="mt-2 text-sm opacity-70">
            Reading and analysing your PDF…
          </p>
        )}

        {err && (
          <p className="text-red-600 dark:text-red-300 text-sm">
            {err}
          </p>
        )}
      </div>

      {r && (
        <div className="glass p-4">
          <h3 className="font-bold mb-2">Summary</h3>
          <ReactMarkdown>{r.summary}</ReactMarkdown>
        </div>
      )}
    </div>
  )
}
