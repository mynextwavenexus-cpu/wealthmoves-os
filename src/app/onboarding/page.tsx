"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OnboardingWizard, OnboardingData } from "@/components/onboarding-wizard";
import { Loader2, CheckCircle } from "lucide-react";

const STORAGE_KEY = "wealthmoves_onboarding";

export default function OnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [savedData, setSavedData] = useState<Partial<OnboardingData>>({});
  const [savedStep, setSavedStep] = useState(0);

  // Load saved progress on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSavedData(parsed.data || {});
        setSavedStep(parsed.step || 0);
      } catch (e) {
        console.error("Failed to parse onboarding data", e);
      }
    }
    setIsLoading(false);
  }, []);

  // Save progress to localStorage
  const handleSaveProgress = (data: Partial<OnboardingData>, step: number) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, step, timestamp: new Date().toISOString() }));
  };

  // Complete onboarding and save to database
  const handleComplete = async (data: OnboardingData) => {
    setIsSaving(true);

    try {
      // Calculate derived values
      const monthlyIncome = data.dreamIncome;
      const yearlyTarget = monthlyIncome * 12;
      const weeklyTarget = Math.round(monthlyIncome / 4.33);
      const dailyTarget = Math.round(weeklyTarget / 5);
      const hourlyTarget = Math.round(dailyTarget / 8);

      const blueprintData = {
        name: data.name,
        monthlyIncome,
        currentIncome: data.currentIncome,
        yearlyTarget,
        monthlyTarget: monthlyIncome,
        weeklyTarget,
        dailyTarget,
        hourlyTarget,
        skills: data.skills.join(", "),
        experience: data.experience,
        passion: data.passion,
        hoursPerWeek: data.hoursPerWeek,
        biggestChallenge: data.biggestChallenge,
        timeline: data.timeline,
        // Initialize lifestyle costs to 0 - user will fill these in later
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
      };

      // Save to API
      const response = await fetch("/api/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blueprintData),
      });

      if (!response.ok) {
        throw new Error("Failed to save blueprint");
      }

      // Also save to localStorage as backup
      localStorage.setItem("wealthmoves_dreamlife", JSON.stringify({
        monthlyTarget: monthlyIncome,
        yearlyTarget,
        weeklyTarget,
        dailyTarget,
        hourlyTarget,
        updatedAt: new Date().toISOString(),
      }));

      // Clear onboarding progress
      localStorage.removeItem(STORAGE_KEY);

      setIsComplete(true);

      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error saving blueprint:", error);
      alert("There was an error saving your blueprint. Please try again.");
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E4DCD1] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0F3F4C] mx-auto mb-4" />
          <p className="text-[#AFA496]">Loading...</p>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-[#E4DCD1] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-[#0F3F4C] mb-4">Welcome to WealthMoves OS!</h1>
          <p className="text-[#AFA496] mb-6">
            Your blueprint has been saved. Redirecting you to your dashboard...
          </p>
          <div className="h-1 bg-[#E4DCD1] rounded-full overflow-hidden">
            <div className="h-full bg-[#0F3F4C] animate-pulse" style={{ width: "100%" }} />
          </div>
        </div>
      </div>
    );
  }

  if (isSaving) {
    return (
      <div className="min-h-screen bg-[#E4DCD1] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0F3F4C] mx-auto mb-4" />
          <p className="text-[#AFA496]">Saving your blueprint...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E4DCD1] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0F3F4C] mb-2">Let&apos;s Build Your Blueprint</h1>
          <p className="text-[#AFA496]">
            Answer a few questions to create your personalized wealth-building plan
          </p>
        </div>

        {/* Wizard */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <OnboardingWizard
            onComplete={handleComplete}
            onSaveProgress={handleSaveProgress}
            savedData={savedData}
            savedStep={savedStep}
          />
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-[#AFA496] mt-6">
          Your progress is automatically saved. You can return anytime.
        </p>
      </div>
    </div>
  );
}
