import { useState } from 'react'
import { LogOut, UserRound } from 'lucide-react'
import type { Level, Result, User } from '../../types'
import { LEVEL_LABEL } from '../../data'
import { LevelBadge } from '../../components/Badges/Badges'
import { CharacterPanel } from '../../components/CharacterPanel/CharacterPanel'
import styles from './ProfileScreen.module.css'

type Props = {
  user: User
  results: Result[]
  onLogout: () => void
}

type Tab = 'history' | 'level' | 'command'

const TABS: { key: Tab; label: string }[] = [
  { key: 'history', label: '学習履歴' },
  { key: 'level', label: 'レベル' },
  { key: 'command', label: 'コマンド別' },
]

const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced']

export function ProfileScreen({ user, results, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>('history')

  return (
    <div className={styles.wrap}>
      {/* 上：プロフィール */}
      <section className={styles.profile}>
        <div className={styles.avatar}>
          <UserRound size={72} strokeWidth={1.3} />
        </div>
        <div className={styles.info}>
          <h1 className={styles.name}>{user.name}</h1>
          <p className={styles.bio}>{user.bio}</p>
        </div>
        <button className={styles.logout} onClick={onLogout}>
          <LogOut size={16} />
          ログアウト
        </button>
      </section>

      {/* 下：タブ */}
      <section className={styles.panel}>
        <div className={styles.tabs}>
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className={styles.content}>
          <div className={styles.main}>
            {tab === 'history' && (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>日付</th>
                    <th>レベル</th>
                    <th>カテゴリー</th>
                    <th>WPM</th>
                    <th>正確率</th>
                  </tr>
                </thead>
                <tbody>
                  {results.length === 0 && (
                    <tr>
                      <td colSpan={5} className={styles.empty}>
                        まだ記録がありません
                      </td>
                    </tr>
                  )}
                  {results.map((r) => (
                    <tr key={r.id}>
                      <td>{r.date}</td>
                      <td>
                        <LevelBadge level={r.level} />
                      </td>
                      <td>{r.challengeTitle}</td>
                      <td>{r.wpm}</td>
                      <td>{r.accuracy}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === 'level' && (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>レベル</th>
                    <th>回数</th>
                    <th>平均 WPM</th>
                    <th>平均 正確率</th>
                  </tr>
                </thead>
                <tbody>
                  {LEVELS.map((lv) => {
                    const list = results.filter((r) => r.level === lv)
                    const avg = (pick: (r: Result) => number) =>
                      list.length ? Math.round(list.reduce((s, r) => s + pick(r), 0) / list.length) : '-'
                    return (
                      <tr key={lv}>
                        <td>{LEVEL_LABEL[lv]}</td>
                        <td>{list.length}</td>
                        <td>{avg((r) => r.wpm)}</td>
                        <td>{list.length ? `${avg((r) => r.accuracy)}%` : '-'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}

            {tab === 'command' && (
              <p className={styles.soon}>コマンド別の成績は準備中です（Supabase にコマンド単位の記録を保存したあとに作ります）。</p>
            )}
          </div>

          <div className={styles.side}>
            <CharacterPanel />
          </div>
        </div>
      </section>
    </div>
  )
}
