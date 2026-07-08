"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  Sparkles, 
  TrendingUp, 
  Package, 
  Target,
  DollarSign,
  Users,
  FileText,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

interface DashboardStats {
  weeklyRevenue: number;
  newLeads: number;
  conversations: number;
  contentPublished: number;
  activeSprint: {
    day: number;
    totalDays: number;
    tasksCompleted: number;
    totalTasks: number;
  } | null;
  blueprint: {
    monthlyTarget: number;
    currentIncome: number;
    gap: number;
  } | null;
  activeOffers: number;
  activeSystems: number;
}

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      loadDashboardStats();
    }
  }, [user]);

  async function loadDashboardStats() {
    try {
      setLoadingStats(true);
      
      // Fetch all dashboard data
      const [blueprintRes, sprintRes, offersRes, systemsRes] = await Promise.all([
        fetch("/api/blueprint"),
        fetch("/api/sprint"),
        fetch("/api/offers"),
        fetch("/api/systems"),
      ]);

      const blueprint = blueprintRes.ok ? await blueprintRes.json() : null;
      const sprint = sprintRes.ok ? await sprintRes.json() : null;
      const offers = offersRes.ok ? await offersRes.json() : [];
      const systems = systemsRes.ok ? await systemsRes.json() : [];

      setStats({
        weeklyRevenue: sprint?.revenueGenerated || 0,
        newLeads: 0, // Will be populated from daily stats
        conversations: 0,
        contentPublished: 0,
        activeSprint: sprint ? {
          day: sprint.day,
          totalDays: sprint.totalDays,
          tasksCompleted: sprint.tasks?.filter((t: any) => t.completed).length || 0,
          totalTasks: sprint.tasks?.length || 0,
        } : null,
        blueprint: blueprint ? {
          monthlyTarget: blueprint.monthlyTarget,
          currentIncome: blueprint.currentIncome,
          gap: blueprint.monthlyTarget - blueprint.currentIncome,
        } : null,
        activeOffers: offers.filter((o: any) => o.status === "active").length,
        activeSystems: systems.filter((s: any) => s.status === "active").length,
      });
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
    } finally {
      setLoadingStats(false);
    }
  }

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F3F4C]"></div>
      </div>
    );
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#0F3F4C]">
          {greeting()}, {user.name?.split(" ")[0] || "there"}! 👋
        </h1>
        <p className="text-[#0F3F4C]/60 mt-1">
          Here's your revenue operating system overview
        </p>
      </div>

      {/* Quick Stats Grid */}
      {loadingStats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-[#0F3F4C]/10 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Weekly Revenue */}
          <div className="bg-white rounded-xl p-6 border border-[#0F3F4C]/10 hover:border-[#0F3F4C]/30 transition-colors">
            <div className="flex items-center gap-2 text-[#0F3F4C]/60 text-sm mb-2">
              <DollarSign className="w-4 h-4" />
              <span>Weekly Revenue</span>
            </div>
            <div className="text-3xl font-bold text-[#0F3F4C]">
              ${stats?.weeklyRevenue.toLocaleString() || 0}
            </div>
          </div>

          {/* Active Offers */}
          <div className="bg-white rounded-xl p-6 border border-[#0F3F4C]/10 hover:border-[#0F3F4C]/30 transition-colors">
            <div className="flex items-center gap-2 text-[#0F3F4C]/60 text-sm mb-2">
              <Package className="w-4 h-4" />
              <span>Active Offers</span>
            </div>
            <div className="text-3xl font-bold text-[#0F3F4C]">
              {stats?.activeOffers || 0}
            </div>
          </div>

          {/* Active Systems */}
          <div className="bg-white rounded-xl p-6 border border-[#0F3F4C]/10 hover:border-[#0F3F4C]/30 transition-colors">
            <div className="flex items-center gap-2 text-[#0F3F4C]/60 text-sm mb-2">
              <TrendingUp className="w-4 h-4" />
              <span>Active Systems</span>
            </div>
            <div className="text-3xl font-bold text-[#0F3F4C]">
              {stats?.activeSystems || 0}
            </div>
          </div>

          {/* New Leads */}
          <div className="bg-white rounded-xl p-6 border border-[#0F3F4C]/10 hover:border-[#0F3F4C]/30 transition-colors">
            <div className="flex items-center gap-2 text-[#0F3F4C]/60 text-sm mb-2">
              <Users className="w-4 h-4" />
              <span>New Leads (7d)</span>
            </div>
            <div className="text-3xl font-bold text-[#0F3F4C]">
              {stats?.newLeads || 0}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blueprint Status */}
        {stats?.blueprint ? (
          <div className="bg-gradient-to-br from-[#0F3F4C] to-[#0F3F4C]/80 rounded-xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Dream Life Blueprint</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-sm opacity-80">Monthly Target</div>
                <div className="text-2xl font-bold">
                  ${stats.blueprint.monthlyTarget.toLocaleString()}/mo
                </div>
              </div>
              <div>
                <div className="text-sm opacity-80">Current Income</div>
                <div className="text-xl font-semibold">
                  ${stats.blueprint.currentIncome.toLocaleString()}/mo
                </div>
              </div>
              <div className="pt-3 border-t border-white/20">
                <div className="text-sm opacity-80">Gap to Close</div>
                <div className="text-2xl font-bold text-yellow-300">
                  ${stats.blueprint.gap.toLocaleString()}/mo
                </div>
              </div>
            </div>
            <button
              onClick={() => router.push("/dream-life")}
              className="mt-4 w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              View Blueprint
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 border border-[#0F3F4C]/10">
            <div className="flex items-center gap-2 mb-4 text-[#0F3F4C]">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Dream Life Blueprint</h3>
            </div>
            <p className="text-[#0F3F4C]/60 mb-4">
              Start by creating your dream life blueprint to calculate exactly what you need to earn.
            </p>
            <button
              onClick={() => router.push("/dream-life")}
              className="w-full bg-[#0F3F4C] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#0F3F4C]/90 transition-colors flex items-center justify-center gap-2"
            >
              Create Your Blueprint
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Sprint Status */}
        {stats?.activeSprint ? (
          <div className="bg-white rounded-xl p-6 border border-[#0F3F4C]/10">
            <div className="flex items-center gap-2 mb-4 text-[#0F3F4C]">
              <Target className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Active Sprint</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-[#0F3F4C]/60">Day Progress</span>
                  <span className="font-medium text-[#0F3F4C]">
                    Day {stats.activeSprint.day} of {stats.activeSprint.totalDays}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#0F3F4C] transition-all"
                    style={{ width: `${(stats.activeSprint.day / stats.activeSprint.totalDays) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-[#0F3F4C]/60">Tasks Completed</span>
                  <span className="font-medium text-[#0F3F4C]">
                    {stats.activeSprint.tasksCompleted} of {stats.activeSprint.totalTasks}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${(stats.activeSprint.tasksCompleted / stats.activeSprint.totalTasks) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() => router.push("/sprint")}
              className="mt-4 w-full bg-[#0F3F4C] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#0F3F4C]/90 transition-colors flex items-center justify-center gap-2"
            >
              Continue Sprint
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 border border-[#0F3F4C]/10">
            <div className="flex items-center gap-2 mb-4 text-[#0F3F4C]">
              <Target className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Revenue Sprint</h3>
            </div>
            <p className="text-[#0F3F4C]/60 mb-4">
              Launch a 30-day revenue sprint to build momentum and hit your first income goal.
            </p>
            <button
              onClick={() => router.push("/sprint")}
              className="w-full bg-[#0F3F4C] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#0F3F4C]/90 transition-colors flex items-center justify-center gap-2"
            >
              Start Your Sprint
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 border border-[#0F3F4C]/10">
        <h3 className="text-lg font-semibold text-[#0F3F4C] mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => router.push("/offers")}
            className="flex items-center gap-3 p-4 rounded-lg border border-[#0F3F4C]/10 hover:border-[#0F3F4C]/30 hover:bg-[#0F3F4C]/5 transition-colors text-left"
          >
            <Package className="w-5 h-5 text-[#0F3F4C]" />
            <div>
              <div className="font-medium text-[#0F3F4C]">Create Offer</div>
              <div className="text-xs text-[#0F3F4C]/60">Build new revenue stream</div>
            </div>
          </button>
          
          <button
            onClick={() => router.push("/systems")}
            className="flex items-center gap-3 p-4 rounded-lg border border-[#0F3F4C]/10 hover:border-[#0F3F4C]/30 hover:bg-[#0F3F4C]/5 transition-colors text-left"
          >
            <TrendingUp className="w-5 h-5 text-[#0F3F4C]" />
            <div>
              <div className="font-medium text-[#0F3F4C]">Build System</div>
              <div className="text-xs text-[#0F3F4C]/60">Automate revenue generation</div>
            </div>
          </button>
          
          <button
            onClick={() => router.push("/revenue")}
            className="flex items-center gap-3 p-4 rounded-lg border border-[#0F3F4C]/10 hover:border-[#0F3F4C]/30 hover:bg-[#0F3F4C]/5 transition-colors text-left"
          >
            <FileText className="w-5 h-5 text-[#0F3F4C]" />
            <div>
              <div className="font-medium text-[#0F3F4C]">Revenue Plan</div>
              <div className="text-xs text-[#0F3F4C]/60">Map your income strategy</div>
            </div>
          </button>
        </div>
      </div>

      {/* Tier Upgrade CTA (if not on Sprint tier) */}
      {user.tier !== "sprint" && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 text-white">
          <div className="flex items-start gap-4">
            <Sparkles className="w-8 h-8 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Unlock Full WealthMoves OS</h3>
              <p className="opacity-90 mb-4">
                Get access to AI coaching, automated systems, and advanced revenue strategies with Sprint tier.
              </p>
              <button
                onClick={() => window.open("https://dreamlife-blueprint.vercel.app/", "_blank")}
                className="bg-white text-[#0F3F4C] px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Upgrade to Sprint →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
