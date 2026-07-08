"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  X, 
  Save, 
  Eye, 
  ArrowLeft,
  DollarSign,
  Users,
  Gift,
  Shield,
  Clock,
  CheckCircle,
  Loader2,
  Sparkles
} from "lucide-react";
import { OfferFormData, offerTemplates, getTemplateById } from "@/lib/offer-templates";

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
  guarantee: {
    enabled: false,
    type: "satisfaction",
    days: 30,
    description: ""
  },
  urgency: {
    enabled: false,
    type: "limited-spots",
    description: "",
    spots: undefined
  },
  status: "draft"
};

export function OfferBuilderForm({ initialData, offerId, templateId }: OfferBuilderFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<OfferFormData>(emptyFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [newBenefit, setNewBenefit] = useState("");
  const [newDeliverable, setNewDeliverable] = useState("");
  const [newBonus, setNewBonus] = useState({ name: "", description: "", value: 0 });

  // Load template or initial data
  useEffect(() => {
    if (templateId) {
      const template = getTemplateById(templateId);
      if (template) {
        setFormData(prev => ({
          ...prev,
          ...template.defaultData,
          name: template.name
        }));
      }
    } else if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [templateId, initialData]);

  const handleSave = async (status: "draft" | "active" = "draft") => {
    setIsSaving(true);
    try {
      const dataToSave = { ...formData, status };
      
      const url = offerId ? `/api/offers/${offerId}` : "/api/offers";
      const method = offerId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave)
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/offers/${data.offer.id}`);
      } else {
        console.error("Failed to save offer");
      }
    } catch (error) {
      console.error("Error saving offer:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setFormData(prev => ({
        ...prev,
        keyBenefits: [...prev.keyBenefits, newBenefit.trim()]
      }));
      setNewBenefit("");
    }
  };

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keyBenefits: prev.keyBenefits.filter((_, i) => i !== index)
    }));
  };

  const addDeliverable = () => {
    if (newDeliverable.trim()) {
      setFormData(prev => ({
        ...prev,
        deliverables: [...prev.deliverables, newDeliverable.trim()]
      }));
      setNewDeliverable("");
    }
  };

  const removeDeliverable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index)
    }));
  };

  const addBonus = () => {
    if (newBonus.name.trim()) {
      setFormData(prev => ({
        ...prev,
        bonuses: [...prev.bonuses, { ...newBonus }]
      }));
      setNewBonus({ name: "", description: "", value: 0 });
    }
  };

  const removeBonus = (index: number) => {
    setFormData(prev => ({
      ...prev,
      bonuses: prev.bonuses.filter((_, i) => i !== index)
    }));
  };

  const totalValue = formData.price + formData.bonuses.reduce((sum, b) => sum + b.value, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/offers")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="heading-xl">
              {offerId ? "Edit Offer" : "Create New Offer"}
            </h1>
            <p className="body-lg text-[#AFA496]">
              {templateId ? "Starting from template" : "Build your offer from scratch"}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => handleSave("draft")}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save as Draft
          </Button>
          <Button 
            className="bg-[#0F3F4C] hover:bg-[#0a2f39]"
            onClick={() => handleSave("active")}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
            Publish Offer
          </Button>
        </div>
      </div>

      {/* Offer Value Card */}
      <Card className="card-wealth bg-gradient-to-r from-[#0F3F4C] to-[#1a5a6c]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-sm opacity-80 mb-1">Offer Price</p>
              <p className="text-4xl font-bold">${formData.price.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80 mb-1">Total Value</p>
              <p className="text-4xl font-bold">${totalValue.toLocaleString()}</p>
            </div>
            {formData.bonuses.length > 0 && (
              <div className="text-right">
                <p className="text-sm opacity-80 mb-1">Bonuses Value</p>
                <p className="text-2xl font-bold">+${formData.bonuses.reduce((sum, b) => sum + b.value, 0).toLocaleString()}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="value">Value Stack</TabsTrigger>
              <TabsTrigger value="guarantee">Guarantee</TabsTrigger>
              <TabsTrigger value="urgency">Urgency</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6 mt-6">
              <Card className="card-wealth">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#0F3F4C]" />
                    Offer Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Offer Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Revenue Sprint Coaching Program"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="input-wealth"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price *</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AFA496]" />
                        <Input
                          id="price"
                          type="number"
                          placeholder="297"
                          value={formData.price || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                          className="input-wealth pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Offer Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger className="input-wealth">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="one-time">One-Time Payment</SelectItem>
                          <SelectItem value="subscription">Subscription</SelectItem>
                          <SelectItem value="payment-plan">Payment Plan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryFormat">Delivery Format</Label>
                    <Select
                      value={formData.deliveryFormat}
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, deliveryFormat: value }))}
                    >
                      <SelectTrigger className="input-wealth">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="digital">Digital Product</SelectItem>
                        <SelectItem value="service">Done-For-You Service</SelectItem>
                        <SelectItem value="coaching">Coaching/Mentorship</SelectItem>
                        <SelectItem value="course">Online Course</SelectItem>
                        <SelectItem value="membership">Membership/Community</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <Textarea
                      id="targetAudience"
                      placeholder="Who is this offer for? Describe your ideal customer..."
                      value={formData.targetAudience}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                      className="input-wealth min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6 mt-6">
              <Card className="card-wealth">
                <CardHeader>
                  <CardTitle>Offer Description</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your offer in detail. What problem does it solve? What transformation does it provide?"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="input-wealth min-h-[200px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Value Stack Tab */}
            <TabsContent value="value" className="space-y-6 mt-6">
              {/* Key Benefits */}
              <Card className="card-wealth">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Key Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a key benefit..."
                      value={newBenefit}
                      onChange={(e) => setNewBenefit(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addBenefit()}
                      className="input-wealth"
                    />
                    <Button onClick={addBenefit} size="icon">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.keyBenefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-[#E4DCD1]/30 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="flex-1">{benefit}</span>
                        <Button variant="ghost" size="icon" onClick={() => removeBenefit(index)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Deliverables */}
              <Card className="card-wealth">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-[#0F3F4C]" />
                    What's Included (Deliverables)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a deliverable..."
                      value={newDeliverable}
                      onChange={(e) => setNewDeliverable(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addDeliverable()}
                      className="input-wealth"
                    />
                    <Button onClick={addDeliverable} size="icon">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.deliverables.map((deliverable, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-[#E4DCD1]/30 rounded-lg">
                        <Gift className="w-4 h-4 text-[#0F3F4C] flex-shrink-0" />
                        <span className="flex-1">{deliverable}</span>
                        <Button variant="ghost" size="icon" onClick={() => removeDeliverable(index)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Bonuses */}
              <Card className="card-wealth">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Bonuses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Bonus name"
                      value={newBonus.name}
                      onChange={(e) => setNewBonus(prev => ({ ...prev, name: e.target.value }))}
                      className="input-wealth col-span-1"
                    />
                    <Input
                      placeholder="Description"
                      value={newBonus.description}
                      onChange={(e) => setNewBonus(prev => ({ ...prev, description: e.target.value }))}
                      className="input-wealth col-span-1"
                    />
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AFA496]" />
                        <Input
                          type="number"
                          placeholder="Value"
                          value={newBonus.value || ""}
                          onChange={(e) => setNewBonus(prev => ({ ...prev, value: parseInt(e.target.value) || 0 }))}
                          className="input-wealth pl-8"
                        />
                      </div>
                      <Button onClick={addBonus} size="icon">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {formData.bonuses.map((bonus, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                        <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium">{bonus.name}</p>
                          <p className="text-sm text-[#AFA496]">{bonus.description}</p>
                        </div>
                        <Badge variant="secondary">${bonus.value} value</Badge>
                        <Button variant="ghost" size="icon" onClick={() => removeBonus(index)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Guarantee Tab */}
            <TabsContent value="guarantee" className="space-y-6 mt-6">
              <Card className="card-wealth">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#0F3F4C]" />
                    Guarantee / Refund Policy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="guarantee-enabled"
                      checked={formData.guarantee.enabled}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ 
                          ...prev, 
                          guarantee: { ...prev.guarantee, enabled: checked as boolean } 
                        }))
                      }
                    />
                    <Label htmlFor="guarantee-enabled">Enable guarantee/refund policy</Label>
                  </div>

                  {formData.guarantee.enabled && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label htmlFor="guarantee-type">Guarantee Type</Label>
                        <Select
                          value={formData.guarantee.type}
                          onValueChange={(value) => 
                            setFormData(prev => ({ 
                              ...prev, 
                              guarantee: { ...prev.guarantee, type: value || "satisfaction" } 
                            }))
                          }
                        >
                          <SelectTrigger className="input-wealth">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="satisfaction">Satisfaction Guarantee</SelectItem>
                            <SelectItem value="money-back">Money-Back Guarantee</SelectItem>
                            <SelectItem value="results">Results Guarantee</SelectItem>
                            <SelectItem value="value">Value Guarantee</SelectItem>
                            <SelectItem value="cancel-anytime">Cancel Anytime</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="guarantee-days">Days (0 for no time limit)</Label>
                        <Input
                          id="guarantee-days"
                          type="number"
                          value={formData.guarantee.days}
                          onChange={(e) => 
                            setFormData(prev => ({ 
                              ...prev, 
                              guarantee: { ...prev.guarantee, days: parseInt(e.target.value) || 0 } 
                            }))
                          }
                          className="input-wealth"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="guarantee-description">Guarantee Description</Label>
                        <Textarea
                          id="guarantee-description"
                          placeholder="Describe your guarantee in detail..."
                          value={formData.guarantee.description}
                          onChange={(e) => 
                            setFormData(prev => ({ 
                              ...prev, 
                              guarantee: { ...prev.guarantee, description: e.target.value } 
                            }))
                          }
                          className="input-wealth min-h-[100px]"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Urgency Tab */}
            <TabsContent value="urgency" className="space-y-6 mt-6">
              <Card className="card-wealth">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#0F3F4C]" />
                    Urgency / Scarcity Elements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="urgency-enabled"
                      checked={formData.urgency.enabled}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ 
                          ...prev, 
                          urgency: { ...prev.urgency, enabled: checked as boolean } 
                        }))
                      }
                    />
                    <Label htmlFor="urgency-enabled">Enable urgency/scarcity</Label>
                  </div>

                  {formData.urgency.enabled && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label htmlFor="urgency-type">Urgency Type</Label>
                        <Select
                          value={formData.urgency.type}
                          onValueChange={(value: any) => 
                            setFormData(prev => ({ 
                              ...prev, 
                              urgency: { ...prev.urgency, type: value } 
                            }))
                          }
                        >
                          <SelectTrigger className="input-wealth">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="deadline">Deadline (Time-based)</SelectItem>
                            <SelectItem value="limited-spots">Limited Spots</SelectItem>
                            <SelectItem value="price-increase">Price Increase</SelectItem>
                            <SelectItem value="bonus-expires">Bonus Expires</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.urgency.type === "limited-spots" && (
                        <div className="space-y-2">
                          <Label htmlFor="urgency-spots">Number of Spots</Label>
                          <Input
                            id="urgency-spots"
                            type="number"
                            placeholder="5"
                            value={formData.urgency.spots || ""}
                            onChange={(e) => 
                              setFormData(prev => ({ 
                                ...prev, 
                                urgency: { ...prev.urgency, spots: parseInt(e.target.value) || undefined } 
                              }))
                            }
                            className="input-wealth"
                          />
                        </div>
                      )}

                      {formData.urgency.type === "deadline" && (
                        <div className="space-y-2">
                          <Label htmlFor="urgency-deadline">Deadline</Label>
                          <Input
                            id="urgency-deadline"
                            type="datetime-local"
                            value={formData.urgency.deadline ? new Date(formData.urgency.deadline).toISOString().slice(0, 16) : ""}
                            onChange={(e) => 
                              setFormData(prev => ({ 
                                ...prev, 
                                urgency: { ...prev.urgency, deadline: new Date(e.target.value).toISOString() } 
                              }))
                            }
                            className="input-wealth"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="urgency-description">Urgency Description</Label>
                        <Textarea
                          id="urgency-description"
                          placeholder="e.g., Only 3 spots left! Doors close Friday at midnight."
                          value={formData.urgency.description}
                          onChange={(e) => 
                            setFormData(prev => ({ 
                              ...prev, 
                              urgency: { ...prev.urgency, description: e.target.value } 
                            }))
                          }
                          className="input-wealth min-h-[100px]"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Sidebar */}
        <div className="lg:col-span-1">
          <Card className="card-wealth sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {/* Offer Card Preview */}
                  <div className="bg-gradient-to-br from-[#0F3F4C] to-[#1a5a6c] rounded-xl p-6 text-white">
                    <h3 className="text-xl font-bold mb-2">
                      {formData.name || "Your Offer Name"}
                    </h3>
                    <p className="text-3xl font-bold mb-4">
                      ${formData.price.toLocaleString()}
                    </p>
                    {formData.description && (
                      <p className="text-sm opacity-80 line-clamp-3">
                        {formData.description}
                      </p>
                    )}
                  </div>

                  {/* Benefits Preview */}
                  {formData.keyBenefits.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-[#0F3F4C] mb-2">What You'll Get</h4>
                      <ul className="space-y-2">
                        {formData.keyBenefits.slice(0, 3).map((benefit, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Deliverables Preview */}
                  {formData.deliverables.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-[#0F3F4C] mb-2">Includes</h4>
                      <ul className="space-y-1">
                        {formData.deliverables.slice(0, 3).map((item, i) => (
                          <li key={i} className="text-sm text-[#AFA496]">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Bonuses Preview */}
                  {formData.bonuses.length > 0 && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-700 mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Bonuses
                      </h4>
                      <ul className="space-y-2">
                        {formData.bonuses.map((bonus, i) => (
                          <li key={i} className="text-sm">
                            <span className="font-medium">{bonus.name}</span>
                            <span className="text-[#AFA496]"> (${bonus.value} value)</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Guarantee Preview */}
                  {formData.guarantee.enabled && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        {formData.guarantee.days > 0 
                          ? `${formData.guarantee.days}-Day ${formData.guarantee.type}` 
                          : formData.guarantee.type}
                      </h4>
                      <p className="text-sm text-green-600 line-clamp-3">
                        {formData.guarantee.description || "Your guarantee description"}
                      </p>
                    </div>
                  )}

                  {/* Urgency Preview */}
                  {formData.urgency.enabled && (
                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Limited Time
                      </h4>
                      <p className="text-sm text-red-600">
                        {formData.urgency.description || "Your urgency message"}
                      </p>
                      {formData.urgency.spots && (
                        <p className="text-sm font-bold text-red-700 mt-1">
                          Only {formData.urgency.spots} spots left!
                        </p>
                      )}
                    </div>
                  )}

                  {/* Total Value */}
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-[#AFA496]">Total Value</span>
                    <span className="text-xl font-bold text-[#0F3F4C]">
                      ${totalValue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
