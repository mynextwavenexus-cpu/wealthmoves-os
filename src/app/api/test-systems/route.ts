import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // This shows exactly what systems data would be generated
  const mockBlueprint = {
    monthlyTarget: 10000,
    skills: "coaching",
    experience: "business",
    passion: "helping others"
  };

  const revenuePerSystem = Math.round(mockBlueprint.monthlyTarget / 6);

  const systems = [
    {
      name: "Newsletter System",
      targetRevenue: revenuePerSystem,
      status: "planning",
      progress: 0
    },
    {
      name: "Coaching System", 
      targetRevenue: revenuePerSystem,
      status: "building",
      progress: 50
    },
    {
      name: "Course System",
      targetRevenue: revenuePerSystem,
      status: "planning", 
      progress: 0
    }
  ];

  return NextResponse.json({
    message: "This is what the systems page SHOULD generate",
    blueprint: mockBlueprint,
    revenuePerSystem,
    systems,
    timestamp: new Date().toISOString()
  });
}
