"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, Video, Download, ExternalLink, Play, Lock } from "lucide-react";
import Link from "next/link";

const COURSESPROUT_POD_URL = process.env.NEXT_PUBLIC_COURSESPROUT_POD_URL || "https://app.coursesprout.com/pods/965";

const resources = [
  {
    category: "Getting Started",
    items: [
      { title: "Dream Life Blueprint Course", type: "course", desc: "Your complete income reality course (automatically enrolled)", url: COURSESPROUT_POD_URL, locked: false, external: true },
      { title: "WealthMoves Playbook", type: "pdf", desc: "Complete guide to building your revenue system", url: "https://wealthmoves-pro.coursesprout.com", locked: false },
      { title: "Dream Life Worksheet", type: "worksheet", desc: "Calculate your exact income targets", url: "/dream-life", locked: false },
      { title: "Quick Start Video", type: "video", desc: "5-minute overview of the platform", url: "https://wealthmoves-pro.coursesprout.com", locked: false },
    ],
  },
  {
    category: "Offer Creation",
    items: [
      { title: "Offer Canvas Template", type: "worksheet", desc: "Structure your perfect offer", url: "/offers", locked: true },
      { title: "Pricing Guide", type: "pdf", desc: "How to price for maximum revenue", url: "https://wealthmoves-pro.coursesprout.com", locked: true },
      { title: "Sales Script Library", type: "pdf", desc: "Proven scripts for every situation", url: "https://wealthmoves-pro.coursesprout.com", locked: true },
    ],
  },
  {
    category: "System Building",
    items: [
      { title: "Newsletter Launch Kit", type: "template", desc: "Everything to start your newsletter", url: "https://wealthmoves-pro.coursesprout.com", locked: true },
      { title: "Automation Workflows", type: "template", desc: "Pre-built n8n workflows", url: "/systems", locked: true },
      { title: "CRM Setup Guide", type: "video", desc: "Configure your customer management", url: "https://wealthmoves-pro.coursesprout.com", locked: true },
    ],
  },
  {
    category: "AI & Automation",
    items: [
      { title: "AI Prompt Library", type: "pdf", desc: "50+ prompts for revenue generation", url: "https://wealthmoves-pro.coursesprout.com", locked: true },
      { title: "Content Generator", type: "tool", desc: "AI-powered content creation", url: "/coach", locked: false },
      { title: "Email Sequence Templates", type: "template", desc: "Ready-to-use email campaigns", url: "https://wealthmoves-pro.coursesprout.com", locked: true },
    ],
  },
];

export default function ResourcesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="heading-xl mb-2">Resources</h1>
        <p className="body-lg">
          Templates, guides, and tools to accelerate your revenue growth.
        </p>
      </div>

      {/* Resource Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resources.map((category, i) => (
          <Card key={i} className="card-wealth">
            <CardHeader>
              <CardTitle className="text-lg">{category.category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category.items.map((item, j) => {
                  const ResourceWrapper = ({ children }: { children: React.ReactNode }) => {
                    if (item.locked) {
                      return (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-[#E4DCD1]/20 cursor-not-allowed opacity-70">
                          {children}
                        </div>
                      );
                    }
                    return (
                      <Link
                        href={item.url}
                        target={item.url.startsWith('http') ? '_blank' : undefined}
                        rel={item.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#E4DCD1]/30 transition-colors cursor-pointer group"
                      >
                        {children}
                      </Link>
                    );
                  };

                  return (
                    <ResourceWrapper key={j}>
                      <div className="w-10 h-10 bg-[#E4DCD1] rounded-lg flex items-center justify-center shrink-0">
                        {item.type === "pdf" && <FileText className="w-5 h-5 text-[#0F3F4C]" />}
                        {item.type === "video" && <Video className="w-5 h-5 text-[#0F3F4C]" />}
                        {item.type === "worksheet" && <BookOpen className="w-5 h-5 text-[#0F3F4C]" />}
                        {item.type === "template" && <Download className="w-5 h-5 text-[#0F3F4C]" />}
                        {item.type === "tool" && <Play className="w-5 h-5 text-[#0F3F4C]" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-[#0F3F4C] group-hover:text-[#0a2f39]">
                            {item.title}
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            {item.type}
                          </Badge>
                          {item.locked && (
                            <Lock className="w-3 h-3 text-[#AFA496]" />
                          )}
                        </div>
                        <p className="text-sm text-[#AFA496]">{item.desc}</p>
                      </div>
                      {!item.locked && (
                        <ExternalLink className="w-4 h-4 text-[#AFA496] opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </ResourceWrapper>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pro Resources CTA */}
      <Card className="bg-[#0F3F4C] text-white border-none">
        <CardContent className="p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">Unlock Pro Resources</h3>
          <p className="text-white/70 mb-4 max-w-md mx-auto">
            Upgrade to WealthMoves Pro for advanced templates, done-for-you systems, and exclusive training.
          </p>
          <Link href="https://buy.stripe.com/fZuaEX0Hn7ru5gh6Wk4Ni0b" target="_blank" rel="noopener noreferrer">
            <Button className="bg-white text-[#0F3F4C] hover:bg-[#E4DCD1]">
              Upgrade to Pro
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
