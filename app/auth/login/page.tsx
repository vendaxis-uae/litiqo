'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Demo: skip auth, go straight to app
    setTimeout(() => {
      router.push('/dashboard')
    }, 800)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 460, padding: '0 24px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span className="gradient-text" style={{ fontSize: 42, fontWeight: 900, letterSpacing: -2, display: 'inline-block' }}>Litiqo</span>
          <p style={{ color: 'var(--tx2)', fontSize: 15, marginTop: 8 }}>AI-Powered Legal Case Intelligence</p>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--bgc)', border: '1px solid var(--bd)', borderRadius: 20, padding: 40, boxShadow: 'var(--shadow)' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Welcome back</h2>
          <p style={{ fontSize: 14, color: 'var(--tx2)', marginBottom: 28 }}>Sign in to your account</p>

          {/* Social Login */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <button
              onClick={() => { setLoading(true); setTimeout(() => router.push('/dashboard'), 800) }}
              style={{
                flex: 1, padding: 12, borderRadius: 12, border: '1px solid var(--bd)',
                background: 'var(--bgc)', cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: 'var(--tx)',
                fontFamily: 'inherit', transition: 'all 0.25s',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button
              onClick={() => { setLoading(true); setTimeout(() => router.push('/dashboard'), 800) }}
              style={{
                flex: 1, padding: 12, borderRadius: 12, border: '1px solid var(--bd)',
                background: 'var(--bgc)', cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: 'var(--tx)',
                fontFamily: 'inherit', transition: 'all 0.25s',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              GitHub
            </button>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '24px 0', color: 'var(--txm)', fontSize: 12, fontWeight: 500 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--bd)' }} />
            or continue with email
            <div style={{ flex: 1, height: 1, background: 'var(--bd)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--tx2)' }}>Email</label>
              <input className="input-field" type="email" placeholder="you@lawfirm.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--tx2)' }}>Password</label>
              <input className="input-field" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px 20px', opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--tx2)' }}>
          Don&apos;t have an account?{' '}
          <a onClick={() => router.push('/auth/signup')} style={{ color: 'var(--ac)', fontWeight: 600, textDecoration: 'none', cursor: 'pointer' }}>Sign up</a>
        </p>
        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--txm)', marginTop: 20, lineHeight: 1.6 }}>
          By continuing, you agree to Litiqo&apos;s Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
