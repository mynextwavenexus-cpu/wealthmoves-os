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
    
    // Calculate targets based on monthly income goal
    const monthlyIncome = data.monthlyIncome || data.monthly_income || 10000;
    const yearlyTarget = monthlyIncome * 12;
    const weeklyTarget = Math.round(monthlyIncome / 4.33);
    const dailyTarget = Math.round(weeklyTarget / 5);
    const hourlyTarget = Math.round(dailyTarget / 8);

    const blueprint = await db.saveBlueprint(userId, {
      name: data.name || "",
      monthlyIncome,
      currentIncome: data.currentIncome || data.current_income || 0,
      yearlyTarget,
      monthlyTarget: monthlyIncome,
      weeklyTarget,
      dailyTarget,
      hourlyTarget,
      homeCost: data.homeCost || data.home_cost || 0,
      vehicleCost: data.vehicleCost || data.vehicle_cost || 0,
      travelCost: data.travelCost || data.travel_cost || 0,
      foodCost: data.foodCost || data.food_cost || 0,
      trainerCost: data.trainerCost || data.trainer_cost || 0,
      chefCost: data.chefCost || data.chef_cost || 0,
      collegeCost: data.collegeCost || data.college_cost || 0,
      retirementCost: data.retirementCost || data.retirement_cost || 0,
      otherCost: data.otherCost || data.other_cost || 0,
      otherDescription: data.otherDescription || data.other_description || "",
      skills: data.skills || "",
      experience: data.experience || "",
      passion: data.passion || "",
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
    const blueprint = await db.saveBlueprint(userId, {
      name: data.name,
      monthlyIncome: data.monthlyIncome,
      currentIncome: data.currentIncome,
      yearlyTarget: data.yearlyTarget,
      monthlyTarget: data.monthlyTarget,
      weeklyTarget: data.weeklyTarget,
      dailyTarget: data.dailyTarget,
      hourlyTarget: data.hourlyTarget,
      homeCost: data.homeCost,
      vehicleCost: data.vehicleCost,
      travelCost: data.travelCost,
      foodCost: data.foodCost,
      trainerCost: data.trainerCost,
      chefCost: data.chefCost,
      collegeCost: data.collegeCost,
      retirementCost: data.retirementCost,
      otherCost: data.otherCost,
      otherDescription: data.otherDescription,
      skills: data.skills,
      experience: data.experience,
      passion: data.passion,
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
