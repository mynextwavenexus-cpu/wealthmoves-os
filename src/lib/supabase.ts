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
}

export interface SystemRow {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  description: string;
  type: string;
  status: string;
  components: Array<{ id: string; label: string; completed: boolean }>;
  progress: number;
  metrics: Record<string, number>;
  created_at: string;
  updated_at: string;
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
