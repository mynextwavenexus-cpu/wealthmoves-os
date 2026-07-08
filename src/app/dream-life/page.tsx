"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DreamLifePage() {
  const router = useRouter();
  const [monthlyTarget, setMonthlyTarget] = useState(10000);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Load existing data
    const stored = localStorage.getItem("wealthmoves_dreamlife");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.monthlyTarget) {
          setMonthlyTarget(data.monthlyTarget);
        }
      } catch (e) {
        console.error("Failed to parse dream life data", e);
      }
    }
  }, []);

  const handleSave = () => {
    const data = {
      monthlyTarget: Number(monthlyTarget),
      yearlyTarget: Number(monthlyTarget) * 12,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem("wealthmoves_dreamlife", JSON.stringify(data));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleViewSystems = () => {
    handleSave();
    router.push("/systems");
  };

  return (
    <div className="min-h-screen bg-[#E4DCD1]">
      <header className="bg-[#0F3F4C] text-white p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Dream Life Blueprint</h1>
          <p className="text-white/70">Define your income goals and build systems to achieve them</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-[#0F3F4C] mb-6">What's your monthly income goal?</h2>
          
          <div className="mb-8">
            <label className="block text-sm text-[#AFA496] mb-2">Monthly Target</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0F3F4C] text-xl">$</span>
              <input
                type="number"
                value={monthlyTarget}
                onChange={(e) => setMonthlyTarget(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-4 text-2xl font-bold text-[#0F3F4C] border-2 border-[#E4DCD1] rounded-lg focus:border-[#0F3F4C] focus:outline-none"
                placeholder="10000"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="bg-[#E4DCD1]/30 rounded-lg p-6 mb-8">
            <h3 className="text-sm font-semibold text-[#0F3F4C] mb-4">Your Revenue Breakdown</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-[#0F3F4C]">${monthlyTarget.toLocaleString()}</p>
                <p className="text-xs text-[#AFA496]">Monthly</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0F3F4C]">${(monthlyTarget * 12).toLocaleString()}</p>
                <p className="text-xs text-[#AFA496]">Yearly</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0F3F4C]">${Math.round(monthlyTarget / 6).toLocaleString()}</p>
                <p className="text-xs text-[#AFA496]">Per System</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-[#0F3F4C] text-white py-3 rounded-lg hover:bg-[#0a2f39] transition-colors"
            >
              {isSaved ? "Saved!" : "Save Blueprint"}
            </button>
            <button
              onClick={handleViewSystems}
              className="flex-1 bg-white border-2 border-[#0F3F4C] text-[#0F3F4C] py-3 rounded-lg hover:bg-[#0F3F4C]/5 transition-colors"
            >
              View My Systems
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
