import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Package,
  Plus,
  ArrowRight,
  Edit3,
  Copy,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

const offers = [
  {
    id: 1,
    type: "quick",
    name: "Strategy Session",
    price: 297,
    status: "active",
    conversions: 12,
    revenue: 3564,
    description: "90-minute 1-on-1 strategy call to solve your biggest business challenge.",
  },
  {
    id: 2,
    type: "core",
    name: "Revenue Sprint Program",
    price: 1297,
    status: "active",
    conversions: 5,
    revenue: 6485,
    description: "30-day intensive to build your revenue system from scratch.",
  },
  {
    id: 3,
    type: "premium",
    name: "Done-With-You Implementation",
    price: 4997,
    status: "draft",
    conversions: 0,
    revenue: 0,
    description: "Full implementation support with weekly calls and done-for-you assets.",
  },
];

export default function OffersPage() {
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
            <p className="text-3xl font-bold text-[#0F3F4C]">$10,049</p>
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
            <p className="text-3xl font-bold text-[#0F3F4C]">17</p>
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
            <p className="text-3xl font-bold text-[#0F3F4C]">$591</p>
          </CardContent>
        </Card>
      </div>

      {/* Offers List */}
      <div className="space-y-4">
        {offers.map((offer) => (
          <Card key={offer.id} className="card-wealth">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge
                      className={
                        offer.type === "quick"
                          ? "bg-blue-100 text-blue-700"
                          : offer.type === "core"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-amber-100 text-amber-700"
                      }
                    >
                      {offer.type.charAt(0).toUpperCase() + offer.type.slice(1)} Offer
                    </Badge>
                    {offer.status === "active" ? (
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-[#0F3F4C] mb-1">
                    {offer.name}
                  </h3>
                  <p className="text-[#AFA496] mb-4">{offer.description}</p>

                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-2xl font-bold text-[#0F3F4C]">
                        ${offer.price}
                      </span>
                    </div>
                    <div className="h-8 w-px bg-[#E4DCD1]" />
                    <div>
                      <span className="text-sm text-[#AFA496]">{offer.conversions} sales</span>
                    </div>
                    <div className="h-8 w-px bg-[#E4DCD1]" />
                    <div>
                      <span className="text-sm text-[#AFA496]">
                        ${offer.revenue.toLocaleString()} revenue
                      </span>
                    </div>
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
        ))}
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
