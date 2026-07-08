// Admin Activity API - User activity logs and events
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "wealthmoves-secret-key-change-in-production"
);

// Mock activity log (would be stored in database)
const activityLog = [
  {
    id: "act_001",
    userId: "user_demo3",
    userName: "Demo User (Sprint)",
    userEmail: "demo3@wealthmoves.ai",
    action: "upgraded",
    details: "Upgraded to Sprint tier",
    metadata: { fromTier: "starter", toTier: "sprint" },
    timestamp: "2026-07-08T12:00:00Z",
  },
  {
    id: "act_002",
    userId: "user_demo2",
    userName: "Demo User (Pro)",
    userEmail: "demo2@wealthmoves.ai",
    action: "blueprint_created",
    details: "Created new blueprint",
    metadata: { blueprintName: "Dream Life 2026" },
    timestamp: "2026-07-08T11:30:00Z",
  },
  {
    id: "act_003",
    userId: "user_demo1",
    userName: "Demo User (Starter)",
    userEmail: "demo1@wealthmoves.ai",
    action: "login",
    details: "User logged in",
    metadata: { ip: "192.168.1.1" },
    timestamp: "2026-07-08T11:00:00Z",
  },
  {
    id: "act_004",
    userId: "user_001",
    userName: "Emma Jackson",
    userEmail: "emma@wealthmoves.ai",
    action: "admin_action",
    details: "Viewed admin dashboard",
    metadata: {},
    timestamp: "2026-07-08T10:00:00Z",
  },
  {
    id: "act_005",
    userId: "user_demo2",
    userName: "Demo User (Pro)",
    userEmail: "demo2@wealthmoves.ai",
    action: "offer_created",
    details: "Created new offer",
    metadata: { offerName: "Coaching Package", price: 497 },
    timestamp: "2026-07-08T09:45:00Z",
  },
  {
    id: "act_006",
    userId: "user_demo3",
    userName: "Demo User (Sprint)",
    userEmail: "demo3@wealthmoves.ai",
    action: "sprint_started",
    details: "Started 30-day sprint",
    metadata: { day: 1 },
    timestamp: "2026-07-08T09:30:00Z",
  },
  {
    id: "act_007",
    userId: "user_demo1",
    userName: "Demo User (Starter)",
    userEmail: "demo1@wealthmoves.ai",
    action: "ai_chat",
    details: "Used AI Coach",
    metadata: { messageCount: 5 },
    timestamp: "2026-07-08T09:00:00Z",
  },
  {
    id: "act_008",
    userId: "user_demo2",
    userName: "Demo User (Pro)",
    userEmail: "demo2@wealthmoves.ai",
    action: "system_built",
    details: "Built revenue system",
    metadata: { systemType: "newsletter" },
    timestamp: "2026-07-08T08:30:00Z",
  },
];

async function isAdmin(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.userId === "user_001";
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const action = searchParams.get("action");
    const userId = searchParams.get("userId");

    // Filter activities
    let filtered = [...activityLog];

    if (action) {
      filtered = filtered.filter((a) => a.action === action);
    }

    if (userId) {
      filtered = filtered.filter((a) => a.userId === userId);
    }

    // Sort by timestamp (newest first)
    filtered.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Paginate
    const total = filtered.length;
    const activities = filtered.slice(offset, offset + limit);

    // Calculate action counts
    const actionCounts = activityLog.reduce((acc, activity) => {
      acc[activity.action] = (acc[activity.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      activities,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      actionCounts,
    });
  } catch (error) {
    console.error("Failed to fetch activity data:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity data" },
      { status: 500 }
    );
  }
}
