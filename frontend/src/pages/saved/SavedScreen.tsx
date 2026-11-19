import { useRef, useState, type MouseEvent } from 'react'
import { ChevronLeft, Download, Trash2 } from 'lucide-react'
import type { Result } from '../../types'
import { formatTime, saveAsImage } from '../../utils'
import { GradeBox, LevelBadge } from '../../components/Badges/Badges'
import { ResultCard } from '../../components/ResultCard/ResultCard'
import styles from './SavedScreen.module.css'

type Props = {
  results: Result[]
  onDelete: (id: string) => void
}

export function SavedScreen({ results, onDelete }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const detailRef = useRef<HTMLDivElement>(null)

  const selected = results.find((r) => r.id === selectedId)

  // 一覧のカードを画像にする（ボタンは data-no-capture なので写らない）
  function saveCard(e: MouseEvent<HTMLButtonElement>, r: Result) {
    e.stopPropagation() // カードの「詳細を開く」が動かないように
    const card = e.currentTarget.closest('[data-card]')
    if (card instanceof HTMLElement) saveAsImage(card, `cloudtyper-${r.date.replaceAll('/', '')}`)
  }

  function remove(e: MouseEvent<HTMLButtonElement>, id: string) {
    e.stopPropagation()
    onDelete(id)
  }

  // ---------- 詳細表示 ----------
  if (selected) {
    return (
      <div className={styles.detail}>
        <button className={styles.back} onClick={() => setSelectedId(null)}>
          <ChevronLeft size={18} />
          成績一覧へ
        </button>

        <div ref={detailRef}>
          <ResultCard result={selected} />
        </div>

        <button
          className={styles.saveBig}
          onClick={() => detailRef.current && saveAsImage(detailRef.current, `cloudtyper-${selected.date.replaceAll('/', '')}`)}
        >
          <Download size={22} />
          画像として保存
        </button>
      </div>
    )
  }

  // ---------- 一覧 ----------
  return (
    <div>
      <p className={styles.hint}>カードをクリックして詳細を見る・画像として保存できます。</p>

      {results.length === 0 ? (
        <p className={styles.empty}>まだ記録がありません。チャレンジを完了して「記録を保存する」を押すと、ここに表示されます。</p>
      ) : (
        <div className={styles.grid}>
          {results.map((r) => (
            <div
              key={r.id}
              data-card
              className={styles.card}
              onClick={() => setSelectedId(r.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedId(r.id)}
            >
              <div className={styles.top}>
                <div>
                  <h3 className={styles.title}>{r.challengeTitle}</h3>
                  <p className={styles.meta}>
                    <LevelBadge level={r.level} />
                    <span>{r.date}</span>
                  </p>
                </div>
                <GradeBox grade={r.grade} size="sm" />
              </div>

              <div className={styles.stats}>
                <div>
                  <span>WPM</span>
                  <b className={styles.wpm}>{r.wpm}</b>
                </div>
                <div>
                  <span>正確率</span>
                  <b className={styles.acc}>{r.accuracy}%</b>
                </div>
                <div>
                  <span>ミス</span>
                  <b className={styles.miss}>{r.miss}</b>
                </div>
                <div>
                  <span>TIME</span>
                  <b className={styles.time}>{formatTime(r.time)}</b>
                </div>
              </div>

              <div className={styles.foot} data-no-capture>
                <button className={styles.download} onClick={(e) => saveCard(e, r)}>
                  <Download size={16} />
                  画像として保存
                </button>
                <button className={styles.trash} onClick={(e) => remove(e, r.id)} aria-label="削除">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
