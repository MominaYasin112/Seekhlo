import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import styles from './Leaderboard.module.css'
import { useAuth } from '../context/AuthContext'
import { useGamification } from '../context/GamificationContext'
import { gamificationApi, isBackendEnabled } from '../services/backendApi'

const mockData = {
  daily: [
    { rank: 1, name: 'Ali Hassan', level: 8, xp: 340, avatar: '🧑‍💻' },
    { rank: 2, name: 'Sara Khan', level: 7, xp: 290, avatar: '👩‍💻' },
    { rank: 3, name: 'Usman Tariq', level: 6, xp: 250, avatar: '🧑‍🎓' },
    { rank: 4, name: 'Hina Malik', level: 5, xp: 210, avatar: '👩‍🎓' },
    { rank: 5, name: 'Bilal Ahmed', level: 5, xp: 190, avatar: '🧑‍💻' },
    { rank: 6, name: 'Fatima Zahra', level: 4, xp: 170, avatar: '👩‍💻' },
    { rank: 7, name: 'Hamza Raza', level: 4, xp: 150, avatar: '🧑‍🎓' },
    { rank: 8, name: 'Zara Noor', level: 3, xp: 130, avatar: '👩‍🎓' },
    { rank: 9, name: 'Omer Shafiq', level: 3, xp: 110, avatar: '🧑‍💻' },
    { rank: 10, name: 'Momina Yasin', level: 3, xp: 100, avatar: '👩‍💻' },
    { rank: 11, name: 'Eiman Farooq', level: 3, xp: 90, avatar: '👩‍🎓' },
  ],
  weekly: [
    { rank: 1, name: 'Sara Khan', level: 7, xp: 1800, avatar: '👩‍💻' },
    { rank: 2, name: 'Ali Hassan', level: 8, xp: 1650, avatar: '🧑‍💻' },
    { rank: 3, name: 'Fatima Zahra', level: 4, xp: 1400, avatar: '👩‍💻' },
    { rank: 4, name: 'Usman Tariq', level: 6, xp: 1200, avatar: '🧑‍🎓' },
  ],
  alltime: [
    { rank: 1, name: 'Ali Hassan', level: 8, xp: 12400, avatar: '🧑‍💻' },
    { rank: 2, name: 'Sara Khan', level: 7, xp: 10800, avatar: '👩‍💻' },
    { rank: 3, name: 'Usman Tariq', level: 6, xp: 9500, avatar: '🧑‍🎓' },
    { rank: 4, name: 'Hina Malik', level: 5, xp: 8200, avatar: '👩‍🎓' },
    { rank: 5, name: 'Bilal Ahmed', level: 5, xp: 7100, avatar: '🧑‍💻' },
    { rank: 6, name: 'Fatima Zahra', level: 4, xp: 6300, avatar: '👩‍💻' },
  ],
}

const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' }
const PODIUM_ORDER = [2, 1, 3] // silver left, gold center, bronze right

// FIX: inject real user into the leaderboard at the correct rank
function injectCurrentUser(data, user, stats) {
  if (!user || !stats) return data
  const name = user.name?.split(' ')[0] || user.email?.split('@')[0] || 'You'
  const xp = stats.xp ?? 0
  const level = stats.level ?? 1

  // Remove any existing "You" placeholder
  const filtered = data.filter(r => !r.isYou)

  // Insert current user at correct position based on XP
  const allUsers = [
    ...filtered,
    { name, xp, level, avatar: '⭐', isYou: true, rank: 0 },
  ]

  // Sort by XP descending and assign ranks
  allUsers.sort((a, b) => b.xp - a.xp)
  allUsers.forEach((u, i) => { u.rank = i + 1 })

  return allUsers
}

function Leaderboard() {
  const { user } = useAuth()
  const { stats } = useGamification()
  const [tab, setTab] = useState('daily')
  const [data, setData] = useState([])

  useEffect(() => {
    if (!isBackendEnabled()) {
      // FIX: always inject real user into mock data
      const base = mockData[tab] || []
      setData(injectCurrentUser(base, user, stats))
      return
    }
    gamificationApi
      .getLeaderboard(tab)
      .then((rows) => {
        const mapped = rows.map((r) => ({
          rank: r.rank,
          name: r.name,
          level: r.level,
          xp: r.xp,
          avatar: '👤',
          isYou: user?.id && r.userId === user.id,
        }))
        const result = mapped.length ? mapped : mockData[tab]
        setData(injectCurrentUser(result, user, stats))
      })
      .catch(() => {
        setData(injectCurrentUser(mockData[tab], user, stats))
      })
  }, [tab, user?.id, stats?.xp])  // FIX: re-run when user's XP changes

  const topThree = data.filter((u) => u.rank <= 3)
  const rest = data.filter((u) => u.rank > 3)

  // Reorder podium: [2,1,3] so gold is in center
  const podiumOrdered = PODIUM_ORDER.map((r) => topThree.find((u) => u.rank === r)).filter(Boolean)

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>🏆 Leaderboard</h1>
          <p>See how you rank against other students</p>
        </div>

        <div className={styles.tabs}>
          {['daily', 'weekly', 'alltime'].map((t) => (
            <button
              key={t}
              className={`${styles.tab} ${tab === t ? styles.active : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'alltime' ? 'All Time' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Top 3 Podium */}
        {topThree.length > 0 && (
          <div className={styles.podiumWrap}>
            {podiumOrdered.map((u) => (
              <div
                key={u.rank}
                className={`${styles.podiumCard} ${styles[`rank${u.rank}`]} ${u.isYou ? styles.podiumYou : ''}`}
              >
                <div className={styles.podiumMedal}>{MEDALS[u.rank]}</div>
                <div className={styles.podiumAvatar}>{u.avatar}</div>
                <div className={styles.podiumName}>{u.name}</div>
                <div className={styles.podiumXp}>⚡ {u.xp.toLocaleString()} XP</div>
                <div className={styles.podiumLevel}>Lv. {u.level}</div>
                {u.isYou && <div className={styles.youBadge}>You</div>}
              </div>
            ))}
          </div>
        )}

        {/* Rest of table */}
        {rest.length > 0 && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student</th>
                  <th>Level</th>
                  <th>XP</th>
                </tr>
              </thead>
              <tbody>
                {rest.map((u) => (
                  <tr key={u.rank} className={u.isYou ? styles.youRow : ''}>
                    <td className={styles.rankCell}>#{u.rank}</td>
                    <td className={styles.nameCell}>
                      <span className={styles.rowAvatar}>{u.avatar}</span>
                      {u.name}
                      {u.isYou && <span className={styles.youTag}>You</span>}
                    </td>
                    <td>Lv. {u.level}</td>
                    <td className={styles.xpCell}>⚡ {u.xp.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Leaderboard