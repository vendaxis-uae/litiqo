'use client'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Briefcase, FileText, Users, Bell, Plus, Settings, Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'
import { store } from '@/lib/store'

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
  const [dark, setDark] = useState(false)
  const [unread, setUnread] = useState(store.getUnreadCount())

  useEffect(() => {
    return store.subscribe(() => setUnread(store.getUnreadCount()))
  }, [])

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--grad1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 14,
          }}>
            A
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)' }}>Aadil</div>
            <div style={{ fontSize: 11, color: 'var(--txm)' }}>Law Firm</div>
          </div>
          <button onClick={toggleDark} style={{
            width: 32, height: 32, borderRadius: 8,
            border: '1px solid var(--bd)', background: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--tx2)', transition: 'all 0.25s',
          }}>
            {dark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>
    </aside>
  )
}
