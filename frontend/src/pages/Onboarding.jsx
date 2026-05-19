import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGamification } from '../context/GamificationContext'
import { ONBOARDING_QUESTIONS } from '../data/modules'
import styles from './Onboarding.module.css'

function Onboarding() {
  const navigate = useNavigate()
  const { completeOnboarding } = useGamification()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})

  const q = ONBOARDING_QUESTIONS[step]
  const isLast = step === ONBOARDING_QUESTIONS.length - 1
  const progress = ((step + 1) / ONBOARDING_QUESTIONS.length) * 100

  const handleSelect = (score) => {
    const next = { ...answers, [q.topic]: score }
    setAnswers(next)
    if (isLast) {
      completeOnboarding(next)
      navigate('/dashboard')
    } else {
      setStep(s => s + 1)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          Seekh<span>Lo</span>
        </div>
        <p className={styles.sub}>Quick quiz — we&apos;ll build your personalized learning path</p>

        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>

        <p className={styles.step}>Question {step + 1} of {ONBOARDING_QUESTIONS.length}</p>
        <h2 className={styles.question}>{q.question}</h2>
        <p className={styles.topic}>{q.topic}</p>

        <div className={styles.options}>
          {q.options.map((opt) => (
            <button
              key={opt.label}
              type="button"
              className={styles.option}
              onClick={() => handleSelect(opt.score)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Onboarding
