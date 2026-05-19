import { useGamification } from '../context/GamificationContext'
import styles from './StatsBar.module.css'

function StatsBar() {
  const { stats } = useGamification()
  const progress = Math.min(100, (stats.xp / stats.xpToNext) * 100)

  return (
    <div className={styles.bar}>
      <div className={styles.stat}>
        <div className={styles.icon}>⚡</div>
        <div>
          <div className={styles.value}>{stats.xp} XP</div>
          <div className={styles.label}>Total XP</div>
        </div>
      </div>

      <div className={styles.stat}>
        <div className={styles.icon}>🎮</div>
        <div>
          <div className={styles.value}>Level {stats.level}</div>
          <div className={styles.label}>Current Level</div>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <div className={styles.progressText}>{stats.xp} / {stats.xpToNext} XP</div>
        </div>
      </div>

      <div className={styles.stat}>
        <div className={styles.icon}>🔥</div>
        <div>
          <div className={styles.value}>{stats.streak} days</div>
          <div className={styles.label}>Current Streak</div>
        </div>
      </div>

      <div className={styles.stat}>
        <div className={styles.icon}>🏆</div>
        <div>
          <div className={styles.value}>#{stats.rank}</div>
          <div className={styles.label}>Leaderboard Rank</div>
        </div>
      </div>
    </div>
  )
}

export default StatsBar
