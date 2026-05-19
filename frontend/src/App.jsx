import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import VerifyEmail from './pages/VerifyEmail'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Leaderboard from './pages/Leaderboard'
import ProgressHistory from './pages/ProgressHistory'
import ModuleViewer from './pages/ModuleViewer'
import { AuthProvider } from './context/AuthContext'
import { GamificationProvider } from './context/GamificationContext'
import ProtectedRoute from './components/ProtectedRoute'
import Toast from './components/Toast'
import LevelUpModal from './components/LevelUpModal'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GamificationProvider>
          <Toast />
          <LevelUpModal />
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify/:token" element={<VerifyEmail />} />
            <Route path="/onboarding" element={<ProtectedRoute requireOnboarding={false}><Onboarding /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute><ProgressHistory /></ProtectedRoute>} />
            <Route path="/module/:id" element={<ProtectedRoute><ModuleViewer /></ProtectedRoute>} />
          </Routes>
        </GamificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
