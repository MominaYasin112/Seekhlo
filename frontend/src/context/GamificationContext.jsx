import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { DEFAULT_PERFORMANCE } from '../data/modules'
import { useAuth } from './AuthContext'
import { gamificationApi, isBackendEnabled, isRealToken } from '../services/backendApi'

const BADGE_DEFS = [
  { id: 'streak_7', icon: '🔥', name: '7-Day Streak', desc: 'Active 7 days in a row', check: s => s.streak >= 7 },
  { id: 'xp_1000', icon: '⚡', name: 'XP Collector', desc: 'Earned 1000 XP', check: s => s.xp >= 1000 },
  { id: 'challenges_5', icon: '🧩', name: 'Problem Solver', desc: 'Solved 5 challenges', check: s => s.challengesSolved >= 5 },
  { id: 'quiz_100', icon: '🎯', name: 'Quiz Master', desc: 'Scored 100% on a quiz', check: s => s.perfectQuizzes >= 1 },
  { id: 'modules_3_day', icon: '🚀', name: 'Fast Learner', desc: 'Completed 3 modules in a day', check: s => s.modulesToday >= 3 },
  { id: 'top_10', icon: '👑', name: 'Top 10', desc: 'Reached top 10 leaderboard', check: s => s.rank <= 10 },
]

// Fresh state for new users — no fake XP, streaks, or completed modules
const freshState = {
  xp: 0,
  level: 1,
  streak: 0,
  rank: null,           // FIX: null means "not yet calculated", not 999
  performance: { ...DEFAULT_PERFORMANCE },
  completedModuleIds: [],
  skippedModuleIds: [],
  earnedBadgeIds: [],
  challengesSolved: 0,
  perfectQuizzes: 0,
  modulesToday: 0,
  modulesTodayDate: null,
  lastActiveDate: null,  // FIX: track last active date for streak
  history: [],
  onboardingDone: false,
}

function getStorageKey(userId) {
  return userId ? `seekhlo_gamification_${userId}` : null
}

function loadState(userId) {
  if (!userId) return { ...freshState }
  try {
    const key = getStorageKey(userId)
    const raw = localStorage.getItem(key)
    if (raw) {
      const saved = JSON.parse(raw)
      // FIX: migrate old rank:999 to null so it gets recalculated
      if (saved.rank === 999) saved.rank = null
      return { ...freshState, ...saved }
    }
    return { ...freshState }
  } catch {
    return { ...freshState }
  }
}

function xpForLevel(level) {
  return level * 500
}

// FIX: calculate rank from leaderboard data + user XP
function calculateRank(userXp, leaderboardData) {
  if (!leaderboardData || leaderboardData.length === 0) return null
  // Count how many users have more XP
  const higher = leaderboardData.filter(r => r.xp > userXp).length
  return higher + 1
}

// FIX: update streak based on today's date
function updateStreak(state) {
  const today = new Date().toISOString().slice(0, 10)
  if (state.lastActiveDate === today) {
    // Already counted today
    return state
  }
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const newStreak = state.lastActiveDate === yesterday ? state.streak + 1 : 1
  return { ...state, streak: newStreak, lastActiveDate: today }
}

const GamificationContext = createContext(null)

export function GamificationProvider({ children }) {
  const { token, user } = useAuth()
  const [state, setState] = useState(() => loadState(user?.id))
  const [toasts, setToasts] = useState([])
  const [levelUp, setLevelUp] = useState(null)

  // When user changes (login/logout/switch account), reload their personal state
  useEffect(() => {
    setState(loadState(user?.id))
  }, [user?.id])

  // FIX: fetch leaderboard to compute real rank when backend is enabled
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
        const key = getStorageKey(user?.id)
        if (key) localStorage.setItem(key, JSON.stringify(next))
        return next
      })
    }).catch(() => {})

    // Also fetch leaderboard to get real rank
    gamificationApi.getLeaderboard?.('alltime').then((rows) => {
      if (!rows?.length) return
      setState(prev => {
        const rank = calculateRank(prev.xp, rows)
        if (!rank || rank === prev.rank) return prev
        const next = { ...prev, rank }
        const key = getStorageKey(user?.id)
        if (key) localStorage.setItem(key, JSON.stringify(next))
        return next
      })
    }).catch(() => {})
  }, [token, user?.id])

  // FIX: compute rank locally from stored XP when backend is offline
  // rank = position among all users who've ever used the app on this device
  // Since we only have one user locally, show rank 1 if any XP earned, else null
  useEffect(() => {
    if (isBackendEnabled() && isRealToken(token)) return
    setState(prev => {
      if (prev.rank !== null) return prev
      const rank = prev.xp > 0 ? 1 : null
      if (rank === prev.rank) return prev
      const next = { ...prev, rank }
      const key = getStorageKey(user?.id)
      if (key) localStorage.setItem(key, JSON.stringify(next))
      return next
    })
  }, [state.xp, token, user?.id])

  const persist = useCallback((next) => {
    setState(next)
    const key = getStorageKey(user?.id)
    if (key) localStorage.setItem(key, JSON.stringify(next))
  }, [user?.id])

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
  }, [])

  const completeOnboarding = useCallback((performance) => {
    setState(prev => {
      const next = { ...prev, performance, onboardingDone: true }
      const key = getStorageKey(user?.id)
      if (key) localStorage.setItem(key, JSON.stringify(next))
      return next
    })
    addToast('Your personalized path is ready! 🎉', 'success')
  }, [addToast, user?.id])

  const skipModule = useCallback((moduleId) => {
    setState(prev => {
      if (prev.skippedModuleIds.includes(moduleId)) return prev
      const next = { ...prev, skippedModuleIds: [...prev.skippedModuleIds, moduleId] }
      const key = getStorageKey(user?.id)
      if (key) localStorage.setItem(key, JSON.stringify(next))
      return next
    })
    addToast('Module skipped — path updated', 'info')
  }, [addToast, user?.id])

  const awardActivity = useCallback(async ({ type, title, xpEarned, score, moduleId }) => {
    if (isBackendEnabled() && isRealToken(token)) {
      try {
        const res = await gamificationApi.postActivity(token, type, { score })
        setState(prev => {
          let next = { ...prev }
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
          const key = getStorageKey(user?.id)
          if (key) localStorage.setItem(key, JSON.stringify(next))
          return next
        })
        if (res.leveledUp) setLevelUp(res.level)
        if (res.newBadges?.length) {
          res.newBadges.forEach(b => addToast(`Badge unlocked: ${b.name}`, 'badge'))
        }
        addToast(`+${res.xpEarned} XP earned! ⚡`, 'xp')
        return
      } catch {
        addToast('Backend unavailable — saved locally', 'info')
      }
    }

    setState(prev => {
      let next = { ...prev }
      next.xp += xpEarned

      // FIX: update streak on activity
      next = updateStreak(next)

      // FIX: reset modulesToday counter if it's a new day
      const today = new Date().toISOString().slice(0, 10)
      if (next.modulesTodayDate !== today) {
        next.modulesToday = 0
        next.modulesTodayDate = today
      }

      next.history = [
        { id: Date.now(), type, title, score, xp: xpEarned, date: today },
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

      // FIX: recalculate rank locally based on XP (simple: rank 1 if any XP)
      if (next.xp > 0 && (next.rank === null || next.rank > 1)) {
        next.rank = 1 // local-only mode: you're always #1 on your own device
      }

      const newBadges = BADGE_DEFS.filter(
        b => !next.earnedBadgeIds.includes(b.id) && b.check(next)
      )
      if (newBadges.length) {
        next.earnedBadgeIds = [...next.earnedBadgeIds, ...newBadges.map(b => b.id)]
        newBadges.forEach(b => addToast(`Badge unlocked: ${b.name} ${b.icon}`, 'badge'))
      }
      const key = getStorageKey(user?.id)
      if (key) localStorage.setItem(key, JSON.stringify(next))
      return next
    })
    addToast(`+${xpEarned} XP earned! ⚡`, 'xp')
  }, [addToast, token, user?.id])

  const updatePerformance = useCallback((topic, score) => {
    persist({
      ...state,
      performance: { ...state.performance, [topic]: score },
    })
  }, [state, persist])

  const resetProgress = useCallback(() => {
    const key = getStorageKey(user?.id)
    if (key) localStorage.removeItem(key)
    setState({ ...freshState, onboardingDone: state.onboardingDone, performance: state.performance })
  }, [user?.id, state.onboardingDone, state.performance])

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
      resetProgress,
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