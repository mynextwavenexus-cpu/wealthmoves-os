// Stripe Webhook Handler - Process payment events
import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent, stripe, type PricingTier } from "@/lib/stripe";
import {
  updatePaymentStatus,
  provisionAccess,
  revokeAccess,
} from "@/lib/payments";

// Stripe webhook secret
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: NextRequest) {
  try {
    // Get the raw body
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature") || "";

    // Verify webhook signature
    let event;
    try {
      event = constructWebhookEvent(payload, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier as PricingTier;

        if (!userId || !tier) {
          console.error("Missing metadata in checkout session");
          return NextResponse.json(
            { error: "Invalid session metadata" },
            { status: 400 }
          );
        }

        // Update payment status
        await updatePaymentStatus(
          session.id,
          "completed",
          session.payment_intent as string
        );

        // Provision access
        const provisioned = await provisionAccess(userId, tier);
        if (!provisioned) {
          console.error("Failed to provision access for user:", userId);
          // Still return 200 to Stripe, but log the error
        }

        console.log(`Payment completed for user ${userId}, tier ${tier}`);
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object;
        await updatePaymentStatus(session.id, "failed");
        console.log("Checkout session expired:", session.id);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object;
        // Find payment by payment intent ID
        // This would require storing the charge ID or looking up by payment intent
        console.log("Charge refunded:", charge.id);

        // If we have user info in metadata, revoke access
        // Note: charge objects don't have our custom metadata
        // We would need to look up the payment in our database
        break;
      }

      case "charge.dispute.created": {
        const dispute = event.data.object;
        console.log("Dispute created:", dispute.id);
        // Handle dispute - potentially suspend access pending resolution
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Disable body parsing for Stripe webhooks
export const runtime = "nodejs";
export const bodyParser = false;
