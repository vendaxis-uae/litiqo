'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Clock, Sparkles, Users, AlertTriangle, CheckCheck, ExternalLink } from 'lucide-react'
import { store } from '@/lib/store'
import { getUser, getNotifications as getSupaNotifs, markNotificationRead, markAllNotificationsRead } from '@/lib/supabase'
import { useToast } from '@/components/Toast'

// NOTIFICATIONS — The car's dashboard warning lights
// Just like your car has lights for low fuel, engine check, etc.
// This page shows ALL warnings and updates about your cases

export default function NotificationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [notifs, setNotifs] = useState(store.getNotifications())
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function loadNotifs() {
      try {
        const user = await getUser()
        if (user) {
          setUserId(user.id)
          const realNotifs = await getSupaNotifs(user.id)
          if (realNotifs) {
            setNotifs(realNotifs.map((n: any) => ({
              ...n,
              type: n.notification_type,
              caseId: n.case_id,
              caseTitle: n.cases?.title || '',
              createdAt: n.created_at,
            })))
          }
        }
      } catch {
        // Use demo data
      }
    }
    loadNotifs()
    return store.subscribe(() => setNotifs(store.getNotifications()))
  }, [])

  const typeConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
    deadline: { icon: Clock, color: 'var(--wn)', bg: 'var(--wnbg)', label: 'Deadline' },
    ai_suggestion: { icon: Sparkles, color: 'var(--ac)', bg: 'var(--acg)', label: 'AI Suggestion' },
    client_activity: { icon: Users, color: 'var(--ok)', bg: 'var(--okbg)', label: 'Client Activity' },
    escalation: { icon: AlertTriangle, color: 'var(--dn)', bg: 'var(--dnbg)', label: 'Escalation' },
  }

  const unreadCount = notifs.filter(n => !n.read).length

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Notifications</h1>
          <p style={{ color: 'var(--tx2)', fontSize: 14 }}>
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button className="btn-secondary" onClick={async () => {
            if (userId) { try { await markAllNotificationsRead(userId) } catch {} }
            store.markAllRead()
            setNotifs(prev => prev.map((n: any) => ({ ...n, read: true })))
            toast('All notifications marked as read')
          }}>
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {notifs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <Bell size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No notifications</p>
          <p style={{ color: 'var(--tx2)', fontSize: 14 }}>You&apos;ll be notified about deadlines, AI suggestions, and client activity</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifs.map((n, i) => {
            const tc = typeConfig[n.type] || typeConfig.deadline
            const Icon = tc.icon
            return (
              <div
                key={n.id}
                className="card animate-fade-in"
                style={{
                  padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16,
                  cursor: 'pointer', background: n.read ? 'var(--bgc)' : 'var(--glass2)',
                  animationDelay: `${i * 0.05}s`,
                }}
                onClick={async () => {
                  if (userId) { try { await markNotificationRead(n.id) } catch {} }
                  store.markRead(n.id)
                  setNotifs(prev => prev.map((notif: any) => notif.id === n.id ? { ...notif, read: true } : notif))
                  if (n.caseId || n.case_id) router.push(`/cases/${n.caseId || n.case_id}`)
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: tc.bg, color: tc.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: tc.bg, color: tc.color }}>{tc.label}</span>
                    {!n.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ac)' }} />}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: n.read ? 400 : 600, marginBottom: 4, lineHeight: 1.5 }}>{n.message}</div>
                  <div style={{ fontSize: 12, color: 'var(--txm)', display: 'flex', gap: 12 }}>
                    <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                    {n.caseTitle && <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--ac)' }}><ExternalLink size={10} /> {n.caseTitle}</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
