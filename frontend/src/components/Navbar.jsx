import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Navbar.module.css'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.logo} onClick={() => navigate('/dashboard')} role="button" tabIndex={0}>
        Seekh<span>Lo</span>
      </div>
      <div className={styles.links}>
        <button type="button" onClick={() => navigate('/dashboard')}>Dashboard</button>
        <button type="button" onClick={() => navigate('/leaderboard')}>Leaderboard</button>
        <button type="button" onClick={() => navigate('/progress')}>Progress</button>
      </div>
      <div className={styles.right}>
        <span className={styles.username}>{user?.name}</span>
        <button type="button" className={styles.logout} onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  )
}

export default Navbar
