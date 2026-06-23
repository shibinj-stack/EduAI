import { useState } from 'react'
import Sidebar from './Sidebar.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { Moon, Sun, LogOut, Menu } from 'lucide-react'

export default function Layout({ children }) {
  const { theme, toggle } = useTheme()
  const { logout, user } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-violet-50 to-white dark:from-[#07080d] dark:to-[#0d1020] text-black dark:text-slate-100">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <main className="flex-1 min-w-0 p-3 sm:p-4 md:p-6">
        <header className="flex justify-between items-center gap-2 mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setOpen(true)}
              className="md:hidden btn glass !px-2 !py-2"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <div className="text-xs sm:text-sm opacity-70 truncate">{user?.email}</div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={toggle} className="btn glass !px-2 sm:!px-4">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={logout} className="btn glass !px-2 sm:!px-4">
              <LogOut size={16} />
            </button>
          </div>
        </header>
        {children}
      </main>
    </div>
  )
}
