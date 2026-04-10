'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // This is like putting the key in the ignition and turning it
      // Supabase checks: does this email exist? Is the password correct?
      // If yes → gives back a session token (like the engine starting)
      // If no → throws an error (like the key not fitting)
      await signIn(email, password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Invalid email or password')
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    // Skip auth for demo — goes straight to dashboard with demo data
    router.push('/dashboard')
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

          {/* Error message */}
          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--dnbg)', color: 'var(--dn)', fontSize: 13, fontWeight: 500, marginBottom: 20, border: '1px solid var(--dnbd)' }}>
              {error}
            </div>
          )}

          {/* Demo access button */}
          <button
            onClick={handleDemoLogin}
            style={{
              width: '100%', padding: 12, borderRadius: 12, border: '1px solid var(--bd)',
              background: 'var(--bgc)', cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: 'var(--ac)',
              fontFamily: 'inherit', transition: 'all 0.25s', marginBottom: 16,
            }}
          >
            ✨ Try Demo (no login required)
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '20px 0', color: 'var(--txm)', fontSize: 12, fontWeight: 500 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--bd)' }} />
            or sign in with email
            <div style={{ flex: 1, height: 1, background: 'var(--bd)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--tx2)' }}>Email</label>
              <input className="input-field" type="email" placeholder="you@lawfirm.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--tx2)' }}>Password</label>
              <input className="input-field" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
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

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--tx2)' }}>
          Don&apos;t have an account?{' '}
          <a onClick={() => router.push('/auth/signup')} style={{ color: 'var(--ac)', fontWeight: 600, textDecoration: 'none', cursor: 'pointer' }}>Sign up</a>
        </p>
      </div>
    </div>
  )
}
