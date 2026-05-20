import { useState, useEffect } from 'react'
import { runCodeTests, saveDraft } from '../services/api'
import { useGamification } from '../context/GamificationContext'
import { useAuth } from '../context/AuthContext'
import styles from './CodingChallenge.module.css'

const MAX_RETRIES = 5
const COOLDOWN_SEC = 60

function CodingChallenge({ challenge, moduleId, onComplete }) {
  const { user } = useAuth()
  const { awardActivity } = useGamification()
  const draftKey = `draft_${challenge.challengeId || moduleId}`

  const [code, setCode] = useState(() => {
    return localStorage.getItem(draftKey) || challenge.starterCode
  })
  const [results, setResults] = useState(null)
  const [running, setRunning] = useState(false)
  const [retries, setRetries] = useState(0)
  const [hintIndex, setHintIndex] = useState(-1)
  const [cooldown, setCooldown] = useState(0)
  const [runnerDown, setRunnerDown] = useState(false)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown(c => Math.max(0, c - 1)), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  const handleSaveDraft = () => {
    localStorage.setItem(draftKey, code)
    saveDraft(String(moduleId), code, user?.email || '')
  }

  const handleRun = async () => {
    if (cooldown > 0) return
    setRunning(true)
    setResults(null)

    try {
      const data = await runCodeTests({
        code,
        testCases: challenge.testCases,
        challengeId: String(moduleId),
      })
      setResults(data.results)
      setRunnerDown(false)

      if (data.all_passed) {
        // FIX: await awardActivity so XP + streak saved to localStorage BEFORE navigating
        await awardActivity({
          type: 'coding_challenge',
          title: challenge.title || 'Coding Challenge',
          xpEarned: challenge.xp || 100,
          score: 100,
          moduleId,
        })
        localStorage.removeItem(draftKey)
        onComplete()   // navigate immediately after state is saved
      } else {
        const next = retries + 1
        setRetries(next)
        if (next >= MAX_RETRIES) {
          setCooldown(COOLDOWN_SEC)
          setRetries(0)
        }
      }
    } catch {
      setRunnerDown(true)
    }
    setRunning(false)
  }

  const showHint = () => {
    if (hintIndex < challenge.hints.length - 1) {
      setHintIndex(i => i + 1)
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.problem}>
        <h2>💻 Coding Challenge</h2>
        <pre className={styles.statement}>{challenge.problem}</pre>
      </div>

      <div className={styles.editorWrap}>
        <div className={styles.toolbar}>
          <span>Python</span>
          <div className={styles.toolbarRight}>
            <button type="button" className={styles.secondary} onClick={handleSaveDraft}>
              Save draft
            </button>
            <button
              type="button"
              className={styles.run}
              onClick={handleRun}
              disabled={running || cooldown > 0}
            >
              {running ? 'Running…' : cooldown > 0 ? `Cooldown ${cooldown}s` : 'Run Tests'}
            </button>
          </div>
        </div>
        <textarea
          className={styles.editor}
          value={code}
          onChange={e => setCode(e.target.value)}
          spellCheck={false}
          rows={14}
        />
        <p className={styles.retries}>
          Retries: {retries}/{MAX_RETRIES}
          {runnerDown && ' · Runner offline — using local fallback'}
        </p>
      </div>

      {hintIndex >= 0 && (
        <div className={styles.hintBox}>
          <strong>Hint {hintIndex + 1}:</strong> {challenge.hints[hintIndex]}
        </div>
      )}
      {hintIndex < challenge.hints.length - 1 && (
        <button type="button" className={styles.hintBtn} onClick={showHint}>
          Get a hint
        </button>
      )}

      {results && (
        <div className={styles.results}>
          <h3>Test results</h3>
          {results.map((r, i) => (
            <div key={i} className={`${styles.testRow} ${r.passed ? styles.pass : styles.fail}`}>
              <span>{r.passed ? '✅' : '❌'} Test {i + 1}</span>
              <span>input: {r.input || '(none)'}</span>
              {!r.passed && (
                <span className={styles.detail}>
                  expected: {r.expected}
                  {r.actual != null && ` · got: ${r.actual}`}
                  {r.error && ` · ${r.error}`}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CodingChallenge