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
} from "lucide-react";

const dailyActions = [
  { id: "outreach", label: "Outreach to 3 prospects", completed: true },
  { id: "content", label: "Create 1 piece of content", completed: true },
  { id: "followup", label: "Follow up with leads", completed: false },
  { id: "offers", label: "Make 1 offer presentation", completed: false },
  { id: "revenue", label: "Track revenue metrics", completed: false },
];

const milestones = [
  { day: 1, title: "Foundation", completed: true },
  { day: 5, title: "First Lead", completed: true },
  { day: 10, title: "First Conversation", completed: true },
  { day: 15, title: "First Offer", completed: false },
  { day: 20, title: "First Sale", completed: false },
  { day: 30, title: "Sprint Complete", completed: false },
];

export default function SprintPage() {
  const completedToday = dailyActions.filter((a) => a.completed).length;
  const totalToday = dailyActions.length;
  const currentDay = 12;

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
            <p className="text-sm text-[#AFA496]">of 30</p>
          </CardContent>
        </Card>

        <Card className="card-wealth">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-[#AFA496]">Current Streak</span>
            </div>
            <p className="text-3xl font-bold text-[#0F3F4C]">8 days</p>
            <p className="text-sm text-[#AFA496]">Best: 12 days</p>
          </CardContent>
        </Card>

        <Card className="card-wealth">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="text-[#AFA496]">Achievements</span>
            </div>
            <p className="text-3xl font-bold text-[#0F3F4C]">5</p>
            <p className="text-sm text-[#AFA496]">of 12 unlocked</p>
          </CardContent>
        </Card>

        <Card className="card-wealth">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-[#AFA496]">Sprint Revenue</span>
            </div>
            <p className="text-3xl font-bold text-[#0F3F4C]">$1,240</p>
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
                {dailyActions.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#E4DCD1]/30 transition-colors cursor-pointer"
                  >
                    <Checkbox checked={action.completed} />
                    <span
                      className={`flex-1 ${
                        action.completed ? "text-[#AFA496] line-through" : "text-[#0F3F4C]"
                      }`}
                    >
                      {action.label}
                    </span>
                    {action.completed && (
                      <Badge className="bg-green-100 text-green-700">Done</Badge>
                    )}
                  </div>
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
                  {milestones.map((milestone, index) => (
                    <div key={index} className="relative flex items-center gap-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                          milestone.completed
                            ? "bg-green-500 text-white"
                            : index <= 2
                            ? "bg-[#0F3F4C] text-white"
                            : "bg-[#E4DCD1] text-[#AFA496]"
                        }`}
                      >
                        {milestone.completed ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-medium">{milestone.day}</span>
                        )}
                      </div>
                      <div>
                        <p
                          className={`font-medium ${
                            milestone.completed || index <= 2
                              ? "text-[#0F3F4C]"
                              : "text-[#AFA496]"
                          }`}
                        >
                          {milestone.title}
                        </p>
                        <p className="text-sm text-[#AFA496]">Day {milestone.day}</p>
                      </div>
                    </div>
                  ))}
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
                {[...Array(30)].map((_, i) => {
                  const day = i + 1;
                  const isCompleted = day <= currentDay;
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
                {[
                  { name: "First Lead", desc: "Generated your first lead", date: "Day 5" },
                  { name: "Content Creator", desc: "Published 5 pieces of content", date: "Day 8" },
                  { name: "Consistency", desc: "7-day streak completed", date: "Day 7" },
                ].map((achievement, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-[#E4DCD1]/30 rounded-lg">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <div className="flex-1">
                      <p className="font-medium text-[#0F3F4C]">{achievement.name}</p>
                      <p className="text-sm text-[#AFA496]">{achievement.desc}</p>
                    </div>
                    <span className="text-xs text-[#AFA496]">{achievement.date}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
