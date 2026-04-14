import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 60

const SYSTEM_PROMPT = `You are a senior legal analyst assisting a civil-litigation lawyer. Produce a concise, factual summary of the case based ONLY on the information provided. Do not invent facts, parties, statutes, or dates. If information is missing, say "not specified" — never guess.

Your response MUST be a single valid JSON object matching this exact schema (no markdown, no prose outside the JSON):

{
  "overview": "2-3 sentence neutral summary of the case",
  "parties": [
    { "name": "string", "role": "Plaintiff | Defendant | Third Party | Other" }
  ],
  "claims": ["short bullet describing each legal claim or cause of action"],
  "relief_sought": ["short bullet describing each remedy requested"],
  "key_dates": [
    { "date": "YYYY-MM-DD or descriptive", "event": "what happened" }
  ],
  "suggested_next_steps": ["procedural checklist items - NOT legal advice"],
  "risk_flags": ["potential issues, e.g. limitation period, missing info, jurisdictional concerns"]
}

Rules:
- Keep each bullet under 25 words.
- "suggested_next_steps" must be procedural (e.g. "File reply within 30 days", "Request document production"), never substantive legal advice.
- "risk_flags" should highlight GAPS in the provided information, not hypothetical legal risks.
- Output ONLY the JSON object, no preamble or trailing text.`

export async function POST(req: NextRequest) {
  try {
    const { caseId } = await req.json()

    if (!caseId) {
      return NextResponse.json({ error: 'caseId is required' }, { status: 400 })
    }

    // Auth: pull user token from request cookie
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch case (RLS ensures user owns it)
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    // Fetch documents + timeline for extra context
    const { data: docs } = await supabase
      .from('documents')
      .select('name, description')
      .eq('case_id', caseId)

    const { data: timeline } = await supabase
      .from('timeline_events')
      .select('event_date, title, description')
      .eq('case_id', caseId)
      .order('event_date', { ascending: true })

    // Build context block
    const contextText = [
      `CASE TITLE: ${caseData.title || 'Untitled'}`,
      `TYPE: ${caseData.type || 'not specified'}`,
      `JURISDICTION: ${caseData.jurisdiction || 'not specified'}`,
      `STATUS: ${caseData.status || 'not specified'}`,
      `PRIORITY: ${caseData.priority || 'not specified'}`,
      `FILING DATE: ${caseData.filing_date || 'not specified'}`,
      `HEARING DATE: ${caseData.hearing_date || 'not specified'}`,
      `CLIENT NAME: ${caseData.client_name || 'not specified'}`,
      `OPPOSING PARTY: ${caseData.opposing_party || 'not specified'}`,
      '',
      `DESCRIPTION:`,
      caseData.description || '(no description provided)',
      '',
      docs && docs.length > 0
        ? `DOCUMENTS ON FILE:\n${docs.map((d: any) => `- ${d.name}${d.description ? ': ' + d.description : ''}`).join('\n')}`
        : 'DOCUMENTS ON FILE: none',
      '',
      timeline && timeline.length > 0
        ? `TIMELINE:\n${timeline.map((t: any) => `- ${t.event_date || ''}: ${t.title}${t.description ? ' — ' + t.description : ''}`).join('\n')}`
        : 'TIMELINE: empty',
    ].join('\n')

    // Call Claude Haiku 4.5
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Please analyze the following case and return the JSON summary:\n\n${contextText}`,
        },
      ],
    })

    const textBlock = response.content.find((b) => b.type === 'text') as any
    const rawText = textBlock?.text || ''

    // Parse JSON (strip code fences if model added them)
    const cleaned = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '').trim()
    let summary: any
    try {
      summary = JSON.parse(cleaned)
    } catch (e) {
      return NextResponse.json(
        { error: 'Failed to parse AI response', raw: rawText },
        { status: 500 }
      )
    }

    // Delete any previous summary for this case, then insert new one
    await supabase.from('ai_summaries').delete().eq('case_id', caseId)

    const { data: saved, error: saveError } = await supabase
      .from('ai_summaries')
      .insert({
        case_id: caseId,
        summary,
        model: 'claude-haiku-4-5',
        tokens_input: response.usage.input_tokens,
        tokens_output: response.usage.output_tokens,
        created_by: user.id,
      })
      .select()
      .single()

    if (saveError) {
      console.error('Save error:', saveError)
      // Still return the summary even if save failed
      return NextResponse.json({ summary, saved: false })
    }

    return NextResponse.json({ summary, saved: true, record: saved })
  } catch (err: any) {
    console.error('summarize-case error:', err)
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
