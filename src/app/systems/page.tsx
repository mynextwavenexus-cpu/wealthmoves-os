"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Mail,
  Users,
  BookOpen,
  Briefcase,
  Share2,
  MessageCircle,
  TrendingUp,
  Target,
  CheckCircle2,
  Loader2,
} from "lucide-react";

const SYSTEM_TYPES = [
  { id: "newsletter", name: "Newsletter System", icon: Mail, desc: "Build an audience and monetize" },
  { id: "coaching", name: "Coaching System", icon: Users, desc: "1-on-1 or group coaching" },
  { id: "course", name: "Course System", icon: BookOpen, desc: "Create and sell courses" },
  { id: "consulting", name: "Consulting System", icon: Briefcase, desc: "High-ticket consulting" },
  { id: "affiliate", name: "Affiliate System", icon: Share2, desc: "Promote and earn commissions" },
  { id: "community", name: "Community System", icon: MessageCircle, desc: "Paid community" },
];

interface BlueprintData {
  monthlyTarget: number;
  currentIncome: number;
}

export default function SystemsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [blueprint, setBlueprint] = useState<BlueprintData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    // Fetch blueprint data
    fetch("/api/blueprint")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data) {
          setBlueprint({
            monthlyTarget: data.monthlyTarget || 0,
            currentIncome: data.currentIncome || 0,
          });
        }
        setLoading(false);
      })
      .catch(() => {
        // Fallback to localStorage if API fails
        const stored = localStorage.getItem("wealthmoves_dreamlife");
        if (stored) {
          try {
            const data = JSON.parse(stored);
            setBlueprint({
              monthlyTarget: data.monthlyTarget || 0,
              currentIncome: 0,
            });
          } catch (e) {
            console.error("Failed to parse blueprint data", e);
          }
        }
        setLoading(false);
      });
  }, [authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F3F4C]" />
      </div>
    );
  }

  const monthlyTarget = blueprint?.monthlyTarget || 0;
  const currentIncome = blueprint?.currentIncome || 0;
  const gap = Math.max(0, monthlyTarget - currentIncome);
  const revenuePerSystem = monthlyTarget > 0 ? Math.round(monthlyTarget / 6) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0F3F4C] mb-2">Revenue Systems</h1>
          <p className="text-lg text-[#0F3F4C]/70">
            {monthlyTarget > 0 
              ? `Build systems to close your $${gap.toLocaleString()}/mo income gap and reach $${monthlyTarget.toLocaleString()}/mo`
              : "Set your income target in Dream Life Blueprint to see personalized system targets"}
          </p>
        </div>
        <Button 
          onClick={() => router.push("/dream-life")}
          variant="outline"
        >
          Update Blueprint
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border border-[#0F3F4C]/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-[#AFA496]">Monthly Target</span>
            </div>
            <p className="text-3xl font-bold text-[#0F3F4C]">
              {monthlyTarget > 0 ? `$${monthlyTarget.toLocaleString()}/mo` : "Not set"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-[#0F3F4C]/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-[#AFA496]">Systems Active</span>
            </div>
            <p className="text-3xl font-bold text-[#0F3F4C]">6 Available</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-[#0F3F4C]/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-[#AFA496]">Per System Target</span>
            </div>
            <p className="text-3xl font-bold text-[#0F3F4C]">
              {revenuePerSystem > 0 ? `$${revenuePerSystem.toLocaleString()}/mo` : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Systems List */}
      <div className="space-y-4">
        {SYSTEM_TYPES.map((system) => {
          const Icon = system.icon;
          return (
            <Card key={system.id} className="bg-white border border-[#0F3F4C]/10">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-[#E4DCD1] rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[#0F3F4C]" />
                      </div>
                      <Badge variant="secondary">Planning</Badge>
                    </div>
                    <h3 className="text-xl font-semibold text-[#0F3F4C] mb-2">
                      {system.name}
                    </h3>
                    <p className="text-sm text-[#AFA496] mb-4">{system.desc}</p>

                    <div className="flex items-center gap-6">
                      <div>
                        <span className="text-2xl font-bold text-[#0F3F4C]">
                          {revenuePerSystem > 0 ? `$${revenuePerSystem.toLocaleString()}/mo` : "Set target to see goal"}
                        </span>
                      </div>
                      {monthlyTarget > 0 && (
                        <>
                          <div className="h-8 w-px bg-[#E4DCD1]" />
                          <div>
                            <span className="text-sm text-[#AFA496]">
                              Target from your ${monthlyTarget.toLocaleString()}/mo goal
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <Button variant="outline" size="sm">
                    Start Building
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
