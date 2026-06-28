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
    <div className="space-y-6">
      {/* Data Source Banner */}
      {dataSource === 'localStorage' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <div className="text-amber-600 text-lg">⚠️</div>
          <div className="flex-1">
            <p className="text-amber-800 font-medium">Using locally saved data</p>
            <p className="text-amber-700 text-sm">
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
        <h1 className="heading-xl mb-2">
          {user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : "Welcome to WealthMoves"}
        </h1>
        <p className="body-lg">
          {user?.name 
            ? "You're making great progress toward your dream life. Here's what's next."
            : "Start by creating your dream life blueprint to unlock your personalized dashboard."}
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Income Target */}
        <Card className="card-wealth">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#AFA496] flex items-center gap-2">
              <Target className="w-4 h-4" />
              Monthly Income Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#0F3F4C]">
              ${stats?.monthlyIncomeGoal ? stats.monthlyIncomeGoal.toLocaleString() : "0"}
            </div>
            <p className="text-sm text-[#AFA496] mt-1">
              ${stats?.currentIncome ? stats.currentIncome.toLocaleString() : "0"} current
            </p>
            <Progress value={stats?.incomeProgress || 0} className="mt-3 h-2" />
            {!stats?.monthlyIncomeGoal && (
              <Link href="/dream-life">
                <Button variant="outline" size="sm" className="mt-3 w-full">
                  Set Your Goal
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Dream Progress */}
        <Card className="card-wealth">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#AFA496] flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Dream Life Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#0F3F4C]">
              {stats?.blueprintProgress ? `${stats.blueprintProgress}%` : "—"}
            </div>
            <p className="text-sm text-[#AFA496] mt-1">
              {stats?.blueprintProgress ? "Blueprint complete" : "No blueprint yet"}
            </p>
            <Progress value={stats?.blueprintProgress || 0} className="mt-3 h-2" />
            {!stats?.blueprintProgress && (
              <Link href="/dream-life">
                <Button variant="outline" size="sm" className="mt-3 w-full">
                  Create Blueprint
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Sprint Status */}
        <Card className={`card-wealth ${!canAccessSprint ? 'opacity-60' : ''}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#AFA496] flex items-center gap-2">
              <Zap className="w-4 h-4" />
              30-Day Sprint
              {!canAccessSprint && <Lock className="w-3 h-3 ml-auto" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {canAccessSprint && sprint ? (
              <>
                <div className="text-3xl font-bold text-[#0F3F4C]">Day {sprint.day}</div>
                <p className="text-sm text-[#AFA496] mt-1">{sprint.daysRemaining} days remaining</p>
                <div className="flex gap-1 mt-3">
                  {[...Array(sprint.day)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-[#0F3F4C]"
                    />
                  ))}
                  {[...Array(sprint.totalDays - sprint.day)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-[#E4DCD1]"
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="text-3xl font-bold text-[#AFA496]">—</div>
                <p className="text-sm text-[#AFA496] mt-1">Sprint members only</p>
                <p className="text-xs text-[#AFA496] mt-2">Join Sprint for $297</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Revenue Score */}
        <Card className="card-wealth">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#AFA496] flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Revenue Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#0F3F4C]">
              {stats?.revenueScore ? `${stats.revenueScore}/100` : "—"}
            </div>
            <p className="text-sm text-[#AFA496] mt-1">
              {stats?.revenueScore ? "Based on your activity" : "Start tracking your revenue"}
            </p>
            {stats?.revenueScore ? (
              <Badge className="mt-3 bg-green-100 text-green-700 hover:bg-green-100">
                Strong momentum
              </Badge>
            ) : (
              <Link href="/revenue">
                <Button variant="outline" size="sm" className="mt-3 w-full">
                  Start Tracking
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Daily Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Next Best Action */}
          {nextAction && (
            <Card className="bg-[#0F3F4C] text-white border-none">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className="bg-white/20 text-white mb-3">
                      Next Best Action
                    </Badge>
                    <h3 className="text-xl font-semibold mb-2">{nextAction.title}</h3>
                    <p className="text-white/70 mb-4 max-w-lg">{nextAction.description}</p>
                    <Link href={nextAction.link}>
                      <Button className="bg-white text-[#0F3F4C] hover:bg-[#E4DCD1]">
                        {nextAction.cta}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                  <div className="hidden md:block w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-12 h-12 text-white/50" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Daily Checklist */}
          <Card className="card-wealth">
            <CardHeader>
              <CardTitle className="heading-lg">Today's Actions</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.monthlyIncomeGoal ? (
                <div className="space-y-4">
                  {[
                    { label: "Outreach to 3 prospects", completed: false },
                    { label: "Create 1 piece of content", completed: false },
                    { label: "Follow up with leads", completed: false },
                    { label: "Review and refine offer", completed: false },
                    { label: "Track revenue metrics", completed: false },
                  ].map((action, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#E4DCD1]/30 transition-colors cursor-pointer"
                    >
                      {action.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#AFA496]" />
                      )}
                      <span
                        className={`flex-1 ${
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
                <div className="text-center py-8">
                  <p className="text-[#AFA496] mb-4">Complete your dream life blueprint to get personalized daily actions.</p>
                  <Link href="/dream-life">
                    <Button className="bg-[#0F3F4C] hover:bg-[#0a2f39]">
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
        <div className="space-y-6">
          <Card className="card-wealth">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-[#0F3F4C]" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {canAccessSystems ? (
                  <div className="p-4 bg-[#E4DCD1]/30 rounded-lg">
                    <h4 className="font-medium text-[#0F3F4C] mb-1">
                      Build Your Newsletter System
                    </h4>
                    <p className="text-sm text-[#AFA496]">
                      Based on your skills assessment, a newsletter could generate $3-5K/month within 90 days.
                    </p>
                    <Link href="/systems">
                      <Button
                        variant="link"
                        className="p-0 h-auto text-[#0F3F4C] font-medium mt-2"
                      >
                        Explore System →
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="p-4 bg-[#E4DCD1]/50 rounded-lg border border-[#AFA496]/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Lock className="w-4 h-4 text-[#0F3F4C]" />
                      <h4 className="font-medium text-[#0F3F4C]">System Builder</h4>
                    </div>
                    <p className="text-sm text-[#0F3F4C]/80">
                      Upgrade to Pro to access revenue system templates.
                    </p>
                  </div>
                )}

                {canAccessOffers ? (
                  <div className="p-4 bg-[#E4DCD1]/30 rounded-lg">
                    <h4 className="font-medium text-[#0F3F4C] mb-1">
                      Refine Your Core Offer
                    </h4>
                    <p className="text-sm text-[#AFA496]">
                      Your current offer pricing is 40% below market rate. Consider raising prices.
                    </p>
                    <Link href="/offers">
                      <Button
                        variant="link"
                        className="p-0 h-auto text-[#0F3F4C] font-medium mt-2"
                      >
                        Review Offers →
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="p-4 bg-[#E4DCD1]/50 rounded-lg border border-[#AFA496]/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Lock className="w-4 h-4 text-[#0F3F4C]" />
                      <h4 className="font-medium text-[#0F3F4C]">Offer Builder</h4>
                    </div>
                    <p className="text-sm text-[#0F3F4C]/80">
                      Upgrade to Pro to create and manage offers.
                    </p>
                  </div>
                )}

                <div className="p-4 bg-[#E4DCD1]/30 rounded-lg">
                  <h4 className="font-medium text-[#0F3F4C] mb-1">
                    Join the Community
                  </h4>
                  <p className="text-sm text-[#AFA496]">
                    12 new members joined this week. Network with other builders.
                  </p>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-[#0F3F4C] font-medium mt-2"
                  >
                    Join Now →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="card-wealth">
            <CardHeader>
              <CardTitle className="text-base">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#AFA496]">New Leads</span>
                  <span className="font-medium text-[#0F3F4C]">{weeklyStats?.newLeads ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#AFA496]">Conversations</span>
                  <span className="font-medium text-[#0F3F4C]">{weeklyStats?.conversations ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#AFA496]">Revenue</span>
                  <span className="font-medium text-[#0F3F4C]">${weeklyStats?.revenue ? weeklyStats.revenue.toLocaleString() : "0"}</span>
                </div>
                <div className="flex justify-between">
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
