"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "@/lib/data-context";
import { RevenueRoadmap } from "@/components/revenue-roadmap";
import {
  TrendingUp,
  Target,
  Zap,
  ArrowRight,
  Star,
  Lightbulb,
  Loader2,
  Sparkles,
  Filter,
  Clock,
  DollarSign,
  BarChart3,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Opportunity {
  id: string;
  type: string;
  title: string;
  description: string;
  potential: {
    min: number;
    max: number;
    timeframe: string;
  };
  timeToFirstRevenue: {
    minDays: number;
    maxDays: number;
    display: string;
  };
  requiredSkills: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  startupCost: {
    min: number;
    max: number;
    display: string;
  };
  scalability: string;
  passiveIncomePotential: string;
  matchScore: number;
  matchReasons: string[];
  estimatedTimeline: string;
  recommendedFirstSteps: string[];
}

interface RevenuePlan {
  id: string;
  createdAt: string;
  summary: {
    incomeGoal: number;
    currentIncome: number;
    gapToClose: number;
    timeline: string;
  };
  recommendedStreams: {
    rank: number;
    opportunity: Opportunity;
    rationale: string;
    expectedRevenue: {
      month1: number;
      month3: number;
      month6: number;
    };
    priority: "primary" | "secondary" | "tertiary";
  }[];
  roadmap: {
    phase: string;
    duration: string;
    focus: string;
    milestones: string[];
    dailyActions: string[];
  }[];
  firstActions: {
    action: string;
    why: string;
    how: string;
    deadline: string;
  }[];
  metrics: {
    targetMonthlyRevenue: number;
    projectedMonth1Revenue: number;
    projectedMonth3Revenue: number;
    confidenceScore: number;
  };
}

interface RevenueTracking {
  streams: {
    id: string;
    name: string;
    type: string;
    monthlyRevenue: number;
    targetRevenue: number;
    progress: number;
  }[];
  totalRevenue: number;
  monthlyGoal: number;
  overallProgress: number;
}

export default function RevenuePage() {
  const { dashboard, isLoading } = useDashboard();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  const [revenuePlan, setRevenuePlan] = useState<RevenuePlan | null>(null);
  const [revenueTracking, setRevenueTracking] = useState<RevenueTracking | null>(null);
  const [isLoadingOpportunities, setIsLoadingOpportunities] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [exploringId, setExploringId] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [activeTab, setActiveTab] = useState<"opportunities" | "plan" | "tracking">("opportunities");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    maxTimeToRevenue: "",
    minIncomePotential: "",
    difficulty: [] as string[],
    maxStartupCost: "",
  });
  const [expandedOpp, setExpandedOpp] = useState<string | null>(null);

  const monthlyGoal = dashboard?.stats?.monthlyIncomeGoal || 0;
  const currentIncome = dashboard?.stats?.currentIncome || 0;
  const gap = monthlyGoal - currentIncome;
  const hasBlueprint = monthlyGoal > 0;

  // Fetch opportunities on load
  useEffect(() => {
    if (hasBlueprint) {
      fetchOpportunities();
      fetchRevenueTracking();
      
      // Check for saved plan
      const savedPlan = localStorage.getItem("revenue-plan");
      if (savedPlan) {
        try {
          setRevenuePlan(JSON.parse(savedPlan));
        } catch (e) {
          console.error("Failed to parse saved plan", e);
        }
      }
    }
  }, [hasBlueprint]);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [filters, opportunities]);

  const fetchOpportunities = async () => {
    setIsLoadingOpportunities(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.maxTimeToRevenue) queryParams.set("maxTimeToRevenue", filters.maxTimeToRevenue);
      if (filters.minIncomePotential) queryParams.set("minIncomePotential", filters.minIncomePotential);
      if (filters.difficulty.length > 0) queryParams.set("difficulty", filters.difficulty.join(","));
      if (filters.maxStartupCost) queryParams.set("maxStartupCost", filters.maxStartupCost);

      const res = await fetch(`/api/revenue/opportunities?${queryParams}`);
      if (res.ok) {
        const data = await res.json();
        setOpportunities(data.opportunities);
        setFilteredOpportunities(data.opportunities);
      }
    } catch (error) {
      console.error("Failed to fetch opportunities:", error);
    } finally {
      setIsLoadingOpportunities(false);
    }
  };

  const fetchRevenueTracking = async () => {
    // For now, use dashboard data
    // In a full implementation, this would call a dedicated API
    const mockTracking: RevenueTracking = {
      streams: [
        {
          id: "1",
          name: "Coaching & Consulting",
          type: "coaching-consulting",
          monthlyRevenue: currentIncome * 0.6,
          targetRevenue: monthlyGoal * 0.5,
          progress: Math.round(((currentIncome * 0.6) / (monthlyGoal * 0.5)) * 100),
        },
        {
          id: "2",
          name: "Digital Products",
          type: "digital-products",
          monthlyRevenue: currentIncome * 0.3,
          targetRevenue: monthlyGoal * 0.3,
          progress: Math.round(((currentIncome * 0.3) / (monthlyGoal * 0.3)) * 100),
        },
        {
          id: "3",
          name: "Affiliate Marketing",
          type: "affiliate-marketing",
          monthlyRevenue: currentIncome * 0.1,
          targetRevenue: monthlyGoal * 0.2,
          progress: Math.round(((currentIncome * 0.1) / (monthlyGoal * 0.2)) * 100),
        },
      ],
      totalRevenue: currentIncome,
      monthlyGoal: monthlyGoal,
      overallProgress: Math.round((currentIncome / monthlyGoal) * 100),
    };
    setRevenueTracking(mockTracking);
  };

  const generateAIPlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const res = await fetch("/api/revenue/ai-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        const data = await res.json();
        setRevenuePlan(data.plan);
        localStorage.setItem("revenue-plan", JSON.stringify(data.plan));
        setActiveTab("plan");
      }
    } catch (error) {
      console.error("Failed to generate plan:", error);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...opportunities];

    if (filters.maxTimeToRevenue) {
      filtered = filtered.filter(o => o.timeToFirstRevenue.maxDays <= parseInt(filters.maxTimeToRevenue));
    }
    if (filters.minIncomePotential) {
      filtered = filtered.filter(o => o.potential.max >= parseInt(filters.minIncomePotential));
    }
    if (filters.difficulty.length > 0) {
      filtered = filtered.filter(o => filters.difficulty.includes(o.difficulty));
    }
    if (filters.maxStartupCost) {
      filtered = filtered.filter(o => o.startupCost.max <= parseInt(filters.maxStartupCost));
    }

    setFilteredOpportunities(filtered);
  };

  const handleExplore = async (opportunity: Opportunity) => {
    setExploringId(opportunity.id);
    setShowChat(true);

    const message = `I want to explore the "${opportunity.title}" opportunity. 

My context:
- Monthly income goal: $${monthlyGoal.toLocaleString()}
- Current income: $${currentIncome.toLocaleString()}
- Gap to close: $${gap.toLocaleString()}
- Required skills for this opportunity: ${opportunity.requiredSkills.join(", ")}
- Time to first revenue: ${opportunity.timeToFirstRevenue.display}
- Potential income: $${opportunity.potential.min.toLocaleString()}-$${opportunity.potential.max.toLocaleString()}/month
- Match score: ${opportunity.matchScore}%

Can you help me understand:
1. Is this a good fit for my situation?
2. What are the first 3 steps I should take?
3. How do I price my first offer?
4. What common mistakes should I avoid?`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiResponse(data.response);
      } else {
        setAiResponse("I'm having trouble connecting right now. Please try again.");
      }
    } catch (error) {
      setAiResponse("Something went wrong. Please try again.");
    } finally {
      setExploringId(null);
    }
  };

  const handleTalkToEmma = () => {
    window.dispatchEvent(new CustomEvent("expand-chat"));
  };

  const toggleDifficulty = (diff: string) => {
    setFilters(prev => ({
      ...prev,
      difficulty: prev.difficulty.includes(diff)
        ? prev.difficulty.filter(d => d !== diff)
        : [...prev.difficulty, diff],
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-700";
      case "intermediate": return "bg-amber-100 text-amber-700";
      case "advanced": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-gray-600";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F3F4C]" />
      </div>
    );
  }

  if (!hasBlueprint) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="heading-xl mb-2">Revenue Opportunities</h1>
          <p className="body-lg">
            Create your Dream Life Blueprint first to unlock personalized revenue opportunities.
          </p>
        </div>
        <Card className="card-wealth">
          <CardContent className="p-12 text-center">
            <Target className="w-16 h-16 text-[#0F3F4C] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#0F3F4C] mb-2">
              Start with Your Dream Life Blueprint
            </h3>
            <p className="text-[#AFA496] mb-6 max-w-md mx-auto">
              Once you define your income goals, we'll analyze your skills and show you the fastest paths to reach them.
            </p>
            <a href="/dream-life">
              <Button className="bg-[#0F3F4C] hover:bg-[#0a2f39]">
                Create Blueprint
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="heading-xl mb-2">Revenue Opportunities</h1>
          <p className="body-lg">
            AI-matched income streams based on your skills, experience, and goals.
          </p>
        </div>
        <Button
          onClick={generateAIPlan}
          disabled={isGeneratingPlan}
          className="bg-gradient-to-r from-[#0F3F4C] to-[#1a5a6b] hover:from-[#0a2f39] hover:to-[#154a59]"
        >
          {isGeneratingPlan ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate My AI Revenue Plan
            </>
          )}
        </Button>
      </div>

      {/* Income Gap Summary */}
      <Card className="bg-[#0F3F4C] text-white border-none">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Badge className="bg-white/20 text-white mb-2">Your Income Analysis</Badge>
              <h3 className="text-xl font-semibold mb-1">
                Monthly Gap: {formatCurrency(gap)}
              </h3>
              <p className="text-white/70">
                Goal: {formatCurrency(monthlyGoal)} | Current: {formatCurrency(currentIncome)}
                {dashboard?.stats?.revenueScore && (
                  <> | Revenue Score: {dashboard.stats.revenueScore}/100</>
                )}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{dashboard?.stats?.incomeProgress || 0}%</div>
              <div className="text-white/70 text-sm">Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#E4DCD1]">
        <button
          onClick={() => setActiveTab("opportunities")}
          className={cn(
            "px-4 py-2 font-medium transition-colors",
            activeTab === "opportunities"
              ? "text-[#0F3F4C] border-b-2 border-[#0F3F4C]"
              : "text-[#AFA496] hover:text-[#0F3F4C]"
          )}
        >
          Opportunities
        </button>
        {revenuePlan && (
          <button
            onClick={() => setActiveTab("plan")}
            className={cn(
              "px-4 py-2 font-medium transition-colors",
              activeTab === "plan"
                ? "text-[#0F3F4C] border-b-2 border-[#0F3F4C]"
                : "text-[#AFA496] hover:text-[#0F3F4C]"
            )}
          >
            My AI Plan
          </button>
        )}
        <button
          onClick={() => setActiveTab("tracking")}
          className={cn(
            "px-4 py-2 font-medium transition-colors",
            activeTab === "tracking"
              ? "text-[#0F3F4C] border-b-2 border-[#0F3F4C]"
              : "text-[#AFA496] hover:text-[#0F3F4C]"
          )}
        >
          Revenue Tracking
        </button>
      </div>

      {/* AI Response Panel */}
      {showChat && aiResponse && (
        <Card className="bg-gradient-to-br from-[#0F3F4C] to-[#1a5a6b] text-white border-none animate-in fade-in slide-in-from-bottom-4">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Emma J's Analysis</h3>
                <div className="text-white/90 whitespace-pre-line leading-relaxed">
                  {aiResponse}
                </div>
                <div className="mt-4 flex gap-3">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={handleTalkToEmma}
                    className="bg-white/20 text-white hover:bg-white/30"
                  >
                    Continue Conversation
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowChat(false)}
                    className="text-white/70 hover:text-white"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Opportunities Tab */}
      {activeTab === "opportunities" && (
        <>
          {/* Filters */}
          <Card className="card-wealth">
            <CardHeader className="pb-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-between w-full"
              >
                <CardTitle className="flex items-center gap-2 text-[#0F3F4C] text-base">
                  <Filter className="w-4 h-4" />
                  Filter Opportunities
                </CardTitle>
                {showFilters ? (
                  <ChevronUp className="w-4 h-4 text-[#AFA496]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#AFA496]" />
                )}
              </button>
            </CardHeader>
            {showFilters && (
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[#0F3F4C] mb-2 block">
                      Max Time to Revenue
                    </label>
                    <select
                      value={filters.maxTimeToRevenue}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxTimeToRevenue: e.target.value }))}
                      className="w-full p-2 border border-[#E4DCD1] rounded-md text-[#0F3F4C]"
                    >
                      <option value="">Any</option>
                      <option value="30">Within 30 days</option>
                      <option value="60">Within 60 days</option>
                      <option value="90">Within 90 days</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#0F3F4C] mb-2 block">
                      Min Income Potential
                    </label>
                    <select
                      value={filters.minIncomePotential}
                      onChange={(e) => setFilters(prev => ({ ...prev, minIncomePotential: e.target.value }))}
                      className="w-full p-2 border border-[#E4DCD1] rounded-md text-[#0F3F4C]"
                    >
                      <option value="">Any</option>
                      <option value="5000">$5,000+/mo</option>
                      <option value="10000">$10,000+/mo</option>
                      <option value="20000">$20,000+/mo</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#0F3F4C] mb-2 block">
                      Difficulty Level
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {["beginner", "intermediate", "advanced"].map((diff) => (
                        <button
                          key={diff}
                          onClick={() => toggleDifficulty(diff)}
                          className={cn(
                            "px-3 py-1 rounded-full text-sm capitalize transition-colors",
                            filters.difficulty.includes(diff)
                              ? "bg-[#0F3F4C] text-white"
                              : "bg-[#E4DCD1] text-[#0F3F4C] hover:bg-[#d4ccc1]"
                          )}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#0F3F4C] mb-2 block">
                      Max Startup Cost
                    </label>
                    <select
                      value={filters.maxStartupCost}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxStartupCost: e.target.value }))}
                      className="w-full p-2 border border-[#E4DCD1] rounded-md text-[#0F3F4C]"
                    >
                      <option value="">Any</option>
                      <option value="500">Under $500</option>
                      <option value="1000">Under $1,000</option>
                      <option value="2000">Under $2,000</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Opportunities Grid */}
          {isLoadingOpportunities ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#0F3F4C]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredOpportunities.map((opp) => (
                <Card key={opp.id} className="card-wealth">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-[#0F3F4C]">{opp.title}</h3>
                          {opp.matchScore >= 80 && (
                            <Badge className="bg-green-100 text-green-700">Top Match</Badge>
                          )}
                        </div>
                        <p className="text-sm text-[#AFA496]">{opp.description}</p>
                      </div>
                      <div className="text-right">
                        <div className={cn("flex items-center gap-1 font-bold text-xl", getScoreColor(opp.matchScore))}>
                          <Star className="w-5 h-5 fill-current" />
                          {opp.matchScore}
                        </div>
                        <span className="text-xs text-[#AFA496]">Match Score</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-[#AFA496] uppercase">Potential</p>
                        <p className="font-semibold text-[#0F3F4C]">
                          {formatCurrency(opp.potential.min)}-{formatCurrency(opp.potential.max)}/mo
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#AFA496] uppercase">Time to Revenue</p>
                        <p className="font-semibold text-[#0F3F4C]">{opp.timeToFirstRevenue.display}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <Badge className={getDifficultyColor(opp.difficulty)}>
                        {opp.difficulty.charAt(0).toUpperCase() + opp.difficulty.slice(1)}
                      </Badge>
                      <span className="text-sm text-[#AFA496]">
                        Startup: {opp.startupCost.display}
                      </span>
                    </div>

                    {/* Match Reasons */}
                    {opp.matchReasons.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-[#AFA496] uppercase mb-2">Why This Fits You</p>
                        <div className="flex flex-wrap gap-2">
                          {opp.matchReasons.slice(0, 3).map((reason, idx) => (
                            <span 
                              key={idx}
                              className="text-xs bg-[#E4DCD1] text-[#0F3F4C] px-2 py-1 rounded"
                            >
                              {reason}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Expandable First Steps */}
                    <div className="mb-4">
                      <button
                        onClick={() => setExpandedOpp(expandedOpp === opp.id ? null : opp.id)}
                        className="flex items-center gap-2 text-sm text-[#0F3F4C] font-medium hover:underline"
                      >
                        {expandedOpp === opp.id ? (
                          <>
                            <ChevronUp className="w-4 h-4" /> Hide First Steps
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" /> Show First Steps
                          </>
                        )}
                      </button>
                      
                      {expandedOpp === opp.id && (
                        <div className="mt-3 p-3 bg-[#E4DCD1]/30 rounded-lg">
                          <ol className="space-y-2">
                            {opp.recommendedFirstSteps.map((step, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-[#0F3F4C]">
                                <span className="w-5 h-5 rounded-full bg-[#0F3F4C] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>

                    <Button 
                      className="w-full bg-[#0F3F4C] hover:bg-[#0a2f39]"
                      onClick={() => handleExplore(opp)}
                      disabled={exploringId === opp.id}
                    >
                      {exploringId === opp.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          Explore This Opportunity
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* AI Plan Tab */}
      {activeTab === "plan" && revenuePlan && (
        <RevenueRoadmap 
          plan={revenuePlan} 
          onActionComplete={() => {
            // Could trigger API call to save progress
          }}
        />
      )}

      {activeTab === "plan" && !revenuePlan && (
        <Card className="card-wealth">
          <CardContent className="p-12 text-center">
            <Sparkles className="w-16 h-16 text-[#0F3F4C] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#0F3F4C] mb-2">
              Generate Your AI Revenue Plan
            </h3>
            <p className="text-[#AFA496] mb-6 max-w-md mx-auto">
              Get a personalized 90-day roadmap with specific revenue streams, pricing recommendations, and daily actions tailored to your profile.
            </p>
            <Button
              onClick={generateAIPlan}
              disabled={isGeneratingPlan}
              className="bg-[#0F3F4C] hover:bg-[#0a2f39]"
            >
              {isGeneratingPlan ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate My Plan
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Revenue Tracking Tab */}
      {activeTab === "tracking" && revenueTracking && (
        <div className="space-y-6">
          {/* Overall Progress */}
          <Card className="bg-gradient-to-br from-[#0F3F4C] to-[#1a5a6b] text-white border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">Overall Progress</h3>
                  <p className="text-white/70">
                    {formatCurrency(revenueTracking.totalRevenue)} of {formatCurrency(revenueTracking.monthlyGoal)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{revenueTracking.overallProgress}%</div>
                </div>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-500"
                  style={{ width: `${Math.min(revenueTracking.overallProgress, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Revenue Streams */}
          <div className="grid gap-4">
            {revenueTracking.streams.map((stream) => (
              <Card key={stream.id} className="card-wealth">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-[#0F3F4C]">{stream.name}</h4>
                      <p className="text-sm text-[#AFA496]">
                        {formatCurrency(stream.monthlyRevenue)} of {formatCurrency(stream.targetRevenue)} target
                      </p>
                    </div>
                    <Badge className={cn(
                      stream.progress >= 100 ? "bg-green-100 text-green-700" :
                      stream.progress >= 50 ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {stream.progress}%
                    </Badge>
                  </div>
                  <div className="h-2 bg-[#E4DCD1] rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-500",
                        stream.progress >= 100 ? "bg-green-500" :
                        stream.progress >= 50 ? "bg-amber-500" :
                        "bg-red-500"
                      )}
                      style={{ width: `${Math.min(stream.progress, 100)}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card className="card-wealth">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0F3F4C]">
                <RefreshCw className="w-5 h-5" />
                Update Your Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#AFA496] mb-4">
                Track your actual revenue to see your progress toward your monthly goal.
              </p>
              <Button 
                variant="outline" 
                onClick={handleTalkToEmma}
                className="w-full"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Talk to Emma J About Revenue Tracking
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Recommendation */}
      <Card className="card-wealth">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0F3F4C]">
            <Lightbulb className="w-5 h-5" />
            Recommended Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[#0F3F4C] mb-4">
            {gap > 0 ? (
              <>
                To close your {formatCurrency(gap)}/month gap, I recommend starting with your highest-matched opportunity 
                for immediate revenue, while building scalable systems for long-term growth.
              </>
            ) : (
              <>
                You've reached your income goal! Focus on scaling and building passive income streams 
                to increase your monthly target.
              </>
            )}
          </p>
          <div className="flex gap-3 flex-wrap">
            <a href="/offers">
              <Button className="bg-[#0F3F4C] hover:bg-[#0a2f39]">
                Build Your First Offer
              </Button>
            </a>
            <Button variant="outline" onClick={handleTalkToEmma}>
              Talk to Emma J
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}