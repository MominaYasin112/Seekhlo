import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGamification } from '../context/GamificationContext'
import { fetchRecommendations } from '../services/api'
import styles from './LearningPath.module.css'

const difficultyColor = {
  Beginner: '#22c55e',
  Intermediate: '#f59e0b',
  Advanced: '#ef4444',
}

function LearningPath() {
  const navigate = useNavigate()
  const { performance, completedModuleIds, skippedModuleIds, skipModule } = useGamification()
  const [modules, setModules] = useState([])
  const [source, setSource] = useState('ml')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchRecommendations({
      scores: performance,
      completedIds: completedModuleIds,
      skippedIds: skippedModuleIds,
    }).then(data => {
      if (cancelled) return
      setModules(data.modules || [])
      setSource(data.source || 'default')
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [performance, completedModuleIds, skippedModuleIds])

  const handleSkip = (e, id) => {
    e.stopPropagation()
    skipModule(id)
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2>📚 Your Learning Path</h2>
        <span className={styles.sub}>
          {source === 'ml' ? 'Recommended by AI' : 'Default path (ML offline)'}
        </span>
      </div>
      {loading ? (
        <p className={styles.loading}>Loading recommendations…</p>
      ) : (
        <div className={styles.list}>
          {modules.map((mod, index) => {
            const done = completedModuleIds.includes(mod.id)
            return (
              <div key={mod.id} className={`${styles.module} ${done ? styles.done : ''}`}>
                <div className={styles.step}>
                  {done ? '✅' : <span className={styles.stepNum}>{index + 1}</span>}
                </div>
                <div className={styles.info}>
                  <div className={styles.title}>{mod.title}</div>
                  <div className={styles.meta}>
                    <span>{mod.topic}</span>
                    <span style={{ color: difficultyColor[mod.difficulty] }}>{mod.difficulty}</span>
                    <span>⏱ {mod.time}</span>
                    <span>⚡ {mod.xp} XP</span>
                  </div>
                </div>
                {!done && (
                  <div className={styles.actions}>
                    <button type="button" className={styles.startBtn} onClick={() => navigate(`/module/${mod.id}`)}>
                      Start →
                    </button>
                    <button type="button" className={styles.skipBtn} onClick={e => handleSkip(e, mod.id)}>
                      Skip
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default LearningPath

