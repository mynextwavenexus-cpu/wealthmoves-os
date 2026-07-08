"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Mail,
  Users,
  BookOpen,
  Briefcase,
  Share2,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  Circle,
  Loader2,
  DollarSign,
} from "lucide-react";

interface Blueprint {
  monthlyTarget: number;
  skills: string;
  experience: string;
  passion: string;
}

interface SystemComponent {
  id: string;
  label: string;
  completed: boolean;
}

interface System {
  id: string;
  name: string;
  icon: string;
  description: string;
  type: string;
  status: "planning" | "building" | "active";
  components: SystemComponent[];
  progress: number;
  targetRevenue: number;
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
      
      // Fetch blueprint
      const blueprintRes = await fetch("/api/blueprint");
      const blueprintData = blueprintRes.ok ? await blueprintRes.json() : null;
      setBlueprint(blueprintData);

      // Generate systems dynamically based on blueprint
      const generatedSystems = generateDynamicSystems(blueprintData);
      setSystems(generatedSystems);
      
    } catch (error) {
      console.error("Failed to load data:", error);
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

    function getComponents(status: string): SystemComponent[] {
      if (status === "building") {
        return [
          { id: "1", label: "Foundation Setup", completed: true },
          { id: "2", label: "Initial Content", completed: true },
          { id: "3", label: "Launch Preparation", completed: false },
          { id: "4", label: "Automation & Scale", completed: false },
        ];
      }
      return [
        { id: "1", label: "Foundation Setup", completed: false },
        { id: "2", label: "Initial Content", completed: false },
        { id: "3", label: "Launch Preparation", completed: false },
        { id: "4", label: "Automation & Scale", completed: false },
      ];
    }

    const systemDefinitions = [
      {
        id: "newsletter",
        name: "Newsletter System",
        icon: "Mail",
        type: "newsletter",
        baseDescription: "Build an audience and monetize through sponsorships and products",
      },
      {
        id: "coaching",
        name: "Coaching System",
        icon: "Users",
        type: "coaching",
        baseDescription: "1-on-1 or group coaching with booking, payment, and delivery",
      },
      {
        id: "course",
        name: "Course System",
        icon: "BookOpen",
        type: "course",
        baseDescription: "Create, host, and sell online courses on autopilot",
      },
      {
        id: "consulting",
        name: "Consulting System",
        icon: "Briefcase",
        type: "consulting",
        baseDescription: "High-ticket consulting with proposals, contracts, and delivery",
      },
      {
        id: "affiliate",
        name: "Affiliate System",
        icon: "Share2",
        type: "affiliate",
        baseDescription: "Promote products and earn commissions on autopilot",
      },
      {
        id: "community",
        name: "Community System",
        icon: "MessageCircle",
        type: "community",
        baseDescription: "Build a paid community with recurring revenue",
      },
    ];

    return systemDefinitions.map((def) => {
      const status = getStatus(def.type);
      const components = getComponents(status);
      const progress = status === "building" ? 50 : 0;

      return {
        id: def.id,
        name: def.name,
        icon: def.icon,
        description: `${def.baseDescription}. Target: $${revenuePerSystem.toLocaleString()}/mo`,
        type: def.type,
        status,
        components,
        progress,
        targetRevenue: revenuePerSystem,
      };
    });
  }

  function toggleComponent(systemId: string, componentId: string) {
    setSystems((prev) =>
      prev.map((sys) => {
        if (sys.id !== systemId) return sys;

        const updatedComponents = sys.components.map((c) =>
          c.id === componentId ? { ...c, completed: !c.completed } : c
        );

        const completedCount = updatedComponents.filter((c) => c.completed).length;
        const newProgress = Math.round((completedCount / updatedComponents.length) * 100);

        let newStatus: "planning" | "building" | "active" = "planning";
        if (newProgress === 100) {
          newStatus = "active";
        } else if (newProgress > 0) {
          newStatus = "building";
        }

        return {
          ...sys,
          components: updatedComponents,
          progress: newProgress,
          status: newStatus,
        };
      })
    );
  }

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F3F4C]" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const activeSystems = systems.filter((s) => s.status !== "planning").length;
  const totalRevenue = systems.reduce((sum, sys) => sum + sys.targetRevenue, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="heading-xl mb-2">System Builder</h1>
        <p className="body-lg">
          Build automated revenue systems based on your ${blueprint?.monthlyTarget.toLocaleString() || "10,000"}/mo goal.
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="bg-[#0F3F4C] text-white border-none">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm opacity-80">Total Revenue Target</span>
              </div>
              <div className="text-3xl font-bold">${totalRevenue.toLocaleString()}/mo</div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm opacity-80">Active Systems</span>
              </div>
              <div className="text-3xl font-bold">
                {activeSystems} / {systems.length}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight className="w-5 h-5" />
                <span className="text-sm opacity-80">Per System Target</span>
              </div>
              <div className="text-3xl font-bold">
                ${systems[0]?.targetRevenue.toLocaleString() || "1,667"}/mo
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!blueprint && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <p className="text-yellow-800">
              💡 <strong>Tip:</strong> Create your Dream Life Blueprint first to get personalized revenue targets for each system.
            </p>
            <Button
              onClick={() => router.push("/dream-life")}
              className="mt-3 bg-yellow-600 hover:bg-yellow-700"
              size="sm"
            >
              Create Blueprint →
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Systems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {systems.map((system) => {
          const Icon = iconMap[system.icon] || Mail;
          return (
            <Card key={system.id} className="card-wealth hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-[#E4DCD1] rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[#0F3F4C]" />
                  </div>
                  <Badge
                    className={
                      system.status === "active"
                        ? "bg-green-100 text-green-700"
                        : system.status === "building"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }
                  >
                    {system.status.charAt(0).toUpperCase() + system.status.slice(1)}
                  </Badge>
                </div>

                <h3 className="text-lg font-semibold text-[#0F3F4C] mb-2">{system.name}</h3>
                <p className="text-sm text-[#AFA496] mb-4">{system.description}</p>

                <div className="mb-4 p-3 bg-[#E4DCD1]/30 rounded-lg">
                  <div className="text-xs text-[#0F3F4C]/60 mb-1">Revenue Target</div>
                  <div className="text-xl font-bold text-[#0F3F4C]">
                    ${system.targetRevenue.toLocaleString()}/mo
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {system.components.map((component) => (
                    <button
                      key={component.id}
                      onClick={() => toggleComponent(system.id, component.id)}
                      className="w-full flex items-center gap-2 text-sm hover:bg-[#E4DCD1]/20 p-2 rounded transition-colors"
                    >
                      {component.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#E4DCD1] flex-shrink-0" />
                      )}
                      <span className={component.completed ? "text-[#0F3F4C]" : "text-[#AFA496]"}>
                        {component.label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#AFA496]">Progress</span>
                    <span className="text-[#0F3F4C] font-medium">{system.progress}%</span>
                  </div>
                  <Progress value={system.progress} className="h-2" />
                </div>

                <Button
                  className="w-full bg-[#0F3F4C] hover:bg-[#0a2f39]"
                  disabled={system.status === "planning"}
                >
                  {system.status === "active"
                    ? "View System"
                    : system.status === "building"
                    ? "Continue Building"
                    : "Start Building"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
