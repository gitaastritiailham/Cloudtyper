import { useState } from 'react'
import cloudLogo from '../../assets/cloud-logo.png'
import styles from './HomeScreen.module.css'

type Props = {
  onStart: () => void // cloudtyper start
  onLogin: () => void // cloudtyper login
}

const PROMPT = 'auth@cloudtyper:~$'

export function HomeScreen({ onStart, onLogin }: Props) {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  function run() {
    const cmd = input.trim()
    if (!cmd) return
    setError('')
    if (cmd === 'cloudtyper start') onStart()
    else if (cmd === 'cloudtyper login') onLogin()
    else setError(`command not found: ${cmd}`)
    setInput('')
  }

  return (
    <div className={styles.terminal}>
      <div className={styles.titleBar}>
        <span className={styles.dots}>
          <i style={{ background: '#ff6b6b' }} />
          <i style={{ background: '#ffd93d' }} />
          <i style={{ background: '#5bd67a' }} />
        </span>
        <span>{'>_ Cloudtyper Terminal'}</span>
      </div>

      <div className={styles.body}>
        <section className={styles.entry}>
          <p className={styles.line}>
            <span className={styles.prompt}>{PROMPT}</span> <span className={styles.cmd}>welcome</span>
          </p>
          <h2 className={styles.welcome}>
            <img src={cloudLogo} alt="" aria-hidden="true" />
            Cloudtyper へようこそ！
          </h2>
          <p className={styles.sub}>
            クラウドのコマンドを入力しながら、タイピングとクラウドの知識を楽しく学びましょう。
          </p>
        </section>

        <section className={styles.entry}>
          <p className={styles.line}>
            <span className={styles.prompt}>{PROMPT}</span> <span className={styles.cmd}>cloudtyper menu</span>
          </p>
          <p className={styles.text}>Cloudtyperを始める方法を選んでください。</p>
          <p className={styles.text}>1. ログインせずに始める</p>
          <p className={styles.command}>
            cloudtyper start
          </p>
          <p className={styles.text}>2. ログインして始める</p>
          <p className={styles.command}>
            cloudtyper login
          </p>
        </section>

        <section className={styles.entry}>
          <label className={styles.line}>
            <span className={styles.prompt}>{PROMPT}</span>{' '}
            {!input && <span className={styles.cursor} aria-hidden="true" />}
            <input
              className={`${styles.input} ${!input ? styles.inputEmpty : ''}`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') run()
              }}
              placeholder="ここにコマンドを入力してください"
              spellCheck={false}
              autoComplete="off"
              autoFocus
            />
          </label>
          {error && <p className={styles.error}>{error}</p>}
        </section>
      </div>
    </div>
  )
}
