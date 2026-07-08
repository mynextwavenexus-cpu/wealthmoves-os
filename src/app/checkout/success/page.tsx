"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, ArrowRight, Sparkles, Zap, Crown } from "lucide-react";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState<string | null>(null);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      // Verify the session and get tier info
      verifySession(sessionId);
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  async function verifySession(sessionId: string) {
    try {
      // In a real implementation, you would verify the session with your backend
      // For now, we'll simulate the verification
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Get tier from URL or default to starter
      const urlTier = searchParams.get("tier");
      setTier(urlTier || "starter");
    } catch (error) {
      console.error("Failed to verify session:", error);
    } finally {
      setLoading(false);
    }
  }

  const getTierIcon = () => {
    switch (tier) {
      case "elite":
        return <Crown className="w-16 h-16 text-yellow-500" />;
      case "sprint":
        return <Zap className="w-16 h-16 text-purple-500" />;
      case "pro":
        return <Zap className="w-16 h-16 text-blue-500" />;
      default:
        return <Sparkles className="w-16 h-16 text-green-500" />;
    }
  };

  const getTierName = () => {
    return tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : "Starter";
  };

  const getWelcomeMessage = () => {
    switch (tier) {
      case "elite":
        return "Welcome to the Elite tier! You now have access to everything including weekly 1-on-1 calls with Emma. Check your email for scheduling instructions.";
      case "sprint":
        return "Welcome to the Sprint tier! You're all set for the 30-Day Revenue Sprint. Check your email for the sprint kickoff details.";
      case "pro":
        return "Welcome to Pro! You now have access to the Offer Builder, System Architect, and advanced AI coaching. Let's build your empire!";
      default:
        return "Welcome to WealthMoves OS! You now have access to your Dream Life Blueprint and AI Coach. Let's start building your future!";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#E4DCD1]/30 to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#0F3F4C] mx-auto mb-4" />
          <p className="text-[#AFA496]">Confirming your purchase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#E4DCD1]/30 to-white p-4">
      <Card className="max-w-lg w-full card-wealth">
        <CardContent className="p-8 text-center">
          <div className="mb-6 flex justify-center">{getTierIcon()}</div>

          <div className="mb-4">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
          </div>

          <CardTitle className="text-2xl mb-2 text-[#0F3F4C]">
            Payment Successful!
          </CardTitle>

          <CardDescription className="text-lg mb-6">
            You're now a <span className="font-semibold text-[#0F3F4C]">{getTierName()}</span> member
          </CardDescription>

          <p className="text-[#AFA496] mb-8">{getWelcomeMessage()}</p>

          <div className="space-y-3">
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-[#0F3F4C] hover:bg-[#0F3F4C]/90 text-white"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push("/dream-life")}
              className="w-full"
            >
              Start Your Blueprint
            </Button>
          </div>

          <p className="text-sm text-[#AFA496] mt-6">
            A confirmation email has been sent to your inbox.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
