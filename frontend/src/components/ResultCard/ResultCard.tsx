import type { ReactNode } from 'react'
import { UserRound } from 'lucide-react'
import type { Result } from '../../types'
import { formatTime } from '../../utils'
import { GradeBox, LevelBadge } from '../Badges/Badges'
import styles from './ResultCard.module.css'

type Props = {
  result: Result
  children?: ReactNode // ボタンなどを下に追加したいとき
}

// 「チャレンジ完了！」のカード。結果画面と成績詳細で共通
export function ResultCard({ result, children }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.head}>
        {/* キャラクター画像ができたら <img> に差し替える */}
        <div className={styles.thumb}>
          <UserRound size={56} strokeWidth={1.4} />
        </div>
        <div className={styles.headText}>
          <LevelBadge level={result.level} />
          <h2 className={styles.title}>チャレンジ完了！</h2>
          <p className={styles.sub}>{result.challengeTitle}</p>
        </div>
      </div>

      <div className={styles.body}>
        <GradeBox grade={result.grade} />

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span>WPM</span>
            <b>{result.wpm}</b>
          </div>
          <div className={styles.stat}>
            <span>正確率</span>
            <b>{result.accuracy}%</b>
          </div>
          <div className={styles.stat}>
            <span>ミス</span>
            <b>{result.miss}</b>
          </div>
          <div className={styles.stat}>
            <span>タイマー</span>
            <b>{formatTime(result.time)}</b>
          </div>
        </div>

        {children}
      </div>
    </div>
  )
}
