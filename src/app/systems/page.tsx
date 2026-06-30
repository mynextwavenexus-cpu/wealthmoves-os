"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

interface SystemComponent {
  id: string;
  label: string;
  completed: boolean;
}

interface System {
  id: string;
  userId: string;
  name: string;
  icon: string;
  description: string;
  type: string;
  status: "planning" | "building" | "active";
  components: SystemComponent[];
  progress: number;
  metrics: {
    leads?: number;
    conversions?: number;
    revenue?: number;
  };
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
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSystems();
  }, []);

  const fetchSystems = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/systems");
      
      if (!response.ok) {
        throw new Error("Failed to fetch systems");
      }

      const data = await response.json();
      setSystems(data.systems || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load systems");
    } finally {
      setLoading(false);
    }
  };

  const toggleComponent = async (systemId: string, componentId: string) => {
    const system = systems.find(s => s.id === systemId);
    if (!system) return;

    const updatedComponents = system.components.map(c =>
      c.id === componentId ? { ...c, completed: !c.completed } : c
    );

    const completedCount = updatedComponents.filter(c => c.completed).length;
    const newProgress = Math.round((completedCount / updatedComponents.length) * 100);

    // Determine new status
    let newStatus: "planning" | "building" | "active" = "planning";
    if (newProgress === 100) {
      newStatus = "active";
    } else if (newProgress > 0) {
      newStatus = "building";
    }

    try {
      const response = await fetch("/api/systems", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemId,
          components: updatedComponents,
          progress: newProgress,
          status: newStatus,
        }),
      });

      if (!response.ok) throw new Error("Failed to update system");

      // Update local state
      setSystems(prev =>
        prev.map(s =>
          s.id === systemId
            ? { ...s, components: updatedComponents, progress: newProgress, status: newStatus }
            : s
        )
      );
    } catch (err) {
      console.error("Error updating system:", err);
    }
  };

  const activeSystems = systems.filter(s => s.status !== "planning").length;
  const totalSystems = systems.length;
  const overallProgress = totalSystems > 0 ? Math.round((activeSystems / totalSystems) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F3F4C]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="heading-xl mb-2">System Builder</h1>
          <p className="body-lg text-red-600">{error}</p>
        </div>
        <Button onClick={fetchSystems}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="heading-xl mb-2">System Builder</h1>
        <p className="body-lg">
          Choose your revenue systems and we'll build the complete automation.
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="bg-[#0F3F4C] text-white border-none">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-1">System Building Progress</h3>
              <p className="text-white/70">
                You're building {activeSystems} system{activeSystems !== 1 ? "s" : ""}.{" "}
                {totalSystems - activeSystems > 0
                  ? `${totalSystems - activeSystems} more to go to activate all systems.`
                  : "All systems ready!"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">
                {activeSystems}/{totalSystems}
              </p>
              <p className="text-white/70">Systems Active</p>
            </div>
          </div>
          <Progress value={overallProgress} className="mt-4 h-2 bg-white/20" />
        </CardContent>
      </Card>

      {/* Systems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {systems.map((system) => {
          const Icon = iconMap[system.icon] || Mail;
          return (
            <Card key={system.id} className="card-wealth">
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

                <h3 className="text-lg font-semibold text-[#0F3F4C] mb-2">
                  {system.name}
                </h3>
                <p className="text-sm text-[#AFA496] mb-4">{system.description}</p>

                <div className="space-y-2 mb-4">
                  {system.components.map((component) => (
                    <button
                      key={component.id}
                      onClick={() => toggleComponent(system.id, component.id)}
                      className="w-full flex items-center gap-2 text-sm hover:bg-[#E4DCD1]/20 p-1 rounded transition-colors"
                    >
                      {component.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#E4DCD1] flex-shrink-0" />
                      )}
                      <span
                        className={
                          component.completed
                            ? "text-[#0F3F4C]"
                            : "text-[#AFA496]"
                        }
                      >
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
