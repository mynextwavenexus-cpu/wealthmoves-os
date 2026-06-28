"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Home,
  Car,
  Plane,
  Utensils,
  Dumbbell,
  ChefHat,
  GraduationCap,
  PiggyBank,
  Plus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Star,
  Briefcase,
  Lightbulb,
  Award,
} from "lucide-react";

const steps = [
  { id: "welcome", title: "Welcome", icon: Star },
  { id: "name", title: "Your Name", icon: Sparkles },
  { id: "home", title: "Dream Home", icon: Home },
  { id: "vehicle", title: "Dream Vehicle", icon: Car },
  { id: "travel", title: "Travel", icon: Plane },
  { id: "food", title: "Food & Dining", icon: Utensils },
  { id: "trainer", title: "Personal Trainer", icon: Dumbbell },
  { id: "chef", title: "Personal Chef", icon: ChefHat },
  { id: "college", title: "Kids' College", icon: GraduationCap },
  { id: "retirement", title: "Retirement & Investments", icon: PiggyBank },
  { id: "other", title: "Everything Else", icon: Plus },
  { id: "skills", title: "Your Skills", icon: Award },
  { id: "experience", title: "Your Experience", icon: Briefcase },
  { id: "passion", title: "Your Passion", icon: Lightbulb },
  { id: "results", title: "Your Numbers", icon: CheckCircle2 },
];

interface FormData {
  name: string;
  home: number;
  vehicle: number;
  travel: number;
  food: number;
  trainer: number;
  chef: number;
  college: number;
  retirement: number;
  other: number;
  otherDescription: string;
  skills: string;
  experience: string;
  passion: string;
}

export default function DreamLifePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'api' | 'localStorage' | 'none'>('none');
  const [formData, setFormData] = useState<FormData>({
    name: "",
    home: 0,
    vehicle: 0,
    travel: 0,
    food: 0,
    trainer: 0,
    chef: 0,
    college: 0,
    retirement: 0,
    other: 0,
    otherDescription: "",
    skills: "",
    experience: "",
    passion: "",
  });

  // Load existing blueprint data on mount
  useEffect(() => {
    const loadBlueprint = async () => {
      try {
        // First try localStorage
        const localData = localStorage.getItem('wealthmoves_dreamlife');
        if (localData) {
          const parsed = JSON.parse(localData);
          setFormData({
            name: parsed.name || "",
            home: parsed.home || 0,
            vehicle: parsed.vehicle || 0,
            travel: parsed.travel || 0,
            food: parsed.food || 0,
            trainer: parsed.trainer || 0,
            chef: parsed.chef || 0,
            college: parsed.college || 0,
            retirement: parsed.retirement || 0,
            other: parsed.other || 0,
            otherDescription: parsed.otherDescription || "",
            skills: parsed.skills || "",
            experience: parsed.experience || "",
            passion: parsed.passion || "",
          });
          setDataSource('localStorage');
        }

        // Then try API (overwrites local if exists)
        const response = await fetch('/api/blueprint');
        if (response.ok) {
          const data = await response.json();
          if (data.blueprint) {
            setFormData({
              name: data.blueprint.name || "",
              home: data.blueprint.homeCost || 0,
              vehicle: data.blueprint.vehicleCost || 0,
              travel: data.blueprint.travelCost || 0,
              food: data.blueprint.foodCost || 0,
              trainer: data.blueprint.trainerCost || 0,
              chef: data.blueprint.chefCost || 0,
              college: data.blueprint.collegeCost || 0,
              retirement: data.blueprint.retirementCost || 0,
              other: data.blueprint.otherCost || 0,
              otherDescription: data.blueprint.otherDescription || "",
              skills: data.blueprint.skills || "",
              experience: data.blueprint.experience || "",
              passion: data.blueprint.passion || "",
            });
            setDataSource('api');
          }
        }
      } catch (error) {
        console.error('Failed to load blueprint:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBlueprint();
  }, []);

  const updateField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateTotal = () => {
    return (
      formData.home +
      formData.vehicle +
      formData.travel +
      formData.food +
      formData.trainer +
      formData.chef +
      formData.college +
      formData.retirement +
      formData.other
    );
  };

  const calculateBreakdown = () => {
    const monthly = calculateTotal();
    return {
      yearly: monthly * 12,
      monthly,
      weekly: monthly / 4.33,
      daily: monthly / 30,
      hourly: monthly / 30 / 8,
    };
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const renderStep = () => {
    const name = formData.name || "there";

    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#0F3F4C] to-[#1a5a6b] rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="heading-lg mb-4">Welcome to The Dream Life Goal</h2>
              <p className="body-lg text-[#AFA496] max-w-2xl mx-auto">
                Most people spend their whole lives working without ever stopping to ask: 
                <em>&quot;How much does the life I actually want actually cost?&quot;</em>
              </p>
              <p className="body-lg text-[#AFA496] max-w-2xl mx-auto mt-4">
                We&apos;re going to fix that right now.
              </p>
            </div>
            <div className="bg-[#E4DCD1]/50 rounded-xl p-6 max-w-2xl mx-auto">
              <p className="text-[#0F3F4C] font-medium mb-2">
                I&apos;m going to ask you a series of questions about your dream lifestyle.
              </p>
              <p className="text-[#AFA496] text-sm">
                And I need you to be <strong>specific</strong> — not &quot;around $2,000&quot; or &quot;maybe $3k.&quot; 
                I need <strong>exact numbers, down to the penny.</strong> The more precise you are, the more real this becomes.
              </p>
              <p className="text-[#0F3F4C] font-medium mt-4">
                Don&apos;t be &quot;realistic.&quot; This is your DREAM life. Think big. Then think bigger.
              </p>
            </div>
            <p className="text-xl font-semibold text-[#0F3F4C]">Ready? Let&apos;s go. 🔥</p>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="heading-lg mb-2">First, what&apos;s your name?</h2>
              <p className="body-lg text-[#AFA496]">
                I&apos;ll use your name throughout this entire session.
              </p>
            </div>
            <Card className="card-wealth max-w-md mx-auto">
              <CardContent className="p-6">
                <Label className="text-lg font-medium text-[#0F3F4C] mb-4 block">
                  Your Name
                </Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Enter your name"
                  className="text-lg"
                  autoFocus
                />
              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="heading-lg mb-2">Dream Home</h2>
              <p className="body-lg text-[#AFA496]">
                Where do you want to live, {name}? Describe your dream home — and what would the exact monthly mortgage or rent be on a place like that?
              </p>
              <p className="text-sm text-[#0F3F4C] font-medium mt-2">Give me the number down to the penny.</p>
            </div>
            <Card className="card-wealth max-w-md mx-auto">
              <CardContent className="p-6">
                <Label className="text-lg font-medium text-[#0F3F4C] mb-4 block">
                  Monthly Mortgage or Rent
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AFA496] text-lg">$</span>
                  <Input
                    type="number"
                    value={formData.home || ""}
                    onChange={(e) => updateField("home", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="pl-8 text-lg"
                    step="0.01"
                    autoFocus
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="heading-lg mb-2">Dream Vehicle</h2>
              <p className="body-lg text-[#AFA496]">
                What are you driving in your dream life, {name}?
              </p>
              <p className="text-sm text-[#0F3F4C] font-medium mt-2">What is the exact monthly payment on that vehicle?</p>
            </div>
            <Card className="card-wealth max-w-md mx-auto">
              <CardContent className="p-6">
                <Label className="text-lg font-medium text-[#0F3F4C] mb-4 block">
                  Monthly Vehicle Payment
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AFA496] text-lg">$</span>
                  <Input
                    type="number"
                    value={formData.vehicle || ""}
                    onChange={(e) => updateField("vehicle", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="pl-8 text-lg"
                    step="0.01"
                    autoFocus
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="heading-lg mb-2">Vacations & Travel</h2>
              <p className="body-lg text-[#AFA496]">
                How often are you traveling, {name}, and where? Think vacations, weekend getaways, bucket list experiences.
              </p>
              <p className="text-sm text-[#0F3F4C] font-medium mt-2">What is your exact monthly travel budget?</p>
            </div>
            <Card className="card-wealth max-w-md mx-auto">
              <CardContent className="p-6">
                <Label className="text-lg font-medium text-[#0F3F4C] mb-4 block">
                  Monthly Travel Budget
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AFA496] text-lg">$</span>
                  <Input
                    type="number"
                    value={formData.travel || ""}
                    onChange={(e) => updateField("travel", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="pl-8 text-lg"
                    step="0.01"
                    autoFocus
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="heading-lg mb-2">Food & Dining</h2>
              <p className="body-lg text-[#AFA496]">
                What does your food life look like, {name}? Groceries, restaurants, date nights.
              </p>
              <p className="text-sm text-[#0F3F4C] font-medium mt-2">What is your exact monthly food budget?</p>
            </div>
            <Card className="card-wealth max-w-md mx-auto">
              <CardContent className="p-6">
                <Label className="text-lg font-medium text-[#0F3F4C] mb-4 block">
                  Monthly Food Budget
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AFA496] text-lg">$</span>
                  <Input
                    type="number"
                    value={formData.food || ""}
                    onChange={(e) => updateField("food", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="pl-8 text-lg"
                    step="0.01"
                    autoFocus
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="heading-lg mb-2">Personal Trainer</h2>
              <p className="body-lg text-[#AFA496]">
                Are you investing in a personal trainer in your dream life, {name}?
              </p>
              <p className="text-sm text-[#0F3F4C] font-medium mt-2">What is the exact monthly cost?</p>
            </div>
            <Card className="card-wealth max-w-md mx-auto">
              <CardContent className="p-6">
                <Label className="text-lg font-medium text-[#0F3F4C] mb-4 block">
                  Monthly Personal Trainer Cost
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AFA496] text-lg">$</span>
                  <Input
                    type="number"
                    value={formData.trainer || ""}
                    onChange={(e) => updateField("trainer", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="pl-8 text-lg"
                    step="0.01"
                    autoFocus
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="heading-lg mb-2">Personal Chef</h2>
              <p className="body-lg text-[#AFA496]">
                Do you have a personal chef in your dream life, {name}?
              </p>
              <p className="text-sm text-[#0F3F4C] font-medium mt-2">What is the exact monthly cost? (If not, enter $0.00)</p>
            </div>
            <Card className="card-wealth max-w-md mx-auto">
              <CardContent className="p-6">
                <Label className="text-lg font-medium text-[#0F3F4C] mb-4 block">
                  Monthly Personal Chef Cost
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AFA496] text-lg">$</span>
                  <Input
                    type="number"
                    value={formData.chef || ""}
                    onChange={(e) => updateField("chef", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="pl-8 text-lg"
                    step="0.01"
                    autoFocus
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="heading-lg mb-2">Kids&apos; College</h2>
              <p className="body-lg text-[#AFA496]">
                Are you saving for your kids&apos; college, {name}?
              </p>
              <p className="text-sm text-[#0F3F4C] font-medium mt-2">What is the exact monthly amount you want to set aside?</p>
            </div>
            <Card className="card-wealth max-w-md mx-auto">
              <CardContent className="p-6">
                <Label className="text-lg font-medium text-[#0F3F4C] mb-4 block">
                  Monthly College Savings
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AFA496] text-lg">$</span>
                  <Input
                    type="number"
                    value={formData.college || ""}
                    onChange={(e) => updateField("college", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="pl-8 text-lg"
                    step="0.01"
                    autoFocus
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="heading-lg mb-2">Retirement & Investments</h2>
              <p className="body-lg text-[#AFA496]">
                How much are you putting away every month for retirement, investments, and building wealth, {name}?
              </p>
              <p className="text-sm text-[#0F3F4C] font-medium mt-2">Exact amount.</p>
            </div>
            <Card className="card-wealth max-w-md mx-auto">
              <CardContent className="p-6">
                <Label className="text-lg font-medium text-[#0F3F4C] mb-4 block">
                  Monthly Retirement & Investment Contribution
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AFA496] text-lg">$</span>
                  <Input
                    type="number"
                    value={formData.retirement || ""}
                    onChange={(e) => updateField("retirement", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="pl-8 text-lg"
                    step="0.01"
                    autoFocus
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 10:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="heading-lg mb-2">Everything Else</h2>
              <p className="body-lg text-[#AFA496]">
                Is there anything else in your dream life we haven&apos;t covered, {name}? Any other monthly expenses?
              </p>
              <p className="text-sm text-[#0F3F4C] font-medium mt-2">Give me every last one — down to the penny.</p>
            </div>
            <Card className="card-wealth max-w-md mx-auto">
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label className="text-lg font-medium text-[#0F3F4C] mb-4 block">
                    Other Monthly Expenses
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AFA496] text-lg">$</span>
                    <Input
                      type="number"
                      value={formData.other || ""}
                      onChange={(e) => updateField("other", parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="pl-8 text-lg"
                      step="0.01"
                      autoFocus
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-[#0F3F4C] mb-2 block">
                    What are these other expenses? (Optional)
                  </Label>
                  <Textarea
                    value={formData.otherDescription}
                    onChange={(e) => updateField("otherDescription", e.target.value)}
                    placeholder="e.g., childcare, hobbies, charity, etc."
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 11:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="heading-lg mb-2">Your Skills & Expertise</h2>
              <p className="body-lg text-[#AFA496]">
                What are you really good at, {name}? What skills do you have that people would pay for?
              </p>
              <p className="text-sm text-[#0F3F4C] font-medium mt-2">
                Think about your professional skills, talents, certifications, or natural abilities.
              </p>
            </div>
            <Card className="card-wealth max-w-md mx-auto">
              <CardContent className="p-6">
                <Label className="text-lg font-medium text-[#0F3F4C] mb-4 block">
                  List Your Skills
                </Label>
                <Textarea
                  value={formData.skills}
                  onChange={(e) => updateField("skills", e.target.value)}
                  placeholder="e.g., marketing, coding, writing, coaching, design, sales, teaching, consulting..."
                  className="min-h-[120px] text-base"
                  autoFocus
                />
                <p className="text-sm text-[#AFA496] mt-2">
                  The more specific, the better. Instead of &quot;marketing&quot; try &quot;Facebook ad management for e-commerce brands.&quot;
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 12:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="heading-lg mb-2">Your Experience</h2>
              <p className="body-lg text-[#AFA496]">
                What experience do you have, {name}? What have you done that gives you credibility?
              </p>
              <p className="text-sm text-[#0F3F4C] font-medium mt-2">
                Years in industry, past jobs, projects completed, results achieved, problems solved.
              </p>
            </div>
            <Card className="card-wealth max-w-md mx-auto">
              <CardContent className="p-6">
                <Label className="text-lg font-medium text-[#0F3F4C] mb-4 block">
                  Describe Your Experience
                </Label>
                <Textarea
                  value={formData.experience}
                  onChange={(e) => updateField("experience", e.target.value)}
                  placeholder="e.g., 10 years in corporate sales, managed $2M budget, built a 6-figure business, helped 50+ clients..."
                  className="min-h-[120px] text-base"
                  autoFocus
                />
                <p className="text-sm text-[#AFA496] mt-2">
                  Specific results and numbers make you more credible. What have you accomplished?
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 13:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="heading-lg mb-2">Your Passion</h2>
              <p className="body-lg text-[#AFA496]">
                What are you passionate about, {name}? What could you talk about for hours?
              </p>
              <p className="text-sm text-[#0F3F4C] font-medium mt-2">
                The intersection of passion and skill is where the best businesses are built.
              </p>
            </div>
            <Card className="card-wealth max-w-md mx-auto">
              <CardContent className="p-6">
                <Label className="text-lg font-medium text-[#0F3F4C] mb-4 block">
                  What Excites You?
                </Label>
                <Textarea
                  value={formData.passion}
                  onChange={(e) => updateField("passion", e.target.value)}
                  placeholder="e.g., helping entrepreneurs scale, teaching people about health, creating beautiful designs, solving complex problems..."
                  className="min-h-[120px] text-base"
                  autoFocus
                />
                <p className="text-sm text-[#AFA496] mt-2">
                  What topics make you lose track of time? What do you love learning about?
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 14:
        const breakdown = calculateBreakdown();
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-[#0F3F4C] to-[#1a5a6b] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="heading-lg mb-2">{formData.name}&apos;s Dream Life Income Target</h2>
              <p className="body-lg text-[#AFA496]">
                Here&apos;s exactly what your dream life costs:
              </p>
            </div>

            <Card className="card-wealth max-w-2xl mx-auto">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-[#0F3F4C] mb-4">Monthly Costs</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-[#E4DCD1]">
                    <span className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-[#AFA496]" />
                      Dream Home
                    </span>
                    <span className="font-medium text-[#0F3F4C]">{formatCurrency(formData.home)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[#E4DCD1]">
                    <span className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-[#AFA496]" />
                      Dream Vehicle
                    </span>
                    <span className="font-medium text-[#0F3F4C]">{formatCurrency(formData.vehicle)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[#E4DCD1]">
                    <span className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-[#AFA496]" />
                      Travel
                    </span>
                    <span className="font-medium text-[#0F3F4C]">{formatCurrency(formData.travel)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[#E4DCD1]">
                    <span className="flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-[#AFA496]" />
                      Food & Dining
                    </span>
                    <span className="font-medium text-[#0F3F4C]">{formatCurrency(formData.food)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[#E4DCD1]">
                    <span className="flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-[#AFA496]" />
                      Personal Trainer
                    </span>
                    <span className="font-medium text-[#0F3F4C]">{formatCurrency(formData.trainer)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[#E4DCD1]">
                    <span className="flex items-center gap-2">
                      <ChefHat className="w-4 h-4 text-[#AFA496]" />
                      Personal Chef
                    </span>
                    <span className="font-medium text-[#0F3F4C]">{formatCurrency(formData.chef)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[#E4DCD1]">
                    <span className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-[#AFA496]" />
                      Kids&apos; College
                    </span>
                    <span className="font-medium text-[#0F3F4C]">{formatCurrency(formData.college)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[#E4DCD1]">
                    <span className="flex items-center gap-2">
                      <PiggyBank className="w-4 h-4 text-[#AFA496]" />
                      Retirement & Investments
                    </span>
                    <span className="font-medium text-[#0F3F4C]">{formatCurrency(formData.retirement)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[#E4DCD1]">
                    <span className="flex items-center gap-2">
                      <Plus className="w-4 h-4 text-[#AFA496]" />
                      Other
                    </span>
                    <span className="font-medium text-[#0F3F4C]">{formatCurrency(formData.other)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-[#0F3F4C] text-white rounded-lg px-4 mt-4">
                    <span className="font-semibold">TOTAL MONTHLY</span>
                    <span className="font-bold text-xl">{formatCurrency(breakdown.monthly)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#0F3F4C] to-[#1a5a6b] text-white border-none max-w-2xl mx-auto">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Your Income Targets</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/20">
                    <span className="text-white/80">Per Year</span>
                    <span className="font-bold text-xl">{formatCurrency(breakdown.yearly)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/20">
                    <span className="text-white/80">Per Month</span>
                    <span className="font-bold text-xl">{formatCurrency(breakdown.monthly)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/20">
                    <span className="text-white/80">Per Week</span>
                    <span className="font-bold text-xl">{formatCurrency(breakdown.weekly)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/20">
                    <span className="text-white/80">Per Day</span>
                    <span className="font-bold text-xl">{formatCurrency(breakdown.daily)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-white/80">Per Hour (8hr day)</span>
                    <span className="font-bold text-2xl text-[#E4DCD1]">{formatCurrency(breakdown.hourly)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills & Experience Summary */}
            {(formData.skills || formData.experience || formData.passion) && (
              <Card className="card-wealth max-w-2xl mx-auto">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-[#0F3F4C] mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Your Skills & Experience
                  </h3>
                  {formData.skills && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-[#AFA496] mb-1">Skills</p>
                      <p className="text-[#0F3F4C]">{formData.skills}</p>
                    </div>
                  )}
                  {formData.experience && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-[#AFA496] mb-1">Experience</p>
                      <p className="text-[#0F3F4C]">{formData.experience}</p>
                    </div>
                  )}
                  {formData.passion && (
                    <div>
                      <p className="text-sm font-medium text-[#AFA496] mb-1">Passion</p>
                      <p className="text-[#0F3F4C]">{formData.passion}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="max-w-2xl mx-auto text-center">
              <p className="text-xl text-[#0F3F4C] font-semibold mb-4">
                That&apos;s your number, {formData.name}. <strong>{formatCurrency(breakdown.daily)}/day</strong> is what stands between you and the life you just described — down to the penny.
              </p>
              <p className="text-[#AFA496] mb-6">
                Write it down. Put it on your mirror. Set it as your phone wallpaper. Every decision you make from here runs through that number.
              </p>
              <Button 
                onClick={async () => {
                  // Save to localStorage
                  localStorage.setItem('wealthmoves_dreamlife', JSON.stringify({
                    ...formData,
                    targets: breakdown,
                    createdAt: new Date().toISOString(),
                  }));
                  
                  // Save to API/database
                  try {
                    const response = await fetch('/api/blueprint', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        name: formData.name,
                        monthlyIncome: breakdown.monthly,
                        currentIncome: 0,
                        homeCost: formData.home,
                        vehicleCost: formData.vehicle,
                        travelCost: formData.travel,
                        foodCost: formData.food,
                        trainerCost: formData.trainer,
                        chefCost: formData.chef,
                        collegeCost: formData.college,
                        retirementCost: formData.retirement,
                        otherCost: formData.other,
                        otherDescription: formData.otherDescription,
                        skills: formData.skills,
                        experience: formData.experience,
                        passion: formData.passion,
                      }),
                    });
                    
                    if (response.ok) {
                      alert('Your Dream Life Goal has been saved! Redirecting to dashboard...');
                      window.location.href = '/';
                    } else {
                      alert('Your Dream Life Goal has been saved locally! (API save failed)');
                    }
                  } catch (error) {
                    console.error('Failed to save blueprint:', error);
                    alert('Your Dream Life Goal has been saved locally!');
                  }
                }}
                className="bg-[#0F3F4C] hover:bg-[#0a2f39]"
              >
                Save My Dream Life Goal
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Data Source Banner */}
      {!isLoading && dataSource === 'localStorage' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <div className="text-amber-600 text-lg">⚠️</div>
          <div className="flex-1">
            <p className="text-amber-800 font-medium">Loaded from browser storage</p>
            <p className="text-amber-700 text-sm">
              We found your blueprint saved in this browser. Complete this page and save to sync it to your account.
            </p>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="heading-xl mb-2">Dream Life Blueprint</h1>
        <p className="body-lg">
          Design your ideal lifestyle and we&apos;ll calculate exactly what it takes to get there.
        </p>
      </div>

      {/* Progress */}
      {currentStep > 0 && currentStep < steps.length - 1 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#AFA496]">
              Step {currentStep} of {steps.length - 2}
            </span>
            <span className="text-sm text-[#0F3F4C] font-medium">
              {steps[currentStep].title}
            </span>
          </div>
          <Progress value={(currentStep / (steps.length - 1)) * 100} className="h-2" />
        </div>
      )}

      {/* Step Content */}
      <div className="mb-8">{renderStep()}</div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button
            onClick={nextStep}
            className="bg-[#0F3F4C] hover:bg-[#0a2f39] flex items-center gap-2"
            disabled={currentStep === 1 && !formData.name.trim()}
          >
            {currentStep === 0 ? "Start" : "Continue"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
