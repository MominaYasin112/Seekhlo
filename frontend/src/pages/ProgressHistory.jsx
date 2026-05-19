import Navbar from '../components/Navbar'
import { useGamification } from '../context/GamificationContext'
import styles from './ProgressHistory.module.css'

const typeIcon = {
  lesson: '📖',
  quiz: '📝',
  coding_challenge: '💻',
  video: '🎬',
}

function ProgressHistory() {
  const { history, stats, completedModuleIds } = useGamification()

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.content}>
        <header className={styles.header}>
          <h1>📈 Progress History</h1>
          <p>Your learning activity and growth over time</p>
        </header>

        <div className={styles.summary}>
          <div className={styles.summaryCard}>
            <span className={styles.summaryVal}>{stats.xp}</span>
            <span className={styles.summaryLabel}>Total XP</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryVal}>{completedModuleIds.length}</span>
            <span className={styles.summaryLabel}>Modules done</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryVal}>{stats.streak}🔥</span>
            <span className={styles.summaryLabel}>Day streak</span>
          </div>
        </div>

        <div className={styles.timeline}>
          <h2>Recent activity</h2>
          {history.length === 0 ? (
            <p className={styles.empty}>No activity yet. Start a module from your dashboard!</p>
          ) : (
            history.map(item => (
              <div key={item.id} className={styles.row}>
                <span className={styles.icon}>{typeIcon[item.type] || '✓'}</span>
                <div className={styles.rowBody}>
                  <div className={styles.rowTitle}>{item.title}</div>
                  <div className={styles.rowMeta}>
                    {item.date}
                    {item.score != null && ` · ${item.score}%`}
                    {item.xp != null && ` · +${item.xp} XP`}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ProgressHistory
