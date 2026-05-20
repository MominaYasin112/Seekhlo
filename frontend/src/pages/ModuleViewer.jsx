import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Quiz from '../components/Quiz'
import CodingChallenge from '../components/CodingChallenge'
import LessonAIChat from '../components/LessonAIChat'
import { useGamification } from '../context/GamificationContext'
import { MODULE_CATALOG, MODULE_CONTENT } from '../data/modules'
import styles from './ModuleViewer.module.css'

const difficultyClass = { Beginner: 'beginner', Intermediate: 'intermediate', Advanced: 'advanced' }

function ModuleViewer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { awardActivity } = useGamification()
  const moduleId = Number(id)
  const catalog = MODULE_CATALOG.find((m) => m.id === moduleId)
  const content = MODULE_CONTENT[moduleId]
  const [showQuiz, setShowQuiz] = useState(false)
  const [completing, setCompleting] = useState(false)

  if (!catalog || !content) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.content}>
          <div className={styles.notFound}>
            <h2>Module not found 😕</h2>
            <p>This module does not have content yet.</p>
            <button type="button" className={styles.back} style={{ marginTop: '1rem' }} onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderContent = (text) => {
    if (!text) return null
    const lines = text.split('\n')
    let inCode = false
    const codeLines = []
    const result = []
    lines.forEach((line, i) => {
      if (line.startsWith('```')) {
        if (inCode) {
          result.push(<pre key={'code-' + i} className={styles.code}>{codeLines.join('\n')}</pre>)
          codeLines.length = 0
          inCode = false
        } else { inCode = true }
        return
      }
      if (inCode) { codeLines.push(line); return }
      if (line.startsWith('## ')) { result.push(<h2 key={i} className={styles.h2}>{line.slice(3)}</h2>); return }
      if (line.startsWith('**') && line.endsWith('**')) { result.push(<p key={i} className={styles.bold}>{line.slice(2, -2)}</p>); return }
      if (line.startsWith('- ')) { result.push(<li key={i} className={styles.li}>{line.slice(2)}</li>); return }
      if (line.trim() === '') { result.push(<br key={i} />); return }
      result.push(<p key={i} className={styles.p}>{line}</p>)
    })
    return result
  }

  const completeLesson = async () => {
    if (completing) return
    setCompleting(true)
    await awardActivity({
      type: catalog.type === 'video' ? 'video' : 'lesson',
      title: catalog.title,
      xpEarned: catalog.xp,
      score: null,
      moduleId,
    })
    navigate('/dashboard')
  }

  // Coding challenge
  if (catalog.type === 'coding' && content) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.content}>
          <button type="button" className={styles.back} onClick={() => navigate('/dashboard')}>Back</button>
          <CodingChallenge
            challenge={{ ...content, xp: catalog.xp, title: catalog.title }}
            moduleId={moduleId}
            onComplete={() => navigate('/dashboard')}
          />
        </div>
        <LessonAIChat
          lessonTitle={catalog.title}
          lessonTopic={catalog.topic}
          lessonContent={content?.description || content?.content || ''}
        />
      </div>
    )
  }

  // Pure quiz module
  if (catalog.type === 'quiz' && content?.quiz) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.content}>
          <button type="button" className={styles.back} onClick={() => navigate('/dashboard')}>Back</button>
          <div className={styles.card} style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem' }}>
            <div className={styles.header}>
              <div className={styles.title}>{catalog.title}</div>
              <div className={styles.meta}>
                <span className={styles.badge + ' ' + styles[difficultyClass[catalog.difficulty]]}>{catalog.difficulty}</span>
                <span className={styles.badge + ' ' + styles.xp}>⚡ {catalog.xp} XP</span>
                <span className={styles.badge + ' ' + styles.time}>⏱ {catalog.time}</span>
              </div>
            </div>
          </div>
          <Quiz
            questions={content.quiz}
            xp={catalog.xp}
            title={catalog.title}
            moduleId={moduleId}
            onComplete={() => navigate('/dashboard')}
          />
        </div>
        <LessonAIChat
          lessonTitle={catalog.title}
          lessonTopic={catalog.topic}
          lessonContent={content?.content || ''}
        />
      </div>
    )
  }

  // Text / Video module
  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.content}>
        <button type="button" className={styles.back} onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.title}>{catalog.title}</div>
            <div className={styles.meta}>
              <span className={styles.badge + ' ' + styles[difficultyClass[catalog.difficulty]]}>{catalog.difficulty}</span>
              <span className={styles.badge + ' ' + styles.xp}>⚡ {catalog.xp} XP</span>
              <span className={styles.badge + ' ' + styles.time}>⏱ {catalog.time}</span>
              <span className={styles.badge + ' ' + styles.time}>{catalog.topic}</span>
            </div>
          </div>
          <div className={styles.body}>
            {catalog.type === 'video' ? (
              <>
                <iframe
                  className={styles.video}
                  src={content?.videoUrl || ''}
                  title={catalog.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                {renderContent(content?.content)}
              </>
            ) : (
              renderContent(content?.content)
            )}
          </div>

          {!showQuiz && content?.quiz && (
            <button type="button" className={styles.completeBtn} onClick={() => setShowQuiz(true)}>
              Take the Quiz to Earn XP →
            </button>
          )}
          {!content?.quiz && (
            <button
              type="button"
              className={styles.completeBtn}
              onClick={completeLesson}
              disabled={completing}
            >
              {completing ? 'Saving…' : 'Mark Complete ✓'}
            </button>
          )}
        </div>

        {showQuiz && content?.quiz && (
          <div style={{ marginTop: '1.5rem' }}>
            <Quiz
              questions={content.quiz}
              xp={catalog.xp}
              title={catalog.title}
              moduleId={moduleId}
              onComplete={() => navigate('/dashboard')}
            />
          </div>
        )}
      </div>

      <LessonAIChat
        lessonTitle={catalog.title}
        lessonTopic={catalog.topic}
        lessonContent={content?.content || ''}
      />
    </div>
  )
}

export default ModuleViewer