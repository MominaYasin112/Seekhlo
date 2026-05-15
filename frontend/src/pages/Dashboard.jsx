import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ padding: '2rem', color: '#fff' }}>
      <h1>Welcome, {user?.name} 👋</h1>
      <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>Dashboard coming soon...</p>
      <button
        onClick={handleLogout}
        style={{ marginTop: '2rem', background: '#7c3aed', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '8px' }}
      >
        Logout
      </button>
    </div>
  )
}

export default Dashboard