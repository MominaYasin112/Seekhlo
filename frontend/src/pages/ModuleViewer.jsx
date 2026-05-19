import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Quiz from '../components/Quiz'
import CodingChallenge from '../components/CodingChallenge'
import { useGamification } from '../context/GamificationContext'
import { MODULE_CATALOG, MODULE_CONTENT } from '../data/modules'
import styles from './ModuleViewer.module.css'

function ModuleViewer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { awardActivity } = useGamification()
  const moduleId = Number(id)
  const catalog = MODULE_CATALOG.find(m => m.id === moduleId)
  const content = MODULE_CONTENT[moduleId]
  const [showQuiz, setShowQuiz] = useState(false)

  if (!catalog) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.content}>
          <p>Module not found.</p>
          <button type="button" onClick={() => navigate('/dashboard')}>Back</button>
        </div>
      </div>
    )
  }

  const renderContent = (text) => {
    if (!text) return null
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h2 key={i} className={styles.h2}>{line.slice(3)}</h2>
      if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className={styles.bold}>{line.slice(2, -2)}</p>
      if (line.startsWith('```')) return null
      if (line.startsWith('- ')) return <li key={i} className={styles.li}>{line.slice(2)}</li>
      if (line.trim() === '') return <br key={i} />
      return <p key={i} className={styles.p}>{line}</p>
    })
  }

  const completeLesson = () => {
    awardActivity({
      type: catalog.type === 'video' ? 'video' : 'lesson',
      title: catalog.title,
      xpEarned: catalog.xp,
      score: null,
      moduleId,
    })
    navigate('/dashboard')
  }

  if (catalog.type === 'coding' && content) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.content}>
          <button type="button" className={styles.back} onClick={() => navigate('/dashboard')}>← Back</button>
          <div className={styles.moduleHeader}>
            <h1>{catalog.title}</h1>
          </div>
          <CodingChallenge
            challenge={{ ...content, xp: catalog.xp, title: catalog.title }}
            moduleId={moduleId}
            onComplete={() => navigate('/dashboard')}
          />
        </div>
      </div>
    )
  }

  if (catalog.type === 'quiz' && content?.quiz) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.content}>
          <button type="button" className={styles.back} onClick={() => navigate('/dashboard')}>← Back</button>
          <h1>{catalog.title}</h1>
          <Quiz
            questions={content.quiz}
            xp={catalog.xp}
            title={catalog.title}
            moduleId={moduleId}
            onComplete={() => navigate('/dashboard')}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.content}>
        <button type="button" className={styles.back} onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
        <div className={styles.moduleHeader}>
          <div className={styles.tags}>
            <span className={styles.tag}>{catalog.topic}</span>
            <span className={styles.tag}>{catalog.difficulty}</span>
            <span className={styles.xpTag}>⚡ {catalog.xp} XP</span>
          </div>
          <h1>{catalog.title}</h1>
        </div>

        {catalog.type === 'video' ? (
          <div className={styles.videoCard}>
            <div className={styles.videoPlaceholder}>
              <span>▶</span>
              <p>Video lesson: {catalog.title}</p>
              <p className={styles.videoNote}>Video streams from cloud storage when backend is connected.</p>
            </div>
          </div>
        ) : (
          <div className={styles.lessonCard}>{renderContent(content?.content)}</div>
        )}

        {!showQuiz && content?.quiz ? (
          <button type="button" className={styles.quizBtn} onClick={() => setShowQuiz(true)}>Take the Quiz →</button>
        ) : !content?.quiz ? (
          <button type="button" className={styles.quizBtn} onClick={completeLesson}>Mark complete →</button>
        ) : null}

        {showQuiz && content?.quiz && (
          <Quiz
            questions={content.quiz}
            xp={catalog.xp}
            title={catalog.title}
            moduleId={moduleId}
            onComplete={() => navigate('/dashboard')}
          />
        )}

        {catalog.type === 'video' && (
          <button type="button" className={styles.quizBtn} onClick={completeLesson} style={{ marginTop: '1rem' }}>
            Mark video complete →
          </button>
        )}
      </div>
    </div>
  )
}

export default ModuleViewer
