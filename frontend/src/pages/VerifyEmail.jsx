import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi, isBackendEnabled } from '../services/backendApi'
import styles from './Auth.module.css'

function VerifyEmail() {
  const { token } = useParams()
  const { login } = useAuth()
  const [message, setMessage] = useState('Verifying your email...')
  const [ok, setOk] = useState(false)

  useEffect(() => {
    if (!isBackendEnabled()) {
      setMessage('Backend not configured. Set VITE_API_URL in frontend/.env')
      return
    }
    authApi.verify(token)
      .then((data) => {
        setOk(true)
        setMessage(data.message)
        if (data.token && data.user) {
          login(data.user, data.token)
          localStorage.setItem('seekhlo_gamification', JSON.stringify({ onboardingDone: true }))
        }
      })
      .catch((err) => setMessage(err.message))
  }, [token, login])

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>{ok ? 'Verified' : 'Email verification'}</h2>
        <p className={styles.success}>{message}</p>
        <p className={styles.switch}>
          <Link to={ok ? '/dashboard' : '/login'}>{ok ? 'Go to dashboard' : 'Back to login'}</Link>
        </p>
      </div>
    </div>
  )
}

export default VerifyEmail
