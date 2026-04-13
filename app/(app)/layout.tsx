'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { ToastProvider } from '@/components/Toast'
import { getUser } from '@/lib/supabase'
import { UserContext } from '@/lib/UserContext'

// This layout wraps ALL app pages (dashboard, cases, documents, etc.)
// Think of it as the car's SECURITY GATE
// Before showing anything, it checks: is someone in the driver's seat?
// If no user is logged in AND not in demo mode â redirects to login page
// If user IS logged in â shows the app with sidebar + topbar

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [demoMode, setDemoMode] = useState(false)

  useEffect(() => {
    // Check if user opted into demo mode (set by login page "Try Demo" button)
    const isDemo = sessionStorage.getItem('litiqo_demo') === 'true'

    async function checkAuth() {
      try {
        const u = await getUser()
        if (u) {
          setUser(u)
          // Clear demo flag if real user is logged in
          sessionStorage.removeItem('litiqo_demo')
        } else if (isDemo) {
          // No real user, but they clicked "Try Demo" â allow access
          setDemoMode(true)
        } else {
          // No user AND no demo flag â redirect to login
          router.replace('/auth/login')
          return
        }
      } catch {
        if (isDemo) {
          setDemoMode(true)
        } else {
          router.replace('/auth/login')
          return
        }
      }
      setLoading(false)
    }
    checkAuth()
  }, [router])

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <span className="gradient-text" style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1 }}>Litiqo</span>
          <p style={{ color: 'var(--tx2)', fontSize: 14, marginTop: 8 }}>Loading...</p>
        </div>
      </div>
    )
  }

  // User is either logged in OR in demo mode â show the app
  return (
    <UserContext.Provider value={{ user, demoMode }}>
      <ToastProvider>
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
          <Sidebar />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Topbar />
            {demoMode && (
              <div style={{
                padding: '8px 32px', background: 'var(--acg)', borderBottom: '1px solid var(--bd)',
                fontSize: 13, color: 'var(--ac)', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <span>You&apos;re in demo mode â data won&apos;t be saved. <a onClick={() => router.push('/auth/signup')} style={{ fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>Sign up</a> to save your work.</span>
              </div>
            )}
            <main style={{ flex: 1, overflow: 'auto', padding: 32 }}>
              {children}
            </main>
          </div>
        </div>
      </ToastProvider>
    </UserContext.Provider>
  )
}
