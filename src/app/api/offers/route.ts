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

// GET /api/offers - List all offers for the user
export async function GET(request: NextRequest) {
  const userId = await getUserId(request);
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

// POST /api/offers - Create a new offer
export async function POST(request: NextRequest) {
  const userId = await getUserId(request);
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || data.price === undefined) {
      return NextResponse.json(
        { error: "Name and price are required" },
        { status: 400 }
      );
    }

    const offer = await db.createOffer(userId, {
      name: data.name,
      description: data.description || "",
      price: data.price,
      status: data.status || "draft",
      type: data.type || "one-time",
      deliveryFormat: data.deliveryFormat || "digital",
      targetAudience: data.targetAudience || "",
      keyBenefits: data.keyBenefits || [],
      deliverables: data.deliverables || [],
      bonuses: data.bonuses || [],
      guarantee: data.guarantee || { enabled: false, type: "satisfaction", days: 30, description: "" },
      urgency: data.urgency || { enabled: false, type: "limited-spots", description: "" }
    });

    return NextResponse.json({ offer }, { status: 201 });
  } catch (error) {
    console.error("Offer creation error:", error);
    return NextResponse.json(
      { error: "Failed to create offer" },
      { status: 500 }
    );
  }
}
