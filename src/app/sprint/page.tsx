"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Target,
  Flame,
  Trophy,
  Calendar,
  CheckCircle2,
  Circle,
  ArrowRight,
  TrendingUp,
  Loader2,
  Zap,
} from "lucide-react";

interface Task {
  id: string;
  label: string;
  completed: boolean;
  category: string;
}

interface Sprint {
  id: string;
  userId: string;
  day: number;
  totalDays: number;
  startDate: string;
  tasks: Task[];
  revenueGenerated: number;
}

const milestones = [
  { day: 1, title: "Foundation", threshold: 1 },
  { day: 5, title: "First Lead", threshold: 5 },
  { day: 10, title: "First Conversation", threshold: 10 },
  { day: 15, title: "First Offer", threshold: 15 },
  { day: 20, title: "First Sale", threshold: 20 },
  { day: 30, title: "Sprint Complete", threshold: 30 },
];

export default function SprintPage() {
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSprint();
  }, []);

  const fetchSprint = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/sprint");
      
      if (!response.ok) {
        throw new Error("Failed to fetch sprint data");
      }

      const data = await response.json();
      setSprint(data.sprint);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sprint");
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId: string) => {
    if (!sprint || updating) return;

    const updatedTasks = sprint.tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );

    // Optimistic update
    setSprint({ ...sprint, tasks: updatedTasks });

    try {
      setUpdating(true);
      const response = await fetch("/api/sprint", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: updatedTasks }),
      });

      if (!response.ok) {
        // Revert on error
        setSprint(sprint);
        throw new Error("Failed to update task");
      }

      const data = await response.json();
      setSprint(data.sprint);
    } catch (err) {
      console.error("Error updating task:", err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F3F4C]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="heading-xl mb-2">30-Day Revenue Sprint</h1>
          <p className="body-lg text-red-600">{error}</p>
        </div>
        <Button onClick={fetchSprint}>Retry</Button>
      </div>
    );
  }

  if (!sprint) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="heading-xl mb-2">30-Day Revenue Sprint</h1>
          <p className="body-lg">
            Ready to start your revenue sprint?
          </p>
        </div>
        <Card className="card-wealth">
          <CardContent className="p-12 text-center">
            <Zap className="w-16 h-16 text-[#0F3F4C] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#0F3F4C] mb-2">
              Start Your 30-Day Sprint
            </h3>
            <p className="text-[#AFA496] mb-6 max-w-md mx-auto">
              Daily actions. Consistent progress. Real results. Join the sprint to get started.
            </p>
            <Button className="bg-[#0F3F4C] hover:bg-[#0a2f39]">
              Join Sprint ($297)
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedToday = sprint.tasks.filter(t => t.completed).length;
  const totalToday = sprint.tasks.length;
  const currentDay = sprint.day;
  const daysRemaining = sprint.totalDays - sprint.day;
  
  // Calculate streak (mock for now - would need historical data)
  const currentStreak = Math.min(8, currentDay);
  const bestStreak = 12;

  // Calculate achievements (based on milestones reached)
  const achievementsUnlocked = milestones.filter(m => m.threshold <= currentDay).length;
  const totalAchievements = milestones.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="heading-xl mb-2">30-Day Revenue Sprint</h1>
        <p className="body-lg">
          Daily actions. Consistent progress. Real results.
        </p>
      </div>

      {/* Sprint Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-wealth">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-[#0F3F4C]" />
              <span className="text-[#AFA496]">Current Day</span>
            </div>
            <p className="text-3xl font-bold text-[#0F3F4C]">Day {currentDay}</p>
            <p className="text-sm text-[#AFA496]">of {sprint.totalDays}</p>
          </CardContent>
        </Card>

        <Card className="card-wealth">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-[#AFA496]">Current Streak</span>
            </div>
            <p className="text-3xl font-bold text-[#0F3F4C]">{currentStreak} days</p>
            <p className="text-sm text-[#AFA496]">Best: {bestStreak} days</p>
          </CardContent>
        </Card>

        <Card className="card-wealth">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="text-[#AFA496]">Achievements</span>
            </div>
            <p className="text-3xl font-bold text-[#0F3F4C]">{achievementsUnlocked}</p>
            <p className="text-sm text-[#AFA496]">of {totalAchievements} unlocked</p>
          </CardContent>
        </Card>

        <Card className="card-wealth">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-[#AFA496]">Sprint Revenue</span>
            </div>
            <p className="text-3xl font-bold text-[#0F3F4C]">
              ${sprint.revenueGenerated.toLocaleString()}
            </p>
            <p className="text-sm text-[#AFA496]">Goal: $5,000</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Checklist */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="card-wealth">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#0F3F4C]" />
                Today's Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#AFA496]">Progress</span>
                  <span className="text-[#0F3F4C] font-medium">
                    {completedToday}/{totalToday} completed
                  </span>
                </div>
                <Progress value={(completedToday / totalToday) * 100} className="h-2" />
              </div>

              <div className="space-y-3">
                {sprint.tasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    disabled={updating}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#E4DCD1]/30 transition-colors"
                  >
                    <Checkbox checked={task.completed} />
                    <span
                      className={`flex-1 text-left ${
                        task.completed ? "text-[#AFA496] line-through" : "text-[#0F3F4C]"
                      }`}
                    >
                      {task.label}
                    </span>
                    {task.completed && (
                      <Badge className="bg-green-100 text-green-700">Done</Badge>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card className="card-wealth">
            <CardHeader>
              <CardTitle>Sprint Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#E4DCD1]" />
                <div className="space-y-6">
                  {milestones.map((milestone, index) => {
                    const isCompleted = currentDay >= milestone.threshold;
                    const isCurrent = currentDay === milestone.day;

                    return (
                      <div key={index} className="relative flex items-center gap-4">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                            isCompleted
                              ? "bg-green-500 text-white"
                              : isCurrent
                              ? "bg-[#0F3F4C] text-white"
                              : "bg-[#E4DCD1] text-[#AFA496]"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <span className="text-sm font-medium">{milestone.day}</span>
                          )}
                        </div>
                        <div>
                          <p
                            className={`font-medium ${
                              isCompleted || isCurrent
                                ? "text-[#0F3F4C]"
                                : "text-[#AFA496]"
                            }`}
                          >
                            {milestone.title}
                          </p>
                          <p className="text-sm text-[#AFA496]">Day {milestone.day}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Streak Calendar */}
          <Card className="card-wealth">
            <CardHeader>
              <CardTitle className="text-base">Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {[...Array(sprint.totalDays)].map((_, i) => {
                  const day = i + 1;
                  const isCompleted = day < currentDay;
                  const isToday = day === currentDay;

                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium ${
                        isToday
                          ? "bg-[#0F3F4C] text-white"
                          : isCompleted
                          ? "bg-green-100 text-green-700"
                          : "bg-[#E4DCD1] text-[#AFA496]"
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="card-wealth">
            <CardHeader>
              <CardTitle className="text-base">Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {milestones
                  .filter(m => m.threshold <= currentDay)
                  .slice(-3)
                  .reverse()
                  .map((achievement, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-[#E4DCD1]/30 rounded-lg">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <div className="flex-1">
                        <p className="font-medium text-[#0F3F4C]">{achievement.title}</p>
                        <p className="text-sm text-[#AFA496]">Unlocked on Day {achievement.day}</p>
                      </div>
                    </div>
                  ))}
                {achievementsUnlocked === 0 && (
                  <p className="text-center text-[#AFA496] py-4">
                    Complete daily tasks to unlock achievements
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
