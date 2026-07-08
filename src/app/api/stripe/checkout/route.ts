// Stripe Checkout API - Create checkout sessions
import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession, getPriceId, type PricingTier } from "@/lib/stripe";
import { jwtVerify } from "jose";
import { recordPayment } from "@/lib/payments";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "wealthmoves-secret-key-change-in-production"
);

// Verify JWT and get user info
async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from auth token
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { tier } = body as { tier: PricingTier };

    // Validate tier
    if (!tier || !["starter", "pro", "sprint", "elite"].includes(tier)) {
      return NextResponse.json(
        { error: "Invalid pricing tier" },
        { status: 400 }
      );
    }

    // Get app URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create checkout session
    const priceId = getPriceId(tier);
    const session = await createCheckoutSession({
      priceId,
      userId: user.userId,
      userEmail: user.email,
      successUrl: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${appUrl}/pricing?canceled=true`,
      tier,
    });

    // Record pending payment
    await recordPayment({
      userId: user.userId,
      stripeSessionId: session.id,
      tier,
      amount: session.amount_total || 0,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
