import { Check, Save } from 'lucide-react'
import type { Result } from '../../types'
import { ResultCard } from '../../components/ResultCard/ResultCard'
import styles from './ResultsScreen.module.css'

type Props = {
  result: Result
  saved: boolean // もう保存したか
  hasNext: boolean // 次の課題があるか
  onSave: () => void
  onNext: () => void
  onRetry: () => void
  onHome: () => void
}

export function ResultsScreen({ result, saved, hasNext, onSave, onNext, onRetry, onHome }: Props) {
  return (
    <ResultCard result={result}>
      <button className={styles.save} onClick={onSave} disabled={saved}>
        {saved ? <Check size={16} /> : <Save size={16} />}
        {saved ? '保存しました' : '記録を保存する'}
      </button>

      <button className={styles.next} onClick={onNext}>
        {hasNext ? '次の課題へ進む >' : '課題一覧へ戻る >'}
      </button>

      <div className={styles.row}>
        <button className={styles.sub} onClick={onRetry}>
          もう一度
        </button>
        <button className={styles.sub} onClick={onHome}>
          ホームへ
        </button>
      </div>
    </ResultCard>
  )
}
