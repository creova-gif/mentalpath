// src/lib/supabase/types.ts
// Generated from live MentalPath schema — hkhwgbkijepsxtixdmrs
// Run `npx supabase gen types typescript --project-id hkhwgbkijepsxtixdmrs > src/lib/supabase/types.ts`
// to regenerate from live database at any time

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      therapists: {
        Row: {
          id: string
          email: string | null
          full_name: string
          credentials: string | null
          college: string | null
          registration_number: string | null
          practice_name: string | null
          province: string | null
          profession_id: string | null
          provider_number: string | null
          profession_code: string | null
          accept_extended_health: boolean
          insurers_supported: string[]
          subscription_tier: string
          subscription_status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          subscription_current_period_end: string | null
          subscription_cancel_at_period_end: boolean
          default_session_rate: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['therapists']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['therapists']['Insert']>
      }
      clients: {
        Row: {
          id: string
          therapist_id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          date_of_birth: string | null
          pronouns: string | null
          preferred_name: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          presenting_concern: string | null
          status: 'active' | 'inactive' | 'waitlist' | 'discharged'
          rate_per_session: number | null
          is_sliding_scale: boolean
          cultural_context_tags: string[]
          portal_access_token: string | null
          portal_access_expires_at: string | null
          session_count: number
          last_session_at: string | null
          noshow_count: number
          consecutive_noshows: number
          last_noshow_at: string | null
          late_cancel_count: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at' | 'updated_at' | 'session_count' | 'noshow_count' | 'consecutive_noshows' | 'late_cancel_count'>
        Update: Partial<Database['public']['Tables']['clients']['Insert']>
      }
      session_notes: {
        Row: {
          id: string
          therapist_id: string
          client_id: string
          appointment_id: string | null
          session_date: string
          session_number: number | null
          format: 'DAP' | 'SOAP' | 'BIRP' | 'Progress'
          subjective: string | null
          objective: string | null
          assessment: string | null
          plan: string | null
          dap_data: Json | null
          soap_data: Json | null
          birp_data: Json | null
          progress_data: Json | null
          is_draft: boolean
          is_locked: boolean
          locked_at: string | null
          ai_assisted: boolean
          duration_minutes: number | null
          session_format: string | null
          presenting_diagnosis: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['session_notes']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['session_notes']['Insert']>
      }
      invoices: {
        Row: {
          id: string
          therapist_id: string
          client_id: string
          appointment_id: string | null
          invoice_number: string
          status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          amount: number
          hst_amount: number
          currency: string
          session_date: string | null
          session_number: number | null
          session_format: string | null
          service_description: string | null
          due_date: string | null
          paid_at: string | null
          stripe_payment_intent_id: string | null
          receipt_pdf_url: string | null
          pdf_storage_path: string | null
          pdf_generated_at: string | null
          email_sent_at: string | null
          email_sent_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['invoices']['Row'], 'id' | 'invoice_number' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>
      }
      appointments: {
        Row: {
          id: string
          therapist_id: string
          client_id: string
          note_id: string | null
          invoice_id: string | null
          scheduled_at: string
          duration_minutes: number
          format: 'video' | 'inperson' | 'phone'
          session_type: string | null
          status: 'scheduled' | 'completed' | 'canceled' | 'noshow'
          cancellation_reason: string | null
          canceled_at: string | null
          is_recurring: boolean
          recurrence_rule: string | null
          reminder_24h_sent_at: string | null
          reminder_2h_sent_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['appointments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['appointments']['Insert']>
      }
      intake_forms: {
        Row: {
          id: string
          therapist_id: string
          client_id: string
          template_type: string
          form_data: Json
          consent_general: boolean
          consent_phipa: boolean
          consent_telehealth: boolean
          consent_recording: boolean
          signed_at: string | null
          signed_ip: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['intake_forms']['Row'], 'id' | 'created_at'>
        Update: never // no-delete, no-update policy
      }
      treatment_plans: {
        Row: {
          id: string
          therapist_id: string
          client_id: string
          version: number
          status: 'active' | 'completed' | 'discontinued'
          presenting_problem: string | null
          strengths: string | null
          goals: Json
          interventions: string[]
          review_date: string | null
          discharge_criteria: string | null
          ai_draft_used: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['treatment_plans']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['treatment_plans']['Insert']>
      }
      messages: {
        Row: {
          id: string
          therapist_id: string
          client_id: string
          sender: 'therapist' | 'client'
          body: string
          read_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'>
        Update: Pick<Database['public']['Tables']['messages']['Row'], 'read_at'>
      }
      waitlist: {
        Row: {
          id: string
          therapist_id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          referral_source: string | null
          presenting_concerns: string | null
          preferred_days: string[]
          preferred_time: string | null
          intake_template: string
          priority: number
          notes: string | null
          notified_at: string | null
          converted_to_client_id: string | null
          status: 'waiting' | 'notified' | 'converted' | 'removed'
          added_at: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['waitlist']['Row'], 'id' | 'added_at' | 'created_at'>
        Update: Partial<Database['public']['Tables']['waitlist']['Insert']>
      }
      outcome_measures: {
        Row: {
          id: string
          therapist_id: string
          client_id: string
          measure_type: 'PHQ-9' | 'GAD-7' | 'PHQ-2' | 'WHODAS' | 'Oswestry' | 'DASH' | 'NPRS' | 'PSFS' | 'Berg' | 'COPM' | 'FIM'
          responses: Json
          score: number
          severity: string | null
          completed_at: string
          session_number: number | null
          flagged: boolean
          flag_reason: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['outcome_measures']['Row'], 'id' | 'created_at'>
        Update: Pick<Database['public']['Tables']['outcome_measures']['Row'], 'flagged' | 'flag_reason'>
      }
      practice_settings: {
        Row: {
          id: string
          therapist_id: string
          booking_link_slug: string | null
          booking_enabled: boolean
          booking_buffer_minutes: number
          booking_advance_days: number
          session_durations: number[]
          available_days: number[]
          available_start: string
          available_end: string
          reminder_24h_enabled: boolean
          reminder_2h_enabled: boolean
          reminder_sms_enabled: boolean
          reminder_email_enabled: boolean
          late_cancel_fee_enabled: boolean
          late_cancel_fee_amount: number
          late_cancel_hours: number
          invoice_due_days: number
          hst_number: string | null
          hst_rate: number
          invoice_footer_note: string | null
          portal_welcome_message: string | null
          portal_custom_color: string
          show_cancellation_policy: boolean
          cancellation_policy: string | null
          notify_new_booking: boolean
          notify_cancellation: boolean
          notify_message: boolean
          notify_email: string | null
          college_registration_expiry: string | null
          liability_insurance_expiry: string | null
          supervision_hours_ytd: number
          supervision_hours_required: number
          phipa_breach_contact: string | null
          data_retention_acknowledged: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['practice_settings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['practice_settings']['Insert']>
      }
      professions: {
        Row: {
          id: string
          name: string
          college: string
          province: string
          note_formats: string[]
          default_note_format: string
          outcome_measures: string[]
          receipt_type: 'standard' | 'extended_health' | 'both'
          insurance_codes: Json
          session_duration_default: number
          requires_treatment_plan: boolean
          requires_body_diagram: boolean
          hst_exempt: boolean
          created_at: string
        }
        Insert: never // read-only lookup table
        Update: never
      }
      audit_log: {
        Row: {
          id: string
          therapist_id: string
          action: string
          table_name: string | null
          record_id: string | null
          details: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['audit_log']['Row'], 'id' | 'created_at'>
        Update: never // append-only
      }
      therapist_checkins: {
        Row: {
          id: string
          therapist_id: string
          week_of: string
          energy_score: number | null
          emotional_load_score: number | null
          satisfaction_score: number | null
          boundary_score: number | null
          intrusive_client_thoughts: boolean
          sleep_disrupted_by_work: boolean
          dreading_specific_sessions: boolean
          emotional_numbing: boolean
          cynicism_increase: boolean
          difficulty_being_present: boolean
          sessions_this_week: number | null
          crisis_sessions_this_week: number
          heaviest_session_topic: string | null
          reflection: string | null
          supervision_this_week: boolean
          peer_consultation_this_week: boolean
          took_breaks: boolean
          personal_therapy_this_week: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['therapist_checkins']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['therapist_checkins']['Insert']>
      }
    }
    Views: {}
    Functions: {
      generate_invoice_number: {
        Args: {}
        Returns: string
      }
      lock_old_notes: {
        Args: {}
        Returns: void
      }
      update_updated_at: {
        Args: {}
        Returns: unknown
      }
    }
    Enums: {}
  }
}

// ── CONVENIENCE TYPES ──────────────────────────────────────────────────────
export type Therapist = Database['public']['Tables']['therapists']['Row']
export type Client = Database['public']['Tables']['clients']['Row']
export type SessionNote = Database['public']['Tables']['session_notes']['Row']
export type Invoice = Database['public']['Tables']['invoices']['Row']
export type Appointment = Database['public']['Tables']['appointments']['Row']
export type IntakeForm = Database['public']['Tables']['intake_forms']['Row']
export type TreatmentPlan = Database['public']['Tables']['treatment_plans']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type WaitlistEntry = Database['public']['Tables']['waitlist']['Row']
export type OutcomeMeasure = Database['public']['Tables']['outcome_measures']['Row']
export type PracticeSettings = Database['public']['Tables']['practice_settings']['Row']
export type Profession = Database['public']['Tables']['professions']['Row']
export type AuditLog = Database['public']['Tables']['audit_log']['Row']
export type TherapistCheckin = Database['public']['Tables']['therapist_checkins']['Row']

// ── INSERT TYPES ───────────────────────────────────────────────────────────
export type NewClient = Database['public']['Tables']['clients']['Insert']
export type NewSessionNote = Database['public']['Tables']['session_notes']['Insert']
export type NewInvoice = Database['public']['Tables']['invoices']['Insert']
export type NewAppointment = Database['public']['Tables']['appointments']['Insert']
export type NewTreatmentPlan = Database['public']['Tables']['treatment_plans']['Insert']
export type NewWaitlistEntry = Database['public']['Tables']['waitlist']['Insert']
export type NewOutcomeMeasure = Database['public']['Tables']['outcome_measures']['Insert']
