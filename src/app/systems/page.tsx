import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Settings2,
  Mail,
  Users,
  BookOpen,
  Briefcase,
  Share2,
  MessageCircle,
  Bot,
  ArrowRight,
  CheckCircle2,
  Circle,
} from "lucide-react";

const systems = [
  {
    id: "newsletter",
    name: "Newsletter System",
    icon: Mail,
    description: "Build an audience and monetize through sponsorships and products.",
    components: ["Lead Magnet", "Landing Page", "Email Sequence", "Content Calendar"],
    progress: 75,
    status: "building",
  },
  {
    id: "coaching",
    name: "Coaching System",
    icon: Users,
    description: "1-on-1 or group coaching with booking, payment, and delivery.",
    components: ["Booking Calendar", "Payment Processing", "Session Framework", "Follow-up"],
    progress: 40,
    status: "building",
  },
  {
    id: "course",
    name: "Course System",
    icon: BookOpen,
    description: "Create, host, and sell online courses on autopilot.",
    components: ["Course Platform", "Video Hosting", "Student Portal", "Certificates"],
    progress: 0,
    status: "planning",
  },
  {
    id: "consulting",
    name: "Consulting System",
    icon: Briefcase,
    description: "High-ticket consulting with proposals, contracts, and delivery.",
    components: ["Proposal Template", "Contract", "Discovery Call", "Project Management"],
    progress: 60,
    status: "building",
  },
  {
    id: "affiliate",
    name: "Affiliate System",
    icon: Share2,
    description: "Promote products and earn commissions on autopilot.",
    components: ["Product Research", "Content Strategy", "Tracking Links", "Email Promos"],
    progress: 20,
    status: "planning",
  },
  {
    id: "community",
    name: "Community System",
    icon: MessageCircle,
    description: "Build a paid community with recurring revenue.",
    components: ["Community Platform", "Onboarding", "Engagement Strategy", "Content"],
    progress: 0,
    status: "planning",
  },
];

export default function SystemsPage() {
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
                You're building 2 systems. 1 more to go to reach your income goal.
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">2/6</p>
              <p className="text-white/70">Systems Active</p>
            </div>
          </div>
          <Progress value={33} className="mt-4 h-2 bg-white/20" />
        </CardContent>
      </Card>

      {/* Systems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {systems.map((system) => {
          const Icon = system.icon;
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
                  {system.components.map((component, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      {system.progress > (i / system.components.length) * 100 ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#E4DCD1]" />
                      )}
                      <span
                        className={
                          system.progress > (i / system.components.length) * 100
                            ? "text-[#0F3F4C]"
                            : "text-[#AFA496]"
                        }
                      >
                        {component}
                      </span>
                    </div>
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
