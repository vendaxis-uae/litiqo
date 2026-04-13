'use client'
import { Search, Bell, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { store } from '@/lib/store'
import { useToast } from './Toast'
import { useUser } from '@/lib/UserContext'

export default function Topbar() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, demoMode } = useUser()
  const [unread, setUnread] = useState(store.getUnreadCount())

  useEffect(() => {
    return store.subscribe(() => setUnread(store.getUnreadCount()))
  }, [])

  const userInitial = user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || (demoMode ? 'D' : 'U')

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '14px 32px',
      gap: 12,
      borderBottom: '1px solid var(--bd)',
      background: 'var(--bgc)',
      flexShrink: 0,
    }}>
      {/* Search */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px',
        borderRadius: 10,
        border: '1px solid var(--bd)',
        background: 'var(--glass2)',
        marginRight: 'auto',
        minWidth: 240,
      }}>
        <Search size={16} style={{ color: 'var(--txm)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search cases, documents..."
          style={{
            border: 'none', background: 'none', outline: 'none',
            color: 'var(--tx)', fontSize: 13, fontFamily: 'inherit', width: '100%',
          }}
        />
      </div>

      {/* Notifications */}
      <button
        onClick={() => router.push('/notifications')}
        style={{
          width: 36, height: 36, borderRadius: 10,
          border: '1px solid var(--bd)', background: 'var(--bgc)',
          color: 'var(--tx2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', position: 'relative', transition: 'all 0.25s',
        }}
      >
        <Bell size={16} />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 6, right: 6, width: 8, height: 8,
            borderRadius: '50%', background: 'var(--dn)', border: '2px solid var(--bgc)',
          }} />
        )}
      </button>

      {/* Settings */}
      <button
        onClick={() => toast('Settings coming soon', 'info')}
        style={{
          width: 36, height: 36, borderRadius: 10,
          border: '1px solid var(--bd)', background: 'var(--bgc)',
          color: 'var(--tx2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.25s',
        }}
      >
        <Settings size={16} />
      </button>

      {/* User avatar */}
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: 'var(--grad1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
      }}>
        {userInitial}
      </div>
    </div>
  )
}
