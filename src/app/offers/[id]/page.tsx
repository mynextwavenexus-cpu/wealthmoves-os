"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Edit3, 
  Copy, 
  Share2, 
  Download, 
  TrendingUp, 
  Users, 
  Eye,
  ShoppingCart,
  RotateCcw,
  Loader2,
  CheckCircle,
  Clock,
  Shield,
  Sparkles,
  Gift,
  DollarSign
} from "lucide-react";
import { OfferFormData } from "@/lib/offer-templates";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface OfferStats {
  views: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
  avgOrderValue: number;
  refundRate: number;
  dailyStats: Array<{
    date: string;
    views: number;
    conversions: number;
    revenue: number;
  }>;
}

interface OfferWithStats {
  id: string;
  name: string;
  description: string;
  price: number;
  status: "draft" | "active" | "paused";
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
  stats: OfferStats;
  createdAt: string;
  updatedAt: string;
}

export default function OfferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const offerId = params.id as string;
  const [offer, setOffer] = useState<OfferWithStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    async function fetchOffer() {
      try {
        const res = await fetch(`/api/offers/${offerId}`);
        if (res.ok) {
          const data = await res.json();
          setOffer(data.offer);
        }
      } catch (err) {
        console.error("Error fetching offer:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOffer();
  }, [offerId]);

  const handleDuplicate = async () => {
    if (!offer) return;
    setIsDuplicating(true);
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...offer,
          name: `${offer.name} (Copy)`,
          status: "draft"
        })
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/offers/${data.offer.id}/edit`);
      }
    } catch (err) {
      console.error("Error duplicating offer:", err);
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/offers/${offerId}/preview`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Share link copied to clipboard!");
    } catch {
      alert(`Share URL: ${shareUrl}`);
    }
  };

  const handleExportPDF = () => {
    alert("PDF export coming soon!");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#0F3F4C]" />
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-[#0F3F4C] mb-2">Offer Not Found</h2>
          <p className="text-[#AFA496] mb-4">The offer you're looking for doesn't exist or you don't have access.</p>
          <Button onClick={() => router.push("/offers")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Offers
          </Button>
        </div>
      </div>
    );
  }

  const totalValue = offer.price + offer.bonuses.reduce((sum, b) => sum + b.value, 0);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/offers")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="heading-xl">{offer.name}</h1>
              <Badge className={
                offer.status === "active" ? "bg-green-100 text-green-700" :
                offer.status === "paused" ? "bg-yellow-100 text-yellow-700" :
                "bg-gray-100 text-gray-700"
              }>
                {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
              </Badge>
            </div>
            <p className="text-[#AFA496]">
              Created {new Date(offer.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={handleDuplicate} disabled={isDuplicating}>
            {isDuplicating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Copy className="w-4 h-4 mr-2" />}
            Duplicate
          </Button>
          <Button 
            className="bg-[#0F3F4C] hover:bg-[#0a2f39]"
            onClick={() => router.push(`/offers/${offerId}/edit`)}
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Offer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="card-wealth">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-[#AFA496]">Views</span>
            </div>
            <p className="text-3xl font-bold text-[#0F3F4C]">{offer.stats.views.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="card-wealth">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-[#AFA496]">Conversions</span>
            </div>
            <p className="text-3xl font-bold text-[#0F3F4C]">{offer.stats.conversions.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="card-wealth">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-[#AFA496]">Revenue</span>
            </div>
            <p className="text-3xl font-bold text-[#0F3F4C]">${offer.stats.revenue.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="card-wealth">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-[#AFA496]">Conv. Rate</span>
            </div>
            <p className="text-3xl font-bold text-[#0F3F4C]">{offer.stats.conversionRate.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Offer Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <Card className="card-wealth">
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#0F3F4C] whitespace-pre-wrap">{offer.description || "No description provided."}</p>
                </CardContent>
              </Card>

              {/* Key Benefits */}
              {offer.keyBenefits.length > 0 && (
                <Card className="card-wealth">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Key Benefits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {offer.keyBenefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Deliverables */}
              {offer.deliverables.length > 0 && (
                <Card className="card-wealth">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-[#0F3F4C]" />
                      What's Included
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {offer.deliverables.map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-[#0F3F4C] rounded-full" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Bonuses */}
              {offer.bonuses.length > 0 && (
                <Card className="card-wealth bg-purple-50/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-700">
                      <Sparkles className="w-5 h-5" />
                      Bonuses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {offer.bonuses.map((bonus, index) => (
                        <div key={index} className="flex justify-between items-start p-3 bg-white rounded-lg">
                          <div>
                            <p className="font-medium text-[#0F3F4C]">{bonus.name}</p>
                            <p className="text-sm text-[#AFA496]">{bonus.description}</p>
                          </div>
                          <Badge variant="secondary">${bonus.value} value</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Card */}
              <Card className="card-wealth bg-gradient-to-br from-[#0F3F4C] to-[#1a5a6c] text-white">
                <CardContent className="p-6">
                  <p className="text-sm opacity-80 mb-1">Price</p>
                  <p className="text-4xl font-bold">${offer.price.toLocaleString()}</p>
                  <Separator className="my-4 bg-white/20" />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="opacity-80">Offer Price</span>
                      <span>${offer.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="opacity-80">Bonuses Value</span>
                      <span>${offer.bonuses.reduce((sum, b) => sum + b.value, 0).toLocaleString()}</span>
                    </div>
                    <Separator className="bg-white/20" />
                    <div className="flex justify-between font-bold">
                      <span>Total Value</span>
                      <span>${totalValue.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Details Card */}
              <Card className="card-wealth">
                <CardHeader>
                  <CardTitle>Offer Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-[#AFA496]">Type</p>
                    <p className="font-medium capitalize">{offer.type.replace("-", " ")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#AFA496]">Delivery Format</p>
                    <p className="font-medium capitalize">{offer.deliveryFormat}</p>
                  </div>
                  {offer.targetAudience && (
                    <div>
                      <p className="text-sm text-[#AFA496]">Target Audience</p>
                      <p className="font-medium">{offer.targetAudience}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Guarantee Card */}
              {offer.guarantee.enabled && (
                <Card className="card-wealth bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <Shield className="w-5 h-5" />
                      Guarantee
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium text-green-700">
                      {offer.guarantee.days > 0 
                        ? `${offer.guarantee.days}-Day ${offer.guarantee.type}` 
                        : offer.guarantee.type}
                    </p>
                    <p className="text-sm text-green-600 mt-2">{offer.guarantee.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Urgency Card */}
              {offer.urgency.enabled && (
                <Card className="card-wealth bg-red-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700">
                      <Clock className="w-5 h-5" />
                      Limited Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-red-600">{offer.urgency.description}</p>
                    {offer.urgency.spots && (
                      <p className="font-bold text-red-700 mt-2">
                        Only {offer.urgency.spots} spots left!
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card className="card-wealth">
              <CardHeader>
                <CardTitle>Revenue Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={offer.stats.dailyStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E4DCD1" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        stroke="#AFA496"
                      />
                      <YAxis stroke="#AFA496" />
                      <Tooltip 
                        formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                        labelFormatter={(date) => new Date(date as string).toLocaleDateString()}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#0F3F4C" 
                        strokeWidth={2}
                        dot={{ fill: '#0F3F4C' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Conversions Chart */}
            <Card className="card-wealth">
              <CardHeader>
                <CardTitle>Views vs Conversions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={offer.stats.dailyStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E4DCD1" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        stroke="#AFA496"
                      />
                      <YAxis stroke="#AFA496" />
                      <Tooltip 
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      />
                      <Bar dataKey="views" fill="#E4DCD1" name="Views" />
                      <Bar dataKey="conversions" fill="#0F3F4C" name="Conversions" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="card-wealth">
              <CardContent className="p-6">
                <p className="text-[#AFA496] mb-2">Average Order Value</p>
                <p className="text-3xl font-bold text-[#0F3F4C]">
                  ${offer.stats.avgOrderValue.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card className="card-wealth">
              <CardContent className="p-6">
                <p className="text-[#AFA496] mb-2">Refund Rate</p>
                <p className="text-3xl font-bold text-[#0F3F4C]">
                  {offer.stats.refundRate.toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card className="card-wealth">
              <CardContent className="p-6">
                <p className="text-[#AFA496] mb-2">Revenue per View</p>
                <p className="text-3xl font-bold text-[#0F3F4C]">
                  ${offer.stats.views > 0 ? (offer.stats.revenue / offer.stats.views).toFixed(2) : "0.00"}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="mt-6">
          <Card className="card-wealth">
            <CardHeader>
              <CardTitle>Offer Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-2xl mx-auto">
                {/* Preview Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-br from-[#0F3F4C] to-[#1a5a6c] p-8 text-white">
                    <h2 className="text-3xl font-bold mb-4">{offer.name}</h2>
                    <p className="text-4xl font-bold">${offer.price.toLocaleString()}</p>
                    {offer.urgency.enabled && (
                      <div className="mt-4 inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                        <Clock className="w-4 h-4" />
                        {offer.urgency.description}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-8 space-y-8">
                    {offer.description && (
                      <div>
                        <p className="text-lg text-[#0F3F4C] leading-relaxed">{offer.description}</p>
                      </div>
                    )}

                    {/* Benefits */}
                    {offer.keyBenefits.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-[#0F3F4C] mb-4">What You'll Get</h3>
                        <ul className="space-y-3">
                          {offer.keyBenefits.map((benefit, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-[#0F3F4C]">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Deliverables */}
                    {offer.deliverables.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-[#0F3F4C] mb-4">Includes</h3>
                        <ul className="space-y-2">
                          {offer.deliverables.map((item, index) => (
                            <li key={index} className="flex items-center gap-2 text-[#0F3F4C]">
                              <Gift className="w-4 h-4 text-[#0F3F4C]" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Bonuses */}
                    {offer.bonuses.length > 0 && (
                      <div className="bg-purple-50 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          Fast-Action Bonuses
                        </h3>
                        <div className="space-y-4">
                          {offer.bonuses.map((bonus, index) => (
                            <div key={index} className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-[#0F3F4C]">{bonus.name}</p>
                                <p className="text-sm text-[#AFA496]">{bonus.description}</p>
                              </div>
                              <span className="text-purple-700 font-medium">${bonus.value} value</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Guarantee */}
                    {offer.guarantee.enabled && (
                      <div className="bg-green-50 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-green-700 mb-2 flex items-center gap-2">
                          <Shield className="w-5 h-5" />
                          {offer.guarantee.days > 0 
                            ? `${offer.guarantee.days}-Day ${offer.guarantee.type}` 
                            : offer.guarantee.type}
                        </h3>
                        <p className="text-green-600">{offer.guarantee.description}</p>
                      </div>
                    )}

                    {/* CTA */}
                    <div className="text-center pt-4">
                      <Button size="lg" className="bg-[#0F3F4C] hover:bg-[#0a2f39] text-lg px-8 py-6">
                        Get Started Now
                      </Button>
                      <p className="text-sm text-[#AFA496] mt-4">
                        Total Value: ${totalValue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
