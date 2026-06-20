import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => onAuthStateChanged(auth, u => { setUser(u); setLoading(false) }), [])
  return (
    <Ctx.Provider value={{
      user, loading,
      login: (e,p) => signInWithEmailAndPassword(auth, e, p),
      signup: (e,p) => createUserWithEmailAndPassword(auth, e, p),
      logout: () => signOut(auth),
    }}>{children}</Ctx.Provider>
  )
}
