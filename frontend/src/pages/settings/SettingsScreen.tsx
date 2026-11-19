import { useState } from 'react'
import { Cloud, CircleHelp, Settings, Volume2, type LucideIcon } from 'lucide-react'
import type { Theme } from '../../types'
import styles from './SettingsScreen.module.css'

type Props = {
  theme: Theme
  onThemeChange: (theme: Theme) => void
  soundOn: boolean
  onSoundChange: (on: boolean) => void
}

type Section = 'display' | 'sound' | 'help'

const SECTIONS: { key: Section; label: string; Icon: LucideIcon }[] = [
  { key: 'display', label: '表示設定', Icon: Settings },
  { key: 'sound', label: 'サウンド', Icon: Volume2 },
  { key: 'help', label: 'ヘルプ', Icon: CircleHelp },
]

const THEMES: { key: Theme; label: string }[] = [
  { key: 'light', label: 'ライト' },
  { key: 'dark', label: 'ダーク' },
  { key: 'blue', label: 'スカイ' },
]

const TITLES: Record<Section, { title: string; sub: string }> = {
  display: { title: '表示設定', sub: 'アプリの見た目や表示に関する設定を変更できます' },
  sound: { title: 'サウンド', sub: 'タイピング中の効果音に関する設定を変更できます' },
  help: { title: 'ヘルプ', sub: 'Cloudtyper の使い方' },
}

export function SettingsScreen({ theme, onThemeChange, soundOn, onSoundChange }: Props) {
  const [section, setSection] = useState<Section>('display')

  return (
    <div className={styles.wrap}>
      <nav className={styles.side}>
        {SECTIONS.map(({ key, label, Icon }) => (
          <button
            key={key}
            className={`${styles.sideItem} ${section === key ? styles.sideActive : ''}`}
            onClick={() => setSection(key)}
          >
            <Icon size={22} />
            {label}
          </button>
        ))}
      </nav>

      <section className={styles.main}>
        <header className={styles.head}>
          <h1 className={styles.title}>{TITLES[section].title}</h1>
          <p className={styles.sub}>{TITLES[section].sub}</p>
        </header>

        <div className={styles.body}>
          {section === 'display' && (
            <>
              <h2 className={styles.h2}>テーマ</h2>
              <div className={styles.themes}>
                {THEMES.map((t) => (
                  <button
                    key={t.key}
                    className={`${styles.theme} ${theme === t.key ? styles.themeActive : ''}`}
                    onClick={() => onThemeChange(t.key)}
                    aria-pressed={theme === t.key}
                  >
                    <span className={`${styles.preview} ${styles[t.key]}`}>
                      <Cloud size={64} strokeWidth={1.6} />
                    </span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {section === 'sound' && (
            <label className={styles.toggle}>
              <input type="checkbox" checked={soundOn} onChange={(e) => onSoundChange(e.target.checked)} />
              タイピング効果音を鳴らす
            </label>
          )}

          {section === 'help' && (
            <ul className={styles.help}>
              <li>ホームのターミナルに <code>cloudtyper start</code> と入力するとログインなしで始められます。</li>
              <li><code>cloudtyper login</code> でログインすると、成績を保存できます。</li>
              <li>課題のコマンドをそのまま入力してください。間違えたキーは入力されず、ミスとして数えられます。</li>
              <li>全部打ち終わると WPM・正確率・ミス・時間からグレード（S/A/B/C）が決まります。</li>
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
