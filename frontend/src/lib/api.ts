// Supabase との通信はすべてここに集める（画面側は関数を呼ぶだけ）
import { supabase } from './supabase'
import type { Challenge, Level, Result } from '../types'
import { calcGrade, formatDate } from '../utils'

// DB の行の形（テーブルの列名に合わせる）
type ChallengeRow = {
  id: number
  difficulty: Level
  title: string
  description: string
  challenge_steps: { sort_order: number; command: string; explanation: string }[]
}

type ResultRow = {
  id: string
  challenge_id: number | null
  challenge_title: string
  difficulty: Level
  wpm: number
  accuracy: number
  mistakes: number
  time_seconds: number
  created_at: string
}

// ---------- 課題 ----------
// challenges と challenge_steps を一度に取得（steps は challenges の中に入って返る）
export async function fetchChallenges(level: Level): Promise<Challenge[]> {
  const { data, error } = await supabase
    .from('challenges')
    .select('id, difficulty, title, description, challenge_steps(sort_order, command, explanation)')
    .eq('difficulty', level)
    .order('sort_order')
  if (error) throw new Error(error.message)

  return (data as unknown as ChallengeRow[]).map((row) => ({
    id: String(row.id),
    level: row.difficulty,
    title: row.title,
    description: row.description,
    steps: [...row.challenge_steps]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((s) => ({ title: s.explanation || s.command, command: s.command })),
  }))
}

// ---------- 成績 ----------
function toResult(row: ResultRow): Result {
  const wpm = Number(row.wpm)
  const accuracy = Number(row.accuracy)
  return {
    id: row.id,
    challengeId: String(row.challenge_id ?? ''),
    challengeTitle: row.challenge_title,
    level: row.difficulty,
    wpm,
    accuracy,
    miss: row.mistakes,
    time: Math.round(Number(row.time_seconds)),
    grade: calcGrade({ wpm, accuracy }), // グレードは DB に保存せず、毎回計算
    date: formatDate(new Date(row.created_at)),
  }
}

// ログイン中のユーザーの成績だけ返る（RLS が user_id で絞ってくれる）
export async function fetchResults(): Promise<Result[]> {
  const { data, error } = await supabase
    .from('results')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data as ResultRow[]).map(toResult)
}

export async function insertResult(r: Result): Promise<void> {
  const { error } = await supabase.from('results').insert({
    id: r.id,
    challenge_id: r.challengeId ? Number(r.challengeId) : null,
    challenge_title: r.challengeTitle,
    difficulty: r.level,
    wpm: r.wpm,
    accuracy: r.accuracy,
    mistakes: r.miss,
    time_seconds: r.time,
    // user_id は入れない（DB 側が auth.uid() を自動で入れる）
  })
  if (error) throw new Error(error.message)
}

export async function deleteResult(id: string): Promise<void> {
  const { error } = await supabase.from('results').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
