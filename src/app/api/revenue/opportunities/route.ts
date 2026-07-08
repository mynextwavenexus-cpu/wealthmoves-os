import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { 
  matchOpportunities, 
  filterOpportunities,
  parseSkills,
  UserProfile,
  MatchedOpportunity 
} from "@/lib/revenue-opportunities";
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
  const userId = await getUserId(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user's blueprint
    const blueprint = await db.getBlueprint(userId);

    if (!blueprint) {
      return NextResponse.json({ 
        error: "No blueprint found",
        message: "Create your Dream Life Blueprint first to get personalized revenue opportunities"
      }, { status: 404 });
    }

    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url);
    const maxTimeToRevenue = searchParams.get("maxTimeToRevenue") 
      ? parseInt(searchParams.get("maxTimeToRevenue")!) 
      : undefined;
    const minIncomePotential = searchParams.get("minIncomePotential") 
      ? parseInt(searchParams.get("minIncomePotential")!) 
      : undefined;
    const difficulty = searchParams.get("difficulty")?.split(",") as ("beginner" | "intermediate" | "advanced")[] | undefined;
    const maxStartupCost = searchParams.get("maxStartupCost") 
      ? parseInt(searchParams.get("maxStartupCost")!) 
      : undefined;

    // Build user profile
    const userProfile: UserProfile = {
      skills: parseSkills(blueprint.skills),
      experience: blueprint.experience,
      passion: blueprint.passion,
      monthlyIncomeGoal: blueprint.monthlyIncome,
      currentIncome: blueprint.currentIncome,
      // Default values for fields not in blueprint yet
      timeAvailability: "moderate",
      riskTolerance: "medium",
      preferredWorkStyle: "either",
      hasAudience: false,
      technicalLevel: "basic",
    };

    // Get matched opportunities
    let opportunities = matchOpportunities(userProfile);

    // Apply filters if provided
    if (maxTimeToRevenue || minIncomePotential || difficulty || maxStartupCost) {
      opportunities = filterOpportunities(opportunities, {
        maxTimeToRevenue,
        minIncomePotential,
        difficulty,
        maxStartupCost,
      });
    }

    // Get user's offers for context
    const offers = await db.getOffers(userId);
    const totalRevenue = offers.reduce((sum, offer) => sum + offer.revenueGenerated, 0);

    return NextResponse.json({
      opportunities,
      userProfile: {
        monthlyIncomeGoal: blueprint.monthlyIncome,
        currentIncome: blueprint.currentIncome,
        incomeGap: blueprint.monthlyIncome - blueprint.currentIncome,
        skills: userProfile.skills,
      },
      stats: {
        totalOpportunities: opportunities.length,
        highMatchCount: opportunities.filter(o => o.matchScore >= 80).length,
        currentRevenue: totalRevenue,
        offersCount: offers.length,
      },
    });
  } catch (error) {
    console.error("Revenue opportunities error:", error);
    return NextResponse.json(
      { error: "Failed to fetch revenue opportunities" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const userId = await getUserId(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Allow updating user profile preferences
    const {
      timeAvailability,
      riskTolerance,
      preferredWorkStyle,
      hasAudience,
      technicalLevel,
    } = body;

    // Get current blueprint
    const blueprint = await db.getBlueprint(userId);
    
    if (!blueprint) {
      return NextResponse.json({ error: "No blueprint found" }, { status: 404 });
    }

    // Build updated user profile with new preferences
    const userProfile: UserProfile = {
      skills: parseSkills(blueprint.skills),
      experience: blueprint.experience,
      passion: blueprint.passion,
      monthlyIncomeGoal: blueprint.monthlyIncome,
      currentIncome: blueprint.currentIncome,
      timeAvailability: timeAvailability || "moderate",
      riskTolerance: riskTolerance || "medium",
      preferredWorkStyle: preferredWorkStyle || "either",
      hasAudience: hasAudience || false,
      technicalLevel: technicalLevel || "basic",
    };

    // Get fresh matches with updated profile
    const opportunities = matchOpportunities(userProfile);

    return NextResponse.json({
      opportunities,
      userProfile: {
        monthlyIncomeGoal: blueprint.monthlyIncome,
        currentIncome: blueprint.currentIncome,
        incomeGap: blueprint.monthlyIncome - blueprint.currentIncome,
        skills: userProfile.skills,
        preferences: {
          timeAvailability: userProfile.timeAvailability,
          riskTolerance: userProfile.riskTolerance,
          technicalLevel: userProfile.technicalLevel,
        },
      },
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
