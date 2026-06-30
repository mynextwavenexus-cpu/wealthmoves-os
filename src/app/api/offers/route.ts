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
    const offers = await db.getOffers(userId);
    return NextResponse.json({ offers });
  } catch (error) {
    console.error("Offers fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch offers" },
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
    const offer = await db.createOffer(userId, data);
    return NextResponse.json({ offer });
  } catch (error) {
    console.error("Offer creation error:", error);
    return NextResponse.json(
      { error: "Failed to create offer" },
      { status: 500 }
    );
  }
}
