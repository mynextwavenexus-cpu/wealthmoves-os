import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "wealthmoves-secret-key-change-in-production"
);

async function isAdmin(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return false;
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.userId === "user_001"; // Only Emma is admin
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mock stats - replace with real database queries
  const stats = {
    totalUsers: 3,
    activeUsers: 2,
    revenue: 0,
    newUsersToday: 0,
  };

  return NextResponse.json(stats);
}
