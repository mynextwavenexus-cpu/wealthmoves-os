// Stripe configuration and utilities
import Stripe from "stripe";
import type { Stripe as StripeType } from "stripe";

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-06-30.basil",
});

// Product and Price IDs (configured in Stripe Dashboard)
export const STRIPE_PRODUCTS = {
  starter: {
    name: "Starter",
    description: "Blueprint + Basic Access",
    price: 2700, // $27.00 in cents
    priceId: process.env.STRIPE_STARTER_PRICE_ID || "price_starter",
    features: [
      "Dream Life Blueprint",
      "Revenue Calculator",
      "AI Coach (Basic)",
      "Community Access",
    ],
  },
  pro: {
    name: "Pro",
    description: "+ Offers + Systems + AI Coach",
    price: 9700, // $97.00 in cents
    priceId: process.env.STRIPE_PRO_PRICE_ID || "price_pro",
    features: [
      "Everything in Starter",
      "Offer Builder",
      "System Architect",
      "AI Coach (Advanced)",
      "PDF Exports",
      "Gap Analysis",
      "Action Plans",
    ],
  },
  sprint: {
    name: "Sprint",
    description: "+ 30-Day Sprint + Group Access",
    price: 29700, // $297.00 in cents
    priceId: process.env.STRIPE_SPRINT_PRICE_ID || "price_sprint",
    features: [
      "Everything in Pro",
      "30-Day Revenue Sprint",
      "Group Coaching Access",
      "Sprint Templates",
      "Progress Tracking",
    ],
  },
  elite: {
    name: "Elite",
    description: "+ 1-on-1 Calls + Done-With-You",
    price: 99700, // $997.00 in cents
    priceId: process.env.STRIPE_ELITE_PRICE_ID || "price_elite",
    features: [
      "Everything in Sprint",
      "Weekly 1-on-1 Calls",
      "Done-With-You Setup",
      "Priority Support",
      "Custom Systems",
      "Direct Access to Emma",
    ],
  },
};

export type PricingTier = "starter" | "pro" | "sprint" | "elite";

// Get price ID for a tier
export function getPriceId(tier: PricingTier): string {
  return STRIPE_PRODUCTS[tier].priceId;
}

// Get product details for a tier
export function getProductDetails(tier: PricingTier) {
  return STRIPE_PRODUCTS[tier];
}

// Format price for display
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

// Create a checkout session
export async function createCheckoutSession({
  priceId,
  userId,
  userEmail,
  successUrl,
  cancelUrl,
  tier,
}: {
  priceId: string;
  userId: string;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
  tier: PricingTier;
}) {
  const session = await stripe.checkout.sessions.create({
    customer_email: userEmail,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      tier,
    },
    allow_promotion_codes: true,
    billing_address_collection: "auto",
  });

  return session;
}

// Create customer portal session
export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

// Verify webhook signature
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  secret: string
): StripeType.Event {
  return stripe.webhooks.constructEvent(payload, signature, secret);
}
