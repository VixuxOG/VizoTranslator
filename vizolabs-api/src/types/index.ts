export interface TranslationRequest {
  text: string
  source: string
  target: string
  context?: string
  industry?: string
  preserveFormat?: boolean
  tone?: 'formal' | 'casual' | 'technical'
  provider?: 'anthropic' | 'openai' | 'google'
}

export interface TranslationResponse {
  translation: string
  source: string
  target: string
  confidence: number
  provider: string
  tokens?: number
  cached?: boolean
}

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: 'user' | 'admin' | 'enterprise'
  settings: Record<string, unknown>
  created_at: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  description?: string
  logo_url?: string
  settings: Record<string, unknown>
  created_at: string
}

export interface Project {
  id: string
  name: string
  description?: string
  source_lang: string
  target_lang: string
  status: 'draft' | 'in_progress' | 'review' | 'completed' | 'cancelled'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  deadline?: string
  organization_id?: string
  created_by: string
  assigned_to?: string
  created_at: string
  updated_at: string
}

export interface GlossaryTerm {
  id: string
  glossary_id: string
  source_term: string
  target_term: string
  part_of_speech?: string
  notes?: string
  usage_examples?: string[]
}

export interface ApiKey {
  id: string
  name: string
  key_prefix: string
  permissions: string[]
  rate_limit: number
  usage_count: number
  is_active: boolean
  expires_at?: string
}

export interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  is_active: boolean
}

export interface Subscription {
  id: string
  plan: 'free' | 'starter' | 'pro' | 'enterprise'
  status: 'active' | 'cancelled' | 'past_due'
  current_period_end: string
}
