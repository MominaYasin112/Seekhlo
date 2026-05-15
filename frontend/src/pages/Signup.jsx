import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
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
    // MOCK — saved in browser until Member A's database API is connected
    const accounts = JSON.parse(localStorage.getItem('seekhlo_accounts') || '{}')
    accounts[email.toLowerCase()] = { name, email: email.toLowerCase(), password }
    localStorage.setItem('seekhlo_accounts', JSON.stringify(accounts))
    login({ name, email }, 'mock-token-456')
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
            <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label>Password</label>
            <input type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
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
