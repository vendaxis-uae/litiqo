'use client'

import { useEffect, useState } from 'react'
import { Sparkles, RefreshCw, AlertTriangle, CheckCircle2, Clock, Users, Scale, Target, ListChecks } from 'lucide-react'
import { getCaseAiSummary, generateCaseAiSummary } from '@/lib/supabase'

interface AiSummary {
  overview?: string
  parties?: { name: string; role: string }[]
  claims?: string[]
  relief_sought?: string[]
  key_dates?: { date: string; event: string }[]
  suggested_next_steps?: string[]
  risk_flags?: string[]
}

interface Props {
  caseId: string
}

const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

export default function AiSummaryCard({ caseId }: Props) {
  const [summary, setSummary] = useState<AiSummary | null>(null)
  const [createdAt, setCreatedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isDemoCase = !isUuid(caseId)

  useEffect(() => {
    if (isDemoCase) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const data = await getCaseAiSummary(caseId)
        if (cancelled) return
        if (data) {
          setSummary(data.summary)
          setCreatedAt(data.created_at)
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [caseId, isDemoCase])

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    try {
      const res = await generateCaseAiSummary(caseId)
      setSummary(res.summary)
      setCreatedAt(new Date().toISOString())
    } catch (e: any) {
      setError(e.message || 'Failed to generate summary')
    } finally {
      setGenerating(false)
    }
  }

  const hasSummary = !!summary

  return (
    <div style={{
      background: 'var(--bgc)',
      border: '1px solid var(--bd)',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: 'var(--shadow2)',
      position: 'relative',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--grad1)' }} />

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 24px',
        background: 'var(--grad-soft)',
        borderBottom: '1px solid var(--bd)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--ac)', color: 'var(--gold)',
          }}>
            <Sparkles size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--tx)', letterSpacing: '-0.01em' }}>AI Case Summary</h3>
            <div style={{ fontSize: 11, color: 'var(--tx2)', fontWeight: 500, marginTop: 2, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Claude Haiku 4.5</div>
          </div>
        </div>
        {!isDemoCase && (
          <button onClick={handleGenerate} disabled={generating} className="btn-primary" style={{ opacity: generating ? 0.7 : 1, cursor: generating ? 'wait' : 'pointer' }}>
            <RefreshCw size={14} style={{ animation: generating ? 'spin 1s linear infinite' : 'none' }} />
            {generating ? 'Generating...' : hasSummary ? 'Regenerate' : 'Generate Summary'}
          </button>
        )}
      </div>

      <div style={{ padding: 24 }}>
        {isDemoCase && (
          <div style={{ textAlign: 'center', padding: '28px 20px' }}>
            <Sparkles size={32} style={{ color: 'var(--gold)', opacity: 0.5, marginBottom: 12 }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)', marginBottom: 6 }}>Demo case — AI not available</p>
            <p style={{ fontSize: 13, color: 'var(--tx2)', maxWidth: 420, margin: '0 auto', lineHeight: 1.5 }}>
              AI summaries are available on cases saved to your account. Create a new case to try it out.
            </p>
          </div>
        )}

        {!isDemoCase && loading && (
          <div style={{ textAlign: 'center', padding: 24, color: 'var(--tx2)', fontSize: 13 }}>Loading summary…</div>
        )}

        {!isDemoCase && !loading && !hasSummary && !generating && (
          <div style={{ textAlign: 'center', padding: '28px 20px' }}>
            <Sparkles size={32} style={{ color: 'var(--gold)', opacity: 0.4, marginBottom: 12 }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)', marginBottom: 4 }}>No AI summary yet</p>
            <p style={{ fontSize: 13, color: 'var(--tx2)' }}>Click "Generate Summary" to analyze this case with AI.</p>
          </div>
        )}

        {generating && !hasSummary && (
          <div style={{ textAlign: 'center', padding: '28px 20px' }}>
            <div style={{
              width: 36, height: 36, margin: '0 auto 12px',
              border: '3px solid var(--acg2)', borderTopColor: 'var(--ac)',
              borderRadius: '50%', animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ fontSize: 13, color: 'var(--tx2)' }}>Analyzing case details…</p>
          </div>
        )}

        {error && (
          <div style={{
            marginBottom: 16, padding: 12, borderRadius: 10,
            background: 'var(--dnbg)', border: '1px solid var(--dnbd)',
            fontSize: 13, color: 'var(--dn)',
            display: 'flex', alignItems: 'flex-start', gap: 8,
          }}>
            <AlertTriangle size={16} style={{ marginTop: 1, flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {hasSummary && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {summary.overview && (
              <div style={{
                padding: 16,
                background: 'var(--grad-soft)',
                borderLeft: '3px solid var(--gold)',
                borderRadius: '0 10px 10px 0',
              }}>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--tx)' }}>{summary.overview}</p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              {summary.parties && summary.parties.length > 0 && (
                <Section icon={<Users size={14} />} title="Parties">
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {summary.parties.map((p, i) => (
                      <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13 }}>
                        <span style={{ color: 'var(--tx2)', minWidth: 90, fontWeight: 500 }}>{p.role}:</span>
                        <span style={{ color: 'var(--tx)', fontWeight: 600 }}>{p.name}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {summary.claims && summary.claims.length > 0 && (
                <Section icon={<Scale size={14} />} title="Key Claims">
                  <BulletList items={summary.claims} />
                </Section>
              )}

              {summary.relief_sought && summary.relief_sought.length > 0 && (
                <Section icon={<Target size={14} />} title="Relief Sought">
                  <BulletList items={summary.relief_sought} />
                </Section>
              )}

              {summary.key_dates && summary.key_dates.length > 0 && (
                <Section icon={<Clock size={14} />} title="Key Dates">
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {summary.key_dates.map((d, i) => (
                      <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13 }}>
                        <span style={{ color: 'var(--tx2)', minWidth: 100, fontFamily: 'monospace', fontSize: 11, paddingTop: 2 }}>{d.date}</span>
                        <span style={{ color: 'var(--tx)' }}>{d.event}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
            </div>

            {summary.suggested_next_steps && summary.suggested_next_steps.length > 0 && (
              <Section icon={<ListChecks size={14} style={{ color: 'var(--ok)' }} />} title="Suggested Next Steps" tint="ok">
                <BulletList items={summary.suggested_next_steps} dotColor="var(--ok)" />
              </Section>
            )}

            {summary.risk_flags && summary.risk_flags.length > 0 && (
              <Section icon={<AlertTriangle size={14} style={{ color: 'var(--wn)' }} />} title="Risk Flags" tint="wn">
                <BulletList items={summary.risk_flags} dotColor="var(--wn)" />
              </Section>
            )}

            {createdAt && (
              <div style={{
                paddingTop: 14, borderTop: '1px solid var(--bd)',
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 11, color: 'var(--txm)', letterSpacing: '0.02em',
              }}>
                <CheckCircle2 size={12} />
                Generated {new Date(createdAt).toLocaleString()}
                <span style={{ margin: '0 4px' }}>·</span>
                Not legal advice
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Section({
  icon,
  title,
  children,
  tint = 'default',
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  tint?: 'default' | 'ok' | 'wn'
}) {
  const bg = tint === 'ok' ? 'var(--okbg)' : tint === 'wn' ? 'var(--wnbg)' : 'var(--bg2)'
  const bd = tint === 'ok' ? 'var(--okbd)' : tint === 'wn' ? 'var(--wnbd)' : 'var(--bd)'
  return (
    <div style={{ borderRadius: 12, padding: 14, background: bg, border: `1px solid ${bd}` }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10,
        color: 'var(--tx)', fontWeight: 700, fontSize: 12,
        letterSpacing: '0.03em', textTransform: 'uppercase',
      }}>
        {icon}
        {title}
      </div>
      {children}
    </div>
  )
}

function BulletList({ items, dotColor = 'var(--ac)' }: { items: string[]; dotColor?: string }) {
  return (
    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--tx)', lineHeight: 1.5 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, marginTop: 7, flexShrink: 0 }} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}
