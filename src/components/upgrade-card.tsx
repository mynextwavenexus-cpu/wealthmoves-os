"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getUserTier, upgradePrompts } from "@/lib/access-control";
import { ArrowRight, Sparkles } from "lucide-react";

export function UpgradeCard() {
  const tier = getUserTier();
  
  if (!tier || tier === "sprint") return null;
  
  const prompt = upgradePrompts[tier];
  if (!prompt) return null;

  return (
    <Card className="bg-gradient-to-br from-[#0F3F4C] to-[#1a5a6b] text-white border-none">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{prompt.title}</h3>
            <p className="text-white/70 text-sm mb-3">{prompt.description}</p>
            <div className="flex items-center gap-3">
              {prompt.link === "#" ? (
                <Button disabled className="bg-white/40 text-white cursor-not-allowed">
                  {prompt.cta}
                </Button>
              ) : (
                <a href={prompt.link} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-white text-[#0F3F4C] hover:bg-[#E4DCD1]">
                    {prompt.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              )}
              <span className="text-white/60 text-sm">{prompt.price}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
