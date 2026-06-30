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
    const systems = await db.getSystems(userId);
    return NextResponse.json({ systems });
  } catch (error) {
    console.error("Systems fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch systems" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const userId = await getUserId(request);
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { systemId, ...updates } = body;

    if (!systemId) {
      return NextResponse.json(
        { error: "System ID is required" },
        { status: 400 }
      );
    }

    const updated = await db.updateSystem(userId, systemId, updates);
    
    if (!updated) {
      return NextResponse.json(
        { error: "System not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ system: updated });
  } catch (error) {
    console.error("System update error:", error);
    return NextResponse.json(
      { error: "Failed to update system" },
      { status: 500 }
    );
  }
}
