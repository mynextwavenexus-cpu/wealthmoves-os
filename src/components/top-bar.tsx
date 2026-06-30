"use client";

import { Bell, TrendingUp } from "lucide-react";
import { useDashboard } from "@/lib/data-context";
import { Button } from "@/components/ui/button";

export function TopBar() {
  const { dashboard } = useDashboard();

  const monthlyGoal = dashboard?.stats?.monthlyIncomeGoal || 0;
  const currentIncome = dashboard?.stats?.currentIncome || 0;
  const progress = dashboard?.stats?.incomeProgress || 0;

  return (
    <header className="h-16 bg-white border-b border-[#E4DCD1] flex items-center justify-between px-6">
      {/* Left - Revenue Goal */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0F3F4C]/10 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-[#0F3F4C]" />
          </div>
          <div>
            <p className="text-xs text-[#AFA496] uppercase tracking-wide">Monthly Goal</p>
            <p className="text-lg font-semibold text-[#0F3F4C]">
              {monthlyGoal > 0 ? `$${monthlyGoal.toLocaleString()}` : "Not set"}
            </p>
          </div>
        </div>
        
        <div className="h-8 w-px bg-[#E4DCD1]" />
        
        <div>
          <p className="text-xs text-[#AFA496] uppercase tracking-wide">Progress</p>
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-[#E4DCD1] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#0F3F4C] rounded-full transition-all" 
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <span className="text-sm font-medium text-[#0F3F4C]">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Right - Notifications */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-[#AFA496]" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </Button>
      </div>
    </header>
  );
}