import { House, ChartColumn, Settings, CircleUserRound } from 'lucide-react'
import cloudLogo from '../../assets/cloud-logo.png'
import type { NavPage } from '../../types'
import styles from './Navbar.module.css'

type Props = {
  active: NavPage
  onNavigate: (page: NavPage) => void
}

const ITEMS = [
  { page: 'home', label: 'ホーム', Icon: House },
  { page: 'results', label: '成績', Icon: ChartColumn },
  { page: 'settings', label: '設定', Icon: Settings },
] as const

export function Navbar({ active, onNavigate }: Props) {
  return (
    <header className={styles.navbar}>
      <div className={styles.brand}>
        <img className={styles.cloudLogo} src={cloudLogo} alt="" aria-hidden="true" />
        <span className={styles.logo}>cloudtyper</span>
      </div>

      <nav className={styles.menu}>
        {ITEMS.map(({ page, label, Icon }) => (
          <button
            key={page}
            className={`${styles.item} ${active === page ? styles.active : ''}`}
            onClick={() => onNavigate(page)}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}

        <span className={styles.divider} />

        <button
          className={`${styles.avatar} ${active === 'account' ? styles.avatarActive : ''}`}
          onClick={() => onNavigate('account')}
          aria-label="アカウント">
          <CircleUserRound size={34} strokeWidth={1.6} />
        </button>
      </nav>
    </header>
  )
}
