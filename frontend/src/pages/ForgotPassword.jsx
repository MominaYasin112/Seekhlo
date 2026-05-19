import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi, isBackendEnabled } from '../services/backendApi'
import styles from './Auth.module.css'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isBackendEnabled()) {
        const data = await authApi.forgotPassword(email.trim().toLowerCase())
        setMessage(data.message)
      } else {
        setMessage('Demo mode: no email sent.')
      }
      setSent(true)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Reset password</h2>
        {sent ? (
          <p className={styles.success}>{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.field}>
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}
        <p className={styles.switch}>
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword
