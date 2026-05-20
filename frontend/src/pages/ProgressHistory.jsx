import Navbar from '../components/Navbar'
import { useGamification } from '../context/GamificationContext'
import styles from './ProgressHistory.module.css'

const typeIcon = {
  lesson: '📖',
  quiz: '📝',
  coding_challenge: '💻',
  video: '🎬',
}

const typeColor = {
  lesson: '#6366f1',
  quiz: '#8b5cf6',
  coding_challenge: '#06b6d4',
  video: '#f59e0b',
}

function ProgressHistory() {
  const { history, stats, completedModuleIds, resetProgress } = useGamification()

  const handleReset = () => {
    if (window.confirm('Reset all your progress, XP, and streak? This cannot be undone.')) {
      resetProgress()
    }
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.headerIcon}>📈</div>
          <h1 className={styles.headerTitle}>Progress History</h1>
          <p className={styles.headerSub}>Your learning activity and growth over time</p>
        </header>

        {/* Stats row */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⚡</div>
            <div className={styles.statVal}>{stats.xp}</div>
            <div className={styles.statLabel}>Total XP</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>✅</div>
            <div className={styles.statVal}>{completedModuleIds.length}</div>
            <div className={styles.statLabel}>Modules done</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🔥</div>
            <div className={styles.statVal}>{stats.streak}</div>
            <div className={styles.statLabel}>Day streak</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🎮</div>
            <div className={styles.statVal}>Lv. {stats.level}</div>
            <div className={styles.statLabel}>Current level</div>
          </div>
        </div>

        {/* Level progress bar */}
        <div className={styles.levelCard}>
          <div className={styles.levelHeader}>
            <span className={styles.levelLabel}>Level {stats.level} Progress</span>
            <span className={styles.levelXp}>{stats.xp} / {stats.xpToNext} XP</span>
          </div>
          <div className={styles.levelTrack}>
            <div
              className={styles.levelFill}
              style={{ width: `${Math.min(100, (stats.xp / stats.xpToNext) * 100)}%` }}
            />
          </div>
          <div className={styles.levelNext}>
            {stats.xpToNext - stats.xp} XP to Level {stats.level + 1}
          </div>
        </div>

        {/* Activity timeline */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Activity</h2>
            <button type="button" onClick={handleReset} className={styles.resetBtn}>
              🔄 Reset Progress
            </button>
          </div>

          {history.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🚀</div>
              <p className={styles.emptyText}>No activity yet.</p>
              <p className={styles.emptySub}>Start a module from your dashboard to see your progress here!</p>
            </div>
          ) : (
            <div className={styles.timeline}>
              {history.map(item => (
                <div key={item.id} className={styles.timelineItem}>
                  <div
                    className={styles.timelineDot}
                    style={{ background: typeColor[item.type] || '#6366f1' }}
                  >
                    {typeIcon[item.type] || '✓'}
                  </div>
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineTitle}>{item.title}</div>
                    <div className={styles.timelineMeta}>
                      <span className={styles.timelineDate}>{item.date}</span>
                      {item.score != null && (
                        <span className={styles.timelineScore}>🎯 {item.score}%</span>
                      )}
                      {item.xp != null && (
                        <span className={styles.timelineXp}>+{item.xp} XP</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProgressHistory