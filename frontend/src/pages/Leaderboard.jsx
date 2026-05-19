import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import styles from './Leaderboard.module.css'
import { useAuth } from '../context/AuthContext'
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
    { rank: 12, name: 'You', level: 3, xp: 80, avatar: '⭐', isYou: true },
  ],
  weekly: [
    { rank: 1, name: 'Sara Khan', level: 7, xp: 1800, avatar: '👩‍💻' },
    { rank: 2, name: 'Ali Hassan', level: 8, xp: 1650, avatar: '🧑‍💻' },
    { rank: 3, name: 'Fatima Zahra', level: 4, xp: 1400, avatar: '👩‍💻' },
    { rank: 4, name: 'Usman Tariq', level: 6, xp: 1200, avatar: '🧑‍🎓' },
    { rank: 5, name: 'You', level: 3, xp: 950, avatar: '⭐', isYou: true },
  ],
  alltime: [
    { rank: 1, name: 'Ali Hassan', level: 8, xp: 12400, avatar: '🧑‍💻' },
    { rank: 2, name: 'Sara Khan', level: 7, xp: 10800, avatar: '👩‍💻' },
    { rank: 3, name: 'Usman Tariq', level: 6, xp: 9500, avatar: '🧑‍🎓' },
    { rank: 4, name: 'Hina Malik', level: 5, xp: 8200, avatar: '👩‍🎓' },
    { rank: 5, name: 'Bilal Ahmed', level: 5, xp: 7100, avatar: '🧑‍💻' },
    { rank: 6, name: 'Fatima Zahra', level: 4, xp: 6300, avatar: '👩‍💻' },
    { rank: 7, name: 'You', level: 3, xp: 1250, avatar: '⭐', isYou: true },
  ]
}

const medalColors = { 1: '🥇', 2: '🥈', 3: '🥉' }

function Leaderboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('daily')
  const [data, setData] = useState(mockData.daily)

  useEffect(() => {
    if (!isBackendEnabled()) {
      setData(mockData[tab])
      return
    }
    gamificationApi.getLeaderboard(tab)
      .then((rows) => {
        const mapped = rows.map((r) => ({
          rank: r.rank,
          name: r.name,
          level: r.level,
          xp: r.xp,
          avatar: '👤',
          isYou: user?.id && r.userId === user.id,
        }))
        if (mapped.length) setData(mapped)
        else setData(mockData[tab])
      })
      .catch(() => setData(mockData[tab]))
  }, [tab, user?.id])

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>🏆 Leaderboard</h1>
          <p>See how you rank against other students</p>
        </div>

        <div className={styles.tabs}>
          {['daily', 'weekly', 'alltime'].map(t => (
            <button
              key={t}
              className={`${styles.tab} ${tab === t ? styles.active : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'alltime' ? 'All Time' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Top 3 podium */}
        <div className={styles.podium}>
          {data.slice(0, 3).map(user => (
            <div key={user.rank} className={`${styles.podiumCard} ${styles[`rank${user.rank}`]}`}>
              <div className={styles.medal}>{medalColors[user.rank]}</div>
              <div className={styles.avatar}>{user.avatar}</div>
              <div className={styles.podiumName}>{user.name}</div>
              <div className={styles.podiumXp}>⚡ {user.xp.toLocaleString()} XP</div>
              <div className={styles.podiumLevel}>Lv. {user.level}</div>
            </div>
          ))}
        </div>

        {/* Full list */}
        <div className={styles.list}>
          {data.map(user => (
            <div key={user.rank} className={`${styles.row} ${user.isYou ? styles.youRow : ''}`}>
              <div className={styles.rankNum}>
                {medalColors[user.rank] || `#${user.rank}`}
              </div>
              <div className={styles.userAvatar}>{user.avatar}</div>
              <div className={styles.userName}>
                {user.name}
                {user.isYou && <span className={styles.youTag}>You</span>}
              </div>
              <div className={styles.userLevel}>Lv. {user.level}</div>
              <div className={styles.userXp}>⚡ {user.xp.toLocaleString()} XP</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Leaderboard