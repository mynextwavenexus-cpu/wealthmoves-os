"use client";

import { useState, useEffect } from "react";

interface DreamLifeData {
  monthlyTarget?: number;
  yearlyTarget?: number;
}

const SYSTEM_TYPES = [
  { id: "newsletter", name: "Newsletter System", desc: "Build an audience and monetize", icon: "📧" },
  { id: "coaching", name: "Coaching System", desc: "1-on-1 or group coaching", icon: "👥" },
  { id: "course", name: "Course System", desc: "Create and sell courses", icon: "📚" },
  { id: "consulting", name: "Consulting System", desc: "High-ticket consulting", icon: "💼" },
  { id: "affiliate", name: "Affiliate System", desc: "Promote and earn commissions", icon: "🔗" },
  { id: "community", name: "Community System", desc: "Paid community", icon: "💬" },
];

export default function SystemsPage() {
  const [monthlyTarget, setMonthlyTarget] = useState(10000);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Try to load from localStorage (set by Dream Life page)
    const stored = localStorage.getItem("wealthmoves_dreamlife");
    if (stored) {
      try {
        const data: DreamLifeData = JSON.parse(stored);
        if (data.monthlyTarget && data.monthlyTarget > 0) {
          setMonthlyTarget(data.monthlyTarget);
        }
      } catch (e) {
        console.error("Failed to parse dream life data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const revenuePerSystem = Math.round(monthlyTarget / 6);
  const yearlyTarget = monthlyTarget * 12;

  if (!isLoaded) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#E4DCD1]">
      {/* Header */}
      <header className="bg-[#0F3F4C] text-white p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Revenue Systems</h1>
          <p className="text-white/70">Build automated systems to reach your income goals</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <p className="text-sm text-[#AFA496] mb-1">Monthly Target</p>
            <p className="text-3xl font-bold text-[#0F3F4C]">${monthlyTarget.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <p className="text-sm text-[#AFA496] mb-1">Yearly Target</p>
            <p className="text-3xl font-bold text-[#0F3F4C]">${yearlyTarget.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <p className="text-sm text-[#AFA496] mb-1">Per System Target</p>
            <p className="text-3xl font-bold text-[#0F3F4C]">${revenuePerSystem.toLocaleString()}/mo</p>
          </div>
        </div>

        {/* Systems Grid */}
        <h2 className="text-xl font-semibold text-[#0F3F4C] mb-4">Your 6 Revenue Systems</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SYSTEM_TYPES.map((system) => (
            <div key={system.id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">{system.icon}</div>
              <h3 className="text-lg font-semibold text-[#0F3F4C] mb-1">{system.name}</h3>
              <p className="text-sm text-[#AFA496] mb-4">{system.desc}</p>
              <div className="border-t pt-4">
                <p className="text-2xl font-bold text-[#0F3F4C]">${revenuePerSystem.toLocaleString()}</p>
                <p className="text-xs text-[#AFA496]">per month target</p>
              </div>
              <button className="w-full mt-4 bg-[#0F3F4C] text-white py-2 rounded-lg hover:bg-[#0a2f39] transition-colors">
                Start Building
              </button>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-[#AFA496] mb-4">Want to customize your income goals?</p>
          <a 
            href="/dream-life" 
            className="inline-block bg-[#0F3F4C] text-white px-6 py-3 rounded-lg hover:bg-[#0a2f39] transition-colors"
          >
            Update Dream Life Blueprint
          </a>
        </div>
      </main>
    </div>
  );
}
