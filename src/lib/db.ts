// Database layer - uses Supabase for persistence with in-memory fallback

import { supabase, isSupabaseConfigured, BlueprintRow, SprintRow, SprintTaskRow, OfferRow, SystemRow } from "./supabase";

export interface Blueprint {
  id: string;
  userId: string;
  name: string;
  monthlyIncome: number;
  currentIncome: number;
  yearlyTarget: number;
  monthlyTarget: number;
  weeklyTarget: number;
  dailyTarget: number;
  hourlyTarget: number;
  homeCost: number;
  vehicleCost: number;
  travelCost: number;
  foodCost: number;
  trainerCost: number;
  chefCost: number;
  collegeCost: number;
  retirementCost: number;
  otherCost: number;
  otherDescription: string;
  skills: string;
  experience: string;
  passion: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sprint {
  id: string;
  userId: string;
  day: number;
  totalDays: number;
  startDate: Date;
  tasks: {
    id: string;
    label: string;
    completed: boolean;
    category: string;
  }[];
  revenueGenerated: number;
}

export interface Offer {
  id: string;
  userId: string;
  name: string;
  description: string;
  price: number;
  status: "draft" | "active" | "paused";
  revenueGenerated: number;
  createdAt: Date;
}

export interface SystemComponent {
  id: string;
  label: string;
  completed: boolean;
}

export interface System {
  id: string;
  userId: string;
  name: string;
  icon: string;
  description: string;
  type: "newsletter" | "coaching" | "course" | "consulting" | "affiliate" | "community";
  status: "planning" | "building" | "active";
  components: SystemComponent[];
  progress: number;
  metrics: {
    leads?: number;
    conversions?: number;
    revenue?: number;
    targetRevenue?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyStats {
  userId: string;
  date: string;
  newLeads: number;
  conversations: number;
  revenue: number;
  contentPublished: number;
  actionsCompleted: string[];
}

// In-memory fallback storage
class InMemoryStorage {
  blueprints: Map<string, Blueprint> = new Map();
  sprints: Map<string, Sprint> = new Map();
  offers: Map<string, Offer> = new Map();
  // REMOVED: systems map - never cache systems
  dailyStats: Map<string, DailyStats> = new Map();
  chatHistory: Map<string, { role: string; content: string; timestamp: Date }[]> = new Map();

  constructor() {
    // Start with empty data - no default/demo data
    // Each user starts fresh and builds their own blueprint
  }
}

const memoryStore = new InMemoryStorage();

// Supabase database operations
class Database {
  private useSupabase = isSupabaseConfigured();

  // Blueprint operations
  async getBlueprint(userId: string): Promise<Blueprint | null> {
    if (!this.useSupabase || !supabase) {
      return memoryStore.blueprints.get(userId) || null;
    }

    const { data, error } = await supabase
      .from("blueprints")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error || !data) return null;

    return this.mapBlueprintRow(data as BlueprintRow);
  }

  async saveBlueprint(userId: string, blueprint: Partial<Blueprint>): Promise<Blueprint> {
    if (!this.useSupabase || !supabase) {
      const existing = memoryStore.blueprints.get(userId);
      const updated: Blueprint = {
        id: existing?.id || `bp_${Date.now()}`,
        userId,
        name: blueprint.name ?? existing?.name ?? "",
        monthlyIncome: blueprint.monthlyIncome ?? existing?.monthlyIncome ?? 0,
        currentIncome: blueprint.currentIncome ?? existing?.currentIncome ?? 0,
        yearlyTarget: blueprint.yearlyTarget ?? existing?.yearlyTarget ?? 0,
        monthlyTarget: blueprint.monthlyTarget ?? existing?.monthlyTarget ?? 0,
        weeklyTarget: blueprint.weeklyTarget ?? existing?.weeklyTarget ?? 0,
        dailyTarget: blueprint.dailyTarget ?? existing?.dailyTarget ?? 0,
        hourlyTarget: blueprint.hourlyTarget ?? existing?.hourlyTarget ?? 0,
        homeCost: blueprint.homeCost ?? existing?.homeCost ?? 0,
        vehicleCost: blueprint.vehicleCost ?? existing?.vehicleCost ?? 0,
        travelCost: blueprint.travelCost ?? existing?.travelCost ?? 0,
        foodCost: blueprint.foodCost ?? existing?.foodCost ?? 0,
        trainerCost: blueprint.trainerCost ?? existing?.trainerCost ?? 0,
        chefCost: blueprint.chefCost ?? existing?.chefCost ?? 0,
        collegeCost: blueprint.collegeCost ?? existing?.collegeCost ?? 0,
        retirementCost: blueprint.retirementCost ?? existing?.retirementCost ?? 0,
        otherCost: blueprint.otherCost ?? existing?.otherCost ?? 0,
        otherDescription: blueprint.otherDescription ?? existing?.otherDescription ?? "",
        skills: blueprint.skills ?? existing?.skills ?? "",
        experience: blueprint.experience ?? existing?.experience ?? "",
        passion: blueprint.passion ?? existing?.passion ?? "",
        createdAt: existing?.createdAt ?? new Date(),
        updatedAt: new Date(),
      };
      memoryStore.blueprints.set(userId, updated);
      return updated;
    }

    const existing = await this.getBlueprint(userId);
    
    const row: Partial<BlueprintRow> = {
      user_id: userId,
      name: blueprint.name || existing?.name || "",
      monthly_income: blueprint.monthlyIncome ?? existing?.monthlyIncome ?? 0,
      current_income: blueprint.currentIncome ?? existing?.currentIncome ?? 0,
      yearly_target: blueprint.yearlyTarget ?? existing?.yearlyTarget ?? 0,
      monthly_target: blueprint.monthlyTarget ?? existing?.monthlyTarget ?? 0,
      weekly_target: blueprint.weeklyTarget ?? existing?.weeklyTarget ?? 0,
      daily_target: blueprint.dailyTarget ?? existing?.dailyTarget ?? 0,
      hourly_target: blueprint.hourlyTarget ?? existing?.hourlyTarget ?? 0,
      home_cost: blueprint.homeCost ?? existing?.homeCost ?? 0,
      vehicle_cost: blueprint.vehicleCost ?? existing?.vehicleCost ?? 0,
      travel_cost: blueprint.travelCost ?? existing?.travelCost ?? 0,
      food_cost: blueprint.foodCost ?? existing?.foodCost ?? 0,
      trainer_cost: blueprint.trainerCost ?? existing?.trainerCost ?? 0,
      chef_cost: blueprint.chefCost ?? existing?.chefCost ?? 0,
      college_cost: blueprint.collegeCost ?? existing?.collegeCost ?? 0,
      retirement_cost: blueprint.retirementCost ?? existing?.retirementCost ?? 0,
      other_cost: blueprint.otherCost ?? existing?.otherCost ?? 0,
      other_description: blueprint.otherDescription ?? existing?.otherDescription ?? "",
      skills: blueprint.skills ?? existing?.skills ?? "",
      experience: blueprint.experience ?? existing?.experience ?? "",
      passion: blueprint.passion ?? existing?.passion ?? "",
    };

    if (existing) {
      const { data, error } = await supabase
        .from("blueprints")
        .update(row)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return this.mapBlueprintRow(data as BlueprintRow);
    } else {
      const { data, error } = await supabase
        .from("blueprints")
        .insert(row)
        .select()
        .single();

      if (error) throw error;
      return this.mapBlueprintRow(data as BlueprintRow);
    }
  }

  private mapBlueprintRow(row: BlueprintRow): Blueprint {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      monthlyIncome: row.monthly_income,
      currentIncome: row.current_income,
      yearlyTarget: row.yearly_target,
      monthlyTarget: row.monthly_target,
      weeklyTarget: row.weekly_target,
      dailyTarget: row.daily_target,
      hourlyTarget: row.hourly_target,
      homeCost: row.home_cost,
      vehicleCost: row.vehicle_cost,
      travelCost: row.travel_cost,
      foodCost: row.food_cost,
      trainerCost: row.trainer_cost,
      chefCost: row.chef_cost,
      collegeCost: row.college_cost,
      retirementCost: row.retirement_cost,
      otherCost: row.other_cost,
      otherDescription: row.other_description,
      skills: row.skills,
      experience: row.experience,
      passion: row.passion,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  // Sprint operations
  async getSprint(userId: string): Promise<Sprint | null> {
    if (!this.useSupabase || !supabase) {
      return memoryStore.sprints.get(userId) || null;
    }

    const { data: sprintData, error: sprintError } = await supabase
      .from("sprints")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (sprintError || !sprintData) return null;

    const { data: tasksData } = await supabase
      .from("sprint_tasks")
      .select("*")
      .eq("sprint_id", (sprintData as SprintRow).id);

    return {
      id: (sprintData as SprintRow).id,
      userId: (sprintData as SprintRow).user_id,
      day: (sprintData as SprintRow).day,
      totalDays: (sprintData as SprintRow).total_days,
      startDate: new Date((sprintData as SprintRow).start_date),
      tasks: tasksData?.map((t: SprintTaskRow) => ({
        id: t.id,
        label: t.label,
        completed: t.completed,
        category: t.category,
      })) || [],
      revenueGenerated: (sprintData as SprintRow).revenue_generated,
    };
  }

  private generateDefaultSprintTasks() {
    return [
      { id: "outreach", label: "Outreach to 3 prospects", completed: false, category: "sales" },
      { id: "content", label: "Create 1 piece of content", completed: false, category: "content" },
      { id: "followup", label: "Follow up with leads", completed: false, category: "sales" },
      { id: "offers", label: "Make 1 offer presentation", completed: false, category: "sales" },
      { id: "revenue", label: "Track revenue metrics", completed: false, category: "analytics" },
    ];
  }

  private initializeDemoOffers(userId: string): Offer[] {
    const demoOffers: Offer[] = [
      {
        id: `offer_revenue_${Date.now()}`,
        userId,
        name: "Revenue Sprint Coaching",
        description: "30-day intensive coaching program to help entrepreneurs hit their first $10K month",
        price: 297,
        status: "active",
        revenueGenerated: 2970,
        createdAt: new Date(),
      },
      {
        id: `offer_consulting_${Date.now()}`,
        userId,
        name: "Business Systems Consulting",
        description: "High-ticket consulting for building automated revenue systems",
        price: 5000,
        status: "active",
        revenueGenerated: 15000,
        createdAt: new Date(),
      },
    ];

    // Store in memory
    demoOffers.forEach(offer => memoryStore.offers.set(offer.id, offer));
    return demoOffers;
  }

  async updateSprint(userId: string, updates: Partial<Sprint>): Promise<Sprint> {
    if (!this.useSupabase || !supabase) {
      const existing = memoryStore.sprints.get(userId);
      if (!existing) {
        const newSprint: Sprint = {
          id: `sprint_${Date.now()}`,
          userId,
          day: updates.day || 1,
          totalDays: updates.totalDays || 30,
          startDate: updates.startDate || new Date(),
          tasks: updates.tasks || this.generateDefaultSprintTasks(),
          revenueGenerated: updates.revenueGenerated || 0,
        };
        memoryStore.sprints.set(userId, newSprint);
        return newSprint;
      }
      const updated = { ...existing, ...updates };
      memoryStore.sprints.set(userId, updated);
      return updated;
    }

    const existing = await this.getSprint(userId);
    
    if (existing) {
      const { data, error } = await supabase
        .from("sprints")
        .update({
          day: updates.day ?? existing.day,
          total_days: updates.totalDays ?? existing.totalDays,
          revenue_generated: updates.revenueGenerated ?? existing.revenueGenerated,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return this.getSprint(userId) as Promise<Sprint>;
    } else {
      const { data, error } = await supabase
        .from("sprints")
        .insert({
          user_id: userId,
          day: updates.day || 1,
          total_days: updates.totalDays || 30,
          start_date: updates.startDate?.toISOString() || new Date().toISOString(),
          revenue_generated: updates.revenueGenerated || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return this.getSprint(userId) as Promise<Sprint>;
    }
  }

  // Offer operations
  async getOffers(userId: string): Promise<Offer[]> {
    if (!this.useSupabase || !supabase) {
      const offers = Array.from(memoryStore.offers.values()).filter(o => o.userId === userId);
      
      // Initialize demo offers for demo user
      if (offers.length === 0 && userId === "demo_user") {
        return this.initializeDemoOffers(userId);
      }
      
      return offers;
    }

    const { data, error } = await supabase
      .from("offers")
      .select("*")
      .eq("user_id", userId);

    if (error || !data) return [];

    return (data as OfferRow[]).map(row => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      description: row.description,
      price: row.price,
      status: row.status as "draft" | "active" | "paused",
      revenueGenerated: row.revenue_generated,
      createdAt: new Date(row.created_at),
    }));
  }

  async createOffer(userId: string, offer: Partial<Offer>): Promise<Offer> {
    if (!this.useSupabase || !supabase) {
      const newOffer: Offer = {
        id: `offer_${Date.now()}`,
        userId,
        name: offer.name || "",
        description: offer.description || "",
        price: offer.price || 0,
        status: "draft",
        revenueGenerated: 0,
        createdAt: new Date(),
      };
      memoryStore.offers.set(newOffer.id, newOffer);
      return newOffer;
    }

    const { data, error } = await supabase
      .from("offers")
      .insert({
        user_id: userId,
        name: offer.name || "",
        description: offer.description || "",
        price: offer.price || 0,
        status: "draft",
        revenue_generated: 0,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: (data as OfferRow).id,
      userId: (data as OfferRow).user_id,
      name: (data as OfferRow).name,
      description: (data as OfferRow).description,
      price: (data as OfferRow).price,
      status: (data as OfferRow).status as "draft" | "active" | "paused",
      revenueGenerated: (data as OfferRow).revenue_generated,
      createdAt: new Date((data as OfferRow).created_at),
    };
  }

  // System operations - DEPRECATED: Systems are generated client-side only
  // This method returns empty array to force client-side generation
  async getSystems(userId: string): Promise<System[]> {
    // Systems are now generated client-side from blueprint
    // This prevents any cached/hardcoded data from being served
    return [];
  }

  async updateSystem(userId: string, systemId: string, updates: Partial<System>): Promise<System | null> {
    // Systems are client-side only - updates handled in browser
    return null;
  }

  // Stats operations
  async getWeeklyStats(userId: string): Promise<{ newLeads: number; conversations: number; revenue: number; contentPublished: number }> {
    if (!this.useSupabase || !supabase) {
      return { newLeads: 0, conversations: 0, revenue: 0, contentPublished: 0 };
    }

    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data, error } = await supabase
      .from("daily_stats")
      .select("*")
      .eq("user_id", userId)
      .gte("date", weekAgo.toISOString().split("T")[0])
      .lte("date", today.toISOString().split("T")[0]);

    if (error || !data) {
      return { newLeads: 0, conversations: 0, revenue: 0, contentPublished: 0 };
    }

    return data.reduce((acc: { newLeads: number; conversations: number; revenue: number; contentPublished: number }, stat: { new_leads?: number; conversations?: number; revenue?: number; content_published?: number }) => ({
      newLeads: acc.newLeads + (stat.new_leads || 0),
      conversations: acc.conversations + (stat.conversations || 0),
      revenue: acc.revenue + (stat.revenue || 0),
      contentPublished: acc.contentPublished + (stat.content_published || 0),
    }), { newLeads: 0, conversations: 0, revenue: 0, contentPublished: 0 });
  }

  // Chat history operations
  async getChatHistory(userId: string): Promise<{ role: string; content: string; timestamp: Date }[]> {
    if (!this.useSupabase || !supabase) {
      return memoryStore.chatHistory.get(userId) || [];
    }

    const { data, error } = await supabase
      .from("chat_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error || !data) return [];

    return data.map((row: { role: string; content: string; created_at: string }) => ({
      role: row.role,
      content: row.content,
      timestamp: new Date(row.created_at),
    }));
  }

  async addChatMessage(userId: string, message: { role: string; content: string }): Promise<void> {
    if (!this.useSupabase || !supabase) {
      const history = memoryStore.chatHistory.get(userId) || [];
      history.push({
        role: message.role,
        content: message.content,
        timestamp: new Date(),
      });
      memoryStore.chatHistory.set(userId, history);
      return;
    }

    await supabase
      .from("chat_history")
      .insert({
        user_id: userId,
        role: message.role,
        content: message.content,
      });
  }
}

export const db = new Database();
