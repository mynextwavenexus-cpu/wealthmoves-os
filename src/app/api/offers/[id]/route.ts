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

// GET /api/offers/[id] - Get a specific offer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const offer = await db.getOfferById(id, userId);

    if (!offer) {
      return NextResponse.json(
        { error: "Offer not found" },
        { status: 404 }
      );
    }

    // Get stats for the offer
    const stats = await db.getOfferStats(id);

    return NextResponse.json({
      offer: {
        ...offer,
        stats
      }
    });
  } catch (error) {
    console.error("Offer fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch offer" },
      { status: 500 }
    );
  }
}

// PUT /api/offers/[id] - Update an offer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await request.json();

    // Check if offer exists and belongs to user
    const existingOffer = await db.getOfferById(id, userId);
    if (!existingOffer) {
      return NextResponse.json(
        { error: "Offer not found" },
        { status: 404 }
      );
    }

    const updatedOffer = await db.updateOffer(id, userId, {
      name: data.name,
      description: data.description,
      price: data.price,
      status: data.status,
      type: data.type,
      deliveryFormat: data.deliveryFormat,
      targetAudience: data.targetAudience,
      keyBenefits: data.keyBenefits,
      deliverables: data.deliverables,
      bonuses: data.bonuses,
      guarantee: data.guarantee,
      urgency: data.urgency
    });

    return NextResponse.json({ offer: updatedOffer });
  } catch (error) {
    console.error("Offer update error:", error);
    return NextResponse.json(
      { error: "Failed to update offer" },
      { status: 500 }
    );
  }
}

// DELETE /api/offers/[id] - Delete an offer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    // Check if offer exists and belongs to user
    const existingOffer = await db.getOfferById(id, userId);
    if (!existingOffer) {
      return NextResponse.json(
        { error: "Offer not found" },
        { status: 404 }
      );
    }

    await db.deleteOffer(id, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Offer delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete offer" },
      { status: 500 }
    );
  }
}
