import type { ReactNode } from 'react'
import type { NavPage } from '../../types'
import { Navbar } from '../Navbar/Navbar'
import { CharacterPanel } from '../CharacterPanel/CharacterPanel'
import styles from './Layout.module.css'

type Props = {
  active: NavPage
  onNavigate: (page: NavPage) => void
  showCharacter?: boolean // false = karakter disembunyikan
  children: ReactNode // isi halaman
}

export function Layout({ active, onNavigate, showCharacter = true, children }: Props) {
  return (
    <div className={styles.page}>
      <div className={styles.window}>
        <Navbar active={active} onNavigate={onNavigate} />
        <main className={`${styles.body} ${showCharacter ? styles.withCharacter : ''}`}>
          <div className={styles.main}>{children}</div>
          {showCharacter && <CharacterPanel />}
        </main>
      </div>
    </div>
  )
}
