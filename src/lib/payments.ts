// Payment processing and access provisioning
import { db } from "./db";
import type { PricingTier } from "./stripe";

// Payment record interface
export interface Payment {
  id: string;
  userId: string;
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  tier: PricingTier;
  amount: number;
  status: "pending" | "completed" | "failed" | "refunded";
  createdAt: Date;
  updatedAt: Date;
}

// In-memory payment storage (replace with database in production)
const paymentsStore: Map<string, Payment> = new Map();

// Record a new payment
export async function recordPayment({
  userId,
  stripeSessionId,
  tier,
  amount,
}: {
  userId: string;
  stripeSessionId: string;
  tier: PricingTier;
  amount: number;
}): Promise<Payment> {
  const payment: Payment = {
    id: `pay_${Date.now()}`,
    userId,
    stripeSessionId,
    tier,
    amount,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  paymentsStore.set(payment.id, payment);
  return payment;
}

// Update payment status
export async function updatePaymentStatus(
  stripeSessionId: string,
  status: Payment["status"],
  stripePaymentIntentId?: string
): Promise<Payment | null> {
  const payment = Array.from(paymentsStore.values()).find(
    (p) => p.stripeSessionId === stripeSessionId
  );

  if (!payment) return null;

  payment.status = status;
  if (stripePaymentIntentId) {
    payment.stripePaymentIntentId = stripePaymentIntentId;
  }
  payment.updatedAt = new Date();

  paymentsStore.set(payment.id, payment);
  return payment;
}

// Get payment by session ID
export async function getPaymentBySessionId(
  stripeSessionId: string
): Promise<Payment | null> {
  return (
    Array.from(paymentsStore.values()).find(
      (p) => p.stripeSessionId === stripeSessionId
    ) || null
  );
}

// Get all payments for a user
export async function getUserPayments(userId: string): Promise<Payment[]> {
  return Array.from(paymentsStore.values()).filter((p) => p.userId === userId);
}

// Provision access after successful payment
export async function provisionAccess(
  userId: string,
  tier: PricingTier
): Promise<boolean> {
  try {
    // Update user tier in database
    // This would integrate with your user management system
    // For now, we'll store it in a way that the auth context can read

    // Store tier upgrade in localStorage via a flag
    // The actual implementation would update the database
    console.log(`Provisioning ${tier} access for user ${userId}`);

    // TODO: Integrate with CourseSprout for course enrollment
    // await enrollInCourseSprout(userId, tier);

    // TODO: Send welcome email
    // await sendWelcomeEmail(userId, tier);

    return true;
  } catch (error) {
    console.error("Failed to provision access:", error);
    return false;
  }
}

// Revoke access (for refunds/cancellations)
export async function revokeAccess(
  userId: string,
  tier: PricingTier
): Promise<boolean> {
  try {
    console.log(`Revoking ${tier} access for user ${userId}`);
    // Implementation would downgrade user to previous tier or starter
    return true;
  } catch (error) {
    console.error("Failed to revoke access:", error);
    return false;
  }
}

// Get revenue stats
export async function getRevenueStats(): Promise<{
  totalRevenue: number;
  revenueByTier: Record<PricingTier, number>;
  paymentCount: number;
  refunds: number;
}> {
  const payments = Array.from(paymentsStore.values());
  const completedPayments = payments.filter((p) => p.status === "completed");
  const refundedPayments = payments.filter((p) => p.status === "refunded");

  const revenueByTier: Record<PricingTier, number> = {
    starter: 0,
    pro: 0,
    sprint: 0,
    elite: 0,
  };

  completedPayments.forEach((p) => {
    revenueByTier[p.tier] += p.amount;
  });

  return {
    totalRevenue: completedPayments.reduce((sum, p) => sum + p.amount, 0),
    revenueByTier,
    paymentCount: completedPayments.length,
    refunds: refundedPayments.length,
  };
}

// Enroll user in CourseSprout (placeholder)
async function enrollInCourseSprout(
  userId: string,
  tier: PricingTier
): Promise<void> {
  // Only Pro and above get CourseSprout access
  if (tier === "starter") return;

  // Implementation would call CourseSprout API
  console.log(`Enrolling user ${userId} in CourseSprout for tier ${tier}`);
}

// Send welcome email (placeholder)
async function sendWelcomeEmail(userId: string, tier: PricingTier): Promise<void> {
  // Implementation would call email service
  console.log(`Sending welcome email to user ${userId} for tier ${tier}`);
}
