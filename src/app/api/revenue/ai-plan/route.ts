import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { matchOpportunities, parseSkills, UserProfile, MatchedOpportunity } from "@/lib/revenue-opportunities";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "wealthmoves-secret-key-change-in-production"
);

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;

async function getUserId(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.userId as string;
  } catch {
    return null;
  }
}

export interface RevenuePlan {
  id: string;
  createdAt: string;
  userId: string;
  summary: {
    incomeGoal: number;
    currentIncome: number;
    gapToClose: number;
    timeline: string;
  };
  recommendedStreams: {
    rank: number;
    opportunity: MatchedOpportunity;
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
  pricingRecommendations: {
    streamType: string;
    recommendedPrice: string;
    pricingStrategy: string;
    upsellOpportunities: string[];
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

export async function POST(request: NextRequest) {
  const userId = await getUserId(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user's blueprint and context
    const blueprint = await db.getBlueprint(userId);
    
    if (!blueprint) {
      return NextResponse.json({ 
        error: "No blueprint found",
        message: "Create your Dream Life Blueprint first to generate a personalized revenue plan"
      }, { status: 404 });
    }

    const offers = await db.getOffers(userId);
    const sprint = await db.getSprint(userId);

    // Build user profile
    const userProfile: UserProfile = {
      skills: parseSkills(blueprint.skills),
      experience: blueprint.experience,
      passion: blueprint.passion,
      monthlyIncomeGoal: blueprint.monthlyIncome,
      currentIncome: blueprint.currentIncome,
      timeAvailability: "moderate",
      riskTolerance: "medium",
      preferredWorkStyle: "either",
      hasAudience: false,
      technicalLevel: "basic",
    };

    // Get matched opportunities
    const matchedOpportunities = matchOpportunities(userProfile);
    const topOpportunities = matchedOpportunities.slice(0, 3);

    // Calculate income gap
    const incomeGap = blueprint.monthlyIncome - blueprint.currentIncome;

    // Try to generate AI plan if Claude API is available
    let aiGeneratedPlan: Partial<RevenuePlan> | null = null;

    if (CLAUDE_API_KEY) {
      try {
        aiGeneratedPlan = await generateAIPlan(
          userProfile,
          topOpportunities,
          offers,
          sprint,
          incomeGap
        );
      } catch (error) {
        console.error("AI plan generation error:", error);
        // Fall back to algorithmic plan
      }
    }

    // Build the complete plan (AI-enhanced or algorithmic fallback)
    const plan: RevenuePlan = buildRevenuePlan(
      userId,
      userProfile,
      topOpportunities,
      offers,
      incomeGap,
      aiGeneratedPlan
    );

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Revenue plan generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate revenue plan" },
      { status: 500 }
    );
  }
}

async function generateAIPlan(
  profile: UserProfile,
  opportunities: MatchedOpportunity[],
  offers: Awaited<ReturnType<typeof db.getOffers>>,
  sprint: Awaited<ReturnType<typeof db.getSprint>> | null,
  incomeGap: number
): Promise<Partial<RevenuePlan>> {
  const systemPrompt = `You are Emma J™, an expert AI Revenue Coach for WealthMoves. You specialize in creating personalized 90-day revenue plans for entrepreneurs.

Your task is to analyze the user's profile and generate a detailed revenue plan with specific recommendations, pricing, and action steps.

Respond in JSON format with the following structure:
{
  "rationale": "Overall strategy rationale (2-3 sentences)",
  "streamRecommendations": [
    {
      "type": "opportunity type",
      "rationale": "Why this fits the user",
      "expectedRevenue": { "month1": number, "month3": number, "month6": number },
      "priority": "primary|secondary|tertiary"
    }
  ],
  "roadmap": [
    {
      "phase": "Phase name (e.g., 'Foundation')",
      "duration": "e.g., 'Days 1-30'",
      "focus": "Main focus area",
      "milestones": ["milestone 1", "milestone 2"],
      "dailyActions": ["action 1", "action 2"]
    }
  ],
  "pricingRecommendations": [
    {
      "streamType": "type name",
      "recommendedPrice": "price range",
      "pricingStrategy": "strategy description",
      "upsellOpportunities": ["upsell 1", "upsell 2"]
    }
  ],
  "firstActions": [
    {
      "action": "Specific action to take",
      "why": "Why this matters",
      "how": "How to do it",
      "deadline": "When to complete (e.g., 'Within 48 hours')"
    }
  ],
  "confidenceScore": number (0-100)
}`;

  const userPrompt = `Create a personalized 90-day revenue plan for this entrepreneur:

USER PROFILE:
- Monthly Income Goal: $${profile.monthlyIncomeGoal.toLocaleString()}
- Current Income: $${profile.currentIncome.toLocaleString()}
- Income Gap to Close: $${incomeGap.toLocaleString()}
- Skills: ${profile.skills.join(", ")}
- Experience: ${profile.experience}
- Passions: ${profile.passion}
- Time Availability: ${profile.timeAvailability}
- Risk Tolerance: ${profile.riskTolerance}
- Technical Level: ${profile.technicalLevel}

TOP MATCHED OPPORTUNITIES:
${opportunities.map((opp, i) => `
${i + 1}. ${opp.title} (Match Score: ${opp.matchScore}%)
   - Potential: $${opp.potential.min.toLocaleString()}-$${opp.potential.max.toLocaleString()}/month
   - Time to Revenue: ${opp.timeToFirstRevenue.display}
   - Difficulty: ${opp.difficulty}
   - Match Reasons: ${opp.matchReasons.join(", ")}
`).join("")}

CURRENT OFFERS: ${offers.length > 0 ? offers.map(o => `${o.name} ($${o.price})`).join(", ") : "None yet"}
${sprint ? `SPRINT STATUS: Day ${sprint.day} of ${sprint.totalDays}` : "Not in a sprint"}

Generate a comprehensive 90-day plan that will help them close the $${incomeGap.toLocaleString()} monthly income gap.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": CLAUDE_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    throw new Error("Claude API error");
  }

  const data = await response.json();
  const content = data.content[0].text;
  
  // Extract JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in AI response");
  }

  return JSON.parse(jsonMatch[0]);
}

function buildRevenuePlan(
  userId: string,
  profile: UserProfile,
  opportunities: MatchedOpportunity[],
  offers: Awaited<ReturnType<typeof db.getOffers>>,
  incomeGap: number,
  aiPlan: Partial<RevenuePlan> | null
): RevenuePlan {
  const now = new Date();
  
  // Build recommended streams
  const recommendedStreams = opportunities.map((opp, index) => {
    const aiRec = (aiPlan as {streamRecommendations?: {type: string; expectedRevenue?: {month1: number; month3: number; month6: number}; rationale?: string; priority?: "primary" | "secondary" | "tertiary"}[]})?.streamRecommendations?.find(r => r.type === opp.type);
    
    // Calculate expected revenue progression
    const month1Revenue = aiRec?.expectedRevenue?.month1 || calculateMonth1Revenue(opp, profile);
    const month3Revenue = aiRec?.expectedRevenue?.month3 || calculateMonth3Revenue(opp, profile, month1Revenue);
    const month6Revenue = aiRec?.expectedRevenue?.month6 || calculateMonth6Revenue(opp, profile, month3Revenue);

    return {
      rank: index + 1,
      opportunity: opp,
      rationale: aiRec?.rationale || generateRationale(opp, profile, incomeGap),
      expectedRevenue: {
        month1: month1Revenue,
        month3: month3Revenue,
        month6: month6Revenue,
      },
      priority: (aiRec?.priority as "primary" | "secondary" | "tertiary") || 
        (index === 0 ? "primary" : index === 1 ? "secondary" : "tertiary"),
    };
  });

  // Build 90-day roadmap
  const roadmap = aiPlan?.roadmap || generateDefaultRoadmap(opportunities[0], profile);

  // Build pricing recommendations
  const pricingRecommendations = aiPlan?.pricingRecommendations || 
    opportunities.slice(0, 2).map(opp => generatePricingRecommendation(opp, profile));

  // Build first actions
  const firstActions = aiPlan?.firstActions || generateFirstActions(opportunities[0], profile);

  // Calculate metrics
  const projectedMonth1 = recommendedStreams.reduce((sum, s) => sum + s.expectedRevenue.month1, 0);
  const projectedMonth3 = recommendedStreams.reduce((sum, s) => sum + s.expectedRevenue.month3, 0);

  return {
    id: `plan_${Date.now()}`,
    createdAt: now.toISOString(),
    userId,
    summary: {
      incomeGoal: profile.monthlyIncomeGoal,
      currentIncome: profile.currentIncome,
      gapToClose: incomeGap,
      timeline: "90 days",
    },
    recommendedStreams,
    roadmap,
    pricingRecommendations,
    firstActions,
    metrics: {
      targetMonthlyRevenue: profile.monthlyIncomeGoal,
      projectedMonth1Revenue: projectedMonth1,
      projectedMonth3Revenue: projectedMonth3,
      confidenceScore: (aiPlan as {confidenceScore?: number})?.confidenceScore || calculateConfidenceScore(opportunities, profile),
    },
  };
}

function calculateMonth1Revenue(opp: MatchedOpportunity, profile: UserProfile): number {
  // Conservative estimate for month 1
  const base = opp.potential.min * 0.1;
  if (opp.timeToFirstRevenue.maxDays <= 30) {
    return Math.round(base * 0.5);
  }
  return Math.round(base * 0.1);
}

function calculateMonth3Revenue(opp: MatchedOpportunity, profile: UserProfile, month1: number): number {
  // Growth from month 1
  const growthRate = opp.scalability === "high" ? 3 : 2;
  return Math.round(month1 * growthRate);
}

function calculateMonth6Revenue(opp: MatchedOpportunity, profile: UserProfile, month3: number): number {
  // Continued growth
  const growthRate = opp.scalability === "high" ? 2 : 1.5;
  return Math.round(Math.min(month3 * growthRate, opp.potential.max * 0.8));
}

function generateRationale(opp: MatchedOpportunity, profile: UserProfile, incomeGap: number): string {
  const reasons: string[] = [];
  
  if (opp.matchScore >= 80) {
    reasons.push("Excellent match with your skills and experience");
  }
  
  if (opp.potential.max >= incomeGap) {
    reasons.push(`Can single-handedly close your $${incomeGap.toLocaleString()} income gap`);
  } else if (opp.potential.max >= incomeGap * 0.5) {
    reasons.push(`Can cover ${Math.round((opp.potential.max / incomeGap) * 100)}% of your income gap`);
  }
  
  if (opp.timeToFirstRevenue.maxDays <= 45) {
    reasons.push("Fast path to first revenue");
  }
  
  if (opp.passiveIncomePotential === "high") {
    reasons.push("Strong passive income potential for long-term scalability");
  }
  
  return reasons.join(". ") + ".";
}

function generateDefaultRoadmap(primaryOpp: MatchedOpportunity, profile: UserProfile) {
  return [
    {
      phase: "Foundation",
      duration: "Days 1-30",
      focus: "Set up your revenue infrastructure and validate demand",
      milestones: [
        "Define your specific niche and ideal client",
        "Create your core offer or service package",
        "Set up necessary tools and platforms",
        "Make first outreach to 10+ prospects",
      ],
      dailyActions: [
        "Spend 30 minutes on offer development",
        "Reach out to 2-3 potential clients",
        "Create 1 piece of content showcasing expertise",
      ],
    },
    {
      phase: "Validation",
      duration: "Days 31-60",
      focus: "Get first paying customers and gather feedback",
      milestones: [
        "Close first 3 paying clients/customers",
        "Collect testimonials or case studies",
        "Refine offer based on feedback",
        "Build simple sales process",
      ],
      dailyActions: [
        "Follow up with 5 leads",
        "Have 1 sales conversation",
        "Document lessons learned",
      ],
    },
    {
      phase: "Scale",
      duration: "Days 61-90",
      focus: "Systematize and scale what's working",
      milestones: [
        "Achieve consistent weekly revenue",
        "Implement automation where possible",
        "Create upsell/cross-sell offers",
        "Build referral system",
      ],
      dailyActions: [
        "Review and optimize conversion metrics",
        "Nurture existing client relationships",
        "Plan next 90-day growth phase",
      ],
    },
  ];
}

function generatePricingRecommendation(opp: MatchedOpportunity, profile: UserProfile) {
  const basePrice = opp.potential.min / 10; // Rough estimate
  
  let recommendedPrice: string;
  let strategy: string;
  
  switch (opp.type) {
    case "coaching-consulting":
      recommendedPrice = "$500-2,000/month or $150-500/hour";
      strategy = "Start with lower pricing for first 3 clients, then raise rates based on results";
      break;
    case "digital-products":
      recommendedPrice = "$27-297 for entry products, $500-2,000 for premium";
      strategy = "Use tiered pricing: free lead magnet → $27 tripwire → $197 core offer → $997 premium";
      break;
    case "service-based":
      recommendedPrice = "$1,000-5,000/project or $75-200/hour";
      strategy = "Price based on value delivered, not hours worked. Offer packages, not hourly rates.";
      break;
    case "ai-automation-agency":
      recommendedPrice = "$2,000-10,000 setup + $500-2,000/month retainer";
      strategy = "Charge for initial setup plus monthly maintenance. Position as ROI-positive investment.";
      break;
    default:
      recommendedPrice = `$${Math.round(basePrice)}-${Math.round(basePrice * 3)}`;
      strategy = "Research competitor pricing and position in the middle-to-premium range";
  }

  return {
    streamType: opp.title,
    recommendedPrice,
    pricingStrategy: strategy,
    upsellOpportunities: [
      "Premium tier with additional features/support",
      "Done-with-you upgrade from DIY",
      "Ongoing monthly retainer for continued support",
    ],
  };
}

function generateFirstActions(opp: MatchedOpportunity, profile: UserProfile) {
  return opp.recommendedFirstSteps.slice(0, 3).map((step, index) => ({
    action: step,
    why: index === 0 
      ? "Clarity on your niche is the foundation of everything"
      : index === 1
      ? "You need an offer to sell before you can make money"
      : "Action beats planning - start conversations immediately",
    how: index === 0
      ? "Write down who you help, what problem you solve, and the transformation you provide"
      : index === 1
      ? "Create a simple document outlining what's included, the price, and the outcome"
      : "Make a list of 20 people who might need this, then message the first 5 today",
    deadline: index === 0 ? "Within 24 hours" : index === 1 ? "Within 48 hours" : "Within 72 hours",
  }));
}

function calculateConfidenceScore(opportunities: MatchedOpportunity[], profile: UserProfile): number {
  let score = 50;
  
  // Higher confidence if top match is strong
  if (opportunities[0]?.matchScore >= 85) score += 20;
  else if (opportunities[0]?.matchScore >= 70) score += 10;
  
  // Higher confidence if multiple good matches
  if (opportunities.filter(o => o.matchScore >= 70).length >= 2) score += 10;
  
  // Higher confidence if fast path to revenue
  if (opportunities[0]?.timeToFirstRevenue.maxDays <= 30) score += 10;
  
  // Higher confidence if clear skills match
  if (opportunities[0]?.matchReasons.some(r => r.includes("Strong skills"))) score += 10;
  
  return Math.min(score, 95);
}

export async function GET(request: NextRequest) {
  const userId = await getUserId(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Return a message indicating this is a POST endpoint
    return NextResponse.json({
      message: "Use POST to generate a new AI revenue plan",
      endpoint: "/api/revenue/ai-plan",
      method: "POST",
    });
  } catch (error) {
    console.error("Revenue plan GET error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
