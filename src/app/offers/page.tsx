"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";

export default function OffersPage() {
  const { dashboard, isLoading } = useDashboard();
  
  const offers = dashboard?.offers || [];
  const totalRevenue = offers.reduce((sum, o) => sum + (o.revenueGenerated || 0), 0);
  // Calculate customers from revenue / price for each offer
  const totalCustomers = offers.reduce((sum, o) => {
    const customers = o.price > 0 ? Math.floor(o.revenueGenerated / o.price) : 0;
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
        <Button className="bg-[#0F3F4C] hover:bg-[#0a2f39]">
          <Plus className="w-4 h-4 mr-2" />
          Create New Offer
        </Button>
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

      {/* Offers List */}
      <div className="space-y-4">
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
              <Button className="bg-[#0F3F4C] hover:bg-[#0a2f39]">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Offer
              </Button>
            </CardContent>
          </Card>
        ) : (
          offers.map((offer) => {
            const sales = offer.price > 0 ? Math.floor(offer.revenueGenerated / offer.price) : 0;
            return (
              <Card key={offer.id} className="card-wealth">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {offer.status === "active" ? (
                          <Badge className="bg-green-100 text-green-700">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-[#0F3F4C] mb-4">
                        {offer.name}
                      </h3>

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
                        {offer.revenueGenerated > 0 && (
                          <>
                            <div className="h-8 w-px bg-[#E4DCD1]" />
                            <div>
                              <span className="text-sm text-[#AFA496]">
                                ${offer.revenueGenerated.toLocaleString()} revenue
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm">
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Create Offer CTA */}
      <Card className="border-dashed border-2 border-[#E4DCD1] bg-transparent">
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
    </div>
  );
}
