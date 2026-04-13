'use client'
import { useState, useEffect } from 'react'
import { Users, Plus, X, Check, Clock, AlertCircle, Send } from 'lucide-react'
import { store } from '@/lib/store'
import { getUser, getCases as getSupaCases, getInvitations as getSupaInvites, inviteClient as supaInviteClient } from '@/lib/supabase'
import { useToast } from '@/components/Toast'

// CLIENT PORTAL — The passenger access pass
// Like giving someone a key card to enter specific rooms in a building
// The lawyer (building owner) decides which rooms each client can access

const permissionsList = [
  { id: 'view_case', label: 'View Case Details', desc: 'Access case information and status' },
  { id: 'view_docs', label: 'View Documents', desc: 'Access case documents' },
  { id: 'view_timeline', label: 'View Timeline', desc: 'See case progress and events' },
  { id: 'add_comments', label: 'Add Comments', desc: 'Leave comments on the case' },
  { id: 'upload_evidence', label: 'Upload Evidence', desc: 'Upload supporting documents' },
]

export default function ClientPortalPage() {
  const { toast } = useToast()
  const [cases, setCases] = useState(store.getCases())
  const [clients, setClients] = useState(store.getInvitedClients())
  const [showInvite, setShowInvite] = useState(false)
  const [inviteForm, setInviteForm] = useState({ caseId: '', name: '', email: '' })
  const [permissions, setPermissions] = useState(['view_case', 'view_docs'])
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const user = await getUser()
        if (user) {
          setUserId(user.id)
          const realCases = await getSupaCases(user.id)
          if (realCases && realCases.length > 0) {
            setCases(realCases.map((c: any) => ({
              ...c, caseNumber: c.case_number, type: c.case_type,
              clientName: c.client_name, timeline: [], documents: [],
            })))
          }
          const realInvites = await getSupaInvites(user.id)
          if (realInvites && realInvites.length > 0) {
            setClients(realInvites.map((inv: any) => ({
              id: inv.id,
              name: inv.client_name,
              email: inv.client_email,
              caseId: inv.case_id,
              caseTitle: inv.cases?.title || '',
              permissions: inv.permissions || [],
              status: inv.status,
            })))
          }
        }
      } catch {
        // Use demo data
      }
    }
    loadData()
    return store.subscribe(() => {
      setCases(store.getCases())
      setClients(store.getInvitedClients())
    })
  }, [])

  const togglePerm = (id: string) => {
    setPermissions(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  const handleInvite = async () => {
    if (!inviteForm.caseId) { toast('Please select a case', 'error'); return }
    if (!inviteForm.name || !inviteForm.email) { toast('Please fill in client details', 'error'); return }
    const permLabels = permissions.map(p => permissionsList.find(pl => pl.id === p)?.label || p)

    if (userId) {
      try {
        await supaInviteClient({
          case_id: inviteForm.caseId,
          invited_by: userId,
          client_name: inviteForm.name,
          client_email: inviteForm.email,
          permissions: permLabels,
        })
        toast('Invitation sent successfully!')
      } catch {
        // Fallback to demo store
        const c = store.getCase(inviteForm.caseId)
        store.inviteClient({
          name: inviteForm.name, email: inviteForm.email,
          caseId: inviteForm.caseId, caseTitle: c?.title || '',
          permissions: permLabels,
        })
        toast('Invitation sent (demo mode)')
      }
    } else {
      const c = store.getCase(inviteForm.caseId)
      store.inviteClient({
        name: inviteForm.name, email: inviteForm.email,
        caseId: inviteForm.caseId, caseTitle: c?.title || '',
        permissions: permLabels,
      })
      toast('Invitation sent successfully!')
    }
    setShowInvite(false)
    setInviteForm({ caseId: '', name: '', email: '' })
    setPermissions(['view_case', 'view_docs'])
  }

  const statusIcon = (status: string) => {
    if (status === 'Accepted') return { icon: Check, color: 'var(--ok)', bg: 'var(--okbg)' }
    if (status === 'Expired') return { icon: AlertCircle, color: 'var(--dn)', bg: 'var(--dnbg)' }
    return { icon: Clock, color: 'var(--wn)', bg: 'var(--wnbg)' }
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Client Portal</h1>
          <p style={{ color: 'var(--tx2)', fontSize: 14 }}>Manage client access and collaboration &middot; {clients.length} invitation{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowInvite(true)}>
          <Plus size={16} /> Invite Client
        </button>
      </div>

      {/* Client List */}
      {clients.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <Users size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No client invitations yet</p>
          <p style={{ color: 'var(--tx2)', fontSize: 14, marginBottom: 20 }}>Invite clients to give them access to their case</p>
          <button className="btn-primary" onClick={() => setShowInvite(true)}>
            <Plus size={14} /> Invite Client
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {clients.map((cl, i) => {
            const si = statusIcon(cl.status)
            return (
              <div key={cl.id} className="card" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 16, animationDelay: `${i * 0.05}s` }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--acg)', color: 'var(--ac)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                  {cl.name[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{cl.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--tx2)' }}>{cl.email} &middot; {cl.caseTitle}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                    {cl.permissions.map(p => (
                      <span key={p} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: 'var(--bg2)', color: 'var(--tx2)' }}>{p}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: si.bg, color: si.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <si.icon size={14} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: si.color }}>{cl.status}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9990, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setShowInvite(false)}
        >
          <div className="animate-slide-up" style={{ background: 'var(--bgc)', border: '1px solid var(--bd)', borderRadius: 20, width: 520, maxWidth: '90vw', boxShadow: 'var(--shadow)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px 16px', borderBottom: '1px solid var(--bd)' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Invite Client to Portal</h3>
              <button onClick={() => setShowInvite(false)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--bd)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tx2)' }}>
                <X size={14} />
              </button>
            </div>
            <div style={{ padding: '24px 28px' }}>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--tx2)' }}>Select Case</label>
              <select className="select-field" style={{ marginBottom: 16 }} value={inviteForm.caseId} onChange={e => setInviteForm({ ...inviteForm, caseId: e.target.value })}>
                <option value="">Choose a case</option>
                {cases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--tx2)' }}>Client Name</label>
                  <input className="input-field" placeholder="Full name" value={inviteForm.name} onChange={e => setInviteForm({ ...inviteForm, name: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--tx2)' }}>Client Email</label>
                  <input className="input-field" type="email" placeholder="email@example.com" value={inviteForm.email} onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })} />
                </div>
              </div>

              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx2)', marginBottom: 10 }}>Permissions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {permissionsList.map(p => (
                  <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--bd)', cursor: 'pointer', transition: 'all 0.25s', background: permissions.includes(p.id) ? 'var(--acg)' : 'transparent' }}>
                    <input
                      type="checkbox"
                      checked={permissions.includes(p.id)}
                      onChange={() => togglePerm(p.id)}
                      style={{ accentColor: 'var(--ac)', width: 16, height: 16 }}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{p.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--tx2)' }}>{p.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px 20px' }} onClick={handleInvite}>
                <Send size={14} /> Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
