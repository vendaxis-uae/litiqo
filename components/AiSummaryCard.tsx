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

export default function AiSummaryCard({ caseId }: Props) {
  const [summary, setSummary] = useState<AiSummary | null>(null)
  const [createdAt, setCreatedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
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
  }, [caseId])

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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Case Summary</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">Claude Haiku 4.5</span>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Generating...' : hasSummary ? 'Regenerate' : 'Generate Summary'}
        </button>
      </div>

      {/* Body */}
      <div className="p-6">
        {loading && (
          <div className="text-center py-6 text-gray-500 text-sm">Loading summary…</div>
        )}

        {!loading && !hasSummary && !generating && (
          <div className="text-center py-8">
            <Sparkles className="w-10 h-10 text-purple-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-1 font-medium">No AI summary yet</p>
            <p className="text-sm text-gray-500">
              Click "Generate Summary" to analyze this case with AI.
            </p>
          </div>
        )}

        {generating && !hasSummary && (
          <div className="text-center py-8">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-600">Analyzing case details…</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {hasSummary && (
          <div className="space-y-5">
            {summary.overview && (
              <div>
                <p className="text-gray-800 leading-relaxed">{summary.overview}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-5">
              {summary.parties && summary.parties.length > 0 && (
                <Section icon={<Users className="w-4 h-4" />} title="Parties">
                  <ul className="space-y-1 text-sm">
                    {summary.parties.map((p, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-gray-500 min-w-[90px]">{p.role}:</span>
                        <span className="text-gray-900 font-medium">{p.name}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {summary.claims && summary.claims.length > 0 && (
                <Section icon={<Scale className="w-4 h-4" />} title="Key Claims">
                  <BulletList items={summary.claims} />
                </Section>
              )}

              {summary.relief_sought && summary.relief_sought.length > 0 && (
                <Section icon={<Target className="w-4 h-4" />} title="Relief Sought">
                  <BulletList items={summary.relief_sought} />
                </Section>
              )}

              {summary.key_dates && summary.key_dates.length > 0 && (
                <Section icon={<Clock className="w-4 h-4" />} title="Key Dates">
                  <ul className="space-y-1 text-sm">
                    {summary.key_dates.map((d, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-gray-500 min-w-[100px] font-mono text-xs">{d.date}</span>
                        <span className="text-gray-800">{d.event}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
            </div>

            {summary.suggested_next_steps && summary.suggested_next_steps.length > 0 && (
              <Section icon={<ListChecks className="w-4 h-4 text-green-600" />} title="Suggested Next Steps" tint="green">
                <BulletList items={summary.suggested_next_steps} dotColor="bg-green-500" />
              </Section>
            )}

            {summary.risk_flags && summary.risk_flags.length > 0 && (
              <Section icon={<AlertTriangle className="w-4 h-4 text-amber-600" />} title="Risk Flags" tint="amber">
                <BulletList items={summary.risk_flags} dotColor="bg-amber-500" />
              </Section>
            )}

            {createdAt && (
              <div className="pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs text-gray-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Generated {new Date(createdAt).toLocaleString()}
                <span className="mx-1">·</span>
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
  tint?: 'default' | 'green' | 'amber'
}) {
  const bg =
    tint === 'green' ? 'bg-green-50 border-green-100' :
    tint === 'amber' ? 'bg-amber-50 border-amber-100' :
    'bg-gray-50 border-gray-100'
  return (
    <div className={`rounded-lg border ${bg} p-4`}>
      <div className="flex items-center gap-1.5 mb-2 text-gray-700 font-semibold text-sm">
        {icon}
        {title}
      </div>
      {children}
    </div>
  )
}

function BulletList({ items, dotColor = 'bg-purple-500' }: { items: string[]; dotColor?: string }) {
  return (
    <ul className="space-y-1.5 text-sm text-gray-800">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${dotColor} mt-1.5 flex-shrink-0`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}
