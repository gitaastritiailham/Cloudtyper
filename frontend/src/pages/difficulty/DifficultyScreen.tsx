import cloudLogo from '../../assets/cloud-logo.png'
import type { Level } from '../../types'
import { LEVEL_LABEL, LEVEL_POINTS } from '../../data'
import styles from './DifficultyScreen.module.css'

type Props = {
  onSelect: (level: Level) => void
}

const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced']

export function DifficultyScreen({ onSelect }: Props) {
  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <img src={cloudLogo} alt="" aria-hidden="true" />
          レベルを選択してください
        </h1>
        <p className={styles.sub}>
          レベルに応じて、コマンドの長さや難易度が上がります
          <br />
          自分のペースで楽しく練習しましょう！
        </p>
      </header>

      <div className={styles.cards}>
        {LEVELS.map((level) => (
          <section key={level} className={styles.card}>
            <h2 className={styles.cardTitle}>{LEVEL_LABEL[level]}</h2>
            <ul className={styles.points}>
              {LEVEL_POINTS[level].map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <button className={styles.start} onClick={() => onSelect(level)}>
              スタート &gt;
            </button>
          </section>
        ))}
      </div>
    </div>
  )
}
