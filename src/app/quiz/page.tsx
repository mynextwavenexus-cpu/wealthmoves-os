"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Home, 
  Car, 
  Plane, 
  Utensils, 
  Heart,
  GraduationCap, 
  PiggyBank,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Target,
  TrendingUp,
  Lock,
  Zap
} from "lucide-react";
import Link from "next/link";

interface QuizAnswers {
  home: number;
  transport: number;
  travel: number;
  food: number;
  wellness: number;
  education: number;
  savings: number;
  other: number;
}

const DEFAULT_ANSWERS: QuizAnswers = {
  home: 0,
  transport: 0,
  travel: 0,
  food: 0,
  wellness: 0,
  education: 0,
  savings: 0,
  other: 0,
};

const QUESTIONS = [
  {
    id: "home",
    icon: Home,
    title: "Where would you live?",
    description: "Your dream home - rent, mortgage, utilities, maintenance",
    placeholder: "e.g., 5000",
    examples: ["$3,000 modest apartment", "$8,000 luxury home", "$15,000 estate"],
  },
  {
    id: "transport",
    icon: Car,
    title: "How would you get around?",
    description: "Car payments, insurance, gas, or transportation costs",
    placeholder: "e.g., 1500",
    examples: ["$500 used car", "$1,500 luxury vehicle", "$3,000 exotic car"],
  },
  {
    id: "travel",
    icon: Plane,
    title: "Where would you travel?",
    description: "Monthly travel budget - vacations, experiences, adventures",
    placeholder: "e.g., 2000",
    examples: ["$500 local trips", "$2,000 international", "$5,000 luxury travel"],
  },
  {
    id: "food",
    icon: Utensils,
    title: "How would you dine?",
    description: "Groceries, restaurants, meal services, personal chef",
    placeholder: "e.g., 1500",
    examples: ["$600 home cooking", "$1,500 dining out", "$3,000 personal chef"],
  },
  {
    id: "wellness",
    icon: Heart,
    title: "How would you stay healthy?",
    description: "Gym, trainer, spa, healthcare, self-care",
    placeholder: "e.g., 500",
    examples: ["$100 basic gym", "$500 personal trainer", "$1,500 wellness package"],
  },
  {
    id: "education",
    icon: GraduationCap,
    title: "What would you learn?",
    description: "Courses, coaching, books, personal development",
    placeholder: "e.g., 500",
    examples: ["$100 books/courses", "$500 coaching", "$2,000 masterminds"],
  },
  {
    id: "savings",
    icon: PiggyBank,
    title: "How much would you save?",
    description: "Retirement, investments, emergency fund, wealth building",
    placeholder: "e.g., 2000",
    examples: ["$500 starter", "$2,000 wealth building", "$5,000 aggressive"],
  },
  {
    id: "other",
    icon: Sparkles,
    title: "What else matters?",
    description: "Hobbies, entertainment, shopping, gifts, charity",
    placeholder: "e.g., 1000",
    examples: ["$300 minimal", "$1,000 comfortable", "$3,000 abundant"],
  },
];

// Force static rendering - no auth required
export const dynamic = 'force-static';

export default function DreamLifeQuizPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(DEFAULT_ANSWERS);
  const [showResults, setShowResults] = useState(false);
  const [email, setEmail] = useState("");

  const currentQuestion = QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  const totalMonthlyCost = Object.values(answers).reduce((a, b) => a + b, 0);
  const yearlyCost = totalMonthlyCost * 12;
  const weeklyTarget = Math.round(totalMonthlyCost / 4.33);
  const dailyTarget = Math.round(weeklyTarget / 5);
  const hourlyTarget = Math.round(dailyTarget / 8);

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAnswer = (value: number) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleSaveAndContinue = () => {
    // Save to localStorage for when they sign up
    localStorage.setItem("wealthmoves_quiz_results", JSON.stringify({
      answers,
      totalMonthlyCost,
      yearlyCost,
      weeklyTarget,
      dailyTarget,
      hourlyTarget,
      completedAt: new Date().toISOString(),
    }));
    
    // Redirect to full blueprint with their data
    router.push("/dream-life");
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-[#E4DCD1] py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F3F4C]/10 rounded-full text-[#0F3F4C] text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Your Dream Life Cost
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#0F3F4C]">
              Here&apos;s What Your Dream Life Costs
            </h1>
            <p className="text-[#AFA496] max-w-xl mx-auto">
              This is your target. Now let&apos;s build the systems to achieve it.
            </p>
          </div>

          {/* Main Result Card */}
          <Card className="bg-[#0F3F4C] text-white border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <p className="text-white/70 text-sm mb-2">Your Dream Life Requires</p>
              <p className="text-5xl md:text-6xl font-bold mb-2">
                ${totalMonthlyCost.toLocaleString()}
              </p>
              <p className="text-white/70">per month</p>
              
              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-white/70 text-sm">
                  That&apos;s <span className="text-white font-semibold">${yearlyCost.toLocaleString()}</span> per year
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Breakdown Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-[#AFA496] mb-1">Weekly</p>
                <p className="text-xl font-bold text-[#0F3F4C]">${weeklyTarget.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-[#AFA496] mb-1">Daily</p>
                <p className="text-xl font-bold text-[#0F3F4C]">${dailyTarget.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-[#AFA496] mb-1">Hourly</p>
                <p className="text-xl font-bold text-[#0F3F4C]">${hourlyTarget.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-[#AFA496] mb-1">Yearly</p>
                <p className="text-xl font-bold text-[#0F3F4C]">${yearlyCost.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>

          {/* Cost Breakdown */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#0F3F4C]">Where Your Money Goes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {QUESTIONS.filter(q => answers[q.id as keyof QuizAnswers] > 0).map((q) => {
                  const value = answers[q.id as keyof QuizAnswers];
                  const percentage = totalMonthlyCost > 0 ? (value / totalMonthlyCost) * 100 : 0;
                  return (
                    <div key={q.id} className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#0F3F4C]/10 rounded-lg flex items-center justify-center shrink-0">
                        <q.icon className="w-5 h-5 text-[#0F3F4C]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-[#0F3F4C]">{q.title}</span>
                          <span className="text-sm text-[#AFA496]">${value.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-[#E4DCD1] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#0F3F4C] rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Gap Analysis */}
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                  <Target className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 mb-2">The Gap Analysis</h3>
                  <p className="text-amber-800 text-sm mb-4">
                    To earn ${totalMonthlyCost.toLocaleString()}/month, you need approximately:
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-2xl font-bold text-[#0F3F4C]">{Math.ceil(totalMonthlyCost / 1000)}</p>
                      <p className="text-xs text-[#AFA496]">clients at $1k</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-2xl font-bold text-[#0F3F4C]">{Math.ceil(totalMonthlyCost / 2500)}</p>
                      <p className="text-xs text-[#AFA496]">clients at $2.5k</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-2xl font-bold text-[#0F3F4C]">{Math.ceil(totalMonthlyCost / 5000)}</p>
                      <p className="text-xs text-[#AFA496]">clients at $5k</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <div className="space-y-4">
            <Button 
              onClick={handleSaveAndContinue}
              className="w-full bg-[#0F3F4C] text-white hover:bg-[#0a2f39] py-6 text-lg font-semibold"
            >
              <Zap className="w-5 h-5 mr-2" />
              Get Your Full Blueprint & Action Plan
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <p className="text-center text-sm text-[#AFA496]">
              Free access includes detailed breakdowns, income tracking, and AI recommendations
            </p>
          </div>

          {/* Trust Signals */}
          <div className="flex items-center justify-center gap-6 text-sm text-[#AFA496]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Free forever</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Export to PDF</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E4DCD1] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F3F4C]/10 rounded-full text-[#0F3F4C] text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Free Dream Life Calculator
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#0F3F4C] mb-2">
            What Does Your Dream Life Cost?
          </h1>
          <p className="text-[#AFA496]">
            Answer 8 quick questions to discover your exact income target
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-[#AFA496] mb-2">
            <span>Question {currentStep + 1} of {QUESTIONS.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="bg-white border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#0F3F4C]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <currentQuestion.icon className="w-8 h-8 text-[#0F3F4C]" />
              </div>
              <h2 className="text-2xl font-bold text-[#0F3F4C] mb-2">
                {currentQuestion.title}
              </h2>
              <p className="text-[#AFA496]">
                {currentQuestion.description}
              </p>
            </div>

            {/* Input */}
            <div className="max-w-xs mx-auto mb-8">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0F3F4C] text-2xl font-bold">$</span>
                <input
                  type="number"
                  value={answers[currentQuestion.id as keyof QuizAnswers] || ""}
                  onChange={(e) => handleAnswer(Number(e.target.value))}
                  placeholder={currentQuestion.placeholder}
                  className="w-full pl-12 pr-4 py-4 text-3xl font-bold text-center text-[#0F3F4C] border-2 border-[#E4DCD1] rounded-xl focus:border-[#0F3F4C] focus:outline-none transition-colors"
                  autoFocus
                />
              </div>
              <p className="text-center text-sm text-[#AFA496] mt-2">per month</p>
            </div>

            {/* Examples */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {currentQuestion.examples.map((example, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const value = parseInt(example.replace(/[^0-9]/g, ""));
                    handleAnswer(value);
                  }}
                  className="p-3 text-sm text-[#0F3F4C] bg-[#E4DCD1]/30 rounded-lg hover:bg-[#0F3F4C]/10 transition-colors text-center"
                >
                  {example}
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex gap-4">
              {currentStep > 0 && (
                <Button
                  onClick={handlePrev}
                  variant="outline"
                  className="flex-1 border-[#0F3F4C]/30 text-[#0F3F4C]"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="flex-1 bg-[#0F3F4C] text-white hover:bg-[#0a2f39]"
              >
                {currentStep === QUESTIONS.length - 1 ? "See My Results" : "Continue"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Skip Option */}
        <div className="text-center mt-6">
          <button
            onClick={() => setShowResults(true)}
            className="text-sm text-[#AFA496] hover:text-[#0F3F4C] underline"
          >
            Skip to results (use current values)
          </button>
        </div>

        {/* Trust Footer */}
        <div className="mt-12 pt-8 border-t border-[#0F3F4C]/10">
          <div className="flex items-center justify-center gap-8 text-sm text-[#AFA496]">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>500+ dream lives calculated</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Private & secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
