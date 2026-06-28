"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "@/lib/data-context";
import {
  TrendingUp,
  Target,
  Zap,
  ArrowRight,
  Star,
  Lightbulb,
  Loader2,
} from "lucide-react";

const opportunities = [
  {
    id: 1,
    title: "Digital Products",
    score: 92,
    potential: "$5,000-8,000/mo",
    match: "High",
    skills: ["Writing", "Teaching", "Community Building"],
    timeToRevenue: "60-90 days",
    description: "Build an audience around your expertise and monetize through subscriptions, courses, and digital products.",
  },
  {
    id: 2,
    title: "Consulting & Coaching",
    score: 88,
    potential: "$10,000-15,000/mo",
    match: "High",
    skills: ["Strategy", "Problem Solving", "Communication"],
    timeToRevenue: "30-60 days",
    description: "Leverage your experience to help others solve problems. High-ticket, immediate revenue potential.",
  },
  {
    id: 3,
    title: "AI Automation Agency",
    score: 85,
    potential: "$8,000-12,000/mo",
    match: "Medium",
    skills: ["Tech", "Systems Thinking", "Sales"],
    timeToRevenue: "45-75 days",
    description: "Help businesses implement AI and automation. High demand, recurring revenue model.",
  },
  {
    id: 4,
    title: "Affiliate Marketing",
    score: 72,
    potential: "$2,000-5,000/mo",
    match: "Medium",
    skills: ["Content Creation", "Marketing", "Relationship Building"],
    timeToRevenue: "90-120 days",
    description: "Promote products you believe in and earn commissions. Requires audience building first.",
  },
];

export default function RevenuePage() {
  const { dashboard, isLoading } = useDashboard();
  const [exploringId, setExploringId] = useState<number | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  const monthlyGoal = dashboard?.stats?.monthlyIncomeGoal || 0;
  const currentIncome = dashboard?.stats?.currentIncome || 0;
  const gap = monthlyGoal - currentIncome;
  const hasBlueprint = monthlyGoal > 0;

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

  const handleExplore = async (opportunity: typeof opportunities[0]) => {
    setExploringId(opportunity.id);
    setShowChat(true);

    // Build context-aware message
    const monthlyGoal = dashboard?.stats?.monthlyIncomeGoal || 0;
    const currentIncome = dashboard?.stats?.currentIncome || 0;
    const gap = monthlyGoal - currentIncome;

    const message = `I want to explore the "${opportunity.title}" opportunity. 

My context:
- Monthly income goal: $${monthlyGoal.toLocaleString()}
- Current income: $${currentIncome.toLocaleString()}
- Gap to close: $${gap.toLocaleString()}
- Required skills for this opportunity: ${opportunity.skills.join(", ")}
- Time to first revenue: ${opportunity.timeToRevenue}
- Potential income: ${opportunity.potential}

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
    // Scroll to or open AI chat panel
    const chatPanel = document.querySelector('[data-chat-panel]');
    if (chatPanel) {
      chatPanel.scrollIntoView({ behavior: 'smooth' });
    }
    // Dispatch custom event to expand chat if collapsed
    window.dispatchEvent(new CustomEvent('expand-chat'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="heading-xl mb-2">Revenue Opportunities</h1>
        <p className="body-lg">
          Based on your skills and goals, here are your highest-potential income streams.
        </p>
      </div>

      {/* Income Gap Summary */}
      <Card className="bg-[#0F3F4C] text-white border-none">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Badge className="bg-white/20 text-white mb-2">Your Income Analysis</Badge>
              <h3 className="text-xl font-semibold mb-1">
                Monthly Gap: ${gap.toLocaleString()}
              </h3>
              <p className="text-white/70">
                Goal: ${monthlyGoal.toLocaleString()} | Current: ${currentIncome.toLocaleString()}
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

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {opportunities.map((opp) => (
          <Card key={opp.id} className="card-wealth">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-[#0F3F4C]">{opp.title}</h3>
                    {opp.match === "High" && (
                      <Badge className="bg-green-100 text-green-700">High Match</Badge>
                    )}
                  </div>
                  <p className="text-sm text-[#AFA496]">{opp.description}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-[#0F3F4C]">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-bold">{opp.score}</span>
                  </div>
                  <span className="text-xs text-[#AFA496]">Score</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-[#AFA496] uppercase">Potential</p>
                  <p className="font-semibold text-[#0F3F4C]">{opp.potential}</p>
                </div>
                <div>
                  <p className="text-xs text-[#AFA496] uppercase">Time to Revenue</p>
                  <p className="font-semibold text-[#0F3F4C]">{opp.timeToRevenue}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-[#AFA496] uppercase mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {opp.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="bg-[#E4DCD1] text-[#0F3F4C]">
                      {skill}
                    </Badge>
                  ))}
                </div>
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

      {/* AI Recommendation */}
      <Card className="card-wealth">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[#0F3F4C]" />
            Recommended Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[#0F3F4C] mb-4">
            {gap > 0 ? (
              <>
                To close your ${gap.toLocaleString()}/month gap, I recommend starting with <strong>Consulting & Coaching</strong> 
                for immediate revenue, while building a scalable system for long-term growth.
              </>
            ) : (
              <>
                You've reached your income goal! Focus on scaling and building passive income streams 
                to increase your monthly target.
              </>
            )}
          </p>
          <div className="flex gap-3">
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
