"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Gift, 
  Shield, 
  Clock, 
  Sparkles,
  Loader2,
  ArrowLeft,
  Lock
} from "lucide-react";
import Link from "next/link";

interface OfferPreview {
  id: string;
  name: string;
  description: string;
  price: number;
  status: string;
  type: string;
  deliveryFormat: string;
  targetAudience: string;
  keyBenefits: string[];
  deliverables: string[];
  bonuses: Array<{ name: string; description: string; value: number }>;
  guarantee: {
    enabled: boolean;
    type: string;
    days: number;
    description: string;
  };
  urgency: {
    enabled: boolean;
    type: string;
    description: string;
    spots?: number;
  };
}

export default function OfferPreviewPage() {
  const params = useParams();
  const offerId = params.id as string;
  const [offer, setOffer] = useState<OfferPreview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOffer() {
      try {
        const res = await fetch(`/api/offers/${offerId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.offer.status !== "active") {
            setError("This offer is not currently available.");
          } else {
            setOffer(data.offer);
          }
        } else {
          setError("Offer not found");
        }
      } catch (err) {
        setError("Error loading offer");
      } finally {
        setIsLoading(false);
      }
    }

    fetchOffer();
  }, [offerId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F3F4C]" />
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Lock className="w-16 h-16 text-[#AFA496] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#0F3F4C] mb-2">
              {error || "Offer Not Available"}
            </h2>
            <p className="text-[#AFA496] mb-4">
              This offer may have expired or is no longer available.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalValue = offer.price + offer.bonuses.reduce((sum, b) => sum + b.value, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDFBF9] to-[#E4DCD1]/20">
      {/* Header */}
      <div className="bg-[#0F3F4C] text-white py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/offers" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Powered by WealthMoves OS</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Main Offer Card */}
          <Card className="overflow-hidden shadow-2xl">
            {/* Header Section */}
            <div className="bg-gradient-to-br from-[#0F3F4C] to-[#1a5a6c] p-8 md:p-12 text-white text-center">
              {offer.urgency.enabled && (
                <div className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Clock className="w-4 h-4" />
                  Limited Time Offer
                </div>
              )}
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                {offer.name}
              </h1>
              <div className="flex items-center justify-center gap-4">
                <span className="text-5xl md:text-6xl font-bold">
                  ${offer.price.toLocaleString()}
                </span>
              </div>
              {offer.urgency.enabled && (
                <p className="mt-4 text-white/80 text-lg">
                  {offer.urgency.description}
                </p>
              )}
              {offer.urgency.spots && (
                <p className="mt-2 text-red-300 font-bold">
                  Only {offer.urgency.spots} spots remaining!
                </p>
              )}
            </div>

            {/* Content Section */}
            <CardContent className="p-8 md:p-12 space-y-10">
              {/* Description */}
              {offer.description && (
                <div className="text-center">
                  <p className="text-lg md:text-xl text-[#0F3F4C] leading-relaxed">
                    {offer.description}
                  </p>
                </div>
              )}

              {/* Target Audience */}
              {offer.targetAudience && (
                <div className="bg-[#E4DCD1]/30 rounded-xl p-6 text-center">
                  <p className="text-sm text-[#AFA496] uppercase tracking-wide mb-2">Perfect For</p>
                  <p className="text-[#0F3F4C] font-medium">{offer.targetAudience}</p>
                </div>
              )}

              {/* Key Benefits */}
              {offer.keyBenefits.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-[#0F3F4C] text-center mb-6">
                    What You'll Get
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {offer.keyBenefits.map((benefit, index) => (
                      <div 
                        key={index} 
                        className="flex items-start gap-3 p-4 bg-green-50 rounded-xl"
                      >
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-[#0F3F4C]">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deliverables */}
              {offer.deliverables.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-[#0F3F4C] text-center mb-6">
                    Here's Everything You Get
                  </h2>
                  <div className="space-y-3">
                    {offer.deliverables.map((item, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-3 p-4 border border-[#E4DCD1] rounded-xl"
                      >
                        <Gift className="w-5 h-5 text-[#0F3F4C]" />
                        <span className="text-[#0F3F4C] font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bonuses */}
              {offer.bonuses.length > 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-purple-700 text-center mb-2">
                    <Sparkles className="w-6 h-6 inline mr-2" />
                    Fast-Action Bonuses
                  </h2>
                  <p className="text-center text-purple-600 mb-6">
                    Act now and get these exclusive bonuses worth ${offer.bonuses.reduce((sum, b) => sum + b.value, 0).toLocaleString()}!
                  </p>
                  <div className="space-y-4">
                    {offer.bonuses.map((bonus, index) => (
                      <div 
                        key={index} 
                        className="flex items-start justify-between p-4 bg-white rounded-xl shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Gift className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-bold text-[#0F3F4C]">{bonus.name}</p>
                            <p className="text-sm text-[#AFA496]">{bonus.description}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                          ${bonus.value} value
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Value Stack */}
              <div className="bg-[#0F3F4C] text-white rounded-2xl p-8">
                <h3 className="text-xl font-bold text-center mb-6">Total Value</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-white/80">{offer.name}</span>
                    <span>${offer.price.toLocaleString()}</span>
                  </div>
                  {offer.bonuses.map((bonus, index) => (
                    <div key={index} className="flex justify-between text-white/80">
                      <span>Bonus: {bonus.name}</span>
                      <span>${bonus.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <Separator className="bg-white/20 my-4" />
                <div className="flex justify-between items-center">
                  <span className="text-lg">Total Value</span>
                  <span className="text-2xl font-bold">${totalValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-lg text-green-300">Your Investment</span>
                  <span className="text-3xl font-bold text-green-300">${offer.price.toLocaleString()}</span>
                </div>
                {offer.bonuses.length > 0 && (
                  <p className="text-center text-green-300 mt-2">
                    You save ${(totalValue - offer.price).toLocaleString()}!
                  </p>
                )}
              </div>

              {/* Guarantee */}
              {offer.guarantee.enabled && (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-700 mb-2">
                    {offer.guarantee.days > 0 
                      ? `${offer.guarantee.days}-Day ${offer.guarantee.type}` 
                      : offer.guarantee.type}
                  </h3>
                  <p className="text-green-600 max-w-xl mx-auto">
                    {offer.guarantee.description}
                  </p>
                </div>
              )}

              {/* CTA Section */}
              <div className="text-center space-y-4">
                <Button 
                  size="lg" 
                  className="bg-[#0F3F4C] hover:bg-[#0a2f39] text-xl px-12 py-8 h-auto shadow-xl hover:shadow-2xl transition-all"
                >
                  Get Started Now
                </Button>
                <p className="text-[#AFA496]">
                  Secure checkout • Instant access
                </p>
              </div>

              {/* Urgency Reminder */}
              {offer.urgency.enabled && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                  <Clock className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-red-700 font-medium">
                    {offer.urgency.description}
                  </p>
                  {offer.urgency.spots && (
                    <p className="text-red-600 mt-1">
                      Only {offer.urgency.spots} spots left - don't miss out!
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-12 text-[#AFA496]">
            <p>© {new Date().getFullYear()} WealthMoves OS. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
