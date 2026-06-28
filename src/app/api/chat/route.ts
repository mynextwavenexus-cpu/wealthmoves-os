import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
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

export async function POST(request: NextRequest) {
  const userId = await getUserId(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Save user message
    await db.addChatMessage(userId, { role: "user", content: message });

    // Get user's context
    const blueprint = await db.getBlueprint(userId);
    const sprint = await db.getSprint(userId);
    const offers = await db.getOffers(userId);
    const chatHistory = await db.getChatHistory(userId);

    // Build system prompt
    const systemPrompt = `You are Emma J™, an AI Revenue Coach for WealthMoves. You help entrepreneurs identify income opportunities, build offers, and create revenue-generating systems.

User Context:
${blueprint ? `- Monthly Income Goal: $${blueprint.monthlyIncome.toLocaleString()}
- Current Income: $${blueprint.currentIncome.toLocaleString()}
- Daily Target: $${blueprint.dailyTarget}` : '- No blueprint created yet'}
${sprint ? `- Sprint Progress: Day ${sprint.day} of ${sprint.totalDays}` : ''}
${offers.length > 0 ? `- Active Offers: ${offers.map(o => o.name).join(', ')}` : ''}

Be encouraging, practical, and specific. Provide actionable advice. If they haven't created a blueprint yet, encourage them to start there. Keep responses concise (2-3 paragraphs max).`;

    let aiResponse: string;

    // Try Claude API if available
    if (CLAUDE_API_KEY) {
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": CLAUDE_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 500,
            system: systemPrompt,
            messages: [
              ...chatHistory.slice(-5).map(m => ({
                role: m.role as "user" | "assistant",
                content: m.content,
              })),
              { role: "user", content: message },
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          aiResponse = data.content[0].text;
        } else {
          throw new Error("Claude API error");
        }
      } catch (error) {
        console.error("Claude API error:", error);
        aiResponse = generateFallbackResponse(message, blueprint, offers);
      }
    } else {
      // Fallback response generation
      aiResponse = generateFallbackResponse(message, blueprint, offers);
    }

    // Save AI response
    await db.addChatMessage(userId, { role: "assistant", content: aiResponse });

    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
    });
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

function generateFallbackResponse(
  message: string,
  blueprint: Awaited<ReturnType<typeof db.getBlueprint>>,
  offers: Awaited<ReturnType<typeof db.getOffers>>
): string {
  const lowerMsg = message.toLowerCase();

  // Intent detection
  if (lowerMsg.includes("revenue") || lowerMsg.includes("income") || lowerMsg.includes("money")) {
    if (!blueprint) {
      return "To help you with revenue goals, I need to understand your dream life first. Let's create your blueprint - this will calculate exactly how much you need to earn monthly, weekly, and daily. Head to the Dream Life section to get started!";
    }
    const gap = blueprint.monthlyIncome - blueprint.currentIncome;
    return `Based on your blueprint, you need $${gap.toLocaleString()} more per month to reach your goal. That's about $${Math.round(gap / 4.33).toLocaleString()} per week. Let's identify which of your offers can close that gap. What offer are you most excited to promote right now?`;
  }

  if (lowerMsg.includes("offer") || lowerMsg.includes("product") || lowerMsg.includes("service")) {
    if (offers.length === 0) {
      return "You don't have any offers created yet! An offer is what you sell to generate revenue. It could be a service, product, course, or coaching program. What skills or knowledge do you have that others would pay for?";
    }
    return `You have ${offers.length} offer(s) in your portfolio. Your highest-performing offer is generating good revenue. Would you like help optimizing the pricing, creating a sales page, or building a funnel for one of these offers?`;
  }

  if (lowerMsg.includes("sprint") || lowerMsg.includes("30 day") || lowerMsg.includes("challenge")) {
    return "The 30-Day Revenue Sprint is designed to get you from idea to income fast. Each day has specific tasks focused on building your offer, finding prospects, and making sales. Are you currently in a sprint, or would you like to start one?";
  }

  if (lowerMsg.includes("system") || lowerMsg.includes("automation") || lowerMsg.includes("funnel")) {
    return "Systems are what separate hustlers from business owners. A good system brings you leads while you sleep. I can help you build a newsletter system, sales funnel, or content automation. Which area feels most important to automate right now?";
  }

  if (lowerMsg.includes("blueprint") || lowerMsg.includes("dream life") || lowerMsg.includes("goal")) {
    return "Your Dream Life Blueprint is the foundation of everything. It breaks down your big vision into specific income targets. If you haven't created one yet, that's your first step. If you have, we can review and adjust it based on your progress.";
  }

  // Default response
  return "That's a great question! I'm here to help you build revenue-generating systems. I can assist with creating offers, optimizing pricing, building funnels, or planning your daily revenue activities. What would be most valuable to focus on right now?";
}
