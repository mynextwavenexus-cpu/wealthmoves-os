"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { hasAccess, getUserTier, navigationItems } from "@/lib/access-control";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Sparkles,
  TrendingUp,
  Package,
  Settings2,
  Zap,
  Target,
  BookOpen,
  MessageSquare,
  GraduationCap,
  ExternalLink,
  Lock,
  LogOut,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const userTier = user?.tier;
  
  // Sync tier to localStorage when user changes
  React.useEffect(() => {
    if (user?.tier) {
      localStorage.setItem("wealthmoves_tier", user.tier);
    }
  }, [user?.tier]);

  // Map icon names to components
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    dashboard: LayoutDashboard,
    dreamLife: Sparkles,
    revenue: TrendingUp,
    offers: Package,
    systems: Settings2,
    aiCoach: MessageSquare,
    sprint: Target,
    resources: BookOpen,
  };

  return (
    <div className="w-64 bg-[#0F3F4C] flex flex-col h-screen overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#E4DCD1] rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-[#0F3F4C]" />
          </div>
          <span className="text-white font-bold text-lg">WealthMoves</span>
        </Link>
        <p className="text-white/50 text-xs mt-1">
          Dream. Plan. Build.
        </p>
        {user && (
          <div className="mt-3 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Membership</p>
            <p className="text-white font-semibold text-sm capitalize">
              {user.tier || 'Free'}
              {user.tier === 'sprint' && ' 🔥'}
              {user.tier === 'pro' && ' ⭐'}
              {user.tier === 'starter' && ' ✨'}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const hasFeatureAccess = user?.tier === "sprint" || hasAccess(item.requires, user?.tier || undefined);
          
          const Icon = iconMap[item.requires] || LayoutDashboard;
          
          if (!hasFeatureAccess) {
            return (
              <div
                key={item.name}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/30 cursor-not-allowed"
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
                <Lock className="w-3 h-3 ml-auto" />
              </div>
            );
          }
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade Link (show if not Sprint tier) */}
      {user && user.tier !== "sprint" && (
        <div className="p-4">
          <a
            href="https://dreamlife-blueprint.vercel.app/#pricing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700 transition-colors shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            Upgrade Now
            <ExternalLink className="w-3 h-3 ml-auto" />
          </a>
        </div>
      )}

      {/* CourseSprout Link */}
      <div className="p-4 border-t border-white/10">
        <a
          href="https://wealthmoves-pro.coursesprout.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors"
        >
          <GraduationCap className="w-5 h-5" />
          My Courses
          <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
        </a>
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors mt-1"
        >
          <Settings2 className="w-5 h-5" />
          Settings
        </Link>
        {!user ? (
          <Link
            href="/login"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors mt-1"
          >
            <Zap className="w-5 h-5" />
            Sign In
          </Link>
        ) : (
          <button
            onClick={() => {
              fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "logout" }),
              }).then(() => {
                localStorage.removeItem("wealthmoves_tier");
                localStorage.removeItem("wealthmoves_dreamlife");
                localStorage.removeItem("wealthmoves_chat_history");
                window.location.href = "/login";
              });
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors mt-1"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
}
