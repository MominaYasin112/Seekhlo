import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StatsBar from '../components/StatsBar'
import LearningPath from '../components/LearningPath'
import Badges from '../components/Badges'
import styles from './Dashboard.module.css'

function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.content}>
        <div className={styles.welcome}>
          <h1>Welcome back, <span>{user?.name}</span> 👋</h1>
          <p>Keep the streak going — your path is ready.</p>
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