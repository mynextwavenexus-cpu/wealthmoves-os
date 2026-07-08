// Admin Revenue API - Detailed revenue analytics
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getRevenueStats } from "@/lib/payments";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "wealthmoves-secret-key-change-in-production"
);

async function isAdmin(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.userId === "user_001";
  } catch {
    return false;
  }
}

// Generate daily revenue data (mock - would come from database)
function generateDailyRevenue(days: number) {
  const data = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Random revenue between $0 and $500
    const revenue = Math.floor(Math.random() * 500);

    data.push({
      date: date.toISOString().split("T")[0],
      revenue,
      transactions: Math.floor(Math.random() * 5),
    });
  }

  return data;
}

// Generate monthly revenue data
function generateMonthlyRevenue(months: number) {
  const data = [];
  const today = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);

    data.push({
      month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      revenue: Math.floor(Math.random() * 10000) + 5000,
      transactions: Math.floor(Math.random() * 50) + 20,
    });
  }

  return data;
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d"; // 7d, 30d, 90d, 1y

    const revenueStats = await getRevenueStats();

    let dailyRevenue;
    let monthlyRevenue;

    switch (period) {
      case "7d":
        dailyRevenue = generateDailyRevenue(7);
        break;
      case "90d":
        dailyRevenue = generateDailyRevenue(90);
        monthlyRevenue = generateMonthlyRevenue(3);
        break;
      case "1y":
        dailyRevenue = generateDailyRevenue(365);
        monthlyRevenue = generateMonthlyRevenue(12);
        break;
      case "30d":
      default:
        dailyRevenue = generateDailyRevenue(30);
        monthlyRevenue = generateMonthlyRevenue(1);
        break;
    }

    // Calculate metrics
    const totalRevenue = dailyRevenue?.reduce((sum, d) => sum + d.revenue, 0) || 0;
    const avgTransactionValue =
      revenueStats.paymentCount > 0
        ? Math.round(revenueStats.totalRevenue / revenueStats.paymentCount)
        : 0;

    // Top performing tiers
    const tierPerformance = Object.entries(revenueStats.revenueByTier)
      .map(([tier, revenue]) => ({
        tier,
        revenue,
        percentage:
          revenueStats.totalRevenue > 0
            ? Math.round((revenue / revenueStats.totalRevenue) * 100)
            : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return NextResponse.json({
      summary: {
        totalRevenue: revenueStats.totalRevenue,
        periodRevenue: totalRevenue,
        paymentCount: revenueStats.paymentCount,
        refunds: revenueStats.refunds,
        avgTransactionValue,
        conversionRate: 3.5, // Mock: 3.5% of visitors convert
      },
      dailyRevenue,
      monthlyRevenue,
      tierPerformance,
      period,
    });
  } catch (error) {
    console.error("Failed to fetch revenue data:", error);
    return NextResponse.json(
      { error: "Failed to fetch revenue data" },
      { status: 500 }
    );
  }
}
