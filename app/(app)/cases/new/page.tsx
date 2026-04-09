'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Mic, Upload, Mail, Zap, ArrowLeft, Plus } from 'lucide-react'
import { store } from '@/lib/store'
import { useToast } from '@/components/Toast'

const intakeTabs = [
  { id: 'form', label: 'Form', icon: FileText },
  { id: 'paste', label: 'Paste Notes', icon: FileText },
  { id: 'voice', label: 'Voice Note', icon: Mic },
  { id: 'upload', label: 'Upload Docs', icon: Upload },
  { id: 'email', label: 'Email Forward', icon: Mail },
  { id: 'template', label: 'Quick Template', icon: Zap },
]

const caseTypes = ['Debt Recovery', 'Contract Dispute', 'Employment', 'Property Dispute', 'Insurance Claim', 'Commercial Dispute']
const jurisdictions = ['UAE (DIFC)', 'UAE (MOHRE)', 'UK (County Court)', 'UK (High Court)', 'US (Federal)', 'US (State)', 'Saudi Arabia', 'India']
const priorities = ['Low', 'Medium', 'High', 'Urgent']

export default function NewCasePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [tab, setTab] = useState('form')
  const [recording, setRecording] = useState(false)
  const [form, setForm] = useState({
    title: '', type: 'Debt Recovery', jurisdiction: 'UAE (DIFC)', priority: 'Medium',
    clientName: '', clientEmail: '', clientPhone: '', opposingParty: '',
    courtName: '', judgeName: '', filingDate: '', hearingDate: '',
    amount: '', description: '',
  })
  const [pasteText, setPasteText] = useState('')

  const handleSubmit = () => {
    if (!form.title) { toast('Please enter a case title', 'error'); return }
    const newCase = store.addCase({
      ...form,
      amount: Number(form.amount) || 0,
      caseNumber: `CASE-${Date.now().toString().slice(-6)}`,
      status: 'New',
    } as any)
    toast('Case created successfully!')
    router.push(`/cases/${newCase.id}`)
  }

  const handlePasteSubmit = () => {
    if (!pasteText.trim()) { toast('Please paste some notes first', 'error'); return }
    const newCase = store.addCase({
      title: `Case from Notes — ${new Date().toLocaleDateString()}`,
      type: 'Contract Dispute',
      jurisdiction: 'UAE (DIFC)',
      priority: 'Medium',
      clientName: '', clientEmail: '', clientPhone: '', opposingParty: '',
      courtName: '', judgeName: '', filingDate: '', hearingDate: '',
      amount: 0,
      description: pasteText,
      caseNumber: `CASE-${Date.now().toString().slice(-6)}`,
      status: 'New',
    } as any)
    toast('Case created from notes!')
    router.push(`/cases/${newCase.id}`)
  }

  return (
    <div className="animate-fade-in">
      <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--tx2)', fontSize: 13, fontWeight: 500, cursor: 'pointer', background: 'none', border: 'none', marginBottom: 16 }}>
        <ArrowLeft size={16} /> Back
      </button>

      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Create New Case</h1>
      <p style={{ color: 'var(--tx2)', fontSize: 14, marginBottom: 28 }}>Choose how you want to start your case</p>

      {/* Intake Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 28, background: 'var(--bg2)', padding: 4, borderRadius: 12, width: 'fit-content' }}>
        {intakeTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 8, border: 'none',
              background: tab === t.id ? 'var(--bgc)' : 'transparent',
              color: tab === t.id ? 'var(--ac)' : 'var(--tx2)',
              fontWeight: tab === t.id ? 600 : 500,
              fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
              boxShadow: tab === t.id ? 'var(--shadow2)' : 'none',
              transition: 'all 0.25s',
            }}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* FORM TAB */}
      {tab === 'form' && (
        <div className="card" style={{ maxWidth: 800 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Case Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--tx2)' }}>Case Title *</label>
              <input className="input-field" placeholder="e.g., Smith vs Johnson" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--tx2)' }}>Case Type</label>
              <select className="select-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {caseTypes.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--tx2)' }}>Jurisdiction</label>
              <select className="select-field" value={form.jurisdiction} onChange={e => setForm({ ...form, jurisdiction: e.target.value })}>
                {jurisdictions.map(j => <option key={j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--tx2)' }}>Priority</label>
              <select className="select-field" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                {priorities.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--tx2)' }}>Claim Amount</label>
              <input className="input-field" type="number" placeholder="e.g., 100000" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            </div>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, paddingTop: 8, borderTop: '1px solid var(--bd)' }}>Client Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--tx2)' }}>Client Name</label>
              <input className="input-field" placeholder="Full name" value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--tx2)' }}>Client Email</label>
              <input className="input-field" type="email" placeholder="email@example.com" value={form.clientEmail} onChange={e => setForm({ ...form, clientEmail: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--tx2)' }}>Client Phone</label>
              <input className="input-field" placeholder="+971 50 000 0000" value={form.clientPhone} onChange={e => setForm({ ...form, clientPhone: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--tx2)' }}>Opposing Party</label>
              <input className="input-field" placeholder="Defendant name" value={form.opposingParty} onChange={e => setForm({ ...form, opposingParty: e.target.value })} />
            </div>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, paddingTop: 8, borderTop: '1px solid var(--bd)' }}>Court Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--tx2)' }}>Court Name</label>
              <input className="input-field" placeholder="e.g., DIFC Courts" value={form.courtName} onChange={e => setForm({ ...form, courtName: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--tx2)' }}>Judge Name</label>
              <input className="input-field" placeholder="Hon. Justice..." value={form.judgeName} onChange={e => setForm({ ...form, judgeName: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--tx2)' }}>Filing Date</label>
              <input className="input-field" type="date" value={form.filingDate} onChange={e => setForm({ ...form, filingDate: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--tx2)' }}>Next Hearing Date</label>
              <input className="input-field" type="date" value={form.hearingDate} onChange={e => setForm({ ...form, hearingDate: e.target.value })} />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--tx2)' }}>Description</label>
            <textarea className="input-field" rows={4} placeholder="Brief description of the case..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-secondary" onClick={() => router.back()}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit}><Plus size={14} /> Create Case</button>
          </div>
        </div>
      )}

      {/* PASTE NOTES TAB */}
      {tab === 'paste' && (
        <div className="card" style={{ maxWidth: 800 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Paste Your Notes</h2>
          <p style={{ color: 'var(--tx2)', fontSize: 14, marginBottom: 20 }}>Paste meeting notes, email threads, or any case-related text. AI will extract the key details.</p>
          <textarea
            className="input-field"
            rows={12}
            placeholder="Paste your case notes, meeting minutes, or email conversation here...&#10;&#10;Example:&#10;Met with client John Smith today regarding unpaid invoices from Apex Corp. Total amount owed is $187,000 for IT services delivered between Jan-Dec 2023. Client wants to file in DIFC Courts..."
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            style={{ resize: 'vertical', marginBottom: 20 }}
          />
          <button className="btn-primary" onClick={handlePasteSubmit}><Plus size={14} /> Create Case from Notes</button>
        </div>
      )}

      {/* VOICE NOTE TAB */}
      {tab === 'voice' && (
        <div className="card" style={{ maxWidth: 800, textAlign: 'center', padding: 60 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Voice Note</h2>
          <p style={{ color: 'var(--tx2)', fontSize: 14, marginBottom: 32 }}>Record a voice memo about your case. AI will transcribe and extract details.</p>
          <button
            onClick={() => { setRecording(!recording); if (!recording) toast('Recording started...', 'info'); else toast('Recording saved! AI will process shortly.') }}
            style={{
              width: 80, height: 80, borderRadius: '50%',
              background: recording ? 'var(--dn)' : 'var(--ac)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: recording ? '0 0 0 12px var(--dnbg)' : '0 0 0 12px var(--acg)',
              transition: 'all 0.3s',
            }}
          >
            <Mic size={28} color="#fff" />
          </button>
          {recording && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 16 }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{
                  width: 4, height: 24, borderRadius: 2, background: 'var(--ac)',
                  animation: `voicePulse 0.8s ease ${i * 0.15}s infinite`,
                }} />
              ))}
            </div>
          )}
          <p style={{ fontSize: 13, color: 'var(--txm)' }}>{recording ? 'Recording... Click to stop' : 'Click to start recording'}</p>
        </div>
      )}

      {/* UPLOAD TAB */}
      {tab === 'upload' && (
        <div className="card" style={{ maxWidth: 800 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Upload Documents</h2>
          <p style={{ color: 'var(--tx2)', fontSize: 14, marginBottom: 20 }}>Upload contracts, invoices, correspondence, or any case-related documents.</p>
          <div
            onClick={() => toast('File upload will be connected with Supabase storage', 'info')}
            style={{
              border: '2px dashed var(--bd)', borderRadius: 16, padding: 60,
              textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--ac)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--bd)'}
          >
            <Upload size={40} style={{ color: 'var(--txm)', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Drop files here or click to browse</p>
            <p style={{ fontSize: 13, color: 'var(--txm)' }}>PDF, DOCX, JPG, PNG up to 25MB each</p>
          </div>
        </div>
      )}

      {/* EMAIL FORWARD TAB */}
      {tab === 'email' && (
        <div className="card" style={{ maxWidth: 800, textAlign: 'center', padding: 48 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Email Forward</h2>
          <p style={{ color: 'var(--tx2)', fontSize: 14, marginBottom: 24 }}>Forward case-related emails to your unique Litiqo address. AI will create a case automatically.</p>
          <div style={{ background: 'var(--bg2)', borderRadius: 12, padding: '20px 24px', display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Mail size={20} style={{ color: 'var(--ac)' }} />
            <span style={{ fontSize: 16, fontWeight: 600, fontFamily: 'monospace' }}>intake-aadil@litiqo.com</span>
          </div>
          <br />
          <button className="btn-secondary" onClick={() => { navigator.clipboard.writeText('intake-aadil@litiqo.com'); toast('Email address copied!') }}>
            Copy Address
          </button>
        </div>
      )}

      {/* QUICK TEMPLATE TAB */}
      {tab === 'template' && (
        <div style={{ maxWidth: 800 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Quick Templates</h2>
          <p style={{ color: 'var(--tx2)', fontSize: 14, marginBottom: 20 }}>Start with a pre-filled template for common case types.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { name: 'Debt Recovery', desc: 'Claim for unpaid invoices or outstanding debts', icon: '💰' },
              { name: 'Contract Dispute', desc: 'Breach of contract or performance disagreements', icon: '📋' },
              { name: 'Employment Claim', desc: 'Wrongful termination, benefits, or workplace disputes', icon: '👤' },
              { name: 'Property Dispute', desc: 'Real estate, lease, or property ownership conflicts', icon: '🏠' },
              { name: 'Insurance Claim', desc: 'Denied or underpaid insurance claims', icon: '🛡' },
              { name: 'Commercial Dispute', desc: 'Business-to-business commercial conflicts', icon: '🏢' },
            ].map(t => (
              <div
                key={t.name}
                className="card"
                onClick={() => { setForm({ ...form, type: t.name.replace(' Claim', ''), title: '' }); setTab('form'); toast(`${t.name} template loaded`, 'info') }}
                style={{ cursor: 'pointer', display: 'flex', gap: 16, alignItems: 'center' }}
              >
                <span style={{ fontSize: 32 }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--tx2)' }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
