// src/lib/supabase/client.ts
// MentalPath — Production Supabase client
// Works in Next.js App Router (server components, client components, route handlers, middleware)

import { createBrowserClient } from '@supabase/ssr'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from './types'

// ── BROWSER CLIENT (use in client components) ─────────────────────────────
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// ── SERVER CLIENT (use in server components and route handlers) ────────────
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

// ── MIDDLEWARE CLIENT (use in middleware.ts) ───────────────────────────────
export function createMiddlewareClient(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )
  return { supabase, response: supabaseResponse }
}

// ── EDGE FUNCTION CALLER (authenticated) ──────────────────────────────────
export async function callEdgeFunction<T = unknown>(
  functionName: string,
  body: Record<string, unknown>,
  accessToken: string
): Promise<T> {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${functionName}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Edge function ${functionName} failed: ${err}`)
  }
  return res.json()
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPED API LAYER
// All database calls in one place. Never write raw supabase queries in components.
// ─────────────────────────────────────────────────────────────────────────────

// ── AUTH ──────────────────────────────────────────────────────────────────
export const authAPI = {
  async signUp(email: string, password: string) {
    const sb = createClient()
    return sb.auth.signUp({ email, password,
      options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify` }
    })
  },
  async signIn(email: string, password: string) {
    const sb = createClient()
    return sb.auth.signInWithPassword({ email, password })
  },
  async signOut() {
    const sb = createClient()
    return sb.auth.signOut()
  },
  async resetPassword(email: string) {
    const sb = createClient()
    return sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`
    })
  },
  async updatePassword(password: string) {
    const sb = createClient()
    return sb.auth.updateUser({ password })
  },
  async getSession() {
    const sb = createClient()
    return sb.auth.getSession()
  },
}

// ── THERAPISTS ────────────────────────────────────────────────────────────
export const therapistAPI = {
  async getProfile(supabase: ReturnType<typeof createClient>) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase
      .from('therapists')
      .select('*, profession:professions(*)')
      .eq('id', user.id)
      .single()
    return data
  },
  async updateProfile(supabase: ReturnType<typeof createClient>, updates: Record<string, unknown>) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    return supabase.from('therapists').update(updates).eq('id', user.id)
  },
  async createProfile(supabase: ReturnType<typeof createClient>, profile: {
    full_name: string
    email: string
    credentials?: string
    college?: string
    registration_number?: string
    province?: string
    profession_id?: string
    practice_name?: string
    default_session_rate?: number
  }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    return supabase.from('therapists').insert({ id: user.id, ...profile })
  },
}

// ── CLIENTS ───────────────────────────────────────────────────────────────
export const clientsAPI = {
  async list(supabase: ReturnType<typeof createClient>) {
    return supabase
      .from('clients')
      .select('id, first_name, last_name, email, phone, status, session_count, last_session_at, noshow_count')
      .order('last_name', { ascending: true })
  },
  async get(supabase: ReturnType<typeof createClient>, clientId: string) {
    return supabase
      .from('clients')
      .select(`
        *,
        intake_forms(id, template_type, completed_at, signed_at),
        treatment_plans(id, status, goals, review_date),
        safety_plans(id, is_active, version),
        outcome_measures(measure_type, score, severity, completed_at)
      `)
      .eq('id', clientId)
      .single()
  },
  async create(supabase: ReturnType<typeof createClient>, client: {
    first_name: string
    last_name: string
    email?: string
    phone?: string
    date_of_birth?: string
    presenting_concern?: string
    rate_per_session?: number
    intake_template?: string
    cultural_context_tags?: string[]
  }) {
    return supabase.from('clients').insert(client).select().single()
  },
  async update(supabase: ReturnType<typeof createClient>, clientId: string, updates: Record<string, unknown>) {
    return supabase.from('clients').update(updates).eq('id', clientId)
  },
  async generatePortalToken(supabase: ReturnType<typeof createClient>, clientId: string) {
    const token = crypto.randomUUID()
    await supabase.from('clients').update({ portal_access_token: token }).eq('id', clientId)
    return token
  },
}

// ── SESSION NOTES ─────────────────────────────────────────────────────────
export const notesAPI = {
  async listForClient(supabase: ReturnType<typeof createClient>, clientId: string) {
    return supabase
      .from('session_notes')
      .select('id, session_date, session_number, format, is_locked, is_draft, ai_assisted, created_at')
      .eq('client_id', clientId)
      .order('session_date', { ascending: false })
  },
  async get(supabase: ReturnType<typeof createClient>, noteId: string) {
    return supabase.from('session_notes').select('*').eq('id', noteId).single()
  },
  async saveDraft(supabase: ReturnType<typeof createClient>, note: {
    client_id: string
    appointment_id?: string
    session_date: string
    session_number?: number
    format: 'DAP' | 'SOAP' | 'BIRP' | 'Progress'
    subjective?: string
    objective?: string
    assessment?: string
    plan?: string
    dap_data?: Record<string, string>
    soap_data?: Record<string, string>
    birp_data?: Record<string, string>
    duration_minutes?: number
    session_format?: string
    presenting_diagnosis?: string
    ai_assisted?: boolean
  }) {
    return supabase.from('session_notes').upsert({
      ...note,
      is_draft: true,
      is_locked: false,
    }).select().single()
  },
  async lock(supabase: ReturnType<typeof createClient>, noteId: string) {
    return supabase.from('session_notes').update({
      is_locked: true,
      is_draft: false,
      locked_at: new Date().toISOString(),
    }).eq('id', noteId)
  },
  async aiDraft(accessToken: string, params: {
    client_id: string
    appointment_id?: string
    format: string
    context?: string
  }) {
    return callEdgeFunction('ai-note-assist', params, accessToken)
  },
}

// ── APPOINTMENTS ──────────────────────────────────────────────────────────
export const appointmentsAPI = {
  async listUpcoming(supabase: ReturnType<typeof createClient>) {
    return supabase
      .from('appointments')
      .select('*, client:clients(first_name, last_name, email, phone)')
      .gte('scheduled_at', new Date().toISOString())
      .eq('status', 'scheduled')
      .order('scheduled_at', { ascending: true })
      .limit(50)
  },
  async listForDate(supabase: ReturnType<typeof createClient>, date: string) {
    const start = new Date(date); start.setHours(0,0,0,0)
    const end = new Date(date); end.setHours(23,59,59,999)
    return supabase
      .from('appointments')
      .select('*, client:clients(first_name, last_name)')
      .gte('scheduled_at', start.toISOString())
      .lte('scheduled_at', end.toISOString())
      .order('scheduled_at', { ascending: true })
  },
  async create(supabase: ReturnType<typeof createClient>, appt: {
    client_id: string
    scheduled_at: string
    duration_minutes: number
    format: 'video' | 'inperson' | 'phone'
    session_type?: string
    is_recurring?: boolean
    recurrence_rule?: string
  }) {
    return supabase.from('appointments').insert(appt).select().single()
  },
  async markNoShow(supabase: ReturnType<typeof createClient>, appointmentId: string) {
    return supabase.from('appointments').update({ status: 'noshow' }).eq('id', appointmentId)
  },
  async cancel(supabase: ReturnType<typeof createClient>, appointmentId: string, reason?: string) {
    return supabase.from('appointments').update({
      status: 'canceled',
      cancellation_reason: reason,
      canceled_at: new Date().toISOString(),
    }).eq('id', appointmentId)
  },
}

// ── INVOICES ──────────────────────────────────────────────────────────────
export const invoicesAPI = {
  async listForClient(supabase: ReturnType<typeof createClient>, clientId: string) {
    return supabase
      .from('invoices')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
  },
  async create(supabase: ReturnType<typeof createClient>, invoice: {
    client_id: string
    appointment_id?: string
    amount: number
    hst_amount?: number
    session_date?: string
    session_number?: number
    session_format?: string
    service_description?: string
    due_date?: string
  }) {
    return supabase.from('invoices').insert(invoice).select().single()
  },
  async markPaid(supabase: ReturnType<typeof createClient>, invoiceId: string) {
    return supabase.from('invoices').update({
      status: 'paid',
      paid_at: new Date().toISOString(),
    }).eq('id', invoiceId)
  },
  async generatePDF(accessToken: string, invoiceId: string, sendEmail = false) {
    return callEdgeFunction('generate-invoice-pdf', { invoice_id: invoiceId, send_email: sendEmail }, accessToken)
  },
}

// ── WAITLIST ──────────────────────────────────────────────────────────────
export const waitlistAPI = {
  async list(supabase: ReturnType<typeof createClient>) {
    return supabase
      .from('waitlist')
      .select('*')
      .eq('status', 'waiting')
      .order('priority', { ascending: false })
      .order('added_at', { ascending: true })
  },
  async add(supabase: ReturnType<typeof createClient>, entry: {
    first_name: string
    last_name: string
    email?: string
    phone?: string
    presenting_concerns?: string
    priority?: number
    intake_template?: string
  }) {
    return supabase.from('waitlist').insert(entry).select().single()
  },
  async notify(supabase: ReturnType<typeof createClient>, waitlistId: string) {
    return supabase.from('waitlist').update({
      status: 'notified',
      notified_at: new Date().toISOString(),
    }).eq('id', waitlistId)
  },
  async convert(supabase: ReturnType<typeof createClient>, waitlistId: string, clientId: string) {
    return supabase.from('waitlist').update({
      status: 'converted',
      converted_to_client_id: clientId,
    }).eq('id', waitlistId)
  },
}

// ── OUTCOME MEASURES ──────────────────────────────────────────────────────
export const outcomesAPI = {
  async listForClient(supabase: ReturnType<typeof createClient>, clientId: string) {
    return supabase
      .from('outcome_measures')
      .select('*')
      .eq('client_id', clientId)
      .order('completed_at', { ascending: false })
  },
  async save(supabase: ReturnType<typeof createClient>, measure: {
    client_id: string
    measure_type: string
    responses: Record<string, number>
    score: number
    severity?: string
    session_number?: number
  }) {
    const flagged = measure.measure_type === 'PHQ-9' && measure.score >= 15
    const flagReason = flagged ? 'PHQ-9 score ≥ 15 — elevated risk. Conduct safety assessment.' : undefined
    return supabase.from('outcome_measures').insert({ ...measure, flagged, flag_reason: flagReason }).select().single()
  },
}

// ── PRACTICE SETTINGS ─────────────────────────────────────────────────────
export const settingsAPI = {
  async get(supabase: ReturnType<typeof createClient>) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase
      .from('practice_settings')
      .select('*')
      .eq('therapist_id', user.id)
      .single()
    return data
  },
  async upsert(supabase: ReturnType<typeof createClient>, settings: Record<string, unknown>) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    return supabase.from('practice_settings').upsert({ therapist_id: user.id, ...settings })
  },
}

// ── STRIPE CHECKOUT ───────────────────────────────────────────────────────
export const stripeAPI = {
  async createCheckout(accessToken: string, plan: 'solo' | 'group') {
    return callEdgeFunction<{ checkout_url: string; session_id: string }>(
      'stripe-checkout', { plan }, accessToken
    )
  },
}

// ── SESSION PREP AI ───────────────────────────────────────────────────────
export const aiAPI = {
  async sessionPrep(accessToken: string, clientId: string) {
    return callEdgeFunction('session-prep', { client_id: clientId }, accessToken)
  },
  async treatmentPlan(accessToken: string, params: {
    client_id: string
    intake_form_id?: string
    presenting_problem?: string
    strengths?: string
  }) {
    return callEdgeFunction('ai-treatment-plan', params, accessToken)
  },
  async referralLetter(accessToken: string, params: {
    client_id: string
    recipient_name?: string
    recipient_role?: string
    reason: string
  }) {
    return callEdgeFunction('referral-letter', params, accessToken)
  },
  async dischargeSummary(accessToken: string, clientId: string) {
    return callEdgeFunction('discharge-summary', { client_id: clientId }, accessToken)
  },
  async wellbeingCheckin(accessToken: string, checkin: Record<string, unknown>) {
    return callEdgeFunction('therapist-wellbeing', checkin, accessToken)
  },
}

// ── PROFESSIONS ───────────────────────────────────────────────────────────
export const professionsAPI = {
  async list(supabase: ReturnType<typeof createClient>) {
    return supabase.from('professions').select('*').order('name')
  },
  async get(supabase: ReturnType<typeof createClient>, professionId: string) {
    return supabase.from('professions').select('*').eq('id', professionId).single()
  },
}
