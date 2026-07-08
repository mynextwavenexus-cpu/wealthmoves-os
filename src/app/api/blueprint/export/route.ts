import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "wealthmoves-secret-key-change-in-production"
);

async function getUserId(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.userId as string;
  } catch {
    return null;
  }
}

// Generate HTML content for PDF
function generatePDFHTML(data: Record<string, unknown>): string {
  const monthlyTarget = (data.monthlyTarget || data.monthly_income || 10000) as number;
  const currentIncome = (data.currentIncome || data.current_income || 0) as number;
  const yearlyTarget = (data.yearlyTarget || data.yearly_target || monthlyTarget * 12) as number;
  const weeklyTarget = (data.weeklyTarget || data.weekly_target || Math.round(monthlyTarget / 4.33)) as number;
  const dailyTarget = (data.dailyTarget || data.daily_target || Math.round(weeklyTarget / 5)) as number;
  const hourlyTarget = (data.hourlyTarget || data.hourly_target || Math.round(dailyTarget / 8)) as number;
  
  const totalLifestyleCost = 
    ((data.homeCost || data.home_cost || 0) as number) +
    ((data.vehicleCost || data.vehicle_cost || 0) as number) +
    ((data.travelCost || data.travel_cost || 0) as number) +
    ((data.foodCost || data.food_cost || 0) as number) +
    ((data.trainerCost || data.trainer_cost || 0) as number) +
    ((data.chefCost || data.chef_cost || 0) as number) +
    ((data.collegeCost || data.college_cost || 0) as number) +
    ((data.retirementCost || data.retirement_cost || 0) as number) +
    ((data.otherCost || data.other_cost || 0) as number);
  
  const progressPercentage = monthlyTarget > 0 
    ? Math.min(100, Math.round((currentIncome / monthlyTarget) * 100)) 
    : 0;
  
  const gap = Math.max(0, monthlyTarget - currentIncome);
  
  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>WealthMoves OS - Dream Life Blueprint</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #0F3F4C;
      background: white;
    }
    .header {
      background: #0F3F4C;
      color: white;
      padding: 40px;
      margin-bottom: 30px;
    }
    .header h1 { font-size: 32px; margin-bottom: 5px; }
    .header p { opacity: 0.8; font-size: 14px; }
    .content { padding: 0 40px 40px; }
    .section { margin-bottom: 30px; }
    .section-title {
      font-size: 20px;
      font-weight: bold;
      color: #0F3F4C;
      border-bottom: 2px solid #E4DCD1;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 15px;
    }
    .card {
      background: #E4DCD1;
      padding: 20px;
      border-radius: 8px;
    }
    .card-label {
      font-size: 12px;
      color: #AFA496;
      margin-bottom: 5px;
    }
    .card-value {
      font-size: 20px;
      font-weight: bold;
      color: #0F3F4C;
    }
    .row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #E4DCD1;
    }
    .row:last-child { border-bottom: none; }
    .label { color: #AFA496; }
    .value { font-weight: bold; color: #0F3F4C; }
    .progress-bar {
      height: 12px;
      background: #E4DCD1;
      border-radius: 6px;
      margin: 15px 0;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: #0F3F4C;
      border-radius: 6px;
    }
    .info-box {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin-top: 15px;
    }
    .info-text { font-size: 14px; line-height: 1.6; }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #AFA496;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #E4DCD1;
    }
    .highlight {
      background: #0F3F4C;
      color: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 15px;
    }
    .highlight-label { font-size: 12px; opacity: 0.8; }
    .highlight-value { font-size: 24px; font-weight: bold; }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>WealthMoves OS</h1>
    <p>Dream Life Blueprint</p>
    <p style="margin-top: 10px; font-size: 12px;">Generated on ${new Date().toLocaleDateString()}</p>
  </div>

  <div class="content">
    <!-- Income Targets -->
    <div class="section">
      <h2 class="section-title">Income Targets</h2>
      <div class="grid">
        <div class="card">
          <div class="card-label">Monthly Target</div>
          <div class="card-value">${formatCurrency(monthlyTarget)}</div>
        </div>
        <div class="card">
          <div class="card-label">Yearly Target</div>
          <div class="card-value">${formatCurrency(yearlyTarget)}</div>
        </div>
        <div class="card">
          <div class="card-label">Weekly Target</div>
          <div class="card-value">${formatCurrency(weeklyTarget)}</div>
        </div>
        <div class="card">
          <div class="card-label">Daily Target</div>
          <div class="card-value">${formatCurrency(dailyTarget)}</div>
        </div>
      </div>
      <div class="card" style="width: 100%;">
        <div class="card-label">Hourly Rate Target</div>
        <div class="card-value">${formatCurrency(hourlyTarget)}/hour</div>
      </div>
    </div>

    <!-- Progress Section -->
    <div class="section">
      <h2 class="section-title">Progress to Goal</h2>
      <div class="row">
        <span class="label">Current Income</span>
        <span class="value">${formatCurrency(currentIncome)}/mo</span>
      </div>
      <div class="row">
        <span class="label">Target Income</span>
        <span class="value">${formatCurrency(monthlyTarget)}/mo</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progressPercentage}%"></div>
      </div>
      <div class="row">
        <span class="label">${progressPercentage}% Complete</span>
        <span class="value">${formatCurrency(gap)} to go</span>
      </div>
    </div>

    <!-- Lifestyle Costs -->
    <div class="section">
      <h2 class="section-title">Lifestyle Cost Breakdown</h2>
      <div class="row">
        <span class="label">Home & Living</span>
        <span class="value">${formatCurrency((data.homeCost || data.home_cost || 0) as number)}</span>
      </div>
      <div class="row">
        <span class="label">Vehicle & Transport</span>
        <span class="value">${formatCurrency((data.vehicleCost || data.vehicle_cost || 0) as number)}</span>
      </div>
      <div class="row">
        <span class="label">Travel & Experiences</span>
        <span class="value">${formatCurrency((data.travelCost || data.travel_cost || 0) as number)}</span>
      </div>
      <div class="row">
        <span class="label">Food & Dining</span>
        <span class="value">${formatCurrency((data.foodCost || data.food_cost || 0) as number)}</span>
      </div>
      <div class="row">
        <span class="label">Personal Trainer</span>
        <span class="value">${formatCurrency((data.trainerCost || data.trainer_cost || 0) as number)}</span>
      </div>
      <div class="row">
        <span class="label">Personal Chef</span>
        <span class="value">${formatCurrency((data.chefCost || data.chef_cost || 0) as number)}</span>
      </div>
      <div class="row">
        <span class="label">Education</span>
        <span class="value">${formatCurrency((data.collegeCost || data.college_cost || 0) as number)}</span>
      </div>
      <div class="row">
        <span class="label">Retirement & Savings</span>
        <span class="value">${formatCurrency((data.retirementCost || data.retirement_cost || 0) as number)}</span>
      </div>
      <div class="row">
        <span class="label">Other</span>
        <span class="value">${formatCurrency((data.otherCost || data.other_cost || 0) as number)}</span>
      </div>
      <div class="highlight" style="margin-top: 15px;">
        <div class="highlight-label">Total Lifestyle Cost</div>
        <div class="highlight-value">${formatCurrency(totalLifestyleCost)}/mo</div>
      </div>
    </div>

    <!-- Gap Analysis -->
    <div class="section">
      <h2 class="section-title">Gap Analysis</h2>
      <div class="info-box">
        <p class="info-text">
          ${monthlyTarget >= totalLifestyleCost 
            ? `Your target income of ${formatCurrency(monthlyTarget)} covers your lifestyle costs of ${formatCurrency(totalLifestyleCost)} with ${formatCurrency(monthlyTarget - totalLifestyleCost)} to spare for additional savings or investments.`
            : `Your target income of ${formatCurrency(monthlyTarget)} is ${formatCurrency(totalLifestyleCost - monthlyTarget)} short of your lifestyle costs of ${formatCurrency(totalLifestyleCost)}. Consider increasing your target or reducing expenses.`
          }
        </p>
      </div>
    </div>

    <div class="footer">
      WealthMoves OS - Your Personal Wealth Building System
    </div>
  </div>
</body>
</html>
  `;
}

export async function POST(request: NextRequest) {
  const userId = await getUserId(request);
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    // Generate HTML content
    const html = generatePDFHTML(data);
    
    // Return HTML with headers suggesting it should be printed to PDF
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="wealthmoves-blueprint-${new Date().toISOString().split("T")[0]}.html"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to generate export" },
      { status: 500 }
    );
  }
}
