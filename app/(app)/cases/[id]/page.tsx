'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, FileText, Clock, Users, Download, Mail, MessageCircle, Link2, ExternalLink, Trash2 } from 'lucide-react'
import { store, type Case } from '@/lib/store'
import { getUser, getCase as getSupaCase, getTimeline as getSupaTimeline, getDocuments as getSupaDocs, updateCase as updateSupaCase, deleteCase as deleteSupaCase } from '@/lib/supabase'
import { useToast } from '@/components/Toast'

// CASE DETAIL â The individual case folder
// When you open a folder from the filing cabinet, this is what you see
// It has tabs: Overview (front page), Timeline (diary), Documents (attached papers)
//
// HOW DATA FLOWS:
// 1. Page loads â checks if real user exists
// 2. If real user â fetches THIS case + timeline + docs from DATABASE
// 3. If demo â uses demo STORE data

export default function CaseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [c, setCase] = useState<any>(store.getCase(params.id as string))
  const [activeTab, setActiveTab] = useState('overview')
  const [showDocModal, setShowDocModal] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<any>(null)
  const [timeline, setTimeline] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState<any>({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    async function loadCase() {
      try {
        const user = await getUser()
        if (user) {
          const realCase = await getSupaCase(params.id as string)
          if (realCase) {
            setCase({ ...realCase, caseNumber: realCase.case_number, type: realCase.case_type, clientName: realCase.client_name, clientEmail: realCase.client_email, clientPhone: realCase.client_phone, opposingParty: realCase.opposing_party, courtName: realCase.court_name, judgeName: realCase.judge_name, filingDate: realCase.filing_date, hearingDate: realCase.hearing_date, createdAt: realCase.created_at, timeline: [], documents: [] })
          }
          const tl = await getSupaTimeline(params.id as string)
          if (tl) setTimeline(tl.map((e: any) => ({ ...e, date: e.event_date, type: e.event_type, createdAt: e.created_at })))
          const docs = await getSupaDocs(params.id as string)
          if (docs) setDocuments(docs.map((d: any) => ({ ...d, type: d.doc_type, createdAt: d.created_at, status: d.generated_by_ai ? 'AI Generated' : 'Draft' })))
        }
      } catch {}
    }
    loadCase()
    return store.subscribe(() => setCase(store.getCase(params.id as string)))
  }, [params.id])

  const handleEditClick = () => { setEditForm({ type: c.type, jurisdiction: c.jurisdiction, priority: c.priority, filingDate: c.filingDate, hearingDate: c.hearingDate, clientName: c.clientName, clientEmail: c.clientEmail, opposingParty: c.opposingParty, description: c.description }); setEditing(true) }
  const handleSaveEdit = async () => { setIsSaving(true); try { const user = await getUser(); if (user) { await updateSupaCase(params.id as string, { case_type: editForm.type, jurisdiction: editForm.jurisdiction, priority: editForm.priority, filing_date: editForm.filingDate, hearing_date: editForm.hearingDate, client_name: editForm.clientName, client_email: editForm.clientEmail, opposing_party: editForm.opposingParty, description: editForm.description }); const updatedCase = await getSupaCase(params.id as string); if (updatedCase) { setCase({ ...updatedCase, caseNumber: updatedCase.case_number, type: updatedCase.case_type, clientName: updatedCase.client_name, clientEmail: updatedCase.client_email, clientPhone: updatedCase.client_phone, opposingParty: updatedCase.opposing_party, courtName: updatedCase.court_name, judgeName: updatedCase.judge_name, filingDate: updatedCase.filing_date, hearingDate: updatedCase.hearing_date, createdAt: updatedCase.created_at, timeline: [], documents: [] }) }; setEditing(false); toast('Case updated successfully', 'success') } } catch (error) { toast('Failed to update case', 'error'); console.error(error) } finally { setIsSaving(false) } }
  const handleCancelEdit = () => { setEditing(false); setEditForm({}) }
  const handleStatusChange = async (newStatus: string) => { try { const user = await getUser(); if (user) { await updateSupaCase(params.id as string, { status: newStatus }); setCase({ ...c, status: newStatus }); toast('Status updated', 'success') } } catch (error) { toast('Failed to update status', 'error'); console.error(error) } }
  const handleDeleteCase = async () => { setIsDeleting(true); try { const user = await getUser(); if (user) { await deleteSupaCase(params.id as string); toast('Case deleted', 'success'); router.push('/cases') } } catch (error) { toast('Failed to delete case', 'error'); console.error(error) } finally { setIsDeleting(false); setShowDeleteConfirm(false) } }
: 'Documents' },
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
            <select
              value={c.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="select-field"
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: '6px 12px',
                cursor: 'pointer',
                background: 'var(--bg2)',
                color: 'var(--tx)',
                border: '1px solid var(--bd)',
                borderRadius: 6,
              }}
            >
              <option value="New">New</option>
              <option value="Active">Active</option>
              <option value="In Progress">In Progress</option>
              <option value="Filing Ready">Filing Ready</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div style={{ fontSize: 13, color: 'var(--tx2)', display: 'flex', gap: 16 }}>
            <span>{c.caseNumber}</span>
            <span>{c.type}</span>
            <span>{c.jurisdiction}</span>
            {c.amount > 0 && <span style={{ fontWeight: 600 }}>${c.amount.toLocaleString()}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!editing && (
            <>
              <button className="btn-secondary" onClick={handleEditClick}>Edit</button>
              <button className="btn-secondary" onClick={() => toast('Export started', 'info')}><Download size={14} /> Export</button>
              <button className="btn-primary" onClick={() => router.push('/documents')}>Generate Document</button>
              <button
                className="btn-secondary"
                onClick={() => setShowDeleteConfirm(true)}
                style={{ color: 'var(--err)', borderColor: 'var(--err)' }}
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
          {editing && (
            <>
              <button className="btn-secondary" onClick={handleCancelEdit}>Cancel</button>
              <button className="btn-primary" onClick={handleSaveEdit} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </>
          )}
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
              {editing ? (
                <>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--tx2)', display: 'block', marginBottom: 6 }}>Type</label>
                    <input
                      type="text"
                      className="input-field"
                      value={editForm.type || ''}
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--tx2)', display: 'block', marginBottom: 6 }}>Jurisdiction</label>
                    <input
                      type="text"
                      className="input-field"
                      value={editForm.jurisdiction || ''}
                      onChange={(e) => setEditForm({ ...editForm, jurisdiction: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--tx2)', display: 'block', marginBottom: 6 }}>Priority</label>
                    <select
                      className="select-field"
                      value={editForm.priority || ''}
                      onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                      style={{ width: '100%' }}
                    >
                      <option value="">Select priority</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--tx2)', display: 'block', marginBottom: 6 }}>Filing Date</label>
                    <input
                      type="date"
                      className="input-field"
                      value={editForm.filingDate || ''}
                      onChange={(e) => setEditForm({ ...editForm, filingDate: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--tx2)', display: 'block', marginBottom: 6 }}>Hearing Date</label>
                    <input
                      type="date"
                      className="input-field"
                      value={editForm.hearingDate || ''}
                      onChange={(e) => setEditForm({ ...editForm, hearingDate: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>
                </>
              ) : (
                <>
                  {[
                    ['Type', c.type], ['Jurisdiction', c.jurisdiction], ['Priority', c.priority],
                    ['Filing Date', c.filingDate || 'Not set'], ['Hearing Date', c.hearingDate || 'Not set'],
                  ].map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--bd)' }}>
                      <span style={{ fontSize: 13, color: 'var(--tx2)' }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{val}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Parties</h3>
            {editing ? (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, color: 'var(--tx2)', display: 'block', marginBottom: 4 }}>Client Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editForm.clientName || ''}
                    onChange={(e) => setEditForm({ ...editForm, clientName: e.target.value })}
                    style={{ width: '100%', marginBottom: 12 }}
                  />
                  <label style={{ fontSize: 12, color: 'var(--tx2)', display: 'block', marginBottom: 4 }}>Client Email</label>
                  <input
                    type="email"
                    className="input-field"
                    value={editForm.clientEmail || ''}
                    onChange={(e) => setEditForm({ ...editForm, clientEmail: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ borderTop: '1px solid var(--bd)', paddingTop: 16 }}>
                  <label style={{ fontSize: 12, color: 'var(--tx2)', display: 'block', marginBottom: 4 }}>Opposing Party</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editForm.opposingParty || ''}
                    onChange={(e) => setEditForm({ ...editForm, opposingParty: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </>
            ) : (
              <>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: 'var(--tx2)', marginBottom: 4 }}>Client</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{c.clientName || 'â'}</div>
                  <div style={{ fontSize: 12, color: 'var(--tx2)' }}>{c.clientEmail}</div>
                </div>
                <div style={{ borderTop: '1px solid var(--bd)', paddingTop: 16 }}>
                  <div style={{ fontSize: 12, color: 'var(--tx2)', marginBottom: 4 }}>Opposing Party</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{c.opposingParty || 'â'}</div>
                </div>
              </>
            )}
          </div>
          {c.description || editing ? (
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Description</h3>
              {editing ? (
                <textarea
                  className="input-field"
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  style={{ width: '100%', minHeight: 120, fontFamily: 'inherit', fontSize: 13, padding: 12, border: '1px solid var(--bd)', borderRadius: 8 }}
                />
              ) : (
                <p style={{ fontSize: 14, color: 'var(--tx2)', lineHeight: 1.7 }}>{c.description}</p>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* TIMELINE TAB */}
      {activeTab === 'timeline' && (
        <div style={{ maxWidth: 700 }}>
          {(timeline.length > 0 ? timeline : c.timeline || []).length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <Clock size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
              <p style={{ color: 'var(--tx2)' }}>No timeline events yet</p>
            </div>
          ) : (
            <div style={{ position: 'relative', paddingLeft: 28 }}>
              <div style={{ position: 'absolute', left: 8, top: 0, bottom: 0, width: 2, background: 'var(--bd)' }} />
              {(timeline.length > 0 ? timeline : c.timeline || []).map((ev: any, i: number) => (
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
            <span style={{ fontSize: 14, color: 'var(--tx2)' }}>{(documents.length > 0 ? documents : c.documents || []).length} documents</span>
            <button className="btn-primary" onClick={() => router.push('/documents')}><FileText size={14} /> Generate New</button>
          </div>
          {(documents.length > 0 ? documents : c.documents || []).length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <FileText size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
              <p style={{ color: 'var(--tx2)' }}>No documents yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(documents.length > 0 ? documents : c.documents || []).map((d: any) => (
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
              <button onClick={() => setShowDocModal(false)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--bd)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tx2)' }}>â</button>
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9995, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div className="animate-slide-up" style={{ background: 'var(--bgc)', border: '1px solid var(--bd)', borderRadius: 20, width: 420, maxWidth: '90vw', boxShadow: 'var(--shadow)', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '28px 28px' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Delete Case?</h3>
              <p style={{ fontSize: 14, color: 'var(--tx2)', marginBottom: 8 }}>
                Are you sure you want to delete <strong>{c.title}</strong>?
              </p>
              <p style={{ fontSize: 13, color: 'var(--txm)', marginBottom: 24 }}>
                This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  className="btn-secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  className="btn-secondary"
                  onClick={handleDeleteCase}
                  disabled={isDeleting}
                  style={{
                    flex: 1,
                    color: 'var(--err)',
                    borderColor: 'var(--err)',
                    background: 'rgba(239, 68, 68, 0.1)',
                  }}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Case'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
