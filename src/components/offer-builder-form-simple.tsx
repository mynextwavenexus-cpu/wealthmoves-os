"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, CheckCircle, Loader2, Sparkles, Eye } from "lucide-react";
import { OfferFormData, getTemplateById } from "@/lib/offer-templates";

interface OfferBuilderFormProps {
  initialData?: Partial<OfferFormData>;
  offerId?: string;
  templateId?: string;
}

const emptyFormData: OfferFormData = {
  name: "",
  description: "",
  price: 0,
  type: "one-time",
  deliveryFormat: "digital",
  targetAudience: "",
  keyBenefits: [],
  deliverables: [],
  bonuses: [],
  guarantee: { enabled: false, type: "satisfaction", days: 30, description: "" },
  urgency: { enabled: false, type: "limited-spots", description: "" },
  status: "draft"
};

export function OfferBuilderForm({ initialData, offerId, templateId }: OfferBuilderFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<OfferFormData>(emptyFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    if (templateId) {
      const template = getTemplateById(templateId);
      if (template) {
        setFormData(prev => ({ ...prev, ...template.defaultData, name: template.name }));
      }
    } else if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [templateId, initialData]);

  const handleSave = async (status: "draft" | "active" = "draft") => {
    setIsSaving(true);
    try {
      const url = offerId ? `/api/offers/${offerId}` : "/api/offers";
      const method = offerId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, status })
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/offers/${data.offer.id}`);
      }
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const totalValue = formData.price + formData.bonuses.reduce((sum, b) => sum + b.value, 0);

  return (
    <div className="space-y-4">
      {/* ROW 1: Green Bar - Create New Offer */}
      <div className="bg-[#0F3F4C] rounded-xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => router.push("/offers")} className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-bold">{offerId ? "Edit Offer" : "Create New Offer"}</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleSave("draft")} disabled={isSaving} className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-8 text-xs px-3">
              {isSaving ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
              Save
            </Button>
            <Button onClick={() => handleSave("active")} disabled={isSaving} className="bg-white text-[#0F3F4C] hover:bg-white/90 h-8 text-xs px-3">
              {isSaving ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <CheckCircle className="w-3 h-3 mr-1" />}
              Publish
            </Button>
          </div>
        </div>
      </div>

      {/* ROW 2: Green Bar - Offer Price */}
      <div className="bg-[#0F3F4C] rounded-xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs opacity-70 mb-1">Offer Price</p>
            <p className="text-2xl font-bold">${formData.price.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-70 mb-1">Total Value</p>
            <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
          </div>
          {formData.bonuses.length > 0 && (
            <div className="text-right">
              <p className="text-xs opacity-70 mb-1">Bonuses</p>
              <p className="text-xl font-bold">+${formData.bonuses.reduce((sum, b) => sum + b.value, 0).toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* ROW 3: Tabs */}
      <div className="flex w-full h-10 p-1 bg-muted rounded-lg gap-1">
        {["basic", "content", "value", "guarantee", "urgency"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-xs rounded capitalize ${activeTab === tab ? "bg-white shadow" : "hover:bg-white/50"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ROW 4: Elements (Form Content) */}
      <div className="space-y-4">
        {activeTab === "basic" && (
          <Card className="card-wealth">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#0F3F4C]" />
                Offer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Offer Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Revenue Sprint Coaching Program"
                />
              </div>
              <div className="space-y-2">
                <Label>Price *</Label>
                <Input
                  type="number"
                  value={formData.price || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                  placeholder="297"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your offer..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "content" && (
          <Card className="card-wealth">
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#AFA496]">Content settings go here...</p>
            </CardContent>
          </Card>
        )}

        {activeTab === "value" && (
          <Card className="card-wealth">
            <CardHeader>
              <CardTitle>Value Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#AFA496]">Value stack settings go here...</p>
            </CardContent>
          </Card>
        )}

        {activeTab === "guarantee" && (
          <Card className="card-wealth">
            <CardHeader>
              <CardTitle>Guarantee</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#AFA496]">Guarantee settings go here...</p>
            </CardContent>
          </Card>
        )}

        {activeTab === "urgency" && (
          <Card className="card-wealth">
            <CardHeader>
              <CardTitle>Urgency</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#AFA496]">Urgency settings go here...</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ROW 5: Preview */}
      <Card className="card-wealth">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Live Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#0F3F4C] to-[#1a5a6c] rounded-xl p-4 text-white">
              <h3 className="text-lg font-bold mb-1">{formData.name || "Your Offer Name"}</h3>
              <p className="text-2xl font-bold">${formData.price.toLocaleString()}</p>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-[#AFA496]">Total Value</span>
              <span className="text-xl font-bold text-[#0F3F4C]">${totalValue.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
