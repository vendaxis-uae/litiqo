'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Briefcase, TrendingUp, Clock, CheckCircle, Bell, ArrowRight, Plus } from 'lucide-react'
import { store } from '@/lib/store'
import { getUser, getCases as getSupaCases, getNotifications as getSupaNotifs } from '@/lib/supabase'
import { useToast } from '@/components/Toast'

// DASHBOARD — The car's main instrument panel
// Shows stats (speedometer), recent cases (trip history), activity (warning lights)
//
// HOW DATA FLOWS:
// 1. Page loads → checks if real user exists (Supabase auth)
// 2. If real user → fetches cases from DATABASE (engine)
// 3. If demo mode → uses cases from STORE (demo data)
// 4. Either way, the dashboard displays the same way

export default function Dashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [cases, setCases] = useState<any[]>(store.getCases())
  const [notifs, setNotifs] = useState<any[]>(store.getNotifications())

  useEffect(() => {
    async function loadData() {
      try {
        const user = await getUser()
        if (user) {
          // REAL MODE: fetch from Supabase (the real engine)
          const realCases = await getSupaCases(user.id)
          if (realCases && realCases.length > 0) {
            setCases(realCases.map((c: any) => ({
              ...c,
              caseNumber: c.case_number,
              type: c.case_type,
              clientName: c.client_name,
              clientEmail: c.client_email,
              clientPhone: c.client_phone,
              opposingParty: c.opposing_party,
              courtName: c.court_name,
              judgeName: c.judge_name,
              filingDate: c.filing_date,
              hearingDate: c.hearing_date,
              createdAt: c.created_at,
              timeline: [],
              documents: [],
            })))
          }
          const realNotifs = await getSupaNotifs(user.id)
          if (realNotifs) setNotifs(realNotifs.map((n: any) => ({
            ...n,
            type: n.notification_type,
            caseId: n.case_id,
            caseTitle: n.cases?.title || '',
            createdAt: n.created_at,
          })))
        }
        // If no user, keep demo data from store
      } catch {
        // Supabase not connected yet — use demo data
      }
    }
    loadData()
    return store.subscribe(() => {
      setCases(store.getCases())
      setNotifs(store.getNotifications())
    })
  }, [])

  const stats = [
    { label: 'Total Cases', value: cases.length, icon: Briefcase, color: 'var(--ac)', bg: 'var(--acg)' },
    { label: 'Active Cases', value: cases.filter((c: any) => c.status === 'Active' || c.status === 'In Progress').length, icon: TrendingUp, color: 'var(--ok)', bg: 'var(--okbg)' },
    { label: 'Pending', value: cases.filter((c: any) => c.status === 'New' || c.status === 'Filing Ready').length, icon: Clock, color: 'var(--wn)', bg: 'var(--wnbg)' },
    { label: 'Closed', value: cases.filter((c: any) => c.status === 'Closed').length, icon: CheckCircle, color: 'var(--ok)', bg: 'var(--okbg)' },
  ]

  const statusColor = (status: string) => {
    if (status === 'New') return 'badge-accent'
    if (status === 'In Progress' || status === 'Active') return 'badge-warn'
    if (status === 'Filing Ready') return 'badge-ok'
    if (status === 'Closed') return 'badge-danger'
    return 'badge-accent'
  }

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Dashboard</h1>
      <p style={{ color: 'var(--tx2)', fontSize: 14, marginBottom: 28 }}>Welcome back! Here&apos;s an overview of your practice.</p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {stats.map((s, i) => (
          <div key={i} className="card" style={{ animationDelay: `${i * 0.1}s` }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <s.icon size={18} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--tx2)', fontWeight: 500, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
        {/* Recent Cases */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Recent Cases</h2>
            <button onClick={() => router.push('/cases')} style={{ fontSize: 13, color: 'var(--ac)', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={14} />
            </button>
          </div>
          {cases.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--tx2)' }}>
              <Briefcase size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p style={{ marginBottom: 16 }}>No cases yet</p>
              <button className="btn-primary" onClick={() => router.push('/cases/new')}>
                <Plus size={14} /> Create Case
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cases.slice(0, 5).map((c: any) => (
                <div
                  key={c.id}
                  onClick={() => router.push(`/cases/${c.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                    border: '1px solid var(--bd)', transition: 'all 0.25s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--bdl)'; e.currentTarget.style.background = 'var(--glass2)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bd)'; e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--acg)', color: 'var(--ac)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                    {(c.type || c.case_type || 'C')[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--tx2)' }}>{c.type || c.case_type} &middot; {c.jurisdiction}</div>
                  </div>
                  <span className={`badge ${statusColor(c.status)}`}>{c.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Recent Activity</h2>
            <button onClick={() => router.push('/notifications')} style={{ fontSize: 13, color: 'var(--ac)', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {notifs.slice(0, 5).map((n: any) => {
              const typeColors: Record<string, { bg: string; color: string }> = {
                deadline: { bg: 'var(--wnbg)', color: 'var(--wn)' },
                ai_suggestion: { bg: 'var(--acg)', color: 'var(--ac)' },
                client_activity: { bg: 'var(--okbg)', color: 'var(--ok)' },
                escalation: { bg: 'var(--dnbg)', color: 'var(--dn)' },
              }
              const tc = typeColors[n.type] || typeColors.deadline
              return (
                <div
                  key={n.id}
                  onClick={() => { store.markRead(n.id); if (n.caseId) router.push(`/cases/${n.caseId}`) }}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                    background: n.read ? 'transparent' : 'var(--glass2)',
                    border: '1px solid var(--bd)', transition: 'all 0.25s',
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.read ? 'transparent' : tc.color, flexShrink: 0, marginTop: 6 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: n.read ? 400 : 600, lineHeight: 1.5 }}>{n.message}</div>
                    <div style={{ fontSize: 11, color: 'var(--txm)', marginTop: 4 }}>
                      {new Date(n.createdAt || n.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
