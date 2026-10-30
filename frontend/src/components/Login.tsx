import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, Eye, EyeOff, KeyRound, LoaderCircle, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { API, readStorage, writeStorage } from '../lib'
import { Brand, IconButton, LanguageButton, ThemeButton } from './ui'
import { useI18n } from '../i18n'

interface LoginProps { onAuthenticated: (key: string, remember: boolean) => void; dark: boolean; onToggleTheme: () => void; siteName: string }
export default function Login({ onAuthenticated, dark, onToggleTheme, siteName }: LoginProps) {
  const { t } = useI18n()
  const [key, setKey] = useState(() => readStorage('localStorage', 'tempmail-remember-key'))
  const [remember, setRemember] = useState(() => Boolean(readStorage('localStorage', 'tempmail-remember-key')))
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!key.trim()) { setError(t('login.required')); return }
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API}/auth/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: key.trim() }) })
      if (!response.ok) throw new Error(response.status === 401 ? t('login.invalid') : t('login.unavailable'))
      writeStorage('localStorage', 'tempmail-remember-key', remember ? key.trim() : null)
      onAuthenticated(key.trim(), remember)
    } catch (error) { setError(error instanceof TypeError ? t('login.network') : error.message) }
    finally { setLoading(false) }
  }

  return <main className="login-layout">
    <section className="login-main">
      <header className="login-header"><Brand name={siteName} /><span><LanguageButton /><ThemeButton dark={dark} onToggle={onToggleTheme} /></span></header>
      <div className="login-form-wrap">
        <div className="login-lock"><LockKeyhole size={25} strokeWidth={1.5} /></div>
        <div className="eyebrow">YOUR PRIVATE MAILROOM</div>
        <h1>{t('login.welcome')}</h1>
        <p className="login-description">{t('login.description')}<br />{t('login.description2')}</p>
        <form onSubmit={submit}>
          <label className="field-label" htmlFor="access-key">{t('login.accessKey')}</label>
          <div className="input-wrap"><KeyRound size={17} /><input id="access-key" type={visible ? 'text' : 'password'} value={key} onChange={(event) => { setKey(event.target.value); setError('') }} placeholder={t('login.placeholder')} autoComplete={remember ? 'current-password' : 'off'} required aria-invalid={!!error} aria-describedby={error ? 'login-error' : undefined} /><IconButton label={visible ? '隐藏密钥' : '显示密钥'} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</IconButton></div>
          <label className="remember-option"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /><span className="remember-check" aria-hidden="true">✓</span><span>{t('login.remember')}</span><small>{t('login.rememberHint')}</small></label>
          {error && <p id="login-error" className="field-error" role="alert">{error}</p>}
          <button className="button button-primary login-submit" disabled={loading}>{loading ? <LoaderCircle size={17} className="spin" /> : <>{t('login.enter')}<ArrowRight size={17} /></>}</button>
        </form>
        <div className="login-note"><ShieldCheck size={15} />{t('login.private')}</div>
      </div>
      <footer className="login-footer"><span>{siteName}</span><span>Simple receiving, zero noise.</span></footer>
    </section>
    <section className="login-showcase" aria-label="产品介绍">
      <div className="showcase-top"><span className="small-caps">LESS NOISE. MORE FOCUS.</span><span className="showcase-pill"><span className="status-dot" />为简单而设计</span></div>
      <div className="mail-art" aria-hidden="true"><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-sheet sheet-back" /><div className="art-sheet sheet-middle" /><div className="art-envelope"><div className="art-envelope-fold" /><span className="art-seal"><Mail size={28} strokeWidth={1.3} /></span></div><span className="art-spark spark-one" /><span className="art-spark spark-two" /></div>
      <div className="showcase-copy"><span className="eyebrow">A LITTLE SPACE FOR YOUR MAIL</span><h2>{t('login.product')}<br /><span>{t('login.product2')}</span></h2><p>{t('login.productDesc')}<br />{t('login.productDesc2')}</p></div>
      <div className="showcase-bottom"><span>01 / 收件，原来可以很简单</span><span className="showcase-dashes"><i /><i /><i /></span></div>
    </section>
  </main>
}
