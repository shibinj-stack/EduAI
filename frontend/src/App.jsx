import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Protected from './components/Protected.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Tutor from './pages/Tutor.jsx'
import Quiz from './pages/Quiz.jsx'
import Flashcards from './pages/Flashcards.jsx'
import Summarize from './pages/Summarize.jsx'
import PDFPack from './pages/PDFPack.jsx'
import Planner from './pages/Planner.jsx'
import Solver from './pages/Solver.jsx'
import Voice from './pages/Voice.jsx'
import Profile from './pages/Profile.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/*" element={<Protected><Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tutor" element={<Tutor />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/summarize" element={<Summarize />} />
          <Route path="/pdf" element={<PDFPack />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/solver" element={<Solver />} />
          <Route path="/voice" element={<Voice />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout></Protected>} />
    </Routes>
  )
}
