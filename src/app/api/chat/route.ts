import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jwtVerify } from "jose";
import { CoachingMode, buildSystemPrompt, UserContext } from "@/lib/ai-modes";

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

async function gatherUserContext(userId: string): Promise<UserContext> {
  // Fetch all user data in parallel
  const [blueprint, sprint, offers] = await Promise.all([
    db.getBlueprint(userId),
    db.getSprint(userId),
    db.getOffers(userId),
  ]);

  return {
    blueprint: blueprint ? {
      name: blueprint.name,
      monthlyIncome: blueprint.monthlyIncome,
      currentIncome: blueprint.currentIncome,
      yearlyTarget: blueprint.yearlyTarget,
      weeklyTarget: blueprint.weeklyTarget,
      dailyTarget: blueprint.dailyTarget,
      hourlyTarget: blueprint.hourlyTarget,
      skills: blueprint.skills,
      experience: blueprint.experience,
      passion: blueprint.passion,
    } : null,
    sprint: sprint ? {
      day: sprint.day,
      totalDays: sprint.totalDays,
      progress: Math.round((sprint.tasks.filter(t => t.completed).length / sprint.tasks.length) * 100) || 0,
      tasks: sprint.tasks,
      revenueGenerated: sprint.revenueGenerated,
    } : null,
    offers: offers || [],
    systems: [],
    revenueHistory: {
      totalRevenue: offers?.reduce((sum, o) => sum + o.revenueGenerated, 0) || 0,
      thisMonth: 0,
      lastMonth: 0,
      growth: 0,
    },
  };
}

function generateContextualResponse(message: string, context: UserContext, mode: CoachingMode): string {
  const lowerMsg = message.toLowerCase();

  // Mode-specific responses
  if (mode === "revenue-strategist") {
    if (!context.blueprint) {
      return "I need to see your Dream Life Blueprint first! Without knowing your income goals, I can't build a revenue strategy. Head to the Blueprint section and let's map out exactly how much you need to earn monthly, weekly, and daily. Then I can show you the math to get there.";
    }
    const gap = context.blueprint.monthlyIncome - context.blueprint.currentIncome;
    const dailyGap = Math.round(gap / 30);
    return `Here's your revenue reality check:

**Target**: $${context.blueprint.monthlyIncome.toLocaleString()}/month
**Current**: $${context.blueprint.currentIncome.toLocaleString()}/month
**Gap**: $${gap.toLocaleString()}/month ($${dailyGap.toLocaleString()}/day)

To close this gap, you need:
- ${Math.ceil(gap / 1000)} sales of a $1,000 offer per month, OR
- ${Math.ceil(gap / 500)} sales of a $500 offer per month, OR
- ${Math.ceil(gap / 100)} sales of a $100 offer per month

Which offer price point feels most achievable for you right now?`;
  }

  if (mode === "accountability") {
    if (!context.sprint) {
      return "You're not currently in a sprint! A 30-Day Revenue Sprint is the fastest way to build momentum. Each day has specific tasks that compound into real revenue. Want to start one? I recommend committing to 30 days of consistent action.";
    }
    const incompleteTasks = context.sprint.tasks.filter((t) => !t.completed);
    const completedTasks = context.sprint.tasks.filter((t) => t.completed);
    return `Sprint Check-in: Day ${context.sprint.day} of ${context.sprint.totalDays}

**Completed**: ${completedTasks.length} tasks ✓
**Remaining**: ${incompleteTasks.length} tasks

Your incomplete tasks:
${incompleteTasks.slice(0, 3).map((t) => `- ${t.label}`).join("\n")}

What's blocking you from completing these? Let's identify the bottleneck and remove it. What ONE task will you commit to finishing in the next 2 hours?`;
  }

  if (mode === "technical") {
    return [
      "I'm in Technical Assistant mode. I can help you set up:",
      "",
      "- Email marketing (ConvertKit, Mailchimp)",
      "- Landing pages (Carrd, Webflow)",
      "- Payment processing (Stripe setup)",
      "- Scheduling tools (Calendly)",
      "- Automation (Zapier)",
      "",
      "What specific tool or system are you trying to set up? Describe where you're stuck and I'll give you step-by-step instructions."
    ].join("\n");
  }

  // General mode - contextual responses
  if (lowerMsg.includes("blueprint") || lowerMsg.includes("dream life") || lowerMsg.includes("goal")) {
    if (!context.blueprint) {
      return "Your Dream Life Blueprint is the foundation of everything we do. It breaks down your vision into specific income targets. You haven't created one yet - this should be your first step! Head to the Blueprint section and let's calculate exactly how much you need to earn to live your dream life.";
    }
    const gap = context.blueprint.monthlyIncome - context.blueprint.currentIncome;
    return `Your Dream Life Blueprint shows you need $${context.blueprint.monthlyIncome.toLocaleString()}/month to fund your ideal lifestyle. You're currently at $${context.blueprint.currentIncome.toLocaleString()}, so we need to close a $${gap.toLocaleString()} gap.

Your daily target is $${context.blueprint.dailyTarget.toLocaleString()}. Based on your skills in ${context.blueprint.skills || "your field"}, we should focus on high-value offers that get you there fastest.

Want to review or adjust any part of your blueprint?`;
  }

  if (lowerMsg.includes("offer") || lowerMsg.includes("product") || lowerMsg.includes("service")) {
    if (context.offers.length === 0) {
      return [
        "You don't have any offers created yet! An offer is what you sell to generate revenue. Based on your blueprint, you need offers that can scale to your income goals.",
        "",
        "Let's brainstorm your first offer:",
        "1. What problem do you solve better than most?",
        "2. Who desperately needs this solution?",
        "3. What format works best (coaching, course, done-for-you service)?",
        "",
        "What skills or knowledge do you have that others would pay for?"
      ].join("\n");
    }
    const totalRevenue = context.offers.reduce((sum, o) => sum + o.revenueGenerated, 0);
    return `You have ${context.offers.length} offer(s) generating $${totalRevenue.toLocaleString()} total. 

Your offers:
${context.offers.map((o) => `- ${o.name} - $${o.price} (${o.status}) - $${o.revenueGenerated.toLocaleString()} revenue`).join("\n")}

Which offer would you like to optimize? I can help with pricing, positioning, or creating a sales strategy.`;
  }

  if (lowerMsg.includes("sprint") || lowerMsg.includes("30 day") || lowerMsg.includes("challenge")) {
    if (!context.sprint) {
      return "The 30-Day Revenue Sprint is designed to get you from idea to income fast. Each day has specific tasks focused on building your offer, finding prospects, and making sales. You're not currently in a sprint - want to start one? Commit to 30 days of daily action and watch your revenue grow.";
    }
    const incompleteTasks = context.sprint.tasks.filter((t) => !t.completed);
    return [
      `You're on Day ${context.sprint.day} of your 30-Day Revenue Sprint! You've generated $${context.sprint.revenueGenerated.toLocaleString()} so far.`,
      "",
      `You have ${incompleteTasks.length} incomplete tasks. Today's focus should be:`,
      incompleteTasks.slice(0, 2).map((t) => `- ${t.label}`).join("\n"),
      "",
      "The sprint works when you work it. Which task can you knock out right now?"
    ].join("\n");
  }

  if (lowerMsg.includes("system") || lowerMsg.includes("automation") || lowerMsg.includes("funnel")) {
    return [
      "Systems are what separate hustlers from business owners. A good system brings you leads while you sleep.",
      "",
      "Based on your current setup, I recommend starting with:",
      "1. **Lead capture system** - Landing page + email opt-in",
      "2. **Nurture system** - Automated email sequence",
      "3. **Sales system** - Calendar booking + payment processing",
      "",
      "Which of these feels most important to automate first? Or do you have a specific system you're trying to build?"
    ].join("\n");
  }

  if (lowerMsg.includes("revenue") || lowerMsg.includes("income") || lowerMsg.includes("money") || lowerMsg.includes("next best action")) {
    if (!context.blueprint) {
      return "To help you with revenue goals, I need to understand your dream life first. Let's create your blueprint - this will calculate exactly how much you need to earn monthly, weekly, and daily. Head to the Dream Life section to get started!";
    }
    if (context.offers.length === 0) {
      return `You have a blueprint (great!) but no offers yet. Your next best action is to create your first offer. What can you sell that solves a real problem? Think about your skills in ${context.blueprint?.skills || "your field"}. What do people ask you for help with?`;
    }
    const gap = context.blueprint.monthlyIncome - context.blueprint.currentIncome;
    const incompleteTasks = context.sprint?.tasks.filter((t) => !t.completed) || [];
    if (incompleteTasks.length > 0) {
      return [
        `Your next best action: **${incompleteTasks[0].label}**`,
        "",
        `You're on track to hit $${context.blueprint.monthlyIncome.toLocaleString()}/month but you need to close a $${gap.toLocaleString()} gap. The fastest path is completing your sprint tasks and making offers to qualified prospects.`,
        "",
        "Focus on this one task for the next hour. Momentum comes from action, not planning. Ready to knock it out?"
      ].join("\n");
    }
    return [
      "You're making great progress! With ${context.offers.length} offers and a clear blueprint, your next focus should be scaling what's working.",
      "",
      "Consider:",
      "1. Increasing prices on your best-performing offer",
      "2. Creating a system to generate consistent leads",
      "3. Running another sprint to hit the next revenue milestone",
      "",
      "What's feeling like the bottleneck right now?"
    ].join("\n");
  }

  // Default response
  return [
    "That's a great question! I'm here to help you build revenue-generating systems. I can assist with:",
    "",
    "- Creating and optimizing offers",
    "- Building automated systems",
    "- Planning your daily revenue activities",
    "- Reviewing your blueprint and strategy",
    "- Technical setup and tools",
    "",
    "What would be most valuable to focus on right now? Or tell me more about where you're feeling stuck."
  ].join("\n");
}

export async function POST(request: NextRequest) {
  const userId = await getUserId(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { message, mode = "general" } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Gather user context
    const context = await gatherUserContext(userId);

    // If no Claude API key, use contextual response system
    if (!CLAUDE_API_KEY) {
      const response = generateContextualResponse(message, context, mode as CoachingMode);
      
      // Store in chat history
      await db.addChatMessage(userId, { role: "user", content: message });
      await db.addChatMessage(userId, { role: "assistant", content: response });

      return NextResponse.json({ response });
    }

    // Build system prompt based on mode and context
    const systemPrompt = buildSystemPrompt(mode as CoachingMode, context);

    // Call Claude API
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          { role: "user", content: message },
        ],
      }),
    });

    if (!claudeResponse.ok) {
      const errorData = await claudeResponse.json();
      console.error("Claude API error:", errorData);
      
      // Fallback to contextual response
      const fallbackResponse = generateContextualResponse(message, context, mode as CoachingMode);
      
      await db.addChatMessage(userId, { role: "user", content: message });
      await db.addChatMessage(userId, { role: "assistant", content: fallbackResponse });

      return NextResponse.json({ response: fallbackResponse });
    }

    const claudeData = await claudeResponse.json();
    const assistantMessage = claudeData.content[0].text;

    // Store in chat history
    await db.addChatMessage(userId, { role: "user", content: message });
    await db.addChatMessage(userId, { role: "assistant", content: assistantMessage });

    return NextResponse.json({ response: assistantMessage });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const userId = await getUserId(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const history = await db.getChatHistory(userId);
    return NextResponse.json({ history });
  } catch (error) {
    console.error("Chat history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}
