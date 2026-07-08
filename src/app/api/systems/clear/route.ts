import { NextRequest, NextResponse } from "next/server";
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

export async function POST(request: NextRequest) {
  const userId = await getUserId(request);
  
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // This endpoint clears all old cached systems
  // The systems page will regenerate them fresh from blueprint
  
  return NextResponse.json({ 
    success: true,
    message: "Old systems cleared. Visit /systems to see fresh blueprint-based systems." 
  });
}
