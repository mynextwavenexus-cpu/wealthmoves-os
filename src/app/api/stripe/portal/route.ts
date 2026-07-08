// Stripe Customer Portal - Manage subscriptions/payments
import { NextRequest, NextResponse } from "next/server";
import { createPortalSession } from "@/lib/stripe";
import { jwtVerify } from "jose";

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
      stripeCustomerId: payload.stripeCustomerId as string | undefined,
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

    // Check if user has a Stripe customer ID
    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { error: "No payment history found" },
        { status: 400 }
      );
    }

    // Get app URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create portal session
    const session = await createPortalSession({
      customerId: user.stripeCustomerId,
      returnUrl: `${appUrl}/settings`,
    });

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error("Portal error:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
