"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OfferBuilderForm } from "@/components/offer-builder-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  BookOpen, 
  MessageCircle, 
  Zap, 
  Repeat, 
  CreditCard,
  FilePlus,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { offerTemplates } from "@/lib/offer-templates";

const iconMap: Record<string, React.ReactNode> = {
  Users: <Users className="w-8 h-8" />,
  BookOpen: <BookOpen className="w-8 h-8" />,
  MessageCircle: <MessageCircle className="w-8 h-8" />,
  Zap: <Zap className="w-8 h-8" />,
  Repeat: <Repeat className="w-8 h-8" />,
  CreditCard: <CreditCard className="w-8 h-8" />,
  FilePlus: <FilePlus className="w-8 h-8" />,
};

const categoryColors: Record<string, string> = {
  coaching: "bg-blue-100 text-blue-700",
  digital: "bg-purple-100 text-purple-700",
  service: "bg-green-100 text-green-700",
  custom: "bg-gray-100 text-gray-700",
};

export default function NewOfferPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(templateId);
  const [showBuilder, setShowBuilder] = useState(!!templateId);

  if (showBuilder) {
    return (
      <div className="container mx-auto py-8 px-4">
        <OfferBuilderForm templateId={selectedTemplate || undefined} />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="heading-xl mb-4">Create a New Offer</h1>
        <p className="body-lg text-[#AFA496] max-w-2xl mx-auto">
          Choose a template to get started quickly, or build your offer from scratch.
          Each template comes pre-loaded with proven structures.
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {offerTemplates.map((template) => (
          <Card 
            key={template.id}
            className={`card-wealth cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
              selectedTemplate === template.id ? "ring-2 ring-[#0F3F4C]" : ""
            }`}
            onClick={() => {
              setSelectedTemplate(template.id);
              setShowBuilder(true);
            }}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 ${
                  template.id === "blank" 
                    ? "bg-[#E4DCD1] text-[#0F3F4C]" 
                    : "bg-[#0F3F4C] text-white"
                }`}>
                  {iconMap[template.icon] || <Sparkles className="w-8 h-8" />}
                </div>
                <h3 className="text-lg font-semibold text-[#0F3F4C] mb-2">
                  {template.name}
                </h3>
                <p className="text-sm text-[#AFA496] mb-4">
                  {template.description}
                </p>
                <Badge className={categoryColors[template.category] || "bg-gray-100"}>
                  {template.category}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Start from Scratch CTA */}
      <Card 
        className="card-wealth border-dashed border-2 border-[#E4DCD1] cursor-pointer hover:border-[#0F3F4C] transition-colors"
        onClick={() => {
          setSelectedTemplate("blank");
          setShowBuilder(true);
        }}
      >
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-[#E4DCD1] rounded-full flex items-center justify-center mx-auto mb-4">
            <FilePlus className="w-8 h-8 text-[#0F3F4C]" />
          </div>
          <h3 className="text-xl font-semibold text-[#0F3F4C] mb-2">
            Start from Scratch
          </h3>
          <p className="text-[#AFA496] mb-4 max-w-md mx-auto">
            Build your offer completely custom. You have full control over every detail.
          </p>
          <Button variant="outline" className="group">
            Create Custom Offer
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>

      {/* Tips Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-wealth">
          <CardContent className="p-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="font-semibold text-[#0F3F4C] mb-2">Proven Templates</h4>
            <p className="text-sm text-[#AFA496]">
              Each template is based on successful offers that have generated millions in revenue.
            </p>
          </CardContent>
        </Card>

        <Card className="card-wealth">
          <CardContent className="p-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="font-semibold text-[#0F3F4C] mb-2">Fast Setup</h4>
            <p className="text-sm text-[#AFA496]">
              Get your offer live in minutes, not hours. Just fill in your details and publish.
            </p>
          </CardContent>
        </Card>

        <Card className="card-wealth">
          <CardContent className="p-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Repeat className="w-5 h-5 text-purple-600" />
            </div>
            <h4 className="font-semibold text-[#0F3F4C] mb-2">Fully Customizable</h4>
            <p className="text-sm text-[#AFA496]">
              Start with a template, then customize every detail to match your brand and offer.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
