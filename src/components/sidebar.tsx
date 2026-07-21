"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { hasAccess, navigationItems } from "@/lib/access-control";
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
  X,
  Menu,
} from "lucide-react";

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Sync external isOpen state with internal state
  React.useEffect(() => {
    if (isOpen !== undefined) {
      setIsMobileOpen(isOpen);
    }
  }, [isOpen]);
  
  // Handle close
  const handleClose = () => {
    setIsMobileOpen(false);
    onClose?.();
  };

  // Sync tier to localStorage when user changes
  React.useEffect(() => {
    if (user?.tier) {
      localStorage.setItem("wealthmoves_tier", user.tier);
    }
  }, [user?.tier]);

  // Close sidebar on route change
  React.useEffect(() => {
    handleClose();
  }, [pathname]);

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
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={handleClose}
        />
      )}
      
      {/* Sidebar - Always overlay, never takes up layout space */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-[280px] md:w-64 bg-[#0F3F4C] flex flex-col h-screen overflow-y-auto transition-transform duration-300 ease-in-out",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Close button for desktop */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 md:hidden text-white/60 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
        {/* Logo */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#E4DCD1] rounded-lg flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-[#0F3F4C]" />
            </div>
            <span className="text-white font-bold text-lg">WealthMoves</span>
          </Link>
          {/* Close button for mobile */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-white/50 text-xs px-4 mt-3 shrink-0">
          Dream. Plan. Build.
        </p>
        
        {user && (
          <div className="mx-4 mt-3 px-3 py-2 bg-white/5 rounded-lg border border-white/10 shrink-0">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Membership</p>
            <p className="text-white font-semibold text-sm capitalize">
              {user.tier || 'Free'}
              {user.tier === 'sprint' && ' 🔥'}
              {user.tier === 'pro' && ' ⭐'}
              {user.tier === 'starter' && ' ✨'}
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto min-h-0">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const hasFeatureAccess = user?.tier === "sprint" || hasAccess(item.requires, user?.tier || undefined);
            
            const Icon = iconMap[item.requires] || LayoutDashboard;
            
            if (!hasFeatureAccess) {
              return (
                <div
                  key={item.name}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/30 cursor-not-allowed min-h-[48px]"
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                  <Lock className="w-3 h-3 ml-auto shrink-0" />
                </div>
              );
            }
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[48px]",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Upgrade Link (show if not Sprint tier) */}
        {user && user.tier !== "sprint" && (
          <div className="p-4 shrink-0">
            <a
              href={`${process.env.NEXT_PUBLIC_SALES_PAGE_URL || "/"}#pricing`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700 transition-colors shadow-lg min-h-[48px]"
            >
              <Sparkles className="w-5 h-5 shrink-0" />
              <span>Upgrade Now</span>
              <ExternalLink className="w-3 h-3 ml-auto shrink-0" />
            </a>
          </div>
        )}

        {/* Bottom Links */}
        <div className="p-4 border-t border-white/10 space-y-1 shrink-0">
          <a
            href={process.env.NEXT_PUBLIC_COURSESPROUT_URL || "https://wealthmoves-pro.coursesprout.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors min-h-[48px]"
          >
            <GraduationCap className="w-5 h-5 shrink-0" />
            <span>My Courses</span>
            <ExternalLink className="w-3 h-3 ml-auto shrink-0 opacity-50" />
          </a>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors min-h-[48px]"
          >
            <Settings2 className="w-5 h-5 shrink-0" />
            <span>Settings</span>
          </Link>
          {!user ? (
            <Link
              href="/login"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors min-h-[48px]"
            >
              <Zap className="w-5 h-5 shrink-0" />
              <span>Sign In</span>
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
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors min-h-[48px]"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Menu Toggle Button - Fixed position */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-3 left-3 z-30 md:hidden p-2.5 bg-[#0F3F4C] rounded-lg shadow-lg active:scale-95 transition-transform"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-white" />
      </button>
    </>
  );
}
