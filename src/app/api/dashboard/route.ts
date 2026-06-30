import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "wealthmoves-secret-key-change-in-production"
);

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

export async function GET(request: NextRequest) {
  let userId = await getUserId(request);
  
  // Use demo user if not authenticated
  if (!userId) {
    userId = "demo_user";
  }

  try {
    const blueprint = await db.getBlueprint(userId);
    const sprint = await db.getSprint(userId);
    const weeklyStats = await db.getWeeklyStats(userId);
    const offers = await db.getOffers(userId);

    // Calculate progress percentages
    const incomeProgress = blueprint 
      ? Math.round((blueprint.currentIncome / blueprint.monthlyIncome) * 100)
      : 0;
    
    const blueprintProgress = blueprint ? 65 : 0;

    const revenueScore = Math.min(100, Math.round(
      (weeklyStats.revenue / 2000) * 50 + 
      (weeklyStats.newLeads * 2) + 
      (weeklyStats.conversations * 5)
    ));

    return NextResponse.json({
      stats: {
        monthlyIncomeGoal: blueprint?.monthlyIncome || 0,
        currentIncome: blueprint?.currentIncome || 0,
        incomeProgress,
        blueprintProgress,
        revenueScore,
      },
      sprint: sprint ? {
        day: sprint.day,
        totalDays: sprint.totalDays,
        daysRemaining: sprint.totalDays - sprint.day,
        revenueGenerated: sprint.revenueGenerated,
      } : null,
      weeklyStats,
      offers: offers.map(o => ({
        id: o.id,
        name: o.name,
        price: o.price,
        status: o.status,
        revenueGenerated: o.revenueGenerated,
      })),
      nextAction: blueprint ? {
        title: "Complete Your Revenue Opportunities Assessment",
        description: "Based on your dream life blueprint, we need to identify your highest-potential income streams. This 5-minute assessment will unlock personalized recommendations.",
        cta: "Start Assessment",
        link: "/revenue",
      } : {
        title: "Create Your Dream Life Blueprint",
        description: "Start by defining your ideal lifestyle. We'll calculate exactly how much you need to earn to make it a reality.",
        cta: "Start Blueprint",
        link: "/dream-life",
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
