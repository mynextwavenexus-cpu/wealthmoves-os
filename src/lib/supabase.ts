import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Check if we have valid credentials
const hasValidCredentials = supabaseUrl && supabaseAnonKey && 
  supabaseUrl.startsWith('http') && supabaseAnonKey.length > 20;

// Create Supabase client
export const supabase = hasValidCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // We're using JWT cookies
      },
    })
  : null;

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => hasValidCredentials && supabase !== null;

// Database types

export interface ProfileRow {
  id: string;
  email: string;
  name: string;
  tier: "starter" | "pro" | "sprint" | "admin";
  avatar_url: string | null;
  onboarding_completed: boolean;
  onboarding_step: number;
  preferences: Record<string, any>;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: "active" | "canceled" | "past_due" | "inactive" | "trialing";
  subscription_period_end: string | null;
  is_admin: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PasswordResetTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export interface PaymentRow {
  id: string;
  user_id: string;
  stripe_payment_intent_id: string | null;
  stripe_invoice_id: string | null;
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "refunded";
  description: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface BlueprintRow {
  id: string;
  user_id: string;
  name: string;
  monthly_income: number;
  current_income: number;
  yearly_target: number;
  monthly_target: number;
  weekly_target: number;
  daily_target: number;
  hourly_target: number;
  home_cost: number;
  vehicle_cost: number;
  travel_cost: number;
  food_cost: number;
  trainer_cost: number;
  chef_cost: number;
  college_cost: number;
  retirement_cost: number;
  other_cost: number;
  other_description: string;
  skills: string;
  experience: string;
  passion: string;
  created_at: string;
  updated_at: string;
}

export interface SprintRow {
  id: string;
  user_id: string;
  day: number;
  total_days: number;
  start_date: string;
  revenue_generated: number;
  created_at: string;
  updated_at: string;
}

export interface SprintTaskRow {
  id: string;
  sprint_id: string;
  label: string;
  completed: boolean;
  category: string;
  created_at: string;
}

export interface OfferRow {
  id: string;
  user_id: string;
  name: string;
  description: string;
  price: number;
  status: string;
  revenue_generated: number;
  created_at: string;
  updated_at: string;
  // Extended fields for offer builder
  type?: string;
  delivery_format?: string;
  target_audience?: string;
  key_benefits?: string[];
  deliverables?: string[];
  bonuses?: Array<{ name: string; description: string; value: number }>;
  guarantee?: {
    enabled: boolean;
    type: string;
    days: number;
    description: string;
  };
  urgency?: {
    enabled: boolean;
    type: string;
    description: string;
    spots?: number;
    deadline?: string;
  };
}

export interface DailyStatsRow {
  id: string;
  user_id: string;
  date: string;
  new_leads: number;
  conversations: number;
  revenue: number;
  content_published: number;
  actions_completed: string[];
  created_at: string;
}

export interface ChatHistoryRow {
  id: string;
  user_id: string;
  role: string;
  content: string;
  created_at: string;
}

// Type helpers for table names
export type Tables = {
  profiles: ProfileRow;
  password_reset_tokens: PasswordResetTokenRow;
  payments: PaymentRow;
  blueprints: BlueprintRow;
  sprints: SprintRow;
  sprint_tasks: SprintTaskRow;
  offers: OfferRow;
  daily_stats: DailyStatsRow;
  chat_history: ChatHistoryRow;
};