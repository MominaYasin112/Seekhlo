import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi, isBackendEnabled } from '../services/backendApi'
import styles from './Auth.module.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const emailKey = email.trim().toLowerCase()

    try {
      if (isBackendEnabled()) {
        const data = await authApi.login({ email: emailKey, password })
        login(data.user, data.token)
        localStorage.setItem('seekhlo_gamification', JSON.stringify({ onboardingDone: true }))
        navigate('/dashboard')
        return
      }
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    // Offline mock fallback (no backend)
    const accounts = JSON.parse(localStorage.getItem('seekhlo_accounts') || '{}')
    const saved = accounts[emailKey]

    if (emailKey === 'test@test.com' && password === '123456') {
      login({ name: 'Student', email: emailKey }, 'mock-token-123')
      try {
        const raw = localStorage.getItem('seekhlo_gamification')
        const g = raw ? JSON.parse(raw) : {}
        localStorage.setItem('seekhlo_gamification', JSON.stringify({ ...g, onboardingDone: true }))
      } catch { /* ignore */ }
      navigate('/dashboard')
    } else if (saved && saved.password === password) {
      login({ name: saved.name, email: saved.email }, 'mock-token-456')
      navigate('/dashboard')
    } else {
      setError('Invalid email or password')
    }
    setLoading(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoText}>Seekh<span className={styles.logoAccent}>Lo</span></span>
          <p className={styles.tagline}>Learn. Level Up. Repeat.</p>
        </div>

        <h2 className={styles.title}>Welcome back</h2>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <p className={styles.forgot}>
            <Link to="/forgot-password">Forgot password?</Link>
          </p>
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className={styles.switch}>
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
