'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, FileText, Clock, Users, Download, Mail, MessageCircle, Link2, ExternalLink } from 'lucide-react'
import { store, type Case } from '@/lib/store'
import { useToast } from '@/components/Toast'

export default function CaseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [c, setCase] = useState<Case | undefined>(store.getCase(params.id as string))
  const [activeTab, setActiveTab] = useState('overview')
  const [showDocModal, setShowDocModal] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<any>(null)

  useEffect(() => {
    return store.subscribe(() => setCase(store.getCase(params.id as string)))
  }, [params.id])

  if (!c) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <p style={{ fontSize: 16, color: 'var(--tx2)' }}>Case not found</p>
      <button className="btn-primary" onClick={() => router.push('/cases')} style={{ marginTop: 16 }}>Back to Cases</button>
    </div>
  )

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'documents', label: 'Documents' },
  ]

  const statusColor = (status: string) => {
    if (status === 'New') return 'badge-accent'
    if (status === 'In Progress' || status === 'Active') return 'badge-warn'
    if (status === 'Filing Ready') return 'badge-ok'
    return 'badge-accent'
  }

  const timelineIcon = (type: string) => {
    const colors: Record<string, string> = { filing: 'var(--ac)', hearing: 'var(--wn)', document: 'var(--ok)', communication: 'var(--ac2)', milestone: 'var(--ac)', note: 'var(--txm)' }
    return colors[type] || 'var(--txm)'
  }

  return (
    <div className="animate-fade-in">
      <button onClick={() => router.push('/cases')} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--tx2)', fontSize: 13, fontWeight: 500, cursor: 'pointer', background: 'none', border: 'none', marginBottom: 16 }}>
        <ArrowLeft size={16} /> Back to Cases
      </button>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800 }}>{c.title}</h1>
            <span className={`badge ${statusColor(c.status)}`}>{c.status}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--tx2)', display: 'flex', gap: 16 }}>
            <span>{c.caseNumber}</span>
            <span>{c.type}</span>
            <span>{c.jurisdiction}</span>
            {c.amount > 0 && <span style={{ fontWeight: 600 }}>${c.amount.toLocaleString()}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary" onClick={() => toast('Export started', 'info')}><Download size={14} /> Export</button>
          <button className="btn-primary" onClick={() => router.push('/documents')}>Generate Document</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--bd)', paddingBottom: 0 }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '10px 20px', fontSize: 14, fontWeight: activeTab === t.id ? 600 : 500,
              color: activeTab === t.id ? 'var(--ac)' : 'var(--tx2)',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: `2px solid ${activeTab === t.id ? 'var(--ac)' : 'transparent'}`,
              transition: 'all 0.25s', fontFamily: 'inherit',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Case Details</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              {[
                ['Type', c.type], ['Jurisdiction', c.jurisdiction], ['Priority', c.priority],
                ['Filing Date', c.filingDate || 'Not set'], ['Hearing Date', c.hearingDate || 'Not set'],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--bd)' }}>
                  <span style={{ fontSize: 13, color: 'var(--tx2)' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Parties</h3>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--tx2)', marginBottom: 4 }}>Client</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{c.clientName || '—'}</div>
              <div style={{ fontSize: 12, color: 'var(--tx2)' }}>{c.clientEmail}</div>
            </div>
            <div style={{ borderTop: '1px solid var(--bd)', paddingTop: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--tx2)', marginBottom: 4 }}>Opposing Party</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{c.opposingParty || '—'}</div>
            </div>
          </div>
          {c.description && (
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Description</h3>
              <p style={{ fontSize: 14, color: 'var(--tx2)', lineHeight: 1.7 }}>{c.description}</p>
            </div>
          )}
        </div>
      )}

      {/* TIMELINE TAB */}
      {activeTab === 'timeline' && (
        <div style={{ maxWidth: 700 }}>
          {c.timeline.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <Clock size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
              <p style={{ color: 'var(--tx2)' }}>No timeline events yet</p>
            </div>
          ) : (
            <div style={{ position: 'relative', paddingLeft: 28 }}>
              <div style={{ position: 'absolute', left: 8, top: 0, bottom: 0, width: 2, background: 'var(--bd)' }} />
              {c.timeline.map((ev, i) => (
                <div key={ev.id} className="animate-fade-in" style={{ marginBottom: 20, position: 'relative', animationDelay: `${i * 0.08}s` }}>
                  <div style={{ position: 'absolute', left: -22, top: 4, width: 12, height: 12, borderRadius: '50%', background: timelineIcon(ev.type), border: '2px solid var(--bgc)' }} />
                  <div className="card" style={{ padding: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{ev.title}</span>
                      <span style={{ fontSize: 12, color: 'var(--txm)' }}>{ev.date}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--tx2)', lineHeight: 1.5 }}>{ev.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DOCUMENTS TAB */}
      {activeTab === 'documents' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 14, color: 'var(--tx2)' }}>{c.documents.length} documents</span>
            <button className="btn-primary" onClick={() => router.push('/documents')}><FileText size={14} /> Generate New</button>
          </div>
          {c.documents.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <FileText size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
              <p style={{ color: 'var(--tx2)' }}>No documents yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {c.documents.map(d => (
                <div key={d.id} className="card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
                  onClick={() => { setSelectedDoc(d); setShowDocModal(true) }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--acg)', color: 'var(--ac)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{d.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--tx2)' }}>{d.type} &middot; {d.createdAt}</div>
                  </div>
                  <span className={`badge ${d.status === 'Final' ? 'badge-ok' : 'badge-warn'}`}>{d.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Document Modal */}
      {showDocModal && selectedDoc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9990, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setShowDocModal(false)}
        >
          <div className="animate-slide-up" style={{ background: 'var(--bgc)', border: '1px solid var(--bd)', borderRadius: 20, width: 560, maxWidth: '90vw', boxShadow: 'var(--shadow)', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px 16px', borderBottom: '1px solid var(--bd)' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>{selectedDoc.name}</h3>
              <button onClick={() => setShowDocModal(false)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--bd)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tx2)' }}>✕</button>
            </div>
            <div style={{ padding: '24px 28px' }}>
              <div style={{ background: 'var(--bg2)', borderRadius: 12, padding: 24, minHeight: 200, marginBottom: 20, fontSize: 13, color: 'var(--tx2)', lineHeight: 1.8 }}>
                <p>[Document preview would appear here]</p>
                <p style={{ marginTop: 8 }}>Type: {selectedDoc.type}</p>
                <p>Status: {selectedDoc.status}</p>
                <p>Created: {selectedDoc.createdAt}</p>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx2)', marginBottom: 10 }}>Share</div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => toast('Email share opened', 'info')}>
                  <Mail size={16} /> Email
                </button>
                <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center', color: '#25d366' }} onClick={() => toast('WhatsApp share opened', 'info')}>
                  <MessageCircle size={16} /> WhatsApp
                </button>
                <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { navigator.clipboard.writeText(`https://litiqo.com/doc/${selectedDoc.id}`); toast('Link copied!') }}>
                  <Link2 size={16} /> Copy Link
                </button>
              </div>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => toast('Download started')}>
                <Download size={14} /> Download Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
