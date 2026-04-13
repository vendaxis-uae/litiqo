'use client'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Briefcase, FileText, Users, Bell, Plus, Moon, Sun, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { store } from '@/lib/store'
import { signOut } from '@/lib/supabase'
import { useUser } from '@/lib/UserContext'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Cases', href: '/cases', icon: Briefcase },
  { label: 'Documents', href: '/documents', icon: FileText },
  { label: 'Client Portal', href: '/clients', icon: Users },
  { label: 'Notifications', href: '/notifications', icon: Bell },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, demoMode } = useUser()
  const [dark, setDark] = useState(false)
  const [unread, setUnread] = useState(store.getUnreadCount())
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    return store.subscribe(() => setUnread(store.getUnreadCount()))
  }, [])

  // Get user display info
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || (demoMode ? 'Demo User' : 'User')
  const userInitial = userName.charAt(0).toUpperCase()
  const userSub = demoMode ? 'Demo Mode' : (user?.user_metadata?.firm_name || user?.email || 'Law Firm')

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      if (!demoMode) {
        await signOut()
      }
      sessionStorage.removeItem('litiqo_demo')
      router.replace('/auth/login')
    } catch {
      router.replace('/auth/login')
    }
  }

  const toggleDark = () => {
    setDark(!dark)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <aside style={{
      width: 260,
      background: 'var(--bg2)',
      borderRight: '1px solid var(--bd)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0',
      flexShrink: 0,
      height: '100vh',
    }}>
      {/* Logo */}
      <div style={{ padding: '0 24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="gradient-text" style={{ fontSize: 26, fontWeight: 900, letterSpacing: -1 }}>Litiqo</span>
        <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: 'var(--acg2)', color: 'var(--ac2)', letterSpacing: 0.5 }}>BETA</span>
      </div>

      {/* New Case Button */}
      <div style={{ padding: '0 16px', marginBottom: 24 }}>
        <button
          onClick={() => router.push('/cases/new')}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', borderRadius: 12 }}
        >
          <Plus size={16} /> New Case
        </button>
      </div>

      {/* Nav Label */}
      <div style={{ padding: '0 24px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--txm)', marginBottom: 8 }}>
        Main Menu
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1 }}>
        {navItems.map(item => {
          const active = pathname === item.href || pathname?.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <div
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 24px',
                fontSize: 13.5,
                fontWeight: active ? 600 : 500,
                color: active ? 'var(--ac)' : 'var(--tx2)',
                cursor: 'pointer',
                transition: 'all 0.25s',
                borderLeft: `3px solid ${active ? 'var(--ac)' : 'transparent'}`,
                background: active ? 'var(--acg)' : 'transparent',
              }}
            >
              <Icon size={18} style={{ opacity: active ? 1 : 0.7 }} />
              {item.label}
              {item.label === 'Notifications' && unread > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 10,
                  background: 'var(--dnbg)',
                  color: 'var(--dn)',
                }}>
                  {unread}
                </span>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--bd)', marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--grad1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 14,
          }}>
            {userInitial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
            <div style={{ fontSize: 11, color: 'var(--txm)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userSub}</div>
          </div>
          <button onClick={toggleDark} style={{
            width: 32, height: 32, borderRadius: 8,
            border: '1px solid var(--bd)', background: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--tx2)', transition: 'all 0.25s', flexShrink: 0,
          }}>
            {dark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '9px 16px', borderRadius: 10, border: '1px solid var(--bd)',
            background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
            color: 'var(--tx2)', fontFamily: 'inherit', transition: 'all 0.25s',
            opacity: loggingOut ? 0.6 : 1,
          }}
        >
          <LogOut size={14} />
          {loggingOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </aside>
  )
}
