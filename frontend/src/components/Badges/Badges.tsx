import type { Grade, Level } from '../../types'
import { LEVEL_LABEL } from '../../data'
import styles from './Badges.module.css'

// 「初級」「中級」「上級」のラベル
export function LevelBadge({ level }: { level: Level }) {
  return <span className={`${styles.level} ${styles[level]}`}>{LEVEL_LABEL[level]}</span>
}

// 「GRADE S」の四角いマーク
export function GradeBox({ grade, size = 'lg' }: { grade: Grade; size?: 'lg' | 'sm' }) {
  return (
    <div className={`${styles.grade} ${styles[`grade${grade}`]} ${size === 'sm' ? styles.gradeSm : ''}`}>
      {size === 'lg' && <span className={styles.gradeLabel}>GRADE</span>}
      <span className={styles.gradeLetter}>{grade}</span>
    </div>
  )
}
