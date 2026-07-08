"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Home, 
  Car, 
  Plane, 
  Utensils, 
  Dumbbell, 
  ChefHat, 
  GraduationCap, 
  PiggyBank, 
  Plus,
  Download,
  ArrowRight,
  DollarSign,
  Calendar,
  Clock,
  Briefcase
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine
} from "recharts";

interface BlueprintData {
  monthlyTarget: number;
  currentIncome: number;
  yearlyTarget: number;
  weeklyTarget: number;
  dailyTarget: number;
  hourlyTarget: number;
  homeCost: number;
  vehicleCost: number;
  travelCost: number;
  foodCost: number;
  trainerCost: number;
  chefCost: number;
  collegeCost: number;
  retirementCost: number;
  otherCost: number;
  otherDescription: string;
  name: string;
  skills: string;
  experience: string;
  passion: string;
}

const DEFAULT_DATA: BlueprintData = {
  monthlyTarget: 10000,
  currentIncome: 0,
  yearlyTarget: 120000,
  weeklyTarget: 2309,
  dailyTarget: 462,
  hourlyTarget: 58,
  homeCost: 3000,
  vehicleCost: 800,
  travelCost: 1000,
  foodCost: 800,
  trainerCost: 500,
  chefCost: 1000,
  collegeCost: 0,
  retirementCost: 2000,
  otherCost: 0,
  otherDescription: "",
  name: "",
  skills: "",
  experience: "",
  passion: "",
};

export default function DreamLifePage() {
  const router = useRouter();
  const [data, setData] = useState<BlueprintData>(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Load data from API and localStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to get from API first
        const response = await fetch("/api/blueprint");
        if (response.ok) {
          const result = await response.json();
          if (result.blueprint) {
            const bp = result.blueprint;
            setData({
              monthlyTarget: bp.monthlyTarget || bp.monthly_income || 10000,
              currentIncome: bp.currentIncome || bp.current_income || 0,
              yearlyTarget: bp.yearlyTarget || bp.yearly_target || 120000,
              weeklyTarget: bp.weeklyTarget || bp.weekly_target || 2309,
              dailyTarget: bp.dailyTarget || bp.daily_target || 462,
              hourlyTarget: bp.hourlyTarget || bp.hourly_target || 58,
              homeCost: bp.homeCost || bp.home_cost || 0,
              vehicleCost: bp.vehicleCost || bp.vehicle_cost || 0,
              travelCost: bp.travelCost || bp.travel_cost || 0,
              foodCost: bp.foodCost || bp.food_cost || 0,
              trainerCost: bp.trainerCost || bp.trainer_cost || 0,
              chefCost: bp.chefCost || bp.chef_cost || 0,
              collegeCost: bp.collegeCost || bp.college_cost || 0,
              retirementCost: bp.retirementCost || bp.retirement_cost || 0,
              otherCost: bp.otherCost || bp.other_cost || 0,
              otherDescription: bp.otherDescription || bp.other_description || "",
              name: bp.name || "",
              skills: bp.skills || "",
              experience: bp.experience || "",
              passion: bp.passion || "",
            });
            setIsLoading(false);
            return;
          }
        }

        // Fallback to localStorage
        const stored = localStorage.getItem("wealthmoves_dreamlife");
        if (stored) {
          const parsed = JSON.parse(stored);
          setData(prev => ({
            ...prev,
            monthlyTarget: parsed.monthlyTarget || 10000,
            yearlyTarget: parsed.yearlyTarget || 120000,
            weeklyTarget: parsed.weeklyTarget || 2309,
            dailyTarget: parsed.dailyTarget || 462,
            hourlyTarget: parsed.hourlyTarget || 58,
          }));
        }
      } catch (error) {
        console.error("Error loading blueprint:", error);
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Calculate derived values when monthly target changes
  const updateMonthlyTarget = (value: number) => {
    const monthlyTarget = Math.max(0, value);
    const yearlyTarget = monthlyTarget * 12;
    const weeklyTarget = Math.round(monthlyTarget / 4.33);
    const dailyTarget = Math.round(weeklyTarget / 5);
    const hourlyTarget = Math.round(dailyTarget / 8);

    setData(prev => ({
      ...prev,
      monthlyTarget,
      yearlyTarget,
      weeklyTarget,
      dailyTarget,
      hourlyTarget,
    }));
  };

  // Calculate total lifestyle cost
  const totalLifestyleCost = 
    data.homeCost + 
    data.vehicleCost + 
    data.travelCost + 
    data.foodCost + 
    data.trainerCost + 
    data.chefCost + 
    data.collegeCost + 
    data.retirementCost + 
    data.otherCost;

  // Calculate gap
  const monthlyGap = Math.max(0, data.monthlyTarget - data.currentIncome);
  const progressPercentage = data.monthlyTarget > 0 
    ? Math.min(100, Math.round((data.currentIncome / data.monthlyTarget) * 100)) 
    : 0;

  // Chart data
  const comparisonData = [
    { name: "Current", amount: data.currentIncome, fill: "#AFA496" },
    { name: "Target", amount: data.monthlyTarget, fill: "#0F3F4C" },
  ];

  const breakdownData = [
    { name: "Home", value: data.homeCost, icon: Home },
    { name: "Vehicle", value: data.vehicleCost, icon: Car },
    { name: "Travel", value: data.travelCost, icon: Plane },
    { name: "Food", value: data.foodCost, icon: Utensils },
    { name: "Trainer", value: data.trainerCost, icon: Dumbbell },
    { name: "Chef", value: data.chefCost, icon: ChefHat },
    { name: "Education", value: data.collegeCost, icon: GraduationCap },
    { name: "Retirement", value: data.retirementCost, icon: PiggyBank },
  ].filter(item => item.value > 0);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/blueprint", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      // Also save to localStorage
      localStorage.setItem("wealthmoves_dreamlife", JSON.stringify({
        monthlyTarget: data.monthlyTarget,
        yearlyTarget: data.yearlyTarget,
        weeklyTarget: data.weeklyTarget,
        dailyTarget: data.dailyTarget,
        hourlyTarget: data.hourlyTarget,
        updatedAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Error saving:", error);
    }
    setIsSaving(false);
  };

  const handleExportPDF = async () => {
    try {
      const response = await fetch("/api/blueprint/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to export");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Open in new window for printing to PDF
      const printWindow = window.open(url, "_blank");
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
      
      // Also offer download
      const a = document.createElement("a");
      a.href = url;
      a.download = `wealthmoves-blueprint-${new Date().toISOString().split("T")[0]}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting:", error);
      alert("Failed to export. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E4DCD1] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#0F3F4C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#AFA496]">Loading your blueprint...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E4DCD1]">
      {/* Header */}
      <header className="bg-[#0F3F4C] text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dream Life Blueprint</h1>
              <p className="text-white/70">Define your income goals and build systems to achieve them</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleExportPDF}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button
                onClick={() => router.push("/systems")}
                className="bg-white text-[#0F3F4C] hover:bg-white/90"
              >
                View Systems
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#0F3F4C] data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="breakdown" className="data-[state=active]:bg-[#0F3F4C] data-[state=active]:text-white">
              Income Breakdown
            </TabsTrigger>
            <TabsTrigger value="lifestyle" className="data-[state=active]:bg-[#0F3F4C] data-[state=active]:text-white">
              Lifestyle Calculator
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Progress Card */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#0F3F4C] flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Your Progress
                </CardTitle>
                <CardDescription>Track your journey to financial freedom</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#AFA496]">Current Income</p>
                      <p className="text-2xl font-bold text-[#0F3F4C]">${data.currentIncome.toLocaleString()}/mo</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#AFA496]">Target Income</p>
                      <p className="text-2xl font-bold text-[#0F3F4C]">${data.monthlyTarget.toLocaleString()}/mo</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#AFA496]">{progressPercentage}% Complete</span>
                      <span className="text-[#0F3F4C] font-medium">
                        ${monthlyGap.toLocaleString()} to go
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-3" />
                  </div>

                  {monthlyGap > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800">Gap Analysis</p>
                        <p className="text-sm text-amber-700">
                          You need ${monthlyGap.toLocaleString()} more per month to reach your goal.
                          That&apos;s approximately {Math.ceil(monthlyGap / 1000)} new clients at $1,000 each,
                          or {Math.ceil(monthlyGap / 500)} clients at $500 each.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Target Input */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#0F3F4C]">Update Your Target</CardTitle>
                <CardDescription>Adjust your monthly income goal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyTarget" className="text-[#0F3F4C]">Monthly Target</Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0F3F4C] text-xl font-semibold">$</span>
                      <Input
                        id="monthlyTarget"
                        type="number"
                        value={data.monthlyTarget}
                        onChange={(e) => updateMonthlyTarget(Number(e.target.value))}
                        className="pl-10 text-2xl py-6 border-[#E4DCD1] focus:border-[#0F3F4C]"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-[#0F3F4C] text-white hover:bg-[#0a2f39]"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Comparison Chart */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#0F3F4C]">Current vs Target</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E4DCD1" />
                      <XAxis dataKey="name" stroke="#AFA496" />
                      <YAxis stroke="#AFA496" tickFormatter={(value) => `$${value.toLocaleString()}`} />
                      <Tooltip 
                        formatter={(value) => [`$${Number(value).toLocaleString()}`, "Amount"]}
                        contentStyle={{ backgroundColor: "#0F3F4C", border: "none", borderRadius: "8px" }}
                        labelStyle={{ color: "white" }}
                        itemStyle={{ color: "white" }}
                      />
                      <Bar dataKey="amount" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Income Breakdown Tab */}
          <TabsContent value="breakdown" className="space-y-6">
            {/* Income Targets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[#0F3F4C]/10 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-[#0F3F4C]" />
                    </div>
                    <span className="text-sm text-[#AFA496]">Yearly</span>
                  </div>
                  <p className="text-2xl font-bold text-[#0F3F4C]">${data.yearlyTarget.toLocaleString()}</p>
                  <p className="text-xs text-[#AFA496] mt-1">${Math.round(data.yearlyTarget / 12).toLocaleString()}/mo avg</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[#0F3F4C]/10 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-[#0F3F4C]" />
                    </div>
                    <span className="text-sm text-[#AFA496]">Weekly</span>
                  </div>
                  <p className="text-2xl font-bold text-[#0F3F4C]">${data.weeklyTarget.toLocaleString()}</p>
                  <p className="text-xs text-[#AFA496] mt-1">5 work days</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[#0F3F4C]/10 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-[#0F3F4C]" />
                    </div>
                    <span className="text-sm text-[#AFA496]">Daily</span>
                  </div>
                  <p className="text-2xl font-bold text-[#0F3F4C]">${data.dailyTarget.toLocaleString()}</p>
                  <p className="text-xs text-[#AFA496] mt-1">8 hour day</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[#0F3F4C]/10 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-[#0F3F4C]" />
                    </div>
                    <span className="text-sm text-[#AFA496]">Hourly</span>
                  </div>
                  <p className="text-2xl font-bold text-[#0F3F4C]">${data.hourlyTarget.toLocaleString()}</p>
                  <p className="text-xs text-[#AFA496] mt-1">Target rate</p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Breakdown */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#0F3F4C]">Revenue Breakdown</CardTitle>
                <CardDescription>How your income breaks down across different time periods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: "Monthly", value: data.monthlyTarget, subtext: "Primary target" },
                    { label: "Yearly", value: data.yearlyTarget, subtext: "Annual goal" },
                    { label: "Weekly", value: data.weeklyTarget, subtext: "52 weeks/year" },
                    { label: "Daily", value: data.dailyTarget, subtext: "5 days/week" },
                    { label: "Hourly", value: data.hourlyTarget, subtext: "8 hours/day" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-4 bg-[#E4DCD1]/20 rounded-lg">
                      <div>
                        <p className="font-medium text-[#0F3F4C]">{item.label}</p>
                        <p className="text-xs text-[#AFA496]">{item.subtext}</p>
                      </div>
                      <p className="text-xl font-bold text-[#0F3F4C]">${item.value.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lifestyle Calculator Tab */}
          <TabsContent value="lifestyle" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lifestyle Costs Inputs */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="bg-white border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-[#0F3F4C] flex items-center gap-2">
                      <Home className="w-5 h-5" />
                      Lifestyle Cost Calculator
                    </CardTitle>
                    <CardDescription>Calculate what your dream lifestyle costs per month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: "homeCost", label: "Home & Living", icon: Home, placeholder: "Rent/mortgage, utilities" },
                        { key: "vehicleCost", label: "Vehicle & Transport", icon: Car, placeholder: "Car payment, insurance, gas" },
                        { key: "travelCost", label: "Travel & Experiences", icon: Plane, placeholder: "Vacations, trips" },
                        { key: "foodCost", label: "Food & Dining", icon: Utensils, placeholder: "Groceries, restaurants" },
                        { key: "trainerCost", label: "Personal Trainer", icon: Dumbbell, placeholder: "Fitness coaching" },
                        { key: "chefCost", label: "Personal Chef", icon: ChefHat, placeholder: "Meal prep service" },
                        { key: "collegeCost", label: "Education", icon: GraduationCap, placeholder: "Courses, college fund" },
                        { key: "retirementCost", label: "Retirement & Savings", icon: PiggyBank, placeholder: "401k, investments" },
                      ].map((item) => (
                        <div key={item.key} className="space-y-2">
                          <Label htmlFor={item.key} className="text-[#0F3F4C] flex items-center gap-2">
                            <item.icon className="w-4 h-4" />
                            {item.label}
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AFA496]">$</span>
                            <Input
                              id={item.key}
                              type="number"
                              value={data[item.key as keyof BlueprintData] as number || ""}
                              onChange={(e) => setData(prev => ({ ...prev, [item.key]: Number(e.target.value) }))}
                              placeholder="0"
                              className="pl-8 border-[#E4DCD1] focus:border-[#0F3F4C]"
                            />
                          </div>
                        </div>
                      ))}

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="otherCost" className="text-[#0F3F4C] flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Other Expenses
                        </Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AFA496]">$</span>
                            <Input
                              id="otherCost"
                              type="number"
                              value={data.otherCost || ""}
                              onChange={(e) => setData(prev => ({ ...prev, otherCost: Number(e.target.value) }))}
                              placeholder="0"
                              className="pl-8 border-[#E4DCD1] focus:border-[#0F3F4C]"
                            />
                          </div>
                          <Input
                            value={data.otherDescription}
                            onChange={(e) => setData(prev => ({ ...prev, otherDescription: e.target.value }))}
                            placeholder="Description (optional)"
                            className="flex-1 border-[#E4DCD1] focus:border-[#0F3F4C]"
                          />
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full mt-6 bg-[#0F3F4C] text-white hover:bg-[#0a2f39]"
                    >
                      {isSaving ? "Saving..." : "Save Lifestyle Costs"}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Summary Sidebar */}
              <div className="space-y-4">
                <Card className="bg-[#0F3F4C] text-white border-0 shadow-sm">
                  <CardContent className="p-6">
                    <p className="text-white/70 text-sm mb-1">Total Lifestyle Cost</p>
                    <p className="text-3xl font-bold">${totalLifestyleCost.toLocaleString()}/mo</p>
                    <p className="text-white/70 text-sm mt-1">
                      ${(totalLifestyleCost * 12).toLocaleString()}/year
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-[#0F3F4C] text-lg">Required Income</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[#AFA496]">Lifestyle Cost</span>
                        <span className="font-medium text-[#0F3F4C]">${totalLifestyleCost.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#AFA496]">Current Target</span>
                        <span className="font-medium text-[#0F3F4C]">${data.monthlyTarget.toLocaleString()}</span>
                      </div>
                      <div className="h-px bg-[#E4DCD1]" />
                      <div className="flex items-center justify-between">
                        <span className="text-[#0F3F4C] font-medium">Gap</span>
                        <span className={`font-bold ${
                          data.monthlyTarget >= totalLifestyleCost ? "text-green-600" : "text-red-600"
                        }`}>
                          {data.monthlyTarget >= totalLifestyleCost ? "+" : ""}
                          ${(data.monthlyTarget - totalLifestyleCost).toLocaleString()}
                        </span>
                      </div>

                      {data.monthlyTarget < totalLifestyleCost && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                          <div className="flex items-start gap-2">
                            <TrendingDown className="w-4 h-4 text-red-600 mt-0.5" />
                            <p className="text-sm text-red-700">
                              Your target is ${(totalLifestyleCost - data.monthlyTarget).toLocaleString()} short of your lifestyle costs.
                            </p>
                          </div>
                        </div>
                      )}

                      {data.monthlyTarget >= totalLifestyleCost && totalLifestyleCost > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                          <div className="flex items-start gap-2">
                            <TrendingUp className="w-4 h-4 text-green-600 mt-0.5" />
                            <p className="text-sm text-green-700">
                              Your target covers your lifestyle with ${(data.monthlyTarget - totalLifestyleCost).toLocaleString()} to spare!
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Breakdown Chart */}
                {breakdownData.length > 0 && (
                  <Card className="bg-white border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-[#0F3F4C] text-lg">Cost Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={breakdownData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#E4DCD1" horizontal={false} />
                            <XAxis type="number" stroke="#AFA496" tickFormatter={(value) => `$${value}`} />
                            <YAxis dataKey="name" type="category" stroke="#0F3F4C" width={80} tick={{ fontSize: 12 }} />
                            <Tooltip 
                              formatter={(value) => [`$${Number(value).toLocaleString()}`, "Cost"]}
                              contentStyle={{ backgroundColor: "#0F3F4C", border: "none", borderRadius: "8px" }}
                              labelStyle={{ color: "white" }}
                              itemStyle={{ color: "white" }}
                            />
                            <Bar dataKey="value" fill="#0F3F4C" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
