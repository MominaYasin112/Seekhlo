import { useState } from 'react'
import { useGamification } from '../context/GamificationContext'
import styles from './Quiz.module.css'

function Quiz({ questions, xp, title, moduleId, onComplete }) {
  const { awardActivity } = useGamification()
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [awarded, setAwarded] = useState(false)

  const q = questions[current]

  const handleSelect = (index) => {
    if (answered) return
    setSelected(index)
    setAnswered(true)
    if (index === q.correct) setScore(s => s + 1)
  }

  const handleNext = () => {
    if (current + 1 < questions.length) {
      setCurrent(c => c + 1)
      setSelected(null)
      setAnswered(false)
    } else {
      setFinished(true)
    }
  }

  const handleFinish = () => {
    if (!awarded) {
      const percent = Math.round((score / questions.length) * 100)
      const earned = Math.round(xp * (percent / 100))
      awardActivity({
        type: 'quiz',
        title: title || 'Quiz',
        xpEarned: earned,
        score: percent,
        moduleId,
      })
      setAwarded(true)
    }
    onComplete()
  }

  if (finished) {
    const percent = Math.round((score / questions.length) * 100)
    const earned = Math.round(xp * (percent / 100))
    return (
      <div className={styles.result}>
        <div className={styles.resultIcon}>{percent >= 70 ? '🎉' : '📚'}</div>
        <h2>{percent >= 70 ? 'Great job!' : 'Keep practicing!'}</h2>
        <p className={styles.resultScore}>{score} / {questions.length} correct ({percent}%)</p>
        <div className={styles.xpEarned}>⚡ +{earned} XP earned</div>
        <button type="button" className={styles.doneBtn} onClick={handleFinish}>Back to Dashboard</button>
      </div>
    )
  }

  return (
    <div className={styles.card}>
      <div className={styles.progress}>
        Question {current + 1} of {questions.length}
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
        </div>
      </div>

      <h2 className={styles.question}>{q.question}</h2>

      <div className={styles.options}>
        {q.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.option}
              ${answered && i === q.correct ? styles.correct : ''}
              ${answered && selected === i && i !== q.correct ? styles.wrong : ''}
              ${selected === i ? styles.selected : ''}
            `}
            onClick={() => handleSelect(i)}
          >
            <span className={styles.optLetter}>{String.fromCharCode(65 + i)}</span>
            {opt}
          </button>
        ))}
      </div>

      {answered && (
        <div className={styles.feedback}>
          {selected === q.correct
            ? '✅ Correct!'
            : `❌ Incorrect. The correct answer is: ${q.options[q.correct]}`}
        </div>
      )}

      {answered && (
        <button type="button" className={styles.nextBtn} onClick={handleNext}>
          {current + 1 < questions.length ? 'Next Question →' : 'See Results →'}
        </button>
      )}
    </div>
  )
}

export default Quiz
