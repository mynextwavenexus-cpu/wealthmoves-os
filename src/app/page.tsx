"use client";

export const dynamic = 'force-dynamic';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UpgradeCard } from "@/components/upgrade-card";
import { hasAccess, getUserTier } from "@/lib/access-control";
import { useDashboard } from "@/lib/data-context";
import { useAuth } from "@/lib/auth-context";
import {
  TrendingUp,
  Target,
  Zap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Circle,
  Lightbulb,
  Lock,
  Loader2,
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const userTier = getUserTier();
  const canAccessOffers = hasAccess("offers");
  const canAccessSystems = hasAccess("systems");
  const canAccessSprint = hasAccess("sprint");
  const { dashboard, isLoading, dataSource } = useDashboard();
  const { user } = useAuth();

  const stats = dashboard?.stats;
  const sprint = dashboard?.sprint;
  const weeklyStats = dashboard?.weeklyStats;
  const nextAction = dashboard?.nextAction;

  if (isLoading || !dashboard) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F3F4C]" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Data Source Banner */}
      {dataSource === 'localStorage' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
          <div className="text-amber-600 text-base sm:text-lg shrink-0">⚠️</div>
          <div className="flex-1 min-w-0">
            <p className="text-amber-800 font-medium text-sm">Using locally saved data</p>
            <p className="text-amber-700 text-xs sm:text-sm">
              Your dream life blueprint is saved in this browser only. 
              <Link href="/dream-life" className="underline font-medium ml-1">
                Re-save to your account
              </Link> to sync across devices.
            </p>
          </div>
        </div>
      )}
      
      {/* Upgrade Banner */}
      <UpgradeCard />
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0F3F4C] mb-1 sm:mb-2">
          {user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : "Welcome to WealthMoves"}
        </h1>
        <p className="text-[#AFA496] text-sm sm:text-base">
          {user?.name 
            ? "You're making great progress toward your dream life. Here's what's next."
            : "Start by creating your dream life blueprint to unlock your personalized dashboard."}
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Income Target */}
        <Card className="bg-white rounded-xl shadow-sm border border-[#E4DCD1]">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-[#AFA496] flex items-center gap-1.5 sm:gap-2">
              <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="truncate">Monthly Goal</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0F3F4C]">
              ${stats?.monthlyIncomeGoal ? stats.monthlyIncomeGoal.toLocaleString() : "0"}
            </div>
            <p className="text-xs sm:text-sm text-[#AFA496] mt-1">
              ${stats?.currentIncome ? stats.currentIncome.toLocaleString() : "0"} current
            </p>
            <Progress value={stats?.incomeProgress || 0} className="mt-2 sm:mt-3 h-2" />
            {!stats?.monthlyIncomeGoal && (
              <Link href="/dream-life">
                <Button variant="outline" size="sm" className="mt-2 sm:mt-3 w-full min-h-[36px] text-xs sm:text-sm">
                  Set Your Goal
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Dream Progress */}
        <Card className="bg-white rounded-xl shadow-sm border border-[#E4DCD1]">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-[#AFA496] flex items-center gap-1.5 sm:gap-2">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="truncate">Dream Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0F3F4C]">
              {stats?.blueprintProgress ? `${stats.blueprintProgress}%` : "—"}
            </div>
            <p className="text-xs sm:text-sm text-[#AFA496] mt-1">
              {stats?.blueprintProgress ? "Blueprint complete" : "No blueprint yet"}
            </p>
            <Progress value={stats?.blueprintProgress || 0} className="mt-2 sm:mt-3 h-2" />
            {!stats?.blueprintProgress && (
              <Link href="/dream-life">
                <Button variant="outline" size="sm" className="mt-2 sm:mt-3 w-full min-h-[36px] text-xs sm:text-sm">
                  Create Blueprint
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Sprint Status */}
        <Card className={`bg-white rounded-xl shadow-sm border border-[#E4DCD1] ${!canAccessSprint ? 'opacity-60' : ''}`}>
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-[#AFA496] flex items-center gap-1.5 sm:gap-2">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="truncate">30-Day Sprint</span>
              {!canAccessSprint && <Lock className="w-3 h-3 ml-auto shrink-0" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {canAccessSprint && sprint ? (
              <>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0F3F4C]">Day {sprint.day}</div>
                <p className="text-xs sm:text-sm text-[#AFA496] mt-1">{sprint.daysRemaining} days remaining</p>
                <div className="flex flex-wrap gap-1 mt-2 sm:mt-3">
                  {[...Array(Math.min(sprint.day, 10))].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#0F3F4C]"
                    />
                  ))}
                  {sprint.day > 10 && <span className="text-xs text-[#AFA496]">+{sprint.day - 10}</span>}
                </div>
              </>
            ) : (
              <>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#AFA496]">—</div>
                <p className="text-xs sm:text-sm text-[#AFA496] mt-1">Sprint members only</p>
                <p className="text-[10px] sm:text-xs text-[#AFA496] mt-1 sm:mt-2">Join Sprint for $297</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Revenue Score */}
        <Card className="bg-white rounded-xl shadow-sm border border-[#E4DCD1] col-span-2 sm:col-span-1">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-[#AFA496] flex items-center gap-1.5 sm:gap-2">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="truncate">Revenue Score</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0F3F4C]">
              {stats?.revenueScore ? `${stats.revenueScore}/100` : "—"}
            </div>
            <p className="text-xs sm:text-sm text-[#AFA496] mt-1">
              {stats?.revenueScore ? "Based on your activity" : "Start tracking your revenue"}
            </p>
            {stats?.revenueScore ? (
              <Badge className="mt-2 sm:mt-3 bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                Strong momentum
              </Badge>
            ) : (
              <Link href="/revenue">
                <Button variant="outline" size="sm" className="mt-2 sm:mt-3 w-full min-h-[36px] text-xs sm:text-sm">
                  Start Tracking
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Daily Actions */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Next Best Action */}
          {nextAction && (
            <Card className="bg-[#0F3F4C] text-white border-none">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Badge className="bg-white/20 text-white mb-2 sm:mb-3 text-xs">
                      Next Best Action
                    </Badge>
                    <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">{nextAction.title}</h3>
                    <p className="text-white/70 mb-3 sm:mb-4 text-sm max-w-lg">{nextAction.description}</p>
                    <Link href={nextAction.link}>
                      <Button className="bg-white text-[#0F3F4C] hover:bg-[#E4DCD1] min-h-[44px]">
                        {nextAction.cta}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                  <div className="hidden sm:flex w-20 h-20 sm:w-24 sm:h-24 bg-white/10 rounded-2xl items-center justify-center shrink-0">
                    <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-white/50" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Daily Checklist */}
          <Card className="bg-white rounded-xl shadow-sm border border-[#E4DCD1]">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl font-semibold text-[#0F3F4C]">Today's Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {stats?.monthlyIncomeGoal ? (
                <div className="space-y-1 sm:space-y-2">
                  {[
                    { label: "Outreach to 3 prospects", completed: false },
                    { label: "Create 1 piece of content", completed: false },
                    { label: "Follow up with leads", completed: false },
                    { label: "Review and refine offer", completed: false },
                    { label: "Track revenue metrics", completed: false },
                  ].map((action, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-[#E4DCD1]/30 transition-colors cursor-pointer min-h-[44px]"
                    >
                      {action.completed ? (
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 sm:w-5 sm:h-5 text-[#AFA496] shrink-0" />
                      )}
                      <span
                        className={`flex-1 text-sm sm:text-base ${
                          action.completed
                            ? "text-[#AFA496] line-through"
                            : "text-[#0F3F4C]"
                        }`}
                      >
                        {action.label}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-[#AFA496] mb-4 text-sm">Complete your dream life blueprint to get personalized daily actions.</p>
                  <Link href="/dream-life">
                    <Button className="bg-[#0F3F4C] hover:bg-[#0a2f39] min-h-[44px]">
                      Start Blueprint
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - AI Recommendations */}
        <div className="space-y-4 sm:space-y-6">
          <Card className="bg-white rounded-xl shadow-sm border border-[#E4DCD1]">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-[#0F3F4C]" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-3 sm:space-y-4">
                {canAccessSystems ? (
                  <div className="p-3 sm:p-4 bg-[#E4DCD1]/30 rounded-lg">
                    <h4 className="font-medium text-[#0F3F4C] mb-1 text-sm sm:text-base">
                      Build Your Newsletter System
                    </h4>
                    <p className="text-xs sm:text-sm text-[#AFA496]">
                      Based on your skills assessment, a newsletter could generate $3-5K/month within 90 days.
                    </p>
                    <Link href="/systems">
                      <Button
                        variant="link"
                        className="p-0 h-auto text-[#0F3F4C] font-medium mt-2 text-sm"
                      >
                        Explore System →
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="p-3 sm:p-4 bg-[#E4DCD1]/50 rounded-lg border border-[#AFA496]/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Lock className="w-4 h-4 text-[#0F3F4C]" />
                      <h4 className="font-medium text-[#0F3F4C] text-sm sm:text-base">System Builder</h4>
                    </div>
                    <p className="text-xs sm:text-sm text-[#0F3F4C]/80">
                      Upgrade to Pro to access revenue system templates.
                    </p>
                  </div>
                )}

                {canAccessOffers ? (
                  <div className="p-3 sm:p-4 bg-[#E4DCD1]/30 rounded-lg">
                    <h4 className="font-medium text-[#0F3F4C] mb-1 text-sm sm:text-base">
                      Refine Your Core Offer
                    </h4>
                    <p className="text-xs sm:text-sm text-[#AFA496]">
                      Your current offer pricing is 40% below market rate. Consider raising prices.
                    </p>
                    <Link href="/offers">
                      <Button
                        variant="link"
                        className="p-0 h-auto text-[#0F3F4C] font-medium mt-2 text-sm"
                      >
                        Review Offers →
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="p-3 sm:p-4 bg-[#E4DCD1]/50 rounded-lg border border-[#AFA496]/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Lock className="w-4 h-4 text-[#0F3F4C]" />
                      <h4 className="font-medium text-[#0F3F4C] text-sm sm:text-base">Offer Builder</h4>
                    </div>
                    <p className="text-xs sm:text-sm text-[#0F3F4C]/80">
                      Upgrade to Pro to create and manage offers.
                    </p>
                  </div>
                )}

                <div className="p-3 sm:p-4 bg-[#E4DCD1]/30 rounded-lg">
                  <h4 className="font-medium text-[#0F3F4C] mb-1 text-sm sm:text-base">
                    Join the Community
                  </h4>
                  <p className="text-xs sm:text-sm text-[#AFA496]">
                    12 new members joined this week. Network with other builders.
                  </p>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-[#0F3F4C] font-medium mt-2 text-sm"
                  >
                    Join Now →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-white rounded-xl shadow-sm border border-[#E4DCD1]">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-sm sm:text-base">This Week</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#AFA496]">New Leads</span>
                  <span className="font-medium text-[#0F3F4C]">{weeklyStats?.newLeads ?? 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#AFA496]">Conversations</span>
                  <span className="font-medium text-[#0F3F4C]">{weeklyStats?.conversations ?? 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#AFA496]">Revenue</span>
                  <span className="font-medium text-[#0F3F4C]">${weeklyStats?.revenue ? weeklyStats.revenue.toLocaleString() : "0"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#AFA496]">Content Published</span>
                  <span className="font-medium text-[#0F3F4C]">{weeklyStats?.contentPublished ?? 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
