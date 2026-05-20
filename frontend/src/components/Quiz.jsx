import { useState } from 'react'
import { useGamification } from '../context/GamificationContext'
import styles from './Quiz.module.css'

const PASSING_SCORE = 70

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
    if (index === q.correct) setScore((s) => s + 1)
  }

  const handleNext = () => {
    if (current + 1 < questions.length) {
      setCurrent((c) => c + 1)
      setSelected(null)
      setAnswered(false)
    } else {
      setFinished(true)
    }
  }

  const handleFinish = () => {
    if (!awarded) {
      const percent = Math.round((score / questions.length) * 100)
      if (percent >= PASSING_SCORE) {
        awardActivity({
          type: 'quiz',
          title: title || 'Quiz',
          xpEarned: xp,
          score: percent,
          moduleId,
        })
      }
      setAwarded(true)
    }
    onComplete()
  }

  const handleRetry = () => {
    setCurrent(0)
    setSelected(null)
    setAnswered(false)
    setScore(0)
    setFinished(false)
    setAwarded(false)
  }

  if (finished) {
    const percent = Math.round((score / questions.length) * 100)
    const passed = percent >= PASSING_SCORE

    return (
      <div className={styles.result}>
        <div className={styles.resultIcon}>{passed ? '🎉' : '📚'}</div>
        <h2 className={passed ? styles.passTitle : styles.failTitle}>
          {passed ? 'Great job! You passed!' : 'Not quite — keep going!'}
        </h2>
        <p className={styles.resultScore}>
          {score} / {questions.length} correct ({percent}%)
        </p>

        {passed ? (
          <>
            <div className={styles.xpEarned}>⚡ +{xp} XP earned!</div>
            <p className={styles.passSub}>Module marked as complete ✓</p>
            <button type="button" className={styles.doneBtn} onClick={handleFinish}>
              Back to Dashboard
            </button>
          </>
        ) : (
          <>
            <div className={styles.failNote}>
              You need {PASSING_SCORE}% to pass and earn XP. No XP awarded this time.
            </div>
            <div className={styles.retryBtns}>
              <button type="button" className={styles.retryBtn} onClick={handleRetry}>
                Try Again 🔄
              </button>
              <button type="button" className={styles.doneBtn} onClick={handleFinish}>
                Back to Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className={styles.card}>
      <div className={styles.progress}>
        <span>
          Question {current + 1} of {questions.length}
        </span>
        <span className={styles.passingNote}>Pass: {PASSING_SCORE}% to earn XP</span>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
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