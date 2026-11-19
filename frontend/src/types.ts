// Semua tipe yang dipakai bersama oleh banyak halaman

export type NavPage = 'home' | 'results' | 'settings' | 'account'

export type Screen =
  | 'home'
  | 'auth'
  | 'difficulty'
  | 'challenges'
  | 'typing'
  | 'results'
  | 'saved'
  | 'profile'
  | 'settings'

export type Theme = 'light' | 'dark' | 'blue'

export type Level = 'beginner' | 'intermediate' | 'advanced'

export type Grade = 'S' | 'A' | 'B' | 'C'

// satu langkah = satu command yang harus diketik
export type Step = {
  title: string // penjelasan, contoh: "AWS CLI でサーバーの情報を確認する"
  command: string // yang harus diketik
}

export type Challenge = {
  id: string
  level: Level
  title: string
  description: string
  steps: Step[]
}

// angka hasil mengetik
export type Stats = {
  wpm: number
  accuracy: number // 0-100
  miss: number
  time: number // detik
}

export type Result = Stats & {
  id: string
  challengeId: string
  challengeTitle: string
  level: Level
  grade: Grade
  date: string // 2026/10/29
}

export type User = {
  id: string // Supabase の user id
  name: string
  bio: string
}

// ログイン画面まわり
export type AuthMode = 'login' | 'signup'

// App がログイン処理の結果を画面に返す形（error = 赤い文、notice = 案内の文）
export type AuthResult = { error?: string; notice?: string }
