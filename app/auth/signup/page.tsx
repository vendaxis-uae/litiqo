'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firmName, setFirmName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      router.push('/dashboard')
    }, 800)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 460, padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span className="gradient-text" style={{ fontSize: 42, fontWeight: 900, letterSpacing: -2, display: 'inline-block' }}>Litiqo</span>
          <p style={{ color: 'var(--tx2)', fontSize: 15, marginTop: 8 }}>Start your free trial</p>
        </div>

        <div style={{ background: 'var(--bgc)', border: '1px solid var(--bd)', borderRadius: 20, padding: 40, boxShadow: 'var(--shadow)' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Create account</h2>
          <p style={{ fontSize: 14, color: 'var(--tx2)', marginBottom: 28 }}>Get started with Litiqo for free</p>

          <form onSubmit={handleSignup}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--tx2)' }}>Full Name</label>
              <input className="input-field" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--tx2)' }}>Firm Name</label>
              <input className="input-field" placeholder="Your law firm" value={firmName} onChange={e => setFirmName(e.target.value)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--tx2)' }}>Email</label>
              <input className="input-field" type="email" placeholder="you@lawfirm.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--tx2)' }}>Password</label>
              <input className="input-field" type="password" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} />
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
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--tx2)' }}>
          Already have an account?{' '}
          <a onClick={() => router.push('/auth/login')} style={{ color: 'var(--ac)', fontWeight: 600, textDecoration: 'none', cursor: 'pointer' }}>Sign in</a>
        </p>
      </div>
    </div>
  )
}
