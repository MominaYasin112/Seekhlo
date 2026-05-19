import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useGamification } from '../context/GamificationContext'

function ProtectedRoute({ children, requireOnboarding = true }) {
  const { token } = useAuth()
  const { onboardingDone } = useGamification()

  if (!token) return <Navigate to="/login" replace />

  if (requireOnboarding && !onboardingDone) {
    return <Navigate to="/onboarding" replace />
  }

  if (!requireOnboarding && onboardingDone) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
