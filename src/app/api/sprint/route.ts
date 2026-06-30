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
    let sprint = await db.getSprint(userId);
    
    // Initialize sprint for demo user if not exists
    if (!sprint && userId === "demo_user") {
      sprint = await db.updateSprint(userId, {
        day: 1,
        totalDays: 30,
        startDate: new Date(),
        tasks: generateDefaultTasks(),
        revenueGenerated: 0,
      });
    }
    
    if (!sprint) {
      return NextResponse.json({ sprint: null });
    }

    // Calculate current day based on start date
    const startDate = new Date(sprint.startDate);
    const today = new Date();
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const currentDay = Math.min(diffDays, sprint.totalDays);

    return NextResponse.json({
      sprint: {
        ...sprint,
        day: currentDay,
        daysRemaining: sprint.totalDays - currentDay,
        progress: Math.round((currentDay / sprint.totalDays) * 100),
      },
    });
  } catch (error) {
    console.error("Sprint fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sprint" },
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
    
    // Create new sprint
    const sprint = await db.updateSprint(userId, {
      day: 1,
      totalDays: data.totalDays || 30,
      startDate: new Date(),
      tasks: data.tasks || generateDefaultTasks(),
      revenueGenerated: 0,
    });

    return NextResponse.json({ sprint });
  } catch (error) {
    console.error("Sprint creation error:", error);
    return NextResponse.json(
      { error: "Failed to create sprint" },
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
    const sprint = await db.updateSprint(userId, data);
    return NextResponse.json({ sprint });
  } catch (error) {
    console.error("Sprint update error:", error);
    return NextResponse.json(
      { error: "Failed to update sprint" },
      { status: 500 }
    );
  }
}

// PATCH for updating task completion or sprint data
export async function PATCH(request: NextRequest) {
  const userId = await getUserId(request);
  
  // Demo users can't save changes
  if (!userId) {
    return NextResponse.json(
      { error: "Please sign in to save changes" },
      { status: 401 }
    );
  }

  try {
    const data = await request.json();
    const sprint = await db.getSprint(userId);
    
    if (!sprint) {
      return NextResponse.json({ error: "No active sprint" }, { status: 404 });
    }

    // Support updating entire task list or individual fields
    const updatedSprint = await db.updateSprint(userId, data);
    
    // Calculate current day based on start date
    const startDate = new Date(updatedSprint.startDate);
    const today = new Date();
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const currentDay = Math.min(diffDays, updatedSprint.totalDays);

    return NextResponse.json({
      sprint: {
        ...updatedSprint,
        day: currentDay,
        daysRemaining: updatedSprint.totalDays - currentDay,
        progress: Math.round((currentDay / updatedSprint.totalDays) * 100),
      },
    });
  } catch (error) {
    console.error("Task update error:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

function generateDefaultTasks() {
  return [
    { id: "t1", label: "Define your dream life income goal", completed: true, category: "strategy" },
    { id: "t2", label: "Identify 3 potential revenue streams", completed: true, category: "strategy" },
    { id: "t3", label: "Create your first offer outline", completed: false, category: "offers" },
    { id: "t4", label: "Set up your sales system", completed: false, category: "systems" },
    { id: "t5", label: "Reach out to 5 prospects", completed: false, category: "sales" },
    { id: "t6", label: "Create content for your audience", completed: false, category: "content" },
    { id: "t7", label: "Track your first revenue", completed: false, category: "analytics" },
  ];
}
