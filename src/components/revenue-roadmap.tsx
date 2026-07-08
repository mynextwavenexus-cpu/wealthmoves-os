"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Target, 
  TrendingUp,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Zap,
  Calendar,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RoadmapPhase {
  phase: string;
  duration: string;
  focus: string;
  milestones: string[];
  dailyActions: string[];
}

interface RevenueStream {
  rank: number;
  opportunity: {
    id: string;
    title: string;
    type: string;
    potential: {
      min: number;
      max: number;
      timeframe: string;
    };
    matchScore: number;
    timeToFirstRevenue: {
      display: string;
    };
    difficulty: string;
  };
  rationale: string;
  expectedRevenue: {
    month1: number;
    month3: number;
    month6: number;
  };
  priority: "primary" | "secondary" | "tertiary";
}

interface FirstAction {
  action: string;
  why: string;
  how: string;
  deadline: string;
  completed?: boolean;
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
  recommendedStreams: RevenueStream[];
  roadmap: RoadmapPhase[];
  firstActions: FirstAction[];
  metrics: {
    targetMonthlyRevenue: number;
    projectedMonth1Revenue: number;
    projectedMonth3Revenue: number;
    confidenceScore: number;
  };
}

interface RevenueRoadmapProps {
  plan: RevenuePlan;
  onActionComplete?: (actionIndex: number, completed: boolean) => void;
}

export function RevenueRoadmap({ plan, onActionComplete }: RevenueRoadmapProps) {
  const [expandedPhase, setExpandedPhase] = useState<number | null>(0);
  const [completedActions, setCompletedActions] = useState<Set<number>>(() => {
    const saved = typeof window !== "undefined" 
      ? localStorage.getItem(`revenue-plan-${plan.id}-actions`) 
      : null;
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const handleActionToggle = (index: number, checked: boolean) => {
    const newCompleted = new Set(completedActions);
    if (checked) {
      newCompleted.add(index);
    } else {
      newCompleted.delete(index);
    }
    setCompletedActions(newCompleted);
    
    // Persist to localStorage
    localStorage.setItem(
      `revenue-plan-${plan.id}-actions`,
      JSON.stringify(Array.from(newCompleted))
    );
    
    onActionComplete?.(index, checked);
  };

  const completedCount = completedActions.size;
  const totalActions = plan.firstActions.length;
  const progressPercent = Math.round((completedCount / totalActions) * 100);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "primary": return "bg-green-100 text-green-700 border-green-200";
      case "secondary": return "bg-blue-100 text-blue-700 border-blue-200";
      case "tertiary": return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-50 text-green-600";
      case "intermediate": return "bg-amber-50 text-amber-600";
      case "advanced": return "bg-red-50 text-red-600";
      default: return "bg-gray-50 text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Plan Summary Card */}
      <Card className="bg-gradient-to-br from-[#0F3F4C] to-[#1a5a6b] text-white border-none">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Badge className="bg-white/20 text-white mb-2">Your AI Revenue Plan</Badge>
              <h3 className="text-xl font-semibold">90-Day Roadmap to {formatCurrency(plan.summary.incomeGoal)}/mo</h3>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{plan.metrics.confidenceScore}%</div>
              <div className="text-white/70 text-sm">Confidence</div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-white/70 text-xs uppercase mb-1">Gap to Close</div>
              <div className="text-lg font-semibold">{formatCurrency(plan.summary.gapToClose)}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-white/70 text-xs uppercase mb-1">Month 1 Target</div>
              <div className="text-lg font-semibold">{formatCurrency(plan.metrics.projectedMonth1Revenue)}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-white/70 text-xs uppercase mb-1">Month 3 Target</div>
              <div className="text-lg font-semibold">{formatCurrency(plan.metrics.projectedMonth3Revenue)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* First Actions - Priority Section */}
      <Card className="card-wealth border-l-4 border-l-[#0F3F4C]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0F3F4C]">
            <Zap className="w-5 h-5" />
            Your First 3 Actions
            <Badge variant="secondary" className="ml-auto">
              {completedCount}/{totalActions} Done
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {plan.firstActions.map((action, index) => (
              <div 
                key={index}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-lg border transition-all",
                  completedActions.has(index) 
                    ? "bg-green-50 border-green-200" 
                    : "bg-white border-[#E4DCD1] hover:border-[#0F3F4C]"
                )}
              >
                <Checkbox
                  checked={completedActions.has(index)}
                  onCheckedChange={(checked) => handleActionToggle(index, checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "font-medium",
                      completedActions.has(index) && "line-through text-gray-500"
                    )}>
                      {action.action}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {action.deadline}
                    </Badge>
                  </div>
                  <p className="text-sm text-[#AFA496] mb-2">{action.why}</p>
                  <p className="text-sm text-[#0F3F4C]">
                    <span className="font-medium">How:</span> {action.how}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#0F3F4C] font-medium">Action Progress</span>
              <span className="text-[#AFA496]">{progressPercent}%</span>
            </div>
            <div className="h-2 bg-[#E4DCD1] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#0F3F4C] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Revenue Streams */}
      <Card className="card-wealth">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0F3F4C]">
            <TrendingUp className="w-5 h-5" />
            Recommended Revenue Streams
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {plan.recommendedStreams.map((stream) => (
              <div 
                key={stream.opportunity.id}
                className="p-4 rounded-lg border border-[#E4DCD1] hover:border-[#0F3F4C] transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0F3F4C] text-white flex items-center justify-center font-bold text-sm">
                      {stream.rank}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#0F3F4C]">{stream.opportunity.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getPriorityColor(stream.priority)}>
                          {stream.priority.charAt(0).toUpperCase() + stream.priority.slice(1)}
                        </Badge>
                        <Badge variant="outline" className={getDifficultyColor(stream.opportunity.difficulty)}>
                          {stream.opportunity.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#0F3F4C]">{stream.opportunity.matchScore}%</div>
                    <div className="text-xs text-[#AFA496]">Match Score</div>
                  </div>
                </div>
                
                <p className="text-sm text-[#0F3F4C] mb-3">{stream.rationale}</p>
                
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="bg-[#E4DCD1]/30 rounded p-2 text-center">
                    <div className="text-xs text-[#AFA496] uppercase">Month 1</div>
                    <div className="font-semibold text-[#0F3F4C]">{formatCurrency(stream.expectedRevenue.month1)}</div>
                  </div>
                  <div className="bg-[#E4DCD1]/30 rounded p-2 text-center">
                    <div className="text-xs text-[#AFA496] uppercase">Month 3</div>
                    <div className="font-semibold text-[#0F3F4C]">{formatCurrency(stream.expectedRevenue.month3)}</div>
                  </div>
                  <div className="bg-[#E4DCD1]/30 rounded p-2 text-center">
                    <div className="text-xs text-[#AFA496] uppercase">Month 6</div>
                    <div className="font-semibold text-[#0F3F4C]">{formatCurrency(stream.expectedRevenue.month6)}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-[#AFA496]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {stream.opportunity.timeToFirstRevenue.display}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {formatCurrency(stream.opportunity.potential.min)}-{formatCurrency(stream.opportunity.potential.max)}/mo potential
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 90-Day Roadmap */}
      <Card className="card-wealth">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0F3F4C]">
            <Calendar className="w-5 h-5" />
            90-Day Implementation Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {plan.roadmap.map((phase, index) => (
              <div 
                key={index}
                className="border border-[#E4DCD1] rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setExpandedPhase(expandedPhase === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 bg-[#E4DCD1]/20 hover:bg-[#E4DCD1]/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                      index === 0 ? "bg-[#0F3F4C] text-white" :
                      index === 1 ? "bg-[#0F3F4C]/80 text-white" :
                      "bg-[#0F3F4C]/60 text-white"
                    )}>
                      {index + 1}
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-[#0F3F4C]">{phase.phase}</h4>
                      <p className="text-sm text-[#AFA496]">{phase.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{phase.milestones.length} Milestones</Badge>
                    {expandedPhase === index ? (
                      <ChevronUp className="w-5 h-5 text-[#AFA496]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#AFA496]" />
                    )}
                  </div>
                </button>
                
                {expandedPhase === index && (
                  <div className="p-4 bg-white">
                    <p className="text-[#0F3F4C] font-medium mb-4">{phase.focus}</p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-semibold text-[#0F3F4C] mb-2 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Key Milestones
                        </h5>
                        <ul className="space-y-2">
                          {phase.milestones.map((milestone, mIndex) => (
                            <li key={mIndex} className="flex items-start gap-2 text-sm text-[#0F3F4C]">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                              {milestone}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-semibold text-[#0F3F4C] mb-2 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Daily Actions
                        </h5>
                        <ul className="space-y-2">
                          {phase.dailyActions.map((action, aIndex) => (
                            <li key={aIndex} className="flex items-start gap-2 text-sm text-[#0F3F4C]">
                              <Circle className="w-4 h-4 text-[#0F3F4C] mt-0.5 shrink-0" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Projection Chart */}
      <Card className="card-wealth">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0F3F4C]">
            <TrendingUp className="w-5 h-5" />
            Revenue Projection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Month 1 */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#0F3F4C] font-medium">Month 1</span>
                <span className="text-[#AFA496]">
                  {formatCurrency(plan.metrics.projectedMonth1Revenue)} / {formatCurrency(plan.summary.incomeGoal)} goal
                </span>
              </div>
              <div className="h-4 bg-[#E4DCD1] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ 
                    width: `${Math.min((plan.metrics.projectedMonth1Revenue / plan.summary.incomeGoal) * 100, 100)}%` 
                  }}
                />
              </div>
              <div className="text-xs text-[#AFA496] mt-1">
                {Math.round((plan.metrics.projectedMonth1Revenue / plan.summary.incomeGoal) * 100)}% of goal
              </div>
            </div>

            {/* Month 3 */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#0F3F4C] font-medium">Month 3</span>
                <span className="text-[#AFA496]">
                  {formatCurrency(plan.metrics.projectedMonth3Revenue)} / {formatCurrency(plan.summary.incomeGoal)} goal
                </span>
              </div>
              <div className="h-4 bg-[#E4DCD1] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#0F3F4C] transition-all duration-500"
                  style={{ 
                    width: `${Math.min((plan.metrics.projectedMonth3Revenue / plan.summary.incomeGoal) * 100, 100)}%` 
                  }}
                />
              </div>
              <div className="text-xs text-[#AFA496] mt-1">
                {Math.round((plan.metrics.projectedMonth3Revenue / plan.summary.incomeGoal) * 100)}% of goal
              </div>
            </div>

            {/* Goal Line */}
            <div className="pt-4 border-t border-[#E4DCD1]">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#0F3F4C] font-medium">Target Monthly Income</span>
                <span className="text-lg font-bold text-[#0F3F4C]">
                  {formatCurrency(plan.summary.incomeGoal)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
