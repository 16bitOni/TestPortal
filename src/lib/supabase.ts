import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Organization {
  id: string
  name: string
  created_at: string
}

export interface Admin {
  id: string
  admin_id: string
  password: string
  name: string
  organization_id: string
  role: 'owner' | 'admin' | 'member'
  invited_by?: string
  is_active: boolean
  created_at: string
}

export interface Student {
  id: string
  student_id: string
  password: string
  name: string
  exam_id: string
  created_at: string
}

export interface Exam {
  id: string
  title: string
  description: string
  admin_id: string
  organization_id: string
  duration_minutes: number
  is_active: boolean
  created_at: string
}

export interface Question {
  id: string
  exam_id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: 'A' | 'B' | 'C' | 'D'
  order_number: number
}

export interface StudentResult {
  id: string
  student_id: string
  exam_id: string
  score: number
  total_questions: number
  time_taken_minutes: number
  submitted_at: string
}