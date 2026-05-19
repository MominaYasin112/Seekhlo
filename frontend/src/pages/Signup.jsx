import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi, isBackendEnabled } from '../services/backendApi'
import styles from './Auth.module.css'

function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      if (isBackendEnabled()) {
        const data = await authApi.register({ name, email: email.trim().toLowerCase(), password })
        if (data.token && data.user) {
          login(data.user, data.token)
          localStorage.setItem('seekhlo_gamification', JSON.stringify({ onboardingDone: false }))
          navigate('/onboarding')
          return
        }
        setError(data.message || 'Check your email to verify your account, then log in.')
        setLoading(false)
        return
      }
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    const emailKey = email.trim().toLowerCase()
    const accounts = JSON.parse(localStorage.getItem('seekhlo_accounts') || '{}')
    accounts[emailKey] = { name, email: emailKey, password }
    localStorage.setItem('seekhlo_accounts', JSON.stringify(accounts))
    login({ name, email: emailKey }, 'mock-token-456')
    navigate('/onboarding')
    setLoading(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoText}>Seekh<span className={styles.logoAccent}>Lo</span></span>
          <p className={styles.tagline}>Learn. Level Up. Repeat.</p>
        </div>
        <h2 className={styles.title}>Create your account</h2>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <p className={styles.switch}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  )
}

export default Signup
