'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signUp } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firmName, setFirmName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // This is like registering at the car dealership
      // Supabase creates a new user account + sends confirmation email
      // The trigger we set up in schema.sql auto-creates their profile
      await signUp(email, password, name)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 460, padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span className="gradient-text" style={{ fontSize: 42, fontWeight: 900, letterSpacing: -2, display: 'inline-block' }}>Litiqo</span>
          <p style={{ color: 'var(--tx2)', fontSize: 15, marginTop: 8 }}>Start your free trial</p>
        </div>

        <div style={{ background: 'var(--bgc)', border: '1px solid var(--bd)', borderRadius: 20, padding: 40, boxShadow: 'var(--shadow)' }}>
          {success ? (
            // After successful signup, show confirmation message
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--okbg)', color: 'var(--ok)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>✓</div>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Check your email</h2>
              <p style={{ fontSize: 14, color: 'var(--tx2)', lineHeight: 1.7, marginBottom: 24 }}>
                We sent a confirmation link to <strong>{email}</strong>.<br />
                Click it to activate your account, then sign in.
              </p>
              <button className="btn-primary" onClick={() => router.push('/auth/login')} style={{ width: '100%', justifyContent: 'center' }}>
                Go to Sign In
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Create account</h2>
              <p style={{ fontSize: 14, color: 'var(--tx2)', marginBottom: 28 }}>Get started with Litiqo for free</p>

              {error && (
                <div style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--dnbg)', color: 'var(--dn)', fontSize: 13, fontWeight: 500, marginBottom: 20, border: '1px solid var(--dnbd)' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSignup}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--tx2)' }}>Full Name</label>
                  <input className="input-field" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--tx2)' }}>Firm Name</label>
                  <input className="input-field" placeholder="Your law firm (optional)" value={firmName} onChange={e => setFirmName(e.target.value)} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--tx2)' }}>Email</label>
                  <input className="input-field" type="email" placeholder="you@lawfirm.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--tx2)' }}>Password</label>
                  <input className="input-field" type="password" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '14px 20px', opacity: loading ? 0.7 : 1 }}
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
            </>
          )}
        </div>

        {!success && (
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--tx2)' }}>
            Already have an account?{' '}
            <a onClick={() => router.push('/auth/login')} style={{ color: 'var(--ac)', fontWeight: 600, textDecoration: 'none', cursor: 'pointer' }}>Sign in</a>
          </p>
        )}
      </div>
    </div>
  )
}
