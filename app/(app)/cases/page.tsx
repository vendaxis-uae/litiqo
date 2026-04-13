'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Briefcase, Plus, Search, Filter } from 'lucide-react'
import { store } from '@/lib/store'
import { getUser, getCases as getSupaCases } from '@/lib/supabase'

// CASES LIST — The filing cabinet drawer
// Shows all cases with search/filter (like alphabetical dividers in the cabinet)
//
// HOW DATA FLOWS:
// 1. Page loads → checks if real user exists
// 2. If real user → pulls cases from DATABASE (the real filing cabinet)
// 3. If demo mode → pulls cases from STORE (the showroom display)

export default function CasesPage() {
  const router = useRouter()
  const [cases, setCases] = useState<any[]>(store.getCases())
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterType, setFilterType] = useState('All')

  useEffect(() => {
    async function loadCases() {
      try {
        const user = await getUser()
        if (user) {
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
        }
      } catch {
        // Supabase not connected — use demo data
      }
    }
    loadCases()
    return store.subscribe(() => setCases(store.getCases()))
  }, [])

  const filtered = cases.filter((c: any) => {
    const caseNum = c.caseNumber || c.case_number || ''
    const caseType = c.type || c.case_type || ''
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !caseNum.toLowerCase().includes(search.toLowerCase())) return false
    if (filterStatus !== 'All' && c.status !== filterStatus) return false
    if (filterType !== 'All' && caseType !== filterType) return false
    return true
  })

  const statusColor = (status: string) => {
    if (status === 'New') return 'badge-accent'
    if (status === 'In Progress' || status === 'Active') return 'badge-warn'
    if (status === 'Filing Ready') return 'badge-ok'
    return 'badge-accent'
  }

  const priorityColor = (p: string) => {
    if (p === 'Urgent') return 'badge-danger'
    if (p === 'High') return 'badge-warn'
    return 'badge-accent'
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Cases</h1>
          <p style={{ color: 'var(--tx2)', fontSize: 14 }}>Manage all your legal cases</p>
        </div>
        <button className="btn-primary" onClick={() => router.push('/cases/new')}>
          <Plus size={16} /> New Case
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 10, border: '1px solid var(--bd)', background: 'var(--bgc)' }}>
          <Search size={16} style={{ color: 'var(--txm)' }} />
          <input
            type="text"
            placeholder="Search cases..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', background: 'none', outline: 'none', color: 'var(--tx)', fontSize: 13, fontFamily: 'inherit', width: '100%' }}
          />
        </div>
        <select className="select-field" style={{ width: 160 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option>All</option>
          <option>New</option>
          <option>Active</option>
          <option>In Progress</option>
          <option>Filing Ready</option>
          <option>Closed</option>
        </select>
        <select className="select-field" style={{ width: 180 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option>All</option>
          <option>Debt Recovery</option>
          <option>Contract Dispute</option>
          <option>Employment</option>
          <option>Property Dispute</option>
          <option>Insurance Claim</option>
          <option>Commercial Dispute</option>
        </select>
      </div>

      {/* Cases List */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <Briefcase size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No cases found</p>
          <p style={{ color: 'var(--tx2)', fontSize: 14, marginBottom: 20 }}>Create your first case to get started</p>
          <button className="btn-primary" onClick={() => router.push('/cases/new')}>
            <Plus size={14} /> Create Case
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((c, i) => (
            <div
              key={c.id}
              className="card"
              onClick={() => router.push(`/cases/${c.id}`)}
              style={{ cursor: 'pointer', padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 16, animationDelay: `${i * 0.05}s` }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--acg)', color: 'var(--ac)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                {(c.type || 'C')[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>{c.title}</div>
                <div style={{ fontSize: 12, color: 'var(--tx2)', display: 'flex', gap: 16 }}>
                  <span>{c.caseNumber}</span>
                  <span>{c.type}</span>
                  <span>{c.jurisdiction}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span className={`badge ${statusColor(c.status)}`} style={{ marginBottom: 4, display: 'inline-block' }}>{c.status}</span>
                <div style={{ fontSize: 12, color: 'var(--tx2)', marginTop: 4 }}>
                  {c.amount > 0 ? `$${c.amount.toLocaleString()}` : '—'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
