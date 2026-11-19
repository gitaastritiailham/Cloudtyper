import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { BookOpen, Keyboard, Lightbulb, Play, X } from 'lucide-react'
import type { Challenge, Stats } from '../../types'
import { LEVEL_LABEL } from '../../data'
import { formatTime } from '../../utils'
import styles from './TypingScreen.module.css'

type Props = {
  challenge: Challenge
  onFinish: (stats: Stats) => void
  onExit: () => void
}

export function TypingScreen({ challenge, onFinish, onExit }: Props) {
  const [stepIndex, setStepIndex] = useState(0) // いま何問目か（0 始まり）
  const [stage, setStage] = useState<'learn' | 'typing'>('learn')
  const [input, setInput] = useState('') // いま打っている文字
  const [correctKeys, setCorrectKeys] = useState(0) // 正しく打ったキーの数
  const [miss, setMiss] = useState(0) // ミスの数
  const [startedAt, setStartedAt] = useState<number | null>(null) // 最初のキーを打った時刻
  const [elapsed, setElapsed] = useState(0) // 経過秒
  const inputRef = useRef<HTMLInputElement>(null)
  const beginButtonRef = useRef<HTMLButtonElement>(null)

  const steps = challenge.steps
  const step = steps[stepIndex]
  const target = step.command

  useEffect(() => {
    if (stage === 'typing') inputRef.current?.focus()
    else beginButtonRef.current?.focus()
  }, [stage, stepIndex])

  // 最初のキーを打ってから 1 秒ごとに時間を更新
  useEffect(() => {
    if (startedAt === null) return
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 250)
    return () => clearInterval(id)
  }, [startedAt])

  // 終わった問題の文字数 + いま打っている文字数
  const doneChars = steps.slice(0, stepIndex).reduce((sum, s) => sum + s.command.length, 0)
  const typedChars = doneChars + input.length
  const liveWpm = elapsed > 0 ? Math.round(typedChars / 5 / (elapsed / 60)) : 0
  const liveAccuracy =
    correctKeys + miss === 0 ? 100 : Math.round((correctKeys / (correctKeys + miss)) * 100)

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    if (value.length <= input.length) return // 消すのは不要（間違った文字は入らないため）

    const start = startedAt ?? Date.now()
    if (startedAt === null) setStartedAt(start)

    // 増えた文字を 1 文字ずつ確認。正しければ追加、違えばミス
    let next = input
    let ok = 0
    let bad = 0
    for (const ch of value.slice(input.length)) {
      if (next.length < target.length && ch === target[next.length]) {
        next += ch
        ok++
      } else {
        bad++
      }
    }

    const totalCorrect = correctKeys + ok
    const totalMiss = miss + bad
    setInput(next)
    setCorrectKeys(totalCorrect)
    setMiss(totalMiss)
    if (next !== target) return

    if (stepIndex + 1 < steps.length) {
      setStepIndex(stepIndex + 1)
      setInput('')
      setStage('learn')
      return
    }

    const seconds = Math.max(1, (Date.now() - start) / 1000)
    const allChars = doneChars + target.length
    onFinish({
      wpm: Math.round(allChars / 5 / (seconds / 60)),
      accuracy: totalCorrect + totalMiss === 0 ? 100 : Math.round((totalCorrect / (totalCorrect + totalMiss)) * 100),
      miss: totalMiss,
      time: Math.round(seconds),
    })
  }

  return (
    <>
    <div className={styles.terminal}>
      <div className={styles.titleBar}>
        <span className={styles.dots}>
          <i style={{ background: '#ff6b6b' }} />
          <i style={{ background: '#ffd93d' }} />
          <i style={{ background: '#5bd67a' }} />
        </span>
        <span className={styles.titleText}>{'>_ Cloudtyper Terminal'}</span>
        <button className={styles.exit} onClick={onExit} aria-label="やめる">
          <X size={20} />
        </button>
      </div>

      <div className={styles.body}>
        <div className={styles.progressRow}>
          <span className={styles.level}>
            {LEVEL_LABEL[challenge.level]}　{challenge.title}
          </span>
          <span className={styles.count}>
            {stepIndex + 1}/{steps.length}
          </span>
        </div>
        <div className={styles.bar}>
          <div className={styles.barFill} style={{ width: `${(stepIndex / steps.length) * 100}%` }} />
        </div>

        <p className={styles.prompt}>auth@cloudtyper:~$</p>
        <p className={styles.stepTitle}>
          <Play size={22} fill="currentColor" strokeWidth={0} />
          {step.title}
        </p>
        <p className={styles.hint}>目的を確認して、同じコマンドを入力してください。</p>
        <div className={styles.target}>
          <span className={styles.done}>{target.slice(0, input.length)}</span>
          <span className={styles.rest}>{target.slice(input.length)}</span>
        </div>
        <div className={styles.inputBox}>
          <span className={styles.dollar}>$</span>
          <input
            ref={inputRef}
            className={styles.input}
            value={input}
            onChange={handleChange}
            placeholder="ここに入力してください"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
          />
        </div>
        <p className={styles.enterHint} aria-live="polite">
          {input === target ? '入力完了！次のコマンドの説明を表示します。' : '入力が終わると、次の説明へ自動で進みます。'}
        </p>
        <div className={styles.statsRow}>
          <div className={styles.statsMain}>
            <div className={styles.stat}>
              <span>WPM</span>
              <b>{liveWpm}</b>
            </div>
            <div className={styles.stat}>
              <span>正確率</span>
              <b>{liveAccuracy}%</b>
            </div>
            <div className={styles.stat}>
              <span>ミス</span>
              <b>{miss}</b>
            </div>
          </div>
          <div className={`${styles.stat} ${styles.time}`}>
            <span>時間</span>
            <b>{formatTime(elapsed)}</b>
          </div>
        </div>
      </div>
    {stage === 'learn' && (
      <div className={styles.modalOverlay}>
        <section
          className={styles.learningModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="learning-modal-title"
          aria-describedby="learning-modal-description"
        >
          <div className={styles.moduleTitle}>
            <BookOpen size={22} aria-hidden="true" />
            <h2 id="learning-modal-title">{challenge.title}</h2>
          </div>
          <code className={styles.moduleCommand}>{target}</code>
          <div className={styles.explanation}>
            <Lightbulb size={20} aria-hidden="true" />
            <p id="learning-modal-description">{step.title}</p>
          </div>
          <button
            ref={beginButtonRef}
            className={styles.beginButton}
            onClick={() => setStage('typing')}
          >
            <Keyboard size={18} aria-hidden="true" />
            Enter でタイピングを開始する
          </button>
        </section>
      </div>
    )}
    </div>
    </>
  )
}
