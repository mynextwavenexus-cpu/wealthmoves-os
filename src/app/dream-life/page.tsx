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
  Briefcase,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
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
  existingSkills: string;
  skillsToDevelop: string;
}

const DEFAULT_DATA: BlueprintData = {
  monthlyTarget: 0,
  currentIncome: 0,
  yearlyTarget: 0,
  weeklyTarget: 0,
  dailyTarget: 0,
  hourlyTarget: 0,
  homeCost: 0,
  vehicleCost: 0,
  travelCost: 0,
  foodCost: 0,
  trainerCost: 0,
  chefCost: 0,
  collegeCost: 0,
  retirementCost: 0,
  otherCost: 0,
  otherDescription: "",
  name: "",
  skills: "",
  experience: "",
  passion: "",
  existingSkills: "",
  skillsToDevelop: "",
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
              monthlyTarget: bp.monthlyTarget || bp.monthly_income || 0,
              currentIncome: bp.currentIncome || bp.current_income || 0,
              yearlyTarget: bp.yearlyTarget || bp.yearly_target || 0,
              weeklyTarget: bp.weeklyTarget || bp.weekly_target || 0,
              dailyTarget: bp.dailyTarget || bp.daily_target || 0,
              hourlyTarget: bp.hourlyTarget || bp.hourly_target || 0,
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
              existingSkills: bp.existingSkills || bp.existing_skills || "",
              skillsToDevelop: bp.skillsToDevelop || bp.skills_to_develop || "",
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
            monthlyTarget: parsed.monthlyTarget || 0,
            yearlyTarget: parsed.yearlyTarget || 0,
            weeklyTarget: parsed.weeklyTarget || 0,
            dailyTarget: parsed.dailyTarget || 0,
            hourlyTarget: parsed.hourlyTarget || 0,
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#0F3F4C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#AFA496]">Loading your blueprint...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "breakdown", label: "Breakdown" },
    { id: "lifestyle", label: "Lifestyle" },
    { id: "skills", label: "Skills" },
  ];

  const currentTabIndex = tabs.findIndex(t => t.id === activeTab);
  const goToPrevTab = () => {
    if (currentTabIndex > 0) setActiveTab(tabs[currentTabIndex - 1].id);
  };
  const goToNextTab = () => {
    if (currentTabIndex < tabs.length - 1) setActiveTab(tabs[currentTabIndex + 1].id);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0F3F4C]">
            Dream Life Blueprint
          </h1>
          <p className="text-[#0F3F4C]/60 mt-0.5 text-sm sm:text-base">
            Define your income goals and build systems to achieve them
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Button
            onClick={handleExportPDF}
            variant="outline"
            className="border-[#0F3F4C]/30 text-[#0F3F4C] hover:bg-[#0F3F4C]/5 font-medium text-sm min-h-[44px]"
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Export PDF</span>
            <span className="sm:hidden">Export</span>
          </Button>
          <Button
            onClick={() => router.push("/systems")}
            className="bg-[#0F3F4C] text-white hover:bg-[#0a2f39] text-sm min-h-[44px]"
          >
            <span className="hidden sm:inline">View Systems</span>
            <span className="sm:hidden">Systems</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Navigation Tabs - Mobile: Horizontal scroll, Desktop: Normal */}
      <div className="bg-white rounded-xl border border-[#E4DCD1] overflow-hidden">
        <nav className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[100px] px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-[#0F3F4C] text-[#0F3F4C] bg-[#0F3F4C]/5"
                  : "border-transparent text-[#AFA496] hover:text-[#0F3F4C] hover:border-[#AFA496]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile Tab Navigation Arrows */}
      <div className="flex items-center justify-between sm:hidden">
        <button
          onClick={goToPrevTab}
          disabled={currentTabIndex === 0}
          className="flex items-center gap-1 px-3 py-2 text-sm text-[#0F3F4C] disabled:text-[#AFA496] disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
          Prev
        </button>
        <span className="text-sm text-[#AFA496]">
          {currentTabIndex + 1} of {tabs.length}
        </span>
        <button
          onClick={goToNextTab}
          disabled={currentTabIndex === tabs.length - 1}
          className="flex items-center gap-1 px-3 py-2 text-sm text-[#0F3F4C] disabled:text-[#AFA496] disabled:opacity-50"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-0">
          {/* Progress Card */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-[#0F3F4C] flex items-center gap-2 text-base sm:text-lg">
                <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                Your Progress
              </CardTitle>
              <CardDescription className="text-sm">Track your journey to financial freedom</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-[#AFA496]">Current Income</p>
                    <p className="text-xl sm:text-2xl font-bold text-[#0F3F4C]">${data.currentIncome.toLocaleString()}/mo</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm text-[#AFA496]">Target Income</p>
                    <p className="text-xl sm:text-2xl font-bold text-[#0F3F4C]">${data.monthlyTarget.toLocaleString()}/mo</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-[#AFA496]">{progressPercentage}% Complete</span>
                    <span className="text-[#0F3F4C] font-medium">
                      ${monthlyGap.toLocaleString()} to go
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2.5 sm:h-3" />
                </div>

                {monthlyGap > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-amber-800 text-sm">Gap Analysis</p>
                      <p className="text-xs sm:text-sm text-amber-700">
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
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-[#0F3F4C] text-base sm:text-lg">Update Your Target</CardTitle>
              <CardDescription className="text-sm">Adjust your monthly income goal</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="monthlyTarget" className="text-[#0F3F4C] text-sm">Monthly Target</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0F3F4C] text-lg sm:text-xl font-semibold">$</span>
                    <Input
                      id="monthlyTarget"
                      type="number"
                      value={data.monthlyTarget}
                      onChange={(e) => updateMonthlyTarget(Number(e.target.value))}
                      className="pl-10 text-xl sm:text-2xl py-5 sm:py-6 border-[#E4DCD1] focus:border-[#0F3F4C]"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full bg-[#0F3F4C] text-white hover:bg-[#0a2f39] min-h-[44px]"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Comparison Chart */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-[#0F3F4C] text-base sm:text-lg">Current vs Target</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E4DCD1" />
                    <XAxis dataKey="name" stroke="#AFA496" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#AFA496" tickFormatter={(value) => `$${value.toLocaleString()}`} tick={{ fontSize: 10 }} />
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
        <TabsContent value="breakdown" className="space-y-4 sm:space-y-6 mt-0">
          {/* Income Targets Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#0F3F4C]/10 rounded-lg flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#0F3F4C]" />
                  </div>
                  <span className="text-xs sm:text-sm text-[#AFA496]">Yearly</span>
                </div>
                <p className="text-lg sm:text-2xl font-bold text-[#0F3F4C]">${data.yearlyTarget.toLocaleString()}</p>
                <p className="text-[10px] sm:text-xs text-[#AFA496] mt-0.5 sm:mt-1">${Math.round(data.yearlyTarget / 12).toLocaleString()}/mo avg</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#0F3F4C]/10 rounded-lg flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-[#0F3F4C]" />
                  </div>
                  <span className="text-xs sm:text-sm text-[#AFA496]">Weekly</span>
                </div>
                <p className="text-lg sm:text-2xl font-bold text-[#0F3F4C]">${data.weeklyTarget.toLocaleString()}</p>
                <p className="text-[10px] sm:text-xs text-[#AFA496] mt-0.5 sm:mt-1">5 work days</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#0F3F4C]/10 rounded-lg flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#0F3F4C]" />
                  </div>
                  <span className="text-xs sm:text-sm text-[#AFA496]">Daily</span>
                </div>
                <p className="text-lg sm:text-2xl font-bold text-[#0F3F4C]">${data.dailyTarget.toLocaleString()}</p>
                <p className="text-[10px] sm:text-xs text-[#AFA496] mt-0.5 sm:mt-1">8 hour day</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#0F3F4C]/10 rounded-lg flex items-center justify-center shrink-0">
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-[#0F3F4C]" />
                  </div>
                  <span className="text-xs sm:text-sm text-[#AFA496]">Hourly</span>
                </div>
                <p className="text-lg sm:text-2xl font-bold text-[#0F3F4C]">${data.hourlyTarget.toLocaleString()}</p>
                <p className="text-[10px] sm:text-xs text-[#AFA496] mt-0.5 sm:mt-1">Target rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Breakdown */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-[#0F3F4C] text-base sm:text-lg">Revenue Breakdown</CardTitle>
              <CardDescription className="text-sm">How your income breaks down across different time periods</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="space-y-2 sm:space-y-3">
                {[
                  { label: "Monthly", value: data.monthlyTarget, subtext: "Primary target" },
                  { label: "Yearly", value: data.yearlyTarget, subtext: "Annual goal" },
                  { label: "Weekly", value: data.weeklyTarget, subtext: "52 weeks/year" },
                  { label: "Daily", value: data.dailyTarget, subtext: "5 days/week" },
                  { label: "Hourly", value: data.hourlyTarget, subtext: "8 hours/day" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 sm:p-4 bg-[#E4DCD1]/20 rounded-lg">
                    <div>
                      <p className="font-medium text-[#0F3F4C] text-sm sm:text-base">{item.label}</p>
                      <p className="text-[10px] sm:text-xs text-[#AFA496]">{item.subtext}</p>
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-[#0F3F4C]">${item.value.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lifestyle Calculator Tab */}
        <TabsContent value="lifestyle" className="space-y-4 sm:space-y-6 mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Lifestyle Costs Inputs */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-[#0F3F4C] flex items-center gap-2 text-base sm:text-lg">
                    <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                    Lifestyle Cost Calculator
                  </CardTitle>
                  <CardDescription className="text-sm">Calculate what your dream lifestyle costs per month</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                      <div key={item.key} className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor={item.key} className="text-[#0F3F4C] flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                          <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          {item.label}
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AFA496] text-sm">$</span>
                          <Input
                            id={item.key}
                            type="number"
                            value={data[item.key as keyof BlueprintData] as number || ""}
                            onChange={(e) => setData(prev => ({ ...prev, [item.key]: Number(e.target.value) }))}
                            placeholder="0"
                            className="pl-7 sm:pl-8 border-[#E4DCD1] focus:border-[#0F3F4C] text-sm"
                          />
                        </div>
                      </div>
                    ))}

                    <div className="space-y-1.5 sm:space-y-2 sm:col-span-2">
                      <Label htmlFor="otherCost" className="text-[#0F3F4C] flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Other Expenses
                      </Label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative sm:w-1/3">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AFA496] text-sm">$</span>
                          <Input
                            id="otherCost"
                            type="number"
                            value={data.otherCost || ""}
                            onChange={(e) => setData(prev => ({ ...prev, otherCost: Number(e.target.value) }))}
                            placeholder="0"
                            className="pl-7 sm:pl-8 border-[#E4DCD1] focus:border-[#0F3F4C] text-sm"
                          />
                        </div>
                        <Input
                          value={data.otherDescription}
                          onChange={(e) => setData(prev => ({ ...prev, otherDescription: e.target.value }))}
                          placeholder="Description (optional)"
                          className="flex-1 border-[#E4DCD1] focus:border-[#0F3F4C] text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full mt-4 sm:mt-6 bg-[#0F3F4C] text-white hover:bg-[#0a2f39] min-h-[44px]"
                  >
                    {isSaving ? "Saving..." : "Save Lifestyle Costs"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Summary Sidebar */}
            <div className="space-y-3 sm:space-y-4">
              <Card className="bg-[#0F3F4C] text-white border-0 shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <p className="text-white/70 text-xs sm:text-sm mb-1">Total Lifestyle Cost</p>
                  <p className="text-2xl sm:text-3xl font-bold">${totalLifestyleCost.toLocaleString()}/mo</p>
                  <p className="text-white/70 text-xs sm:text-sm mt-1">
                    ${(totalLifestyleCost * 12).toLocaleString()}/year
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-[#0F3F4C] text-base sm:text-lg">Required Income</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[#AFA496] text-sm">Lifestyle Cost</span>
                      <span className="font-medium text-[#0F3F4C]">${totalLifestyleCost.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#AFA496] text-sm">Current Target</span>
                      <span className="font-medium text-[#0F3F4C]">${data.monthlyTarget.toLocaleString()}</span>
                    </div>
                    <div className="h-px bg-[#E4DCD1]" />
                    <div className="flex items-center justify-between">
                      <span className="text-[#0F3F4C] font-medium text-sm">Gap</span>
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
                          <TrendingDown className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                          <p className="text-xs sm:text-sm text-red-700">
                            Your target is ${(totalLifestyleCost - data.monthlyTarget).toLocaleString()} short of your lifestyle costs.
                          </p>
                        </div>
                      </div>
                    )}

                    {data.monthlyTarget >= totalLifestyleCost && totalLifestyleCost > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                        <div className="flex items-start gap-2">
                          <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                          <p className="text-xs sm:text-sm text-green-700">
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
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-[#0F3F4C] text-base sm:text-lg">Cost Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                    <div className="h-40 sm:h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={breakdownData} layout="vertical" margin={{ left: 0, right: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E4DCD1" horizontal={false} />
                          <XAxis type="number" stroke="#AFA496" tickFormatter={(value) => `$${value}`} tick={{ fontSize: 10 }} />
                          <YAxis dataKey="name" type="category" stroke="#0F3F4C" width={70} tick={{ fontSize: 11 }} />
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

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-4 sm:space-y-6 mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Existing Skills */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-[#0F3F4C] text-base sm:text-lg">Existing Skills</CardTitle>
                <CardDescription className="text-sm">What skills do you already have that can generate revenue?</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="space-y-4">
                  <textarea
                    value={data.existingSkills}
                    onChange={(e) => setData(prev => ({ ...prev, existingSkills: e.target.value }))}
                    placeholder="Example:\n- Web development\n- Copywriting\n- Sales\n- Project management\n- Graphic design\n- Teaching/coaching"
                    className="w-full min-h-[200px] p-4 rounded-lg border border-[#E4DCD1] focus:border-[#0F3F4C] focus:ring-1 focus:ring-[#0F3F4C] resize-none text-sm"
                  />
                  <Button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-[#0F3F4C] text-white hover:bg-[#0a2f39] min-h-[44px]"
                  >
                    {isSaving ? "Saving..." : "Save Skills"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Skills to Develop */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-[#0F3F4C] text-base sm:text-lg">Skills to Develop</CardTitle>
                <CardDescription className="text-sm">What skills do you need to learn to create better offers?</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="space-y-4">
                  <textarea
                    value={data.skillsToDevelop}
                    onChange={(e) => setData(prev => ({ ...prev, skillsToDevelop: e.target.value }))}
                    placeholder="Example:\n- AI automation\n- High-ticket sales\n- Video editing\n- Email marketing\n- Funnel building\n- Public speaking"
                    className="w-full min-h-[200px] p-4 rounded-lg border border-[#E4DCD1] focus:border-[#0F3F4C] focus:ring-1 focus:ring-[#0F3F4C] resize-none text-sm"
                  />
                  <Button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-[#0F3F4C] text-white hover:bg-[#0a2f39] min-h-[44px]"
                  >
                    {isSaving ? "Saving..." : "Save Skills"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skills Summary Card */}
          <Card className="bg-[#0F3F4C] text-white border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-lg font-bold mb-4">Skills Gap Analysis</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-white/70 text-sm mb-2">Existing Skills Count</p>
                  <p className="text-2xl font-bold">{data.existingSkills ? data.existingSkills.split('\n').filter(s => s.trim()).length : 0}</p>
                </div>
                <div>
                  <p className="text-white/70 text-sm mb-2">Skills to Develop</p>
                  <p className="text-2xl font-bold">{data.skillsToDevelop ? data.skillsToDevelop.split('\n').filter(s => s.trim()).length : 0}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-sm text-white/80">
                  Focus on leveraging your existing skills for quick revenue while developing new skills for long-term growth.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}