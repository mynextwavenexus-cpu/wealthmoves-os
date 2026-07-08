"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Users,
  BookOpen,
  Briefcase,
  Share2,
  MessageCircle,
  Plus,
  TrendingUp,
  Target,
  Zap,
  Loader2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

interface Blueprint {
  monthlyTarget: number;
  currentIncome: number;
  skills: string;
  experience: string;
  passion: string;
}

interface System {
  id: string;
  name: string;
  icon: string;
  type: string;
  status: "planning" | "building" | "active";
  progress: number;
  targetRevenue: number;
  description: string;
}

const iconMap: Record<string, any> = {
  Mail,
  Users,
  BookOpen,
  Briefcase,
  Share2,
  MessageCircle,
};

export default function SystemsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [systems, setSystems] = useState<System[]>([]);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  async function loadData() {
    try {
      setLoading(true);
      
      const blueprintRes = await fetch("/api/blueprint");
      const blueprintData = blueprintRes.ok ? await blueprintRes.json() : null;
      setBlueprint(blueprintData);

      const generatedSystems = generateDynamicSystems(blueprintData);
      setSystems(generatedSystems);
      
    } catch (error) {
      console.error("Failed to load data:", error);
      const generatedSystems = generateDynamicSystems(null);
      setSystems(generatedSystems);
    } finally {
      setLoading(false);
    }
  }

  function generateDynamicSystems(blueprint: Blueprint | null): System[] {
    const monthlyTarget = blueprint?.monthlyTarget || 10000;
    const revenuePerSystem = Math.round(monthlyTarget / 6);
    
    const skills = blueprint?.skills?.toLowerCase() || "";
    const experience = blueprint?.experience?.toLowerCase() || "";
    const passion = blueprint?.passion?.toLowerCase() || "";
    const profile = `${skills} ${experience} ${passion}`;

    function getStatus(systemType: string): "planning" | "building" {
      if (systemType === "newsletter" && (profile.includes("writ") || profile.includes("content") || profile.includes("blog"))) return "building";
      if (systemType === "coaching" && (profile.includes("coach") || profile.includes("mentor") || profile.includes("teach"))) return "building";
      if (systemType === "course" && (profile.includes("educat") || profile.includes("train") || profile.includes("course"))) return "building";
      if (systemType === "consulting" && (profile.includes("consult") || profile.includes("expert") || profile.includes("advisor"))) return "building";
      if (systemType === "affiliate" && (profile.includes("market") || profile.includes("sales") || profile.includes("promot"))) return "building";
      if (systemType === "community" && (profile.includes("communit") || profile.includes("network") || profile.includes("group"))) return "building";
      return "planning";
    }

    const systemDefinitions = [
      {
        id: "newsletter",
        name: "Newsletter System",
        icon: "Mail",
        type: "newsletter",
        description: "Build an audience and monetize through sponsorships and products",
      },
      {
        id: "coaching",
        name: "Coaching System",
        icon: "Users",
        type: "coaching",
        description: "1-on-1 or group coaching with booking and payment",
      },
      {
        id: "course",
        name: "Course System",
        icon: "BookOpen",
        type: "course",
        description: "Create and sell online courses on autopilot",
      },
      {
        id: "consulting",
        name: "Consulting System",
        icon: "Briefcase",
        type: "consulting",
        description: "High-ticket consulting with proposals and delivery",
      },
      {
        id: "affiliate",
        name: "Affiliate System",
        icon: "Share2",
        type: "affiliate",
        description: "Promote products and earn commissions",
      },
      {
        id: "community",
        name: "Community System",
        icon: "MessageCircle",
        type: "community",
        description: "Build a paid community with recurring revenue",
      },
    ];

    return systemDefinitions.map((def) => {
      const status = getStatus(def.type);
      const progress = status === "building" ? 50 : 0;

      return {
        id: def.id,
        name: def.name,
        icon: def.icon,
        type: def.type,
        status,
        progress,
        targetRevenue: revenuePerSystem,
        description: def.description,
      };
    });
  }

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F3F4C]" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const activeSystems = systems.filter((s) => s.status === "building").length;
  const totalRevenue = systems.reduce((sum, sys) => sum + sys.targetRevenue, 0);
  const avgSystemRevenue = systems.length > 0 ? Math.round(totalRevenue / systems.length) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-xl mb-2">Revenue Systems</h1>
          <p className="body-lg">
            Build automated systems to reach your ${blueprint?.monthlyTarget.toLocaleString() || "10,000"}/mo goal.
          </p>
        </div>
        {blueprint && (
          <Button 
            onClick={() => router.push("/dream-life")}
            variant="outline"
          >
            Update Blueprint
          </Button>
        )}
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-wealth">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-[#AFA496]">Total Target</span>
            </div>
            <p className="text-3xl font-bold text-[#0F3F4C]">
              ${totalRevenue.toLocaleString()}/mo
            </p>
          </CardContent>
        </Card>

        <Card className="card-wealth">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-[#AFA496]">In Progress</span>
            </div>
            <p className="text-3xl font-bold text-[#0F3F4C]">{activeSystems} / {systems.length}</p>
          </CardContent>
        </Card>

        <Card className="card-wealth">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-[#AFA496]">Per System</span>
            </div>
            <p className="text-3xl font-bold text-[#0F3F4C]">
              ${avgSystemRevenue.toLocaleString()}/mo
            </p>
          </CardContent>
        </Card>
      </div>

      {!blueprint && (
        <Card className="card-wealth bg-yellow-50 border-yellow-200">
          <CardContent className="p-6 text-center">
            <Target className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#0F3F4C] mb-2">
              Create Your Blueprint First
            </h3>
            <p className="text-[#AFA496] mb-4 max-w-md mx-auto">
              Set up your Dream Life Blueprint to get personalized revenue targets for each system.
            </p>
            <Button 
              onClick={() => router.push("/dream-life")}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Create Blueprint Now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Systems List */}
      <div className="space-y-4">
        {systems.map((system) => {
          const Icon = iconMap[system.icon] || Mail;
          return (
            <Card key={system.id} className="card-wealth">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-[#E4DCD1] rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[#0F3F4C]" />
                      </div>
                      {system.status === "building" ? (
                        <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>
                      ) : (
                        <Badge variant="secondary">Planning</Badge>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-[#0F3F4C] mb-2">
                      {system.name}
                    </h3>
                    <p className="text-sm text-[#AFA496] mb-4">
                      {system.description}
                    </p>

                    <div className="flex items-center gap-6">
                      <div>
                        <span className="text-2xl font-bold text-[#0F3F4C]">
                          ${system.targetRevenue.toLocaleString()}/mo
                        </span>
                      </div>
                      <div className="h-8 w-px bg-[#E4DCD1]" />
                      <div>
                        <span className="text-sm text-[#AFA496]">{system.progress}% complete</span>
                      </div>
                      <div className="h-8 w-px bg-[#E4DCD1]" />
                      <div>
                        <span className="text-sm text-[#AFA496]">
                          {system.status === "building" ? "Building" : "Not started"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button 
                      variant={system.status === "building" ? "default" : "outline"} 
                      size="sm"
                      className={system.status === "building" ? "bg-[#0F3F4C] hover:bg-[#0a2f39]" : ""}
                    >
                      {system.status === "building" ? "Continue" : "Start Building"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Build New System CTA */}
      <Card className="border-dashed border-2 border-[#E4DCD1] bg-transparent">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-[#E4DCD1] rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-[#0F3F4C]" />
          </div>
          <h3 className="text-lg font-semibold text-[#0F3F4C] mb-2">
            Need a Custom System?
          </h3>
          <p className="text-[#AFA496] mb-4 max-w-md mx-auto">
            Have a unique revenue model? We can help you build a custom system tailored to your business.
          </p>
          <Button className="bg-[#0F3F4C] hover:bg-[#0a2f39]">
            Request Custom System
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
