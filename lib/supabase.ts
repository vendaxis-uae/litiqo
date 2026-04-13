// ============================================
// SUPABASE CLIENT â THE IGNITION KEY
// ============================================
// This file creates the connection to your database
// Think of it as turning the key in the ignition
// Without this, the frontend can't talk to the engine
//
// HOW IT WORKS:
// 1. Your app loads â this file runs
// 2. It connects to YOUR specific Supabase database using YOUR URL and key
// 3. Now every page can read/write data through this connection
// 4. The anon key is safe to expose â Row Level Security protects everything

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// This is the "key in the ignition" â creates the connection
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============================================
// DATABASE FUNCTIONS â THE TRANSMISSION
// ============================================
// Each function below is a gear in the transmission
// The frontend (steering wheel) calls these functions
// These functions talk to the database (engine)
// The engine sends back data â the dashboard displays it
//
// Example flow:
// User clicks "Create Case" â createCase() runs â
// Supabase saves it â returns the new case â
// Dashboard shows the case

// ---------- CASES (Main Filing Cabinet) ----------

export async function getCases(userId: string) {
  // Like opening the filing cabinet and pulling out all your folders
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getCase(caseId: string) {
  // Like pulling out one specific folder
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('id', caseId)
    .single()

  if (error) throw error
  return data
}

export async function createCase(caseData: {
  user_id: string
  case_number: string
  title: string
  case_type: string
  jurisdiction?: string
  priority?: string
  client_name?: string
  client_email?: string
  client_phone?: string
  opposing_party?: string
  court_name?: string
  judge_name?: string
  filing_date?: string
  hearing_date?: string
  amount?: number
  description?: string
}) {
  // Like putting a new folder into the filing cabinet
  // The database assigns it a unique ID automatically
  const { data, error } = await supabase
    .from('cases')
    .insert(caseData)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCase(caseId: string, updates: Record<string, any>) {
  // Like pulling out a folder, editing it, and putting it back
  const { data, error } = await supabase
    .from('cases')
    .update(updates)
    .eq('id', caseId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteCase(caseId: string) {
  const { error } = await supabase
    .from('cases')
    .delete()
    .eq('id', caseId)

  if (error) throw error
}

// ---------- TIMELINE (The Diary) ----------

export async function getTimeline(caseId: string) {
  // Like reading the diary entries for a specific case
  const { data, error } = await supabase
    .from('timeline_events')
    .select('*')
    .eq('case_id', caseId)
    .order('event_date', { ascending: true })

  if (error) throw error
  return data
}

export async function addTimelineEvent(event: {
  case_id: string
  event_date: string
  title: string
  description?: string
  event_type?: string
  created_by?: string
}) {
  // Like writing a new entry in the diary
  const { data, error } = await supabase
    .from('timeline_events')
    .insert(event)
    .select()
    .single()

  if (error) throw error
  return data
}

// ---------- DOCUMENTS (The Glove Box) ----------

export async function getDocuments(caseId: string) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createDocument(doc: {
  case_id: string
  name: string
  doc_type?: string
  content?: string
  generated_by_ai?: boolean
  created_by?: string
}) {
  const { data, error } = await supabase
    .from('documents')
    .insert(doc)
    .select()
    .single()

  if (error) throw error
  return data
}

// ---------- CLIENT INVITATIONS (Passenger Pass) ----------

export async function getInvitations(userId: string) {
  const { data, error } = await supabase
    .from('client_invitations')
    .select('*, cases(title)')
    .eq('invited_by', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function inviteClient(invitation: {
  case_id: string
  invited_by: string
  client_name: string
  client_email: string
  permissions?: string[]
}) {
  const { data, error } = await supabase
    .from('client_invitations')
    .insert(invitation)
    .select()
    .single()

  if (error) throw error
  return data
}

// ---------- NOTIFICATIONS (Dashboard Warning Lights) ----------

export async function getNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*, cases(title)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function markNotificationRead(notifId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notifId)

  if (error) throw error
}

export async function markAllNotificationsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false)

  if (error) throw error
}

// ---------- AUTH (The Ignition Key) ----------

export async function signUp(email: string, password: string, fullName: string) {
  // Like getting a new car key made at the dealership
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }
    }
  })
  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  // Like putting the key in and turning the ignition
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export async function signOut() {
  // Like turning off the engine and taking the key out
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getUser() {
  // Like checking who's currently in the driver's seat
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
