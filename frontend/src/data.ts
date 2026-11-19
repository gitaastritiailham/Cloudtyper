import type { Level } from './types'

export const LEVEL_LABEL: Record<Level, string> = {
  beginner: '初級',
  intermediate: '中級',
  advanced: '上級',
}

export const LEVEL_POINTS: Record<Level, string[]> = {
  beginner: ['基本的なコマンド', '短いコマンド', '初心者向け'],
  intermediate: ['オプション付きコマンド', 'やや長いコマンド', '実務でよく使う操作'],
  advanced: ['長い・複雑なコマンド', '複数のオプション', '実践的な運用操作'],
}
