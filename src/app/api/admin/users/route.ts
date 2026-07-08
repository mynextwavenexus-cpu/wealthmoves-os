import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "wealthmoves-secret-key-change-in-production"
);

// In-memory user store (replace with database in production)
const users = [
  {
    id: "user_001",
    email: "emma@wealthmoves.ai",
    name: "Emma Jackson",
    tier: "sprint",
    createdAt: "2026-01-01T00:00:00Z",
    lastLogin: "2026-07-08T10:00:00Z",
  },
  {
    id: "user_demo1",
    email: "demo1@wealthmoves.ai",
    name: "Demo User (Starter)",
    tier: "starter",
    createdAt: "2026-06-01T00:00:00Z",
    lastLogin: "2026-07-08T09:00:00Z",
  },
  {
    id: "user_demo2",
    email: "demo2@wealthmoves.ai",
    name: "Demo User (Pro)",
    tier: "pro",
    createdAt: "2026-06-01T00:00:00Z",
    lastLogin: "2026-07-08T08:00:00Z",
  },
];

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

  return NextResponse.json({ users });
}

export async function PATCH(request: NextRequest) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, tier } = body;

    const user = users.find(u => u.id === userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.tier = tier;
    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
