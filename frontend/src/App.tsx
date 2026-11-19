import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { deleteResult, fetchChallenges, fetchResults, insertResult } from './lib/api'
import { Layout } from './components/Layout/Layout'
import {
  AuthScreen,
  ChallengesScreen,
  DifficultyScreen,
  HomeScreen,
  ProfileScreen,
  ResultsScreen,
  SavedScreen,
  SettingsScreen,
  TypingScreen,
} from './pages'
import { calcGrade, formatDate } from './utils'
import type {
  AuthMode,
  AuthResult,
  Challenge,
  Level,
  NavPage,
  Result,
  Screen,
  Stats,
  Theme,
  User,
} from './types'

// Navbar のどのメニューを光らせるか（画面 -> メニュー）
const NAV_OF: Record<Screen, NavPage> = {
  home: 'home',
  auth: 'home',
  difficulty: 'home',
  challenges: 'home',
  typing: 'home',
  results: 'home',
  saved: 'results',
  profile: 'account',
  settings: 'settings',
}

// 右にキャラクターを出す画面
const WITH_CHARACTER: Screen[] = ['home', 'auth', 'difficulty', 'challenges', 'typing', 'results']

function loadTheme(): Theme {
  try {
    const t = localStorage.getItem('theme')
    if (t === 'light' || t === 'dark' || t === 'blue') return t
  } catch {
    // localStorage が使えないときは無視
  }
    return 'blue'
}

function App() {
  // 再設定メールのリンク（URL に type=recovery が付く）から開いたときは、最初からログイン画面
  const [recovery, setRecovery] = useState(() => window.location.hash.includes('type=recovery'))
  const [screen, setScreen] = useState<Screen>(() =>
    window.location.hash.includes('type=recovery') ? 'auth' : 'home',
  )
  const [level, setLevel] = useState<Level>('beginner')
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [attempt, setAttempt] = useState(0) // 「もう一度」で TypingScreen を作り直すための番号
  const [result, setResult] = useState<Result | null>(null) // 直前の結果
  const [challenges, setChallenges] = useState<Challenge[]>([]) // 選んだレベルの課題（Supabase）
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [saved, setSaved] = useState<Result[]>([]) // 保存した成績（Supabase の results）
  const [user, setUser] = useState<User | null>(null) // null = 未ログイン
  const [theme, setTheme] = useState<Theme>(loadTheme)
  const [soundOn, setSoundOn] = useState(true)

  // Supabase のログイン状態を反映（リロードしても維持される）
  useEffect(() => {
    const apply = (session: Session | null) => {
      if (!session) return setUser(null)
      const meta = session.user.user_metadata
      const name = meta?.name || meta?.full_name || session.user.email?.split('@')[0] || 'player'
      setUser({ id: session.user.id, name, bio: '' })
    }
    supabase.auth.getSession().then(({ data }) => apply(data.session))
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecovery(true)
        setScreen('auth')
      }
      apply(session)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  // ログインしたら成績を読み込む／ログアウトしたら空にする
  const userId = user?.id
  useEffect(() => {
    if (!userId) {
      setSaved([])
      return
    }
    fetchResults()
      .then(setSaved)
      .catch((e) => console.error('成績の取得に失敗', e))
  }, [userId])

  // テーマを <html data-theme="..."> に反映
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // 無視
    }
  }, [theme])

  // ---------- ナビゲーション ----------
  function navigate(page: NavPage) {
    if (page === 'home') setScreen('home')
    else if (page === 'results') setScreen('saved')
    else if (page === 'settings') setScreen('settings')
    else setScreen(user ? 'profile' : 'auth')
  }

  // ---------- ログイン / 新規登録 ----------
  // Supabase のエラー文（英語）を日本語にする
  function authMessage(msg: string) {
    if (msg.includes('Invalid login credentials')) return 'メールアドレスまたはパスワードが違います'
    if (msg.includes('Email not confirmed')) return 'メールの確認が完了していません。届いたメールのリンクを開いてください'
    if (msg.includes('should be different')) return '前と同じパスワードは使えません'
    if (msg.includes('already registered')) return 'このメールアドレスはすでに登録されています'
    return msg
  }

  async function handleAuth(
    mode: AuthMode,
    email: string,
    password: string,
    name: string,
  ): Promise<AuthResult> {
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error: authMessage(error.message) }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        // name は profiles.display_name に入る（DB のトリガーが user_metadata を読む）
        options: { data: { name: name || email.split('@')[0] } },
      })
      if (error) return { error: authMessage(error.message) }
      // すでに登録済みのメールは identities が空で返ってくる（メールは送られない）
      if (data.user?.identities?.length === 0) {
        return { error: 'このメールアドレスはすでに登録されています。ログインしてください' }
      }
      if (!data.session) {
        return { notice: '確認メールを送信しました。メール内のリンクを開いてからログインしてください。' }
      }
    }
    setScreen('difficulty')
    return {}
  }

  // 確認メールの再送（登録済みで未確認のアカウント用）
  async function handleResend(email: string): Promise<AuthResult> {
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    if (error) return { error: authMessage(error.message) }
    return { notice: '確認メールを再送しました。届かない場合は迷惑メールも確認してください。' }
  }

  // パスワード再設定メールを送る（リンクを開くと新しいパスワードの入力画面に戻ってくる）
  async function handleForgot(email: string): Promise<AuthResult> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    })
    if (error) return { error: authMessage(error.message) }
    return { notice: '再設定用のメールを送信しました。メール内のリンクを開いてください。' }
  }

  // 新しいパスワードを保存する
  async function handleNewPassword(password: string): Promise<AuthResult> {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) return { error: authMessage(error.message) }
    setRecovery(false)
    setScreen('difficulty')
    return {}
  }

  async function handleGoogle(): Promise<AuthResult> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    return error ? { error: error.message } : {}
  }

  async function logout() {
    await supabase.auth.signOut() // user は onAuthStateChange が null にしてくれる
    setScreen('home')
  }

  // ---------- 課題 ----------
  // レベルを選んだら、そのレベルの課題を Supabase から取得して一覧へ
  async function pickLevel(lv: Level) {
    setLevel(lv)
    setChallenges([])
    setLoadError('')
    setLoading(true)
    setScreen('challenges')
    try {
      setChallenges(await fetchChallenges(lv))
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  function startChallenge(c: Challenge) {
    setChallenge(c)
    setAttempt((n) => n + 1)
    setScreen('typing')
  }

  function finishTyping(stats: Stats) {
    if (!challenge) return
    setResult({
      ...stats,
      id: crypto.randomUUID(),
      challengeId: challenge.id,
      challengeTitle: challenge.title,
      level: challenge.level,
      grade: calcGrade(stats),
      date: formatDate(new Date()),
    })
    setScreen('results')
  }

  // 一覧の中での「次の課題」
  const nextChallenge = challenges[challenges.findIndex((c) => c.id === challenge?.id) + 1]

  async function saveResult() {
    if (!result || saved.some((r) => r.id === result.id)) return
    if (!user) {
      alert('記録を保存するにはログインしてください')
      return setScreen('auth')
    }
    try {
      await insertResult(result)
      setSaved((prev) => [result, ...prev])
    } catch (e) {
      alert(`保存に失敗しました：${e instanceof Error ? e.message : e}`)
    }
  }

  async function removeResult(id: string) {
    try {
      await deleteResult(id)
      setSaved((prev) => prev.filter((r) => r.id !== id))
    } catch (e) {
      alert(`削除に失敗しました：${e instanceof Error ? e.message : e}`)
    }
  }

  return (
    <Layout
      active={NAV_OF[screen]}
      onNavigate={navigate}
      showCharacter={WITH_CHARACTER.includes(screen)}
    >
      {screen === 'home' && (
        <HomeScreen onStart={() => setScreen('difficulty')} onLogin={() => setScreen('auth')} />
      )}

      {screen === 'auth' && (
        <AuthScreen
          onSubmit={handleAuth}
          onGoogle={handleGoogle}
          onResend={handleResend}
          onForgot={handleForgot}
          onNewPassword={handleNewPassword}
          recovery={recovery}
        />
      )}

      {screen === 'difficulty' && <DifficultyScreen onSelect={pickLevel} />}

      {screen === 'challenges' && (
        <ChallengesScreen
          level={level}
          challenges={challenges}
          loading={loading}
          error={loadError}
          onSelect={startChallenge}
          onBack={() => setScreen('difficulty')}
        />
      )}

      {screen === 'typing' && challenge && (
        <TypingScreen
          key={attempt}
          challenge={challenge}
          onFinish={finishTyping}
          onExit={() => setScreen('challenges')}
        />
      )}

      {screen === 'results' && result && (
        <ResultsScreen
          result={result}
          saved={saved.some((r) => r.id === result.id)}
          hasNext={nextChallenge !== undefined}
          onSave={saveResult}
          onNext={() => (nextChallenge ? startChallenge(nextChallenge) : setScreen('challenges'))}
          onRetry={() => challenge && startChallenge(challenge)}
          onHome={() => setScreen('home')}
        />
      )}

      {screen === 'saved' && (
        <SavedScreen results={saved} onDelete={removeResult} />
      )}

      {screen === 'profile' && user && (
        <ProfileScreen user={user} results={saved} onLogout={logout} />
      )}

      {screen === 'settings' && (
        <SettingsScreen
          theme={theme}
          onThemeChange={setTheme}
          soundOn={soundOn}
          onSoundChange={setSoundOn}
        />
      )}
    </Layout>
  )
}

export default App
