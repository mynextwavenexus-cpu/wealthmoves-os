"use client";

import { Bell, TrendingUp, Menu } from "lucide-react";
import { useDashboard } from "@/lib/data-context";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const { dashboard } = useDashboard();

  const monthlyGoal = dashboard?.stats?.monthlyIncomeGoal || 0;
  const currentIncome = dashboard?.stats?.currentIncome || 0;
  const progress = dashboard?.stats?.incomeProgress || 0;

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-[#E4DCD1] flex items-center justify-between px-3 sm:px-4 md:px-6 shrink-0">
      {/* Left - Menu + Revenue Goal */}
      <div className="flex items-center gap-2 sm:gap-4 md:gap-6 overflow-hidden min-w-0">
        {/* Hamburger Menu */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-10 w-10 rounded-lg hover:bg-[#E4DCD1]/50"
        >
          <Menu className="w-5 h-5 text-[#0F3F4C]" />
        </Button>
        
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-[#0F3F4C]/10 rounded-lg flex items-center justify-center shrink-0">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#0F3F4C]" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-[#AFA496] uppercase tracking-wide">Monthly Goal</p>
            <p className="text-sm sm:text-base md:text-lg font-semibold text-[#0F3F4C] truncate">
              {monthlyGoal > 0 ? `$${monthlyGoal.toLocaleString()}` : "Not set"}
            </p>
          </div>
        </div>
        
        <div className="hidden sm:block h-6 sm:h-8 w-px bg-[#E4DCD1] shrink-0" />
        
        <div className="hidden sm:block min-w-0">
          <p className="text-[10px] sm:text-xs text-[#AFA496] uppercase tracking-wide">Progress</p>
          <div className="flex items-center gap-2">
            <div className="w-16 sm:w-20 md:w-32 h-1.5 sm:h-2 bg-[#E4DCD1] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#0F3F4C] rounded-full transition-all" 
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <span className="text-xs sm:text-sm font-medium text-[#0F3F4C] shrink-0">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Right - Notifications */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-4 shrink-0">
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-lg hover:bg-[#E4DCD1]/50"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-[#AFA496]" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
        </Button>
      </div>
    </header>
  );
}
