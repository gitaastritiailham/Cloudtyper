import { useState, type CSSProperties, type FormEvent } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import type { AuthMode, AuthResult } from '../../types'
import styles from './AuthScreen.module.css'

type Props = {
  // App が Supabase に問い合わせて、結果（エラー文など）を返す
  onSubmit: (mode: AuthMode, email: string, password: string, name: string) => Promise<AuthResult>
  onGoogle: () => Promise<AuthResult>
  onResend: (email: string) => Promise<AuthResult> // 確認メールの再送
  onForgot: (email: string) => Promise<AuthResult> // パスワード再設定メールの送信
  onNewPassword: (password: string) => Promise<AuthResult> // 新しいパスワードの保存
  recovery: boolean // 再設定メールのリンクから戻ってきたとき true
}

type View = AuthMode | 'forgot'

// 文字だけのリンク風ボタン
const linkStyle: CSSProperties = {
  alignSelf: 'flex-start',
  marginBottom: 12,
  padding: 0,
  border: 'none',
  background: 'none',
  color: 'var(--brand)',
  textDecoration: 'underline',
  cursor: 'pointer',
}

const titleStyle: CSSProperties = {
  margin: 0,
  padding: '28px 28px 0',
  color: 'var(--text)',
  fontSize: 22,
  textAlign: 'center',
}

export function AuthScreen({ onSubmit, onGoogle, onResend, onForgot, onNewPassword, recovery }: Props) {
  const [view, setView] = useState<View>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const isLogin = view === 'login'
  const isSignup = view === 'signup'
  const isForgot = view === 'forgot'

  // 結果（エラー文・案内文）を画面に反映する共通処理
  async function run(task: () => Promise<AuthResult>) {
    setError('')
    setNotice('')
    setLoading(true)
    try {
      const r = await task()
      if (r.error) setError(r.error)
      if (r.notice) setNotice(r.notice)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  function changeView(next: View) {
    setView(next)
    setError('')
    setNotice('')
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    // 新しいパスワードを決める（メールのリンクから戻ってきたとき）
    if (recovery) {
      if (password.length < 6) return setError('パスワードは6文字以上で入力してください')
      return run(() => onNewPassword(password))
    }

    if (!email.includes('@')) return setError('メールアドレスを正しく入力してください')

    // パスワードを忘れた：メールだけ送る
    if (isForgot) return run(() => onForgot(email))

    if (isSignup && !name.trim()) return setError('表示名を入力してください')
    // ログイン時は長さを確認しない（前に作ったアカウントが入れなくなるため）
    if (isSignup && password.length < 6) return setError('パスワードは6文字以上で入力してください')
    run(() => onSubmit(view, email, password, name))
  }

  // パスワード欄（目のアイコン付き）。ログイン・新規登録・再設定で共通
  const passwordField = (
    <>
      <label className={styles.label} htmlFor="password">
        {recovery ? '新しいパスワード' : 'パスワード'}
      </label>
      <div className={styles.passwordBox}>
        <input
          id="password"
          className={styles.input}
          type={showPassword ? 'text' : 'password'}
          placeholder={isLogin ? 'パスワード' : '6文字以上'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={isLogin ? 'current-password' : 'new-password'}
        />
        <button
          type="button"
          className={styles.eye}
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
        >
          {showPassword ? <EyeOff size={26} /> : <Eye size={26} />}
        </button>
      </div>
    </>
  )

  const messages = (
    <>
      {notice && <p className={styles.error} style={{ color: 'var(--brand)' }}>{notice}</p>}
      {/* 確認メールの再送は新規登録のときだけ */}
      {notice && isSignup && (
        <button type="button" onClick={() => run(() => onResend(email))} disabled={loading} style={linkStyle}>
          確認メールを再送する
        </button>
      )}
      {error && <p className={styles.error}>{error}</p>}
    </>
  )

  // ---------- 新しいパスワードの入力画面 ----------
  if (recovery) {
    return (
      <div className={styles.card}>
        <h2 style={titleStyle}>新しいパスワードを設定</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          {passwordField}
          {messages}
          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? '処理中...' : 'パスワードを更新'}
          </button>
        </form>
      </div>
    )
  }

  // ---------- パスワードを忘れた画面 ----------
  if (isForgot) {
    return (
      <div className={styles.card}>
        <h2 style={titleStyle}>パスワードの再設定</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <p style={{ margin: '0 0 16px', fontSize: 14 }}>
            登録したメールアドレスに、再設定用のリンクを送ります。
          </p>
          <label className={styles.label} htmlFor="email">
            メールアドレス
          </label>
          <input
            id="email"
            className={styles.input}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          {messages}
          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? '処理中...' : '再設定メールを送信'}
          </button>
          <button
            type="button"
            onClick={() => changeView('login')}
            style={{ ...linkStyle, alignSelf: 'center', margin: '16px 0 0' }}
          >
            ログインに戻る
          </button>
        </form>
      </div>
    )
  }

  // ---------- ログイン / 新規登録 ----------
  return (
    <div className={styles.card}>
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${isLogin ? styles.tabActive : ''}`}
          onClick={() => changeView('login')}
        >
          ログイン
        </button>
        <button
          type="button"
          className={`${styles.tab} ${isSignup ? styles.tabActive : ''}`}
          onClick={() => changeView('signup')}
        >
          新規登録
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {isSignup && (
          <>
            <label className={styles.label} htmlFor="name">
              表示名
            </label>
            <input
              id="name"
              className={styles.input}
              type="text"
              placeholder="例: CloudTyper"
              maxLength={30}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="nickname"
            />
          </>
        )}

        <label className={styles.label} htmlFor="email">
          メールアドレス
        </label>
        <input
          id="email"
          className={styles.input}
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        {passwordField}

        {isLogin && (
          <button type="button" onClick={() => changeView('forgot')} style={linkStyle}>
            パスワードをお忘れの方
          </button>
        )}

        {messages}

        <button type="submit" className={styles.submit} disabled={loading}>
          {loading ? '処理中...' : isLogin ? 'ログイン' : 'アカウント作成'}
        </button>

        <div className={styles.or}>
          <span>または</span>
        </div>

        <button type="button" className={styles.google} onClick={() => run(onGoogle)} disabled={loading}>
          <svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
          </svg>
          Googleで{isLogin ? 'ログイン' : '登録'}
        </button>
      </form>
    </div>
  )
}
