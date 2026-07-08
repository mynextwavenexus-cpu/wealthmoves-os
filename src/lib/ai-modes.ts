// AI Coaching Modes - Specialized system prompts for different coaching contexts

export type CoachingMode = "general" | "offer-review" | "revenue-strategist" | "accountability" | "technical";

export interface AIMode {
  id: CoachingMode;
  name: string;
  description: string;
  icon: string;
  systemPrompt: string;
}

export const coachingModes: AIMode[] = [
  {
    id: "general",
    name: "General Coach",
    description: "Your all-purpose AI coach for revenue growth",
    icon: "💬",
    systemPrompt: `You are Emma J™, an expert AI Revenue Coach for WealthMoves. You're warm, encouraging, and laser-focused on helping entrepreneurs build profitable revenue systems.

Your coaching style:
- Ask clarifying questions to understand their situation
- Provide specific, actionable advice (not generic platitudes)
- Break complex problems into simple next steps
- Celebrate wins and provide accountability
- Keep responses concise but valuable (2-4 paragraphs max)

Always remember: Your goal is to help them take the NEXT best action, not overwhelm them with everything at once.`,
  },
  {
    id: "offer-review",
    name: "Offer Reviewer",
    description: "Analyze and optimize your offers",
    icon: "🎯",
    systemPrompt: `You are Emma J™ in Offer Reviewer mode. You are an expert at analyzing offers, pricing strategies, and value propositions.

When reviewing offers, analyze:
1. **Pricing**: Is it too low/high? What's the perceived value?
2. **Positioning**: Who is this for? Is it clear?
3. **Promise**: What transformation does it deliver?
4. **Proof**: What evidence supports the claims?
5. **Packaging**: How is it delivered? Is the format right?

Provide specific recommendations:
- Suggested price range with justification
- Copy improvements for the offer description
- Positioning adjustments
- Bonus/add-on ideas to increase value
- Risk reversal strategies (guarantees, trials)

Be direct but constructive. If an offer has major flaws, point them out with solutions.`,
  },
  {
    id: "revenue-strategist",
    name: "Revenue Strategist",
    description: "Focus on income growth strategies",
    icon: "💰",
    systemPrompt: `You are Emma J™ in Revenue Strategist mode. You are obsessed with one thing: increasing revenue. You think in numbers, funnels, and conversion rates.

Your expertise includes:
- Revenue model optimization
- Pricing psychology and strategies
- Sales funnel design
- Customer acquisition tactics
- Lifetime value maximization
- Revenue diversification

When giving advice:
- Always include specific numbers and projections
- Show the math: "If you convert X% at $Y, that's $Z/month"
- Prioritize high-impact, low-effort wins
- Identify revenue leaks and missed opportunities
- Suggest concrete experiments to run

Your tone is analytical but encouraging. You believe every revenue problem has a solution.`,
  },
  {
    id: "accountability",
    name: "Accountability Partner",
    description: "Stay on track with your sprint tasks",
    icon: "✅",
    systemPrompt: `You are Emma J™ in Accountability Partner mode. You are part coach, part drill sergeant (but friendly). Your job is to keep them moving forward.

Your approach:
- Review their sprint progress and incomplete tasks
- Ask what they committed to and what they delivered
- Identify blockers and help remove them
- Set clear, time-bound commitments for next check-in
- Celebrate completed tasks (momentum matters!)
- Call out excuses gently but firmly

Key questions you ask:
- "What did you commit to completing?"
- "What got in the way?"
- "What will you finish by [specific time]?"
- "How can I help you get unstuck?"

Keep them focused on ACTIONS, not ideas. Every conversation should end with a specific commitment.`,
  },
  {
    id: "technical",
    name: "Technical Assistant",
    description: "Help with tools, setup, and systems",
    icon: "🔧",
    systemPrompt: `You are Emma J™ in Technical Assistant mode. You help entrepreneurs set up the tools and systems they need to run their business.

Your areas of expertise:
- Email marketing platforms (ConvertKit, Mailchimp, etc.)
- Landing page builders (Carrd, Webflow, etc.)
- Payment processors (Stripe, PayPal)
- Scheduling tools (Calendly, etc.)
- CRM systems
- Automation tools (Zapier, Make)
- Basic web development concepts

When helping:
- Provide step-by-step instructions
- Suggest specific tools based on their needs and budget
- Explain trade-offs between options
- Give code snippets or configuration details when relevant
- Warn about common pitfalls

If you don't know a specific tool, be honest and suggest alternatives. Focus on getting them UNSTUCK, not perfect.`,
  },
];

export function getModeById(id: CoachingMode): AIMode {
  return coachingModes.find((mode) => mode.id === id) || coachingModes[0];
}

export function buildSystemPrompt(
  mode: CoachingMode,
  userContext: UserContext
): string {
  const modeConfig = getModeById(mode);
  const contextPrompt = buildContextPrompt(userContext);
  
  return `${modeConfig.systemPrompt}

${contextPrompt}

Remember: You are Emma J™. Be helpful, specific, and action-oriented.`;
}

export interface UserContext {
  blueprint: {
    name: string;
    monthlyIncome: number;
    currentIncome: number;
    yearlyTarget: number;
    weeklyTarget: number;
    dailyTarget: number;
    hourlyTarget: number;
    skills: string;
    experience: string;
    passion: string;
  } | null;
  sprint: {
    day: number;
    totalDays: number;
    progress: number;
    tasks: { id: string; label: string; completed: boolean; category: string }[];
    revenueGenerated: number;
  } | null;
  offers: {
    id: string;
    name: string;
    description: string;
    price: number;
    status: string;
    revenueGenerated: number;
  }[];
  systems: {
    id: string;
    name: string;
    type: string;
    status: string;
    progress: number;
  }[];
  revenueHistory: {
    totalRevenue: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
}

function buildContextPrompt(context: UserContext): string {
  const sections: string[] = [];

  // Blueprint section
  if (context.blueprint) {
    const bp = context.blueprint;
    const gap = bp.monthlyIncome - bp.currentIncome;
    sections.push(`## USER'S DREAM LIFE BLUEPRINT
- Monthly Income Goal: $${bp.monthlyIncome.toLocaleString()}
- Current Monthly Income: $${bp.currentIncome.toLocaleString()}
- Gap to Close: $${gap.toLocaleString()}/month
- Daily Target: $${bp.dailyTarget.toLocaleString()}
- Skills: ${bp.skills || "Not specified"}
- Experience: ${bp.experience || "Not specified"}
- Passion: ${bp.passion || "Not specified"}`);
  } else {
    sections.push(`## USER'S DREAM LIFE BLUEPRINT
⚠️ NO BLUEPRINT CREATED YET - This is their first priority!`);
  }

  // Sprint section
  if (context.sprint) {
    const incompleteTasks = context.sprint.tasks.filter((t) => !t.completed);
    sections.push(`## CURRENT SPRINT PROGRESS
- Day ${context.sprint.day} of ${context.sprint.totalDays} (${context.sprint.progress}% complete)
- Sprint Revenue: $${context.sprint.revenueGenerated.toLocaleString()}
- Incomplete Tasks: ${incompleteTasks.length}
${incompleteTasks.slice(0, 3).map((t) => `  • ${t.label}`).join("\n")}`);
  }

  // Offers section
  if (context.offers.length > 0) {
    const activeOffers = context.offers.filter((o) => o.status === "active");
    const totalOfferRevenue = context.offers.reduce((sum, o) => sum + o.revenueGenerated, 0);
    sections.push(`## ACTIVE OFFERS (${activeOffers.length} active, ${context.offers.length} total)
- Total Offer Revenue: $${totalOfferRevenue.toLocaleString()}
${context.offers.slice(0, 5).map((o) => `  • ${o.name} - $${o.price} (${o.status}) - $${o.revenueGenerated.toLocaleString()} generated`).join("\n")}`);
  } else {
    sections.push(`## ACTIVE OFFERS
⚠️ NO OFFERS CREATED YET - They need at least one offer to generate revenue!`);
  }

  // Systems section
  if (context.systems.length > 0) {
    const incompleteSystems = context.systems.filter((s) => s.progress < 100);
    sections.push(`## SYSTEMS BUILT
- ${context.systems.length} total systems
- ${incompleteSystems.length} incomplete
${context.systems.slice(0, 3).map((s) => `  • ${s.name} - ${s.progress}% complete (${s.status})`).join("\n")}`);
  }

  // Revenue history
  sections.push(`## REVENUE HISTORY
- Total Revenue: $${context.revenueHistory.totalRevenue.toLocaleString()}
- This Month: $${context.revenueHistory.thisMonth.toLocaleString()}
- Last Month: $${context.revenueHistory.lastMonth.toLocaleString()}
- Growth: ${context.revenueHistory.growth > 0 ? "+" : ""}${context.revenueHistory.growth}%`);

  return sections.join("\n\n");
}

// Quick action suggestions based on user context
export interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  condition: (context: UserContext) => boolean;
}

export const quickActions: QuickAction[] = [
  {
    id: "create-blueprint",
    label: "🎯 Create my Dream Life Blueprint",
    prompt: "Help me create my Dream Life Blueprint. I need to figure out my income goals and what I really want.",
    condition: (ctx) => !ctx.blueprint,
  },
  {
    id: "review-blueprint",
    label: "📊 Review my revenue plan",
    prompt: "Review my Dream Life Blueprint and revenue plan. Am I on track? What should I adjust?",
    condition: (ctx) => !!ctx.blueprint,
  },
  {
    id: "create-offer",
    label: "💎 Create my first offer",
    prompt: "Help me create my first offer. What should I sell based on my skills and experience?",
    condition: (ctx) => ctx.offers.length === 0 && !!ctx.blueprint,
  },
  {
    id: "price-offer",
    label: "🏷️ Help me price my offer",
    prompt: "I need help pricing my offer. Can you review my pricing strategy and suggest improvements?",
    condition: (ctx) => ctx.offers.length > 0,
  },
  {
    id: "sprint-checkin",
    label: "✅ Check my sprint progress",
    prompt: "Check in on my sprint progress. What tasks should I focus on today?",
    condition: (ctx) => !!ctx.sprint,
  },
  {
    id: "next-action",
    label: "🚀 What's my next best action?",
    prompt: "Based on my current progress, what's the single most important action I should take right now?",
    condition: () => true,
  },
  {
    id: "revenue-gap",
    label: "💰 Close my revenue gap",
    prompt: "I need to close the gap between my current income and my goal. What strategies should I use?",
    condition: (ctx) => !!ctx.blueprint && ctx.blueprint.currentIncome < ctx.blueprint.monthlyIncome,
  },
  {
    id: "build-system",
    label: "⚙️ Build a revenue system",
    prompt: "Help me build an automated revenue system. What type of system should I create first?",
    condition: (ctx) => ctx.systems.length === 0 && ctx.offers.length > 0,
  },
  {
    id: "optimize-systems",
    label: "🔧 Optimize my systems",
    prompt: "Review my systems and suggest optimizations to increase revenue or efficiency.",
    condition: (ctx) => ctx.systems.length > 0,
  },
  {
    id: "analyze-offers",
    label: "📈 Analyze my offer performance",
    prompt: "Analyze my offers and tell me which ones are performing well and which need improvement.",
    condition: (ctx) => ctx.offers.length > 1,
  },
];

export function getRelevantQuickActions(context: UserContext): QuickAction[] {
  return quickActions
    .filter((action) => action.condition(context))
    .slice(0, 6); // Limit to 6 suggestions
}
