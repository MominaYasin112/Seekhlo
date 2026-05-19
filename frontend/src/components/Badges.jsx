import { useGamification } from '../context/GamificationContext'
import styles from './Badges.module.css'

function Badges() {
  const { badges } = useGamification()
  const earnedCount = badges.filter(b => b.earned).length

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2>🏅 Badges</h2>
        <span className={styles.count}>{earnedCount}/{badges.length}</span>
      </div>
      <div className={styles.grid}>
        {badges.map(badge => (
          <div key={badge.id} className={`${styles.badge} ${badge.earned ? styles.earned : styles.locked}`}>
            <div className={styles.icon}>{badge.earned ? badge.icon : '🔒'}</div>
            <div className={styles.name}>{badge.name}</div>
            <div className={styles.desc}>{badge.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Badges
