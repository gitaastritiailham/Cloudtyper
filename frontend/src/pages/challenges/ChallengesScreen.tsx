import { ChevronLeft, ChevronRight } from 'lucide-react'
import cloudLogo from '../../assets/cloud-logo.png'
import type { Challenge, Level } from '../../types'
import { LEVEL_LABEL } from '../../data'
import styles from './ChallengesScreen.module.css'

type Props = {
  level: Level
  challenges: Challenge[] // App が Supabase から取得したもの
  loading: boolean
  error: string
  onSelect: (challenge: Challenge) => void
  onBack: () => void
}

export function ChallengesScreen({ level, challenges, loading, error, onSelect, onBack }: Props) {
  return (
    <div className={styles.wrap}>
      <button className={styles.back} onClick={onBack}>
        <ChevronLeft size={18} />
        レベル選択へ
      </button>

      <header className={styles.header}>
        <h1 className={styles.title}>
          <img src={cloudLogo} alt="" aria-hidden="true" />
          チャレンジ一覧（{LEVEL_LABEL[level]}）
        </h1>
        <p className={styles.sub}>
          レベルに応じて、コマンドの長さや難易度が上がります
          <br />
          自分のペースで楽しく練習しましょう！
        </p>
      </header>

      <div className={styles.list}>
        {loading && <p className={styles.empty}>読み込み中…</p>}
        {error && <p className={styles.empty}>読み込みに失敗しました：{error}</p>}
        {!loading && !error && challenges.length === 0 && (
          <p className={styles.empty}>このレベルの課題はまだありません</p>
        )}
        {challenges.map((c) => (
          <button key={c.id} className={styles.item} onClick={() => onSelect(c)}>
            <span className={styles.text}>
              <span className={styles.name}>{c.title}</span>
              <span className={styles.desc}>{c.description}</span>
            </span>
            <ChevronRight className={styles.chevron} size={30} strokeWidth={2} />
          </button>
        ))}
      </div>
    </div>
  )
}
