"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Crown, ArrowRight, Loader2, Shield } from "lucide-react";
import { STRIPE_PRODUCTS, type PricingTier } from "@/lib/stripe";

const tiers: {
  id: PricingTier;
  name: string;
  price: number;
  description: string;
  popular?: boolean;
  icon: React.ReactNode;
}[] = [
  {
    id: "starter",
    name: "Starter",
    price: 27,
    description: "Perfect for getting started",
    icon: <Sparkles className="w-6 h-6" />,
  },
  {
    id: "pro",
    name: "Pro",
    price: 97,
    description: "For serious entrepreneurs",
    popular: true,
    icon: <Zap className="w-6 h-6" />,
  },
  {
    id: "sprint",
    name: "Sprint",
    price: 297,
    description: "Accelerate your growth",
    icon: <Zap className="w-6 h-6" />,
  },
  {
    id: "elite",
    name: "Elite",
    price: 997,
    description: "Done-with-you implementation",
    icon: <Crown className="w-6 h-6" />,
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<PricingTier | null>(null);

  async function handleCheckout(tier: PricingTier) {
    if (!user) {
      router.push("/login?redirect=/pricing");
      return;
    }

    setLoading(tier);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Checkout failed:", data.error);
        alert("Failed to start checkout. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E4DCD1]/30 to-white">
      {/* Hero Section */}
      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-4 bg-[#0F3F4C] text-white hover:bg-[#0F3F4C]/90">
            Simple Pricing
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-[#0F3F4C] mb-6">
            Choose Your Path to
            <span className="text-[#0F3F4C]/80"> Financial Freedom</span>
          </h1>
          <p className="text-xl text-[#AFA496] max-w-2xl mx-auto mb-8">
            One-time investment. Lifetime access. No monthly fees. 
            Upgrade anytime as you grow.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-[#AFA496]">
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-green-500" />
              30-Day Money Back
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-green-500" />
              Secure Payment
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-green-500" />
              Instant Access
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier) => {
              const product = STRIPE_PRODUCTS[tier.id];
              const isLoading = loading === tier.id;

              return (
                <Card
                  key={tier.id}
                  className={`relative flex flex-col ${
                    tier.popular
                      ? "border-2 border-[#0F3F4C] shadow-xl scale-105 z-10"
                      : "border border-[#E4DCD1]"
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-[#0F3F4C] text-white">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div
                      className={`w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                        tier.popular
                          ? "bg-[#0F3F4C] text-white"
                          : "bg-[#E4DCD1]/50 text-[#0F3F4C]"
                      }`}
                    >
                      {tier.icon}
                    </div>
                    <CardTitle className="text-2xl text-[#0F3F4C]">
                      {tier.name}
                    </CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col">
                    <div className="text-center mb-6">
                      <span className="text-4xl font-bold text-[#0F3F4C]">
                        ${tier.price}
                      </span>
                      <span className="text-[#AFA496]"> one-time</span>
                    </div>

                    <ul className="space-y-3 mb-8 flex-1">
                      {product.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm text-[#0F3F4C]"
                        >
                          <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handleCheckout(tier.id)}
                      disabled={isLoading}
                      className={`w-full ${
                        tier.popular
                          ? "bg-[#0F3F4C] hover:bg-[#0F3F4C]/90 text-white"
                          : "bg-[#E4DCD1] hover:bg-[#E4DCD1]/80 text-[#0F3F4C]"
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          Get Started
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-[#0F3F4C] text-center mb-12">
            Compare All Features
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#E4DCD1]">
                  <th className="text-left py-4 px-4 text-[#0F3F4C] font-semibold">
                    Feature
                  </th>
                  <th className="text-center py-4 px-4 text-[#0F3F4C] font-semibold">
                    Starter
                  </th>
                  <th className="text-center py-4 px-4 text-[#0F3F4C] font-semibold bg-[#E4DCD1]/20">
                    Pro
                  </th>
                  <th className="text-center py-4 px-4 text-[#0F3F4C] font-semibold">
                    Sprint
                  </th>
                  <th className="text-center py-4 px-4 text-[#0F3F4C] font-semibold">
                    Elite
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Dream Life Blueprint", starter: true, pro: true, sprint: true, elite: true },
                  { name: "Revenue Calculator", starter: true, pro: true, sprint: true, elite: true },
                  { name: "AI Coach (Basic)", starter: true, pro: true, sprint: true, elite: true },
                  { name: "Community Access", starter: true, pro: true, sprint: true, elite: true },
                  { name: "Offer Builder", starter: false, pro: true, sprint: true, elite: true },
                  { name: "System Architect", starter: false, pro: true, sprint: true, elite: true },
                  { name: "AI Coach (Advanced)", starter: false, pro: true, sprint: true, elite: true },
                  { name: "PDF Exports", starter: false, pro: true, sprint: true, elite: true },
                  { name: "Gap Analysis", starter: false, pro: true, sprint: true, elite: true },
                  { name: "Action Plans", starter: false, pro: true, sprint: true, elite: true },
                  { name: "30-Day Revenue Sprint", starter: false, pro: false, sprint: true, elite: true },
                  { name: "Group Coaching", starter: false, pro: false, sprint: true, elite: true },
                  { name: "Sprint Templates", starter: false, pro: false, sprint: true, elite: true },
                  { name: "Weekly 1-on-1 Calls", starter: false, pro: false, sprint: false, elite: true },
                  { name: "Done-With-You Setup", starter: false, pro: false, sprint: false, elite: true },
                  { name: "Priority Support", starter: false, pro: false, sprint: false, elite: true },
                  { name: "Direct Access to Emma", starter: false, pro: false, sprint: false, elite: true },
                ].map((feature, idx) => (
                  <tr key={idx} className="border-b border-[#E4DCD1]/50">
                    <td className="py-4 px-4 text-[#0F3F4C]">{feature.name}</td>
                    <td className="text-center py-4 px-4">
                      {feature.starter ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-[#AFA496]">—</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-4 bg-[#E4DCD1]/10">
                      {feature.pro ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-[#AFA496]">—</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-4">
                      {feature.sprint ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-[#AFA496]">—</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-4">
                      {feature.elite ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-[#AFA496]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-[#0F3F4C] text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {[
              {
                q: "Is this a one-time payment or subscription?",
                a: "All tiers are one-time payments. You pay once and get lifetime access to your tier's features. No recurring fees, ever.",
              },
              {
                q: "Can I upgrade later?",
                a: "Yes! You can upgrade to a higher tier at any time. You'll only pay the difference between your current tier and the new tier.",
              },
              {
                q: "What's the 30-day money-back guarantee?",
                a: "If you're not satisfied with WealthMoves OS within 30 days of purchase, contact us for a full refund. No questions asked.",
              },
              {
                q: "Do I need technical skills?",
                a: "Not at all. WealthMoves OS is designed to be user-friendly. The AI Coach will guide you through every step.",
              },
              {
                q: "How is this different from other courses?",
                a: "Unlike passive courses, WealthMoves OS is an active operating system. You build while you learn, with AI guidance every step of the way.",
              },
            ].map((faq, idx) => (
              <Card key={idx} className="card-wealth">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-[#0F3F4C] mb-2">{faq.q}</h3>
                  <p className="text-[#AFA496]">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="py-12 px-4 bg-[#0F3F4C]">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>SSL Secure Checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>30-Day Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>Instant Access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
