"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface DashboardStats {
  monthlyIncomeGoal: number;
  currentIncome: number;
  incomeProgress: number;
  blueprintProgress: number;
  revenueScore: number;
}

interface Sprint {
  day: number;
  totalDays: number;
  daysRemaining: number;
  revenueGenerated: number;
}

interface WeeklyStats {
  newLeads: number;
  conversations: number;
  revenue: number;
  contentPublished: number;
}

interface Offer {
  id: string;
  name: string;
  price: number;
  status: string;
  revenueGenerated: number;
}

interface NextAction {
  title: string;
  description: string;
  cta: string;
  link: string;
}

interface DashboardData {
  stats: DashboardStats;
  sprint: Sprint | null;
  weeklyStats: WeeklyStats;
  offers: Offer[];
  nextAction: NextAction;
}

interface DataContextType {
  dashboard: DashboardData | null;
  isLoading: boolean;
  refreshDashboard: () => Promise<void>;
  dataSource: 'api' | 'localStorage' | 'none';
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'api' | 'localStorage' | 'none'>('none');

  const refreshDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const data = await res.json();
        
        // Check if API has blueprint data
        const hasApiData = data.stats && data.stats.monthlyIncomeGoal > 0;
        
        if (hasApiData) {
          setDataSource('api');
          setDashboard(data);
        } else {
          // If API returns empty stats but localStorage has data, merge it
          const localData = localStorage.getItem('wealthmoves_dreamlife');
          if (localData) {
            const parsed = JSON.parse(localData);
            const monthlyIncome = parsed.targets?.monthly || 0;
            const currentIncome = parsed.currentIncome || 0;
            
            if (monthlyIncome > 0) {
              data.stats = {
                monthlyIncomeGoal: monthlyIncome,
                currentIncome: currentIncome,
                incomeProgress: Math.round((currentIncome / monthlyIncome) * 100),
                blueprintProgress: 65,
                revenueScore: 0,
              };
              
              // Also set next action if not present
              if (!data.nextAction) {
                data.nextAction = {
                  title: "Complete Your Revenue Opportunities Assessment",
                  description: "Based on your dream life blueprint, we need to identify your highest-potential income streams. This 5-minute assessment will unlock personalized recommendations.",
                  cta: "Start Assessment",
                  link: "/revenue",
                };
              }
              
              setDataSource('localStorage');
              setDashboard(data);
            } else {
              setDataSource('none');
              setDashboard(data);
            }
          } else {
            setDataSource('none');
            setDashboard(data);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshDashboard();
  }, []);

  return (
    <DataContext.Provider value={{ dashboard, isLoading, refreshDashboard, dataSource }}>
      {children}
    </DataContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DataProvider");
  }
  return context;
}
