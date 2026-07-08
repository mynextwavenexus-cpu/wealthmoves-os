"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "@/lib/data-context";
import {
  Package,
  Plus,
  ArrowRight,
  Edit3,
  Copy,
  TrendingUp,
  Users,
  Zap,
  Loader2,
  Eye,
  BarChart3,
  Sparkles,
  FilePlus,
  Users as UsersIcon,
  BookOpen,
  MessageCircle,
  Repeat,
} from "lucide-react";
import { offerTemplates } from "@/lib/offer-templates";

const iconMap: Record<string, React.ReactNode> = {
  Users: <UsersIcon className="w-5 h-5" />,
  BookOpen: <BookOpen className="w-5 h-5" />,
  MessageCircle: <MessageCircle className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  Repeat: <Repeat className="w-5 h-5" />,
  CreditCard: <TrendingUp className="w-5 h-5" />,
  FilePlus: <FilePlus className="w-5 h-5" />,
};

export default function OffersPage() {
  const { dashboard, isLoading } = useDashboard();
  const [showTemplates, setShowTemplates] = useState(false);
  
  const offers = dashboard?.offers || [];
  const totalRevenue = offers.reduce((sum, o) => sum + (o.revenueGenerated || 0), 0);
  const totalCustomers = offers.reduce((sum, o) => {
    const customers = o.price > 0 ? Math.floor((o.revenueGenerated || 0) / o.price) : 0;
    return sum + customers;
  }, 0);
  const avgOrderValue = totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F3F4C]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-xl mb-2">Your Offers</h1>
          <p className="body-lg">
            Build, price, and position your products and services.
          </p>
        </div>
        <Link href="/offers/new">
          <Button className="bg-[#0F3F4C] hover:bg-[#0a2f39]">
            <Plus className="w-4 h-4 mr-2" />
            Create New Offer
          </Button>
        </Link>
      </div>

      {/* Offer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-wealth">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-[#AFA496]">Total Revenue</span>
            </div>
            <p className="text-3xl font-bold text-[#0F3F4C]">
              ${totalRevenue.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="card-wealth">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-[#AFA496]">Total Customers</span>
            </div>
            <p className="text-3xl font-bold text-[#0F3F4C]">{totalCustomers}</p>
          </CardContent>
        </Card>

        <Card className="card-wealth">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-[#AFA496]">Avg. Order Value</span>
            </div>
            <p className="text-3xl font-bold text-[#0F3F4C]">
              ${avgOrderValue.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Templates */}
      {!showTemplates ? (
        <Card 
          className="card-wealth cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setShowTemplates(true)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#0F3F4C] rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#0F3F4C]">
                    Start with a Template
                  </h3>
                  <p className="text-[#AFA496]">
                    Choose from 7+ proven offer templates to get started faster
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[#AFA496]" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="card-wealth">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Choose a Template</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowTemplates(false)}>
                Hide
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {offerTemplates.map((template) => (
                <Link 
                  key={template.id} 
                  href={`/offers/new?template=${template.id}`}
                >
                  <div className="p-4 border border-[#E4DCD1] rounded-xl hover:border-[#0F3F4C] hover:shadow-md transition-all cursor-pointer text-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 ${
                      template.id === "blank" ? "bg-[#E4DCD1] text-[#0F3F4C]" : "bg-[#0F3F4C] text-white"
                    }`}>
                      {iconMap[template.icon] || <Sparkles className="w-5 h-5" />}
                    </div>
                    <p className="font-medium text-sm text-[#0F3F4C]">{template.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Offers List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[#0F3F4C]">Your Offers</h2>
        
        {offers.length === 0 ? (
          <Card className="card-wealth">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-[#AFA496] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#0F3F4C] mb-2">
                No Offers Yet
              </h3>
              <p className="text-[#AFA496] mb-6 max-w-md mx-auto">
                Create your first offer to start generating revenue. We'll help you price it and position it for your ideal customers.
              </p>
              <Link href="/offers/new">
                <Button className="bg-[#0F3F4C] hover:bg-[#0a2f39]">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Offer
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          offers.map((offer) => {
            const sales = offer.price > 0 ? Math.floor((offer.revenueGenerated || 0) / offer.price) : 0;
            return (
              <Card key={offer.id} className="card-wealth hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {offer.status === "active" ? (
                          <Badge className="bg-green-100 text-green-700">Active</Badge>
                        ) : offer.status === "paused" ? (
                          <Badge className="bg-yellow-100 text-yellow-700">Paused</Badge>
                        ) : (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                      </div>
                      <Link href={`/offers/${offer.id}`}>
                        <h3 className="text-xl font-semibold text-[#0F3F4C] mb-4 hover:text-[#0a2f39] transition-colors">
                          {offer.name}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-6">
                        <div>
                          <span className="text-2xl font-bold text-[#0F3F4C]">
                            ${offer.price.toLocaleString()}
                          </span>
                        </div>
                        {sales > 0 && (
                          <>
                            <div className="h-8 w-px bg-[#E4DCD1]" />
                            <div>
                              <span className="text-sm text-[#AFA496]">{sales} sales</span>
                            </div>
                          </>
                        )}
                        {(offer.revenueGenerated || 0) > 0 && (
                          <>
                            <div className="h-8 w-px bg-[#E4DCD1]" />
                            <div>
                              <span className="text-sm text-[#AFA496]">
                                ${(offer.revenueGenerated || 0).toLocaleString()} revenue
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link href={`/offers/${offer.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/offers/${offer.id}/edit`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Create Offer CTA */}
      <Link href="/offers/new">
        <Card className="border-dashed border-2 border-[#E4DCD1] bg-transparent hover:border-[#0F3F4C] hover:bg-[#E4DCD1]/10 transition-all cursor-pointer">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-[#E4DCD1] rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-[#0F3F4C]" />
            </div>
            <h3 className="text-lg font-semibold text-[#0F3F4C] mb-2">
              Create a New Offer
            </h3>
            <p className="text-[#AFA496] mb-4 max-w-md mx-auto">
              Build a quick offer to generate fast revenue, or create a premium offer for high-ticket clients.
            </p>
            <Button className="bg-[#0F3F4C] hover:bg-[#0a2f39]">
              Start Building
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
