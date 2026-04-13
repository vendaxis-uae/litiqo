'use client'
import { useState, useEffect } from 'react'
import { FileText, Sparkles, Check, Loader2, Copy, Download } from 'lucide-react'
import { store } from '@/lib/store'
import { getUser, getCases as getSupaCases, createDocument as createSupaDoc } from '@/lib/supabase'
import { useToast } from '@/components/Toast'

// DOCUMENT GENERATOR — The car's GPS navigation system
// Just like GPS plans your route, AI plans your legal document
// You tell it WHERE you want to go (case + document type)
// It generates the ROUTE (the document content)
//
// HOW DATA FLOWS:
// 1. User picks a case and document type
// 2. AI generates content (simulated for now — will connect to Claude API later)
// 3. Document gets saved to the case (either in DB or demo store)

const templates = [
  { name: 'Demand Letter', type: 'Letter', desc: 'Formal demand for payment or action' },
  { name: 'Motion to Dismiss', type: 'Motion', desc: 'Request to dismiss a case or claim' },
  { name: 'Chronological Statement of Facts', type: 'Brief', desc: 'Timeline-based factual narrative' },
  { name: 'Position Statement', type: 'Brief', desc: 'Legal arguments and position summary' },
  { name: 'Witness Statement', type: 'Affidavit', desc: 'Sworn statement from a witness' },
  { name: 'Settlement Agreement', type: 'Agreement', desc: 'Terms for dispute resolution' },
  { name: 'Notice of Claim', type: 'Complaint', desc: 'Formal notification of legal claim' },
  { name: 'Court Submission', type: 'Brief', desc: 'Formal document for court filing' },
]

const docTypes = ['Complaint', 'Answer', 'Motion', 'Brief', 'Contract', 'Agreement', 'Letter', 'Memorandum', 'Subpoena', 'Affidavit', 'Order']

const genSteps = [
  'Analyzing case details...',
  'Applying jurisdiction template...',
  'Generating draft document...',
  'Reviewing legal requirements...',
  'Finalizing and formatting...',
]

export default function DocumentsPage() {
  const { toast } = useToast()
  const [cases, setCases] = useState(store.getCases())
  const [selectedCase, setSelectedCase] = useState('')
  const [docName, setDocName] = useState('')
  const [docType, setDocType] = useState('')
  const [generating, setGenerating] = useState(false)
  const [genStep, setGenStep] = useState(0)
  const [genDone, setGenDone] = useState(false)
  const [preview, setPreview] = useState('')
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
              ...c,
              caseNumber: c.case_number,
              type: c.case_type,
              clientName: c.client_name,
              opposingParty: c.opposing_party,
              timeline: [],
              documents: [],
            })))
          }
        }
      } catch {
        // Use demo data
      }
    }
    loadData()
    return store.subscribe(() => setCases(store.getCases()))
  }, [])

  const handleTemplateClick = (t: typeof templates[0]) => {
    setDocName(t.name)
    setDocType(t.type)
    toast(`${t.name} template selected`, 'info')
  }

  const handleGenerate = () => {
    if (!selectedCase) { toast('Please select a case first', 'error'); return }
    if (!docName) { toast('Please enter a document name', 'error'); return }

    setGenerating(true)
    setGenStep(0)
    setGenDone(false)
    setPreview('')

    // Simulate step-by-step AI generation
    let step = 0
    const interval = setInterval(() => {
      step++
      setGenStep(step)
      if (step >= genSteps.length) {
        clearInterval(interval)
        setGenDone(true)
        setGenerating(false)
        // Find the case from our loaded cases (works for both Supabase and demo)
        const c = cases.find((cs: any) => cs.id === selectedCase) || store.getCase(selectedCase)
        const caseNum = c?.caseNumber || c?.case_number || 'N/A'
        const caseType = c?.type || c?.case_type || ''
        const clientName = c?.clientName || c?.client_name || '[Client]'
        const oppParty = c?.opposingParty || c?.opposing_party || '[Opposing Party]'
        setPreview(
          `${docName.toUpperCase()}\n\n` +
          `Case: ${c?.title || 'Unknown'}\n` +
          `Case Number: ${caseNum}\n` +
          `Jurisdiction: ${c?.jurisdiction || 'N/A'}\n` +
          `Date: ${new Date().toLocaleDateString()}\n\n` +
          `─────────────────────────────\n\n` +
          `TO WHOM IT MAY CONCERN\n\n` +
          `Re: ${c?.title}\n\n` +
          `We write on behalf of our client, ${clientName}, in connection with the above-referenced matter against ${oppParty}.\n\n` +
          `This ${docType || 'document'} is submitted pursuant to the laws and regulations of ${c?.jurisdiction || '[Jurisdiction]'}.\n\n` +
          `${c?.description || ''}\n\n` +
          `The total amount in dispute is ${c?.amount ? '$' + c.amount.toLocaleString() : '[Amount]'}.\n\n` +
          `We respectfully request that this matter be given due consideration.\n\n` +
          `Yours faithfully,\n` +
          `[Attorney Name]\n` +
          `Litiqo Legal Services`
        )
        // Add document to case — save to real DB if logged in, or demo store
        const c2 = cases.find((cs: any) => cs.id === selectedCase)
        if (c2 && userId) {
          createSupaDoc({
            case_id: c2.id,
            name: `${docName}.pdf`,
            doc_type: docType || 'Brief',
            content: '',
            generated_by_ai: true,
            created_by: userId,
          }).catch(() => { /* fallback to demo */ })
        } else if (c2) {
          store.addDocument(c2.id, { name: `${docName}.pdf`, type: docType || 'Brief', status: 'Draft' })
        }
        toast('Document generated successfully!')
      }
    }, 1200)
  }

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Document Generator</h1>
      <p style={{ color: 'var(--tx2)', fontSize: 14, marginBottom: 28 }}>Create professional legal documents with AI</p>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20 }}>
        {/* Left - Settings */}
        <div>
          <div className="card" style={{ marginBottom: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Document Settings</h3>

            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--tx2)' }}>Select Case</label>
            <select className="select-field" style={{ marginBottom: 14 }} value={selectedCase} onChange={e => setSelectedCase(e.target.value)}>
              <option value="">Choose a case</option>
              {cases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>

            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--tx2)' }}>Document Name</label>
            <input className="input-field" style={{ marginBottom: 14 }} placeholder="Enter document name" value={docName} onChange={e => setDocName(e.target.value)} />

            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--tx2)' }}>Document Type</label>
            <select className="select-field" style={{ marginBottom: 20 }} value={docType} onChange={e => setDocType(e.target.value)}>
              <option value="">Select type</option>
              {docTypes.map(t => <option key={t}>{t}</option>)}
            </select>

            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px 20px' }}
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? <Loader2 size={16} className="animate-spin-slow" /> : <Sparkles size={16} />}
              {generating ? 'Generating...' : 'Generate with AI'}
            </button>
          </div>

          {/* Generation Progress */}
          {(generating || genDone) && (
            <div className="card animate-fade-in">
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Generation Progress</h4>
              {genSteps.map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', opacity: i <= genStep ? 1 : 0.3, transition: 'opacity 0.3s' }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: i < genStep ? 'var(--okbg)' : i === genStep && generating ? 'var(--acg)' : 'var(--bg2)',
                    color: i < genStep ? 'var(--ok)' : i === genStep && generating ? 'var(--ac)' : 'var(--txm)',
                  }}>
                    {i < genStep ? <Check size={12} /> : i === genStep && generating ? <Loader2 size={12} className="animate-spin-slow" /> : <span style={{ fontSize: 10 }}>{i + 1}</span>}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: i === genStep ? 600 : 400, color: i <= genStep ? 'var(--tx)' : 'var(--txm)' }}>{step}</span>
                </div>
              ))}
              {genDone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '10px 12px', borderRadius: 8, background: 'var(--okbg)', color: 'var(--ok)', fontSize: 13, fontWeight: 600 }}>
                  <Check size={14} /> Document ready!
                </div>
              )}
            </div>
          )}

          {/* Templates */}
          <div style={{ marginTop: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Templates</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {templates.map(t => (
                <div
                  key={t.name}
                  onClick={() => handleTemplateClick(t)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                    border: '1px solid var(--bd)', background: docName === t.name ? 'var(--acg)' : 'var(--bgc)',
                    borderColor: docName === t.name ? 'var(--ac)' : 'var(--bd)',
                    transition: 'all 0.25s',
                  }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--acg)', color: 'var(--ac)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--tx2)' }}>{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right - Preview */}
        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--bd)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Document Preview</h3>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => { if (preview) { navigator.clipboard.writeText(preview); toast('Copied!') } }}>
                <Copy size={12} /> Copy
              </button>
              <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => { if (preview) toast('Export started', 'info'); else toast('Generate a document first', 'error') }}>
                <Download size={12} /> Export
              </button>
            </div>
          </div>
          <div style={{ flex: 1, padding: 24, overflow: 'auto' }}>
            {preview ? (
              <pre style={{ fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: 'var(--tx)' }}>{preview}</pre>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 300 }}>
                <p style={{ color: 'var(--txm)', fontSize: 14, textAlign: 'center' }}>
                  Select a case and template to generate content,<br />or write your own.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
