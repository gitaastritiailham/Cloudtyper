import { toPng } from 'html-to-image'
import type { Grade, Stats } from './types'

// S / A / B / C を WPM と正確率から決める（基準はあとで自由に変更）
export function calcGrade({ wpm, accuracy }: Pick<Stats, 'wpm' | 'accuracy'>): Grade {
  if (accuracy >= 98 && wpm >= 60) return 'S'
  if (accuracy >= 95 && wpm >= 45) return 'A'
  if (accuracy >= 90 && wpm >= 30) return 'B'
  return 'C'
}

// 83 -> "01:23"
export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// -> "2026/10/29"
export function formatDate(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}/${mm}/${dd}`
}

// 画面の一部（node）を PNG にしてダウンロードする
// data-no-capture が付いた要素（ボタンなど）は画像に含めない
export async function saveAsImage(node: HTMLElement, filename: string) {
  const url = await toPng(node, {
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    filter: (n) => !(n instanceof HTMLElement && n.dataset.noCapture !== undefined),
  })
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.png`
  a.click()
}
