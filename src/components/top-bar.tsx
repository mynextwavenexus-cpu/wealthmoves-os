"use client";

import { Bell, User, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopBar() {
  const router = useRouter();

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
            <p className="text-lg font-semibold text-[#0F3F4C]">$20,700</p>
          </div>
        </div>
        
        <div className="h-8 w-px bg-[#E4DCD1]" />
        
        <div>
          <p className="text-xs text-[#AFA496] uppercase tracking-wide">Progress</p>
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-[#E4DCD1] rounded-full overflow-hidden">
              <div className="w-[35%] h-full bg-[#0F3F4C] rounded-full" />
            </div>
            <span className="text-sm font-medium text-[#0F3F4C]">35%</span>
          </div>
        </div>
      </div>

      {/* Right - Notifications & Profile */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-[#AFA496]" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-[#0F3F4C] text-white text-sm">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <a href="https://wealthmoves-pro.coursesprout.com" target="_blank" rel="noopener noreferrer" className="w-full">
                My Courses
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Preferences</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}