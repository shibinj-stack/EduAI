import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Moon, Sun, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

export default function Signup() {
  const { signup } = useAuth()
  const { theme, toggle } = useTheme()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true)
    try { await signup(email, pw); nav('/') }
    catch (x) { setErr(x.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="auth-bg flex items-center justify-center p-4 relative">
      <button onClick={toggle} className="btn glass absolute top-4 right-4" aria-label="Toggle theme">
        {theme === 'dark' ? <Sun size={16}/> : <Moon size={16}/>}
      </button>
      <form onSubmit={submit} className="glass p-8 w-full max-w-md space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="accent" size={22} />
          <h1 className="text-2xl font-bold accent">AI Study Buddy</h1>
        </div>
        <h2 className="text-lg font-semibold">Create your account</h2>
        <p className="text-sm opacity-70 -mt-2">Start your AI-powered study journey.</p>
        <input className="input" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="input" type="password" placeholder="Password (6+ chars)" minLength={6} value={pw} onChange={e=>setPw(e.target.value)} required />
        {err && <p className="text-red-500 text-sm">{err}</p>}
        <button disabled={loading} className="btn btn-primary w-full">{loading ? 'Creating…' : 'Sign up'}</button>
        <p className="text-sm opacity-80">Have one? <Link className="accent underline" to="/login">Login</Link></p>
      </form>
    </div>
  )
}
