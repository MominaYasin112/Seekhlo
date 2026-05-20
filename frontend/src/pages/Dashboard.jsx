import { useAuth } from '../context/AuthContext'
import { useGamification } from '../context/GamificationContext'
import Navbar from '../components/Navbar'
import StatsBar from '../components/StatsBar'
import LearningPath from '../components/LearningPath'
import Badges from '../components/Badges'
import styles from './Dashboard.module.css'

function Dashboard() {
  const { user } = useAuth()
  const { stats } = useGamification()

  const isNewUser = stats.xp === 0 && stats.streak === 0

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.content}>
        <div className={styles.welcome}>
          <h1>
            {isNewUser ? 'Welcome, ' : 'Welcome back, '}
            <span>{user?.name?.split(' ')[0]}</span>! 👋
          </h1>
          <p>
            {isNewUser
              ? 'Your learning journey starts now — pick your first module below! 🚀'
              : 'Keep the streak going — your path is ready.'}
          </p>
        </div>
        <StatsBar />
        <div className={styles.grid}>
          <LearningPath />
          <Badges />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
