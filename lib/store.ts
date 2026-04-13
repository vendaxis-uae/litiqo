'use client'

// Simple client-side state store for demo mode (before Supabase is connected)
// This allows the app to work fully without a database

export interface Case {
  id: string
  title: string
  caseNumber: string
  type: string
  status: 'New' | 'Active' | 'Filing Ready' | 'In Progress' | 'Closed'
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  jurisdiction: string
  clientName: string
  clientEmail: string
  clientPhone: string
  opposingParty: string
  courtName: string
  judgeName: string
  filingDate: string
  hearingDate: string
  amount: number
  description: string
  createdAt: string
  timeline: TimelineEvent[]
  documents: Document[]
}

export interface TimelineEvent {
  id: string
  date: string
  title: string
  description: string
  type: 'filing' | 'hearing' | 'document' | 'communication' | 'milestone' | 'note'
}

export interface Document {
  id: string
  name: string
  type: string
  status: 'Draft' | 'Final' | 'Generating'
  createdAt: string
  caseId: string
}

export interface Notification {
  id: string
  message: string
  type: 'deadline' | 'ai_suggestion' | 'client_activity' | 'escalation'
  caseId?: string
  caseTitle?: string
  read: boolean
  createdAt: string
}

export interface InvitedClient {
  id: string
  name: string
  email: string
  caseId: string
  caseTitle: string
  permissions: string[]
  status: 'Pending' | 'Accepted' | 'Expired'
  invitedAt: string
}

// Demo data
const demoCases: Case[] = [
  {
    id: '1',
    title: 'Meridian Tech vs Apex Global',
    caseNumber: 'CASE-2024-001',
    type: 'Debt Recovery',
    status: 'Filing Ready',
    priority: 'High',
    jurisdiction: 'UAE (DIFC)',
    clientName: 'Meridian Tech LLC',
    clientEmail: 'legal@meridiantech.ae',
    clientPhone: '+971 4 555 0101',
    opposingParty: 'Apex Global Trading FZE',
    courtName: 'DIFC Courts',
    judgeName: 'Hon. Justice Richardson',
    filingDate: '2024-03-15',
    hearingDate: '2024-05-20',
    amount: 187450,
    description: 'Debt recovery claim for unpaid invoices related to IT infrastructure services provided between Jan-Dec 2023.',
    createdAt: '2024-03-10T10:00:00Z',
    timeline: [
      { id: 't1', date: '2024-03-10', title: 'Case Intake', description: 'Initial consultation with client. Reviewed outstanding invoices.', type: 'milestone' },
      { id: 't2', date: '2024-03-12', title: 'Documents Collected', description: 'Received 42 supporting documents including invoices and contracts.', type: 'document' },
      { id: 't3', date: '2024-03-15', title: 'Case Filed', description: 'Claim filed with DIFC Courts. Case number assigned.', type: 'filing' },
      { id: 't4', date: '2024-04-01', title: 'Demand Letter Sent', description: 'Formal demand letter sent to Apex Global Trading.', type: 'communication' },
      { id: 't5', date: '2024-05-20', title: 'First Hearing', description: 'Scheduled first hearing at DIFC Courts.', type: 'hearing' },
    ],
    documents: [
      { id: 'd1', name: 'Statement of Claim.pdf', type: 'Complaint', status: 'Final', createdAt: '2024-03-15', caseId: '1' },
      { id: 'd2', name: 'Demand Letter.pdf', type: 'Letter', status: 'Final', createdAt: '2024-04-01', caseId: '1' },
      { id: 'd3', name: 'Chronological Statement of Facts.pdf', type: 'Brief', status: 'Draft', createdAt: '2024-04-10', caseId: '1' },
    ],
  },
  {
    id: '2',
    title: 'Green Valley vs Summit Construction',
    caseNumber: 'CASE-2024-002',
    type: 'Contract Dispute',
    status: 'In Progress',
    priority: 'Medium',
    jurisdiction: 'UK (County Court)',
    clientName: 'Green Valley Developments Ltd',
    clientEmail: 'disputes@greenvalley.co.uk',
    clientPhone: '+44 20 7946 0958',
    opposingParty: 'Summit Construction Group',
    courtName: 'Central London County Court',
    judgeName: 'HHJ Thompson',
    filingDate: '2024-02-20',
    hearingDate: '2024-06-15',
    amount: 342000,
    description: 'Breach of construction contract. Defective work and delays on residential development project.',
    createdAt: '2024-02-15T09:00:00Z',
    timeline: [
      { id: 't6', date: '2024-02-15', title: 'Case Intake', description: 'Client meeting. Reviewed construction contract and defect reports.', type: 'milestone' },
      { id: 't7', date: '2024-02-18', title: 'Expert Appointed', description: 'Structural engineer appointed for independent assessment.', type: 'milestone' },
      { id: 't8', date: '2024-02-20', title: 'Particulars of Claim Filed', description: 'Filed with Central London County Court.', type: 'filing' },
      { id: 't9', date: '2024-03-10', title: 'Defence Received', description: 'Summit Construction filed their defence.', type: 'document' },
      { id: 't10', date: '2024-04-05', title: 'Disclosure Complete', description: 'Both parties completed standard disclosure.', type: 'document' },
    ],
    documents: [
      { id: 'd4', name: 'Particulars of Claim.pdf', type: 'Complaint', status: 'Final', createdAt: '2024-02-20', caseId: '2' },
      { id: 'd5', name: 'Expert Report.pdf', type: 'Brief', status: 'Final', createdAt: '2024-03-25', caseId: '2' },
    ],
  },
  {
    id: '3',
    title: 'Sarah Al-Hassan vs Pacific Consulting',
    caseNumber: 'CASE-2024-003',
    type: 'Employment',
    status: 'New',
    priority: 'Medium',
    jurisdiction: 'UAE (MOHRE)',
    clientName: 'Sarah Al-Hassan',
    clientEmail: 'sarah.alhassan@email.com',
    clientPhone: '+971 50 555 0303',
    opposingParty: 'Pacific Consulting Group DMCC',
    courtName: 'MOHRE Labour Court',
    judgeName: '',
    filingDate: '',
    hearingDate: '',
    amount: 95000,
    description: 'Wrongful termination claim. Employee terminated without notice or end-of-service benefits.',
    createdAt: '2024-04-01T14:00:00Z',
    timeline: [
      { id: 't11', date: '2024-04-01', title: 'Case Intake', description: 'Initial consultation. Reviewed employment contract and termination letter.', type: 'milestone' },
      { id: 't12', date: '2024-04-03', title: 'Documents Requested', description: 'Requested salary slips, HR correspondence, and performance reviews from client.', type: 'document' },
    ],
    documents: [
      { id: 'd6', name: 'Employment Contract.pdf', type: 'Contract', status: 'Final', createdAt: '2024-04-01', caseId: '3' },
    ],
  },
]

const demoNotifications: Notification[] = [
  { id: 'n1', message: 'Filing deadline for Meridian Tech vs Apex Global in 48 hours', type: 'escalation', caseId: '1', caseTitle: 'Meridian Tech vs Apex Global', read: false, createdAt: '2024-04-08T09:00:00Z' },
  { id: 'n2', message: 'AI found a relevant precedent for Green Valley vs Summit Construction', type: 'ai_suggestion', caseId: '2', caseTitle: 'Green Valley vs Summit Construction', read: false, createdAt: '2024-04-07T15:30:00Z' },
  { id: 'n3', message: 'Sarah Al-Hassan uploaded new evidence documents', type: 'client_activity', caseId: '3', caseTitle: 'Sarah Al-Hassan vs Pacific Consulting', read: false, createdAt: '2024-04-07T11:00:00Z' },
  { id: 'n4', message: 'Next hearing for Meridian Tech vs Apex Global on May 20, 2024', type: 'deadline', caseId: '1', caseTitle: 'Meridian Tech vs Apex Global', read: true, createdAt: '2024-04-06T08:00:00Z' },
  { id: 'n5', message: 'AI suggests generating a Position Statement for Green Valley case', type: 'ai_suggestion', caseId: '2', caseTitle: 'Green Valley vs Summit Construction', read: true, createdAt: '2024-04-05T14:00:00Z' },
  { id: 'n6', message: 'Client portal access expiring for Pacific Consulting case', type: 'deadline', caseId: '3', caseTitle: 'Sarah Al-Hassan vs Pacific Consulting', read: true, createdAt: '2024-04-04T10:00:00Z' },
]

// Store functions
let cases = [...demoCases]
let notifications = [...demoNotifications]
let invitedClients: InvitedClient[] = [
  { id: 'ic1', name: 'Meridian Tech Legal Team', email: 'legal@meridiantech.ae', caseId: '1', caseTitle: 'Meridian Tech vs Apex Global', permissions: ['View Case Details', 'View Documents'], status: 'Accepted', invitedAt: '2024-03-12T10:00:00Z' },
]
let listeners: (() => void)[] = []

function notify() { listeners.forEach(fn => fn()) }

export const store = {
  subscribe(fn: () => void) {
    listeners.push(fn)
    return () => { listeners = listeners.filter(l => l !== fn) }
  },
  getCases: () => cases,
  getCase: (id: string) => cases.find(c => c.id === id),
  addCase: (c: Omit<Case, 'id' | 'createdAt' | 'timeline' | 'documents'>) => {
    const newCase: Case = {
      ...c,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      timeline: [
        { id: `t-${Date.now()}`, date: new Date().toISOString().split('T')[0], title: 'Case Created', description: `New ${c.type} case opened: ${c.title}`, type: 'milestone' },
        ...(c.clientName ? [{ id: `t-${Date.now()+1}`, date: new Date().toISOString().split('T')[0], title: 'Parties Identified', description: `Client: ${c.clientName} vs ${c.opposingParty}`, type: 'milestone' as const }] : []),
        ...(c.jurisdiction ? [{ id: `t-${Date.now()+2}`, date: new Date().toISOString().split('T')[0], title: 'Jurisdiction Set', description: `Case filed under ${c.jurisdiction}`, type: 'filing' as const }] : []),
        ...(c.amount ? [{ id: `t-${Date.now()+3}`, date: new Date().toISOString().split('T')[0], title: 'Claim Amount Recorded', description: `Amount in dispute: $${c.amount.toLocaleString()}`, type: 'note' as const }] : []),
      ],
      documents: [],
    }
    cases = [newCase, ...cases]
    notify()
    return newCase
  },
  getNotifications: () => notifications,
  getUnreadCount: () => notifications.filter(n => !n.read).length,
  markRead: (id: string) => {
    notifications = notifications.map(n => n.id === id ? { ...n, read: true } : n)
    notify()
  },
  markAllRead: () => {
    notifications = notifications.map(n => ({ ...n, read: true }))
    notify()
  },
  getInvitedClients: () => invitedClients,
  inviteClient: (client: Omit<InvitedClient, 'id' | 'invitedAt' | 'status'>) => {
    const newClient: InvitedClient = {
      ...client,
      id: String(Date.now()),
      status: 'Pending',
      invitedAt: new Date().toISOString(),
    }
    invitedClients = [newClient, ...invitedClients]
    notify()
    return newClient
  },
  addDocument: (caseId: string, doc: Omit<Document, 'id' | 'createdAt' | 'caseId'>) => {
    const newDoc: Document = { ...doc, id: String(Date.now()), createdAt: new Date().toISOString(), caseId }
    cases = cases.map(c => c.id === caseId ? { ...c, documents: [...c.documents, newDoc] } : c)
    notify()
    return newDoc
  },
  addTimelineEvent: (caseId: string, event: Omit<TimelineEvent, 'id'>) => {
    const newEvent: TimelineEvent = { ...event, id: String(Date.now()) }
    cases = cases.map(c => c.id === caseId ? { ...c, timeline: [...c.timeline, newEvent] } : c)
    notify()
    return newEvent
  },
}
