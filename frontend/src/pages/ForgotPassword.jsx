import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './Auth.module.css'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    // MOCK — wire to Member A's reset-password API when ready
    await new Promise(r => setTimeout(r, 800))
    setSent(true)
    setLoading(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoText}>Seekh<span className={styles.logoAccent}>Lo</span></span>
          <p className={styles.tagline}>Learn. Level Up. Repeat.</p>
        </div>

        <h2 className={styles.title}>Reset password</h2>

        {sent ? (
          <p className={styles.success}>
            If an account exists for <strong>{email}</strong>, we sent a reset link.
            Check your inbox (mock — no email sent in demo).
          </p>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className={styles.switch}>
          <Link to="/login">← Back to login</Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword
