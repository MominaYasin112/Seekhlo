import { useGamification } from '../context/GamificationContext'
import styles from './LevelUpModal.module.css'

function LevelUpModal() {
  const { levelUp, dismissLevelUp } = useGamification()
  if (!levelUp) return null

  return (
    <div className={styles.overlay} onClick={dismissLevelUp}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <span className={styles.burst} role="img" aria-hidden>✨</span>
        <p className={styles.level}>Level {levelUp}</p>
        <h2>Level Up!</h2>
        <p className={styles.sub}>You&apos;ve reached a new level. Keep learning!</p>
        <button type="button" className={styles.btn} onClick={dismissLevelUp}>
          Continue
        </button>
      </div>
    </div>
  )
}

export default LevelUpModal
