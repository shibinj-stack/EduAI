import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Bot, Brain, Layers, FileText, BookOpen, Calendar, Camera, Mic, User, Settings, X } from 'lucide-react'

const items = [
  ['/', 'Dashboard', LayoutDashboard],
  ['/tutor', 'AI Tutor', Bot],
  ['/quiz', 'Quiz Generator', Brain],
  ['/flashcards', 'Flashcards', Layers],
  ['/pdf', 'PDF Study Pack', FileText],
  ['/summarize', 'Notes Summarizer', BookOpen],
  ['/planner', 'Study Planner', Calendar],
  ['/solver', 'Doubt Solver', Camera],
  ['/voice', 'Voice Assistant', Mic],
  ['/profile', 'Profile', User],
  ['/settings', 'Settings', Settings],
]

export default function Sidebar({ open = false, onClose = () => {} }) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed z-40 top-0 left-0 h-screen w-64 p-4 glass m-0 md:m-2
          transform transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:static md:translate-x-0 md:w-60 md:sticky md:top-0
          overflow-y-auto
        `}
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-violet-600 dark:text-violet-300">
            AI Study Buddy
          </h1>
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded hover:bg-violet-100 dark:hover:bg-violet-500/10"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex flex-col gap-1">
          {items.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                  isActive
                    ? 'bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-200'
                    : 'hover:bg-violet-50 dark:hover:bg-violet-500/10'
                }`
              }
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
