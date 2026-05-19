import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { DEFAULT_PERFORMANCE } from '../data/modules'
import { useAuth } from './AuthContext'
import { gamificationApi, isBackendEnabled, isRealToken } from '../services/backendApi'

const STORAGE_KEY = 'seekhlo_gamification'

const BADGE_DEFS = [
  { id: 'streak_7', icon: '🔥', name: '7-Day Streak', desc: 'Active 7 days in a row', check: s => s.streak >= 7 },
  { id: 'xp_1000', icon: '⚡', name: 'XP Collector', desc: 'Earned 1000 XP', check: s => s.xp >= 1000 },
  { id: 'challenges_5', icon: '🧩', name: 'Problem Solver', desc: 'Solved 5 challenges', check: s => s.challengesSolved >= 5 },
  { id: 'quiz_100', icon: '🎯', name: 'Quiz Master', desc: 'Scored 100% on a quiz', check: s => s.perfectQuizzes >= 1 },
  { id: 'modules_3_day', icon: '🚀', name: 'Fast Learner', desc: 'Completed 3 modules in a day', check: s => s.modulesToday >= 3 },
  { id: 'top_10', icon: '👑', name: 'Top 10', desc: 'Reached top 10 leaderboard', check: s => s.rank <= 10 },
]

const defaultState = {
  xp: 1250,
  level: 3,
  streak: 7,
  rank: 12,
  performance: { ...DEFAULT_PERFORMANCE },
  completedModuleIds: [1, 2],
  skippedModuleIds: [],
  earnedBadgeIds: ['streak_7', 'xp_1000'],
  challengesSolved: 0,
  perfectQuizzes: 0,
  modulesToday: 0,
  history: [
    { id: 1, type: 'lesson', title: 'Arrays & Strings', score: null, xp: 100, date: '2026-05-10' },
    { id: 2, type: 'lesson', title: 'Linked Lists', score: null, xp: 120, date: '2026-05-12' },
    { id: 3, type: 'quiz', title: 'Recursion Quiz', score: 67, xp: 87, date: '2026-05-14' },
  ],
  onboardingDone: false,
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...defaultState, ...JSON.parse(raw) } : { ...defaultState }
  } catch {
    return { ...defaultState }
  }
}

function xpForLevel(level) {
  return level * 500
}

const GamificationContext = createContext(null)

export function GamificationProvider({ children }) {
  const { token } = useAuth()
  const [state, setState] = useState(loadState)
  const [toasts, setToasts] = useState([])
  const [levelUp, setLevelUp] = useState(null)

  useEffect(() => {
    if (!isBackendEnabled() || !isRealToken(token)) return
    gamificationApi.getStats(token).then((data) => {
      if (!data) return
      setState(prev => {
        const next = {
          ...prev,
          xp: data.total_xp ?? prev.xp,
          level: data.level ?? prev.level,
          streak: data.streak ?? prev.streak,
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        return next
      })
    }).catch(() => {})
  }, [token])

  const persist = useCallback((next) => {
    setState(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }, [])

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
  }, [])

  const completeOnboarding = useCallback((performance) => {
    setState(prev => {
      const next = { ...prev, performance, onboardingDone: true }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
    addToast('Your personalized path is ready!', 'success')
  }, [addToast])

  const skipModule = useCallback((moduleId) => {
    setState(prev => {
      if (prev.skippedModuleIds.includes(moduleId)) return prev
      const next = { ...prev, skippedModuleIds: [...prev.skippedModuleIds, moduleId] }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
    addToast('Recommendation skipped — path updated', 'info')
  }, [addToast])

  const awardActivity = useCallback(async ({ type, title, xpEarned, score, moduleId }) => {
    if (isBackendEnabled() && isRealToken(token)) {
      try {
        const res = await gamificationApi.postActivity(token, type, { score })
        setState(prev => {
          const next = { ...prev }
          next.xp = res.totalXP ?? next.xp + (res.xpEarned || 0)
          next.level = res.level ?? next.level
          next.streak = res.streakCount ?? next.streak
          next.history = [
            { id: Date.now(), type, title, score, xp: res.xpEarned, date: new Date().toISOString().slice(0, 10) },
            ...next.history,
          ]
          if (moduleId && !next.completedModuleIds.includes(moduleId)) {
            next.completedModuleIds = [...next.completedModuleIds, moduleId]
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
          return next
        })
        if (res.leveledUp) setLevelUp(res.level)
        if (res.newBadges?.length) {
          res.newBadges.forEach(b => addToast(`Badge unlocked: ${b.name}`, 'badge'))
        }
        addToast(`+${res.xpEarned} XP earned!`, 'xp')
        return
      } catch {
        addToast('Backend unavailable — saved locally', 'info')
      }
    }

    setState(prev => {
      const next = { ...prev }
      next.xp += xpEarned
      next.history = [
        { id: Date.now(), type, title, score, xp: xpEarned, date: new Date().toISOString().slice(0, 10) },
        ...next.history,
      ]
      if (moduleId && !next.completedModuleIds.includes(moduleId)) {
        next.completedModuleIds = [...next.completedModuleIds, moduleId]
      }
      if (type === 'coding_challenge') next.challengesSolved += 1
      if (type === 'quiz' && score === 100) next.perfectQuizzes += 1
      next.modulesToday += 1
      const threshold = xpForLevel(next.level)
      if (next.xp >= threshold) {
        next.level += 1
        setLevelUp(next.level)
      }
      const newBadges = BADGE_DEFS.filter(
        b => !next.earnedBadgeIds.includes(b.id) && b.check(next)
      )
      if (newBadges.length) {
        next.earnedBadgeIds = [...next.earnedBadgeIds, ...newBadges.map(b => b.id)]
        newBadges.forEach(b => addToast(`Badge unlocked: ${b.name} ${b.icon}`, 'badge'))
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
    addToast(`+${xpEarned} XP earned!`, 'xp')
  }, [addToast, token])

  const updatePerformance = useCallback((topic, score) => {
    persist({
      ...state,
      performance: { ...state.performance, [topic]: score },
    })
  }, [state, persist])

  const badges = BADGE_DEFS.map(b => ({
    ...b,
    earned: state.earnedBadgeIds.includes(b.id),
  }))

  const stats = {
    xp: state.xp,
    level: state.level,
    xpToNext: state.level * 500,
    streak: state.streak,
    rank: state.rank,
  }

  return (
    <GamificationContext.Provider value={{
      ...state,
      stats,
      badges,
      completeOnboarding,
      skipModule,
      awardActivity,
      updatePerformance,
      toasts,
      levelUp,
      dismissLevelUp: () => setLevelUp(null),
    }}>
      {children}
    </GamificationContext.Provider>
  )
}

export function useGamification() {
  const ctx = useContext(GamificationContext)
  if (!ctx) throw new Error('useGamification must be used within GamificationProvider')
  return ctx
}
