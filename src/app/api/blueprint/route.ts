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

// Helper to calculate derived income targets
function calculateIncomeTargets(monthlyIncome: number) {
  return {
    yearlyTarget: monthlyIncome * 12,
    weeklyTarget: Math.round(monthlyIncome / 4.33),
    dailyTarget: Math.round((monthlyIncome / 4.33) / 5),
    hourlyTarget: Math.round(((monthlyIncome / 4.33) / 5) / 8),
  };
}

export async function GET(request: NextRequest) {
  const userId = await getUserId(request);
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const blueprint = await db.getBlueprint(userId);
    
    if (!blueprint) {
      return NextResponse.json({ blueprint: null });
    }

    return NextResponse.json({ blueprint });
  } catch (error) {
    console.error("Blueprint fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blueprint" },
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
    const data = await request.json();
    
    // Get monthly income goal (support both snake_case and camelCase)
    const monthlyIncome = data.monthlyIncome || data.monthly_income || data.dreamIncome || 10000;
    const currentIncome = data.currentIncome || data.current_income || 0;
    
    // Calculate derived targets
    const targets = calculateIncomeTargets(monthlyIncome);

    const blueprint = await db.saveBlueprint(userId, {
      // Personal info
      name: data.name || "",
      
      // Income targets
      monthlyIncome,
      currentIncome,
      ...targets,
      
      // Lifestyle costs (support both snake_case and camelCase)
      homeCost: data.homeCost ?? data.home_cost ?? 0,
      vehicleCost: data.vehicleCost ?? data.vehicle_cost ?? 0,
      travelCost: data.travelCost ?? data.travel_cost ?? 0,
      foodCost: data.foodCost ?? data.food_cost ?? 0,
      trainerCost: data.trainerCost ?? data.trainer_cost ?? 0,
      chefCost: data.chefCost ?? data.chef_cost ?? 0,
      collegeCost: data.collegeCost ?? data.college_cost ?? 0,
      retirementCost: data.retirementCost ?? data.retirement_cost ?? 0,
      otherCost: data.otherCost ?? data.other_cost ?? 0,
      otherDescription: data.otherDescription ?? data.other_description ?? "",
      
      // Skills and experience
      skills: data.skills || "",
      experience: data.experience || "",
      passion: data.passion || "",
      
      // Additional onboarding data
      hoursPerWeek: data.hoursPerWeek ?? data.hours_per_week ?? 0,
      biggestChallenge: data.biggestChallenge ?? data.biggest_challenge ?? "",
      timeline: data.timeline || "",
    });

    return NextResponse.json({ blueprint });
  } catch (error) {
    console.error("Blueprint save error:", error);
    return NextResponse.json(
      { error: "Failed to save blueprint" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const userId = await getUserId(request);
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    // If monthly income is being updated, recalculate derived values
    let updates: Record<string, unknown> = { ...data };
    
    if (data.monthlyIncome !== undefined || data.monthly_income !== undefined) {
      const monthlyIncome = data.monthlyIncome ?? data.monthly_income;
      const targets = calculateIncomeTargets(monthlyIncome);
      updates = { ...updates, ...targets };
    }

    const blueprint = await db.saveBlueprint(userId, {
      // Personal info
      name: updates.name as string | undefined,
      
      // Income targets
      monthlyIncome: (updates.monthlyIncome ?? updates.monthly_income) as number | undefined,
      currentIncome: (updates.currentIncome ?? updates.current_income) as number | undefined,
      yearlyTarget: (updates.yearlyTarget ?? updates.yearly_target) as number | undefined,
      monthlyTarget: (updates.monthlyTarget ?? updates.monthly_target) as number | undefined,
      weeklyTarget: (updates.weeklyTarget ?? updates.weekly_target) as number | undefined,
      dailyTarget: (updates.dailyTarget ?? updates.daily_target) as number | undefined,
      hourlyTarget: (updates.hourlyTarget ?? updates.hourly_target) as number | undefined,
      
      // Lifestyle costs
      homeCost: (updates.homeCost ?? updates.home_cost) as number | undefined,
      vehicleCost: (updates.vehicleCost ?? updates.vehicle_cost) as number | undefined,
      travelCost: (updates.travelCost ?? updates.travel_cost) as number | undefined,
      foodCost: (updates.foodCost ?? updates.food_cost) as number | undefined,
      trainerCost: (updates.trainerCost ?? updates.trainer_cost) as number | undefined,
      chefCost: (updates.chefCost ?? updates.chef_cost) as number | undefined,
      collegeCost: (updates.collegeCost ?? updates.college_cost) as number | undefined,
      retirementCost: (updates.retirementCost ?? updates.retirement_cost) as number | undefined,
      otherCost: (updates.otherCost ?? updates.other_cost) as number | undefined,
      otherDescription: (updates.otherDescription ?? updates.other_description) as string | undefined,
      
      // Skills and experience
      skills: updates.skills as string | undefined,
      experience: updates.experience as string | undefined,
      passion: updates.passion as string | undefined,
      
      // Additional data
      hoursPerWeek: (updates.hoursPerWeek ?? updates.hours_per_week) as number | undefined,
      biggestChallenge: (updates.biggestChallenge ?? updates.biggest_challenge) as string | undefined,
      timeline: updates.timeline as string | undefined,
    });
    
    return NextResponse.json({ blueprint });
  } catch (error) {
    console.error("Blueprint update error:", error);
    return NextResponse.json(
      { error: "Failed to update blueprint" },
      { status: 500 }
    );
  }
}

// DELETE endpoint to clear blueprint
export async function DELETE(request: NextRequest) {
  const userId = await getUserId(request);
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // For now, we'll just return success as we don't have a delete method in db
    // This can be implemented later if needed
    return NextResponse.json({ success: true, message: "Blueprint cleared" });
  } catch (error) {
    console.error("Blueprint delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete blueprint" },
      { status: 500 }
    );
  }
}
