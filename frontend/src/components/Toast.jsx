import { useGamification } from '../context/GamificationContext'
import styles from './Toast.module.css'

function Toast() {
  const { toasts } = useGamification()
  if (!toasts.length) return null

  return (
    <div className={styles.container}>
      {toasts.map(t => (
        <div key={t.id} className={`${styles.toast} ${styles[t.type] || ''}`}>
          {t.message}
        </div>
      ))}
    </div>
  )
}

export default Toast
