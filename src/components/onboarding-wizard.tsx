"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Check, Target, Briefcase, Heart, Clock, AlertCircle, Calendar } from "lucide-react";

export interface OnboardingData {
  name: string;
  currentIncome: number;
  dreamIncome: number;
  skills: string[];
  experience: "beginner" | "intermediate" | "advanced";
  passion: string;
  hoursPerWeek: number;
  biggestChallenge: string;
  timeline: string;
}

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => void;
  onSaveProgress: (data: Partial<OnboardingData>, step: number) => void;
  savedData?: Partial<OnboardingData>;
  savedStep?: number;
}

const SKILL_OPTIONS = [
  "Marketing",
  "Sales",
  "Writing",
  "Design",
  "Programming",
  "Coaching",
  "Consulting",
  "Video Editing",
  "Social Media",
  "Public Speaking",
  "Project Management",
  "Data Analysis",
  "Photography",
  "Copywriting",
  "Other",
];

const TIMELINE_OPTIONS = [
  { value: "1-3", label: "1-3 months", description: "I want results fast" },
  { value: "3-6", label: "3-6 months", description: "Steady progress is fine" },
  { value: "6-12", label: "6-12 months", description: "I'm building for the long term" },
  { value: "12+", label: "12+ months", description: "I have a bigger vision" },
];

export function OnboardingWizard({ onComplete, onSaveProgress, savedData, savedStep = 0 }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(savedStep);
  const [data, setData] = useState<OnboardingData>({
    name: savedData?.name || "",
    currentIncome: savedData?.currentIncome || 0,
    dreamIncome: savedData?.dreamIncome || 10000,
    skills: savedData?.skills || [],
    experience: savedData?.experience || "beginner",
    passion: savedData?.passion || "",
    hoursPerWeek: savedData?.hoursPerWeek || 10,
    biggestChallenge: savedData?.biggestChallenge || "",
    timeline: savedData?.timeline || "3-6",
  });

  const totalSteps = 9;

  const updateData = (field: keyof OnboardingData, value: unknown) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onSaveProgress(newData, currentStep);
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      onSaveProgress(data, currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      onSaveProgress(data, currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete(data);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return data.name.trim().length > 0;
      case 1:
        return data.currentIncome >= 0;
      case 2:
        return data.dreamIncome > 0;
      case 3:
        return data.skills.length > 0;
      case 4:
        return data.experience !== undefined;
      case 5:
        return data.passion.trim().length > 0;
      case 6:
        return data.hoursPerWeek > 0;
      case 7:
        return data.biggestChallenge.trim().length > 0;
      case 8:
        return data.timeline !== undefined;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-[#0F3F4C]/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">👋</span>
              </div>
              <CardTitle className="text-2xl text-[#0F3F4C]">Welcome to WealthMoves OS</CardTitle>
              <CardDescription className="text-[#AFA496]">
                Let&apos;s start by getting to know you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#0F3F4C]">What&apos;s your name?</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => updateData("name", e.target.value)}
                  placeholder="Enter your name"
                  className="text-lg py-6 border-[#E4DCD1] focus:border-[#0F3F4C]"
                />
              </div>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-[#0F3F4C]/10 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="w-8 h-8 text-[#0F3F4C]" />
              </div>
              <CardTitle className="text-2xl text-[#0F3F4C]">Current Income</CardTitle>
              <CardDescription className="text-[#AFA496]">
                Where are you starting from?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentIncome" className="text-[#0F3F4C]">What&apos;s your current monthly income?</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0F3F4C] text-xl font-semibold">$</span>
                  <Input
                    id="currentIncome"
                    type="number"
                    value={data.currentIncome || ""}
                    onChange={(e) => updateData("currentIncome", Number(e.target.value))}
                    placeholder="0"
                    className="pl-10 text-2xl py-6 border-[#E4DCD1] focus:border-[#0F3F4C]"
                  />
                </div>
                <p className="text-sm text-[#AFA496]">Be honest — this helps us calculate your gap</p>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-[#0F3F4C]/10 rounded-full flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-[#0F3F4C]" />
              </div>
              <CardTitle className="text-2xl text-[#0F3F4C]">Dream Income Goal</CardTitle>
              <CardDescription className="text-[#AFA496]">
                What&apos;s your target monthly income?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dreamIncome" className="text-[#0F3F4C]">Monthly income goal</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0F3F4C] text-xl font-semibold">$</span>
                  <Input
                    id="dreamIncome"
                    type="number"
                    value={data.dreamIncome || ""}
                    onChange={(e) => updateData("dreamIncome", Number(e.target.value))}
                    placeholder="10000"
                    className="pl-10 text-2xl py-6 border-[#E4DCD1] focus:border-[#0F3F4C]"
                  />
                </div>
                <div className="bg-[#E4DCD1]/30 rounded-lg p-4 mt-4">
                  <p className="text-sm text-[#0F3F4C] font-medium">That&apos;s:</p>
                  <ul className="text-sm text-[#AFA496] mt-2 space-y-1">
                    <li>• ${(data.dreamIncome * 12).toLocaleString()} per year</li>
                    <li>• ${Math.round(data.dreamIncome / 4.33).toLocaleString()} per week</li>
                    <li>• ${Math.round(data.dreamIncome / 30).toLocaleString()} per day</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-[#0F3F4C]/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">🛠️</span>
              </div>
              <CardTitle className="text-2xl text-[#0F3F4C]">Your Skills</CardTitle>
              <CardDescription className="text-[#AFA496]">
                What are you good at? (Select all that apply)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {SKILL_OPTIONS.map((skill) => (
                  <div key={skill} className="flex items-center space-x-2">
                    <Checkbox
                      id={skill}
                      checked={data.skills.includes(skill)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateData("skills", [...data.skills, skill]);
                        } else {
                          updateData("skills", data.skills.filter((s) => s !== skill));
                        }
                      }}
                    />
                    <Label htmlFor={skill} className="text-sm text-[#0F3F4C] cursor-pointer">
                      {skill}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-[#0F3F4C]/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <CardTitle className="text-2xl text-[#0F3F4C]">Experience Level</CardTitle>
              <CardDescription className="text-[#AFA496]">
                How would you rate your business experience?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={data.experience}
                onValueChange={(value) => updateData("experience", value as OnboardingData["experience"])}
                className="space-y-3"
              >
                {[
                  { value: "beginner", label: "Beginner", desc: "Just starting out, learning the ropes" },
                  { value: "intermediate", label: "Intermediate", desc: "Some experience, made some money" },
                  { value: "advanced", label: "Advanced", desc: "Experienced, scaling to the next level" },
                ].map((option) => (
                  <div key={option.value}>
                    <RadioGroupItem
                      value={option.value}
                      id={option.value}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={option.value}
                      className="flex flex-col p-4 border-2 border-[#E4DCD1] rounded-lg cursor-pointer hover:border-[#0F3F4C]/50 peer-data-[state=checked]:border-[#0F3F4C] peer-data-[state=checked]:bg-[#0F3F4C]/5 transition-all"
                    >
                      <span className="font-semibold text-[#0F3F4C]">{option.label}</span>
                      <span className="text-sm text-[#AFA496]">{option.desc}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-[#0F3F4C]/10 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-[#0F3F4C]" />
              </div>
              <CardTitle className="text-2xl text-[#0F3F4C]">Your Passion</CardTitle>
              <CardDescription className="text-[#AFA496]">
                What are you passionate about?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="passion" className="text-[#0F3F4C]">What gets you excited?</Label>
                <Textarea
                  id="passion"
                  value={data.passion}
                  onChange={(e) => updateData("passion", e.target.value)}
                  placeholder="I love helping people..., I'm passionate about..., I enjoy..."
                  className="min-h-[120px] border-[#E4DCD1] focus:border-[#0F3F4C]"
                />
                <p className="text-sm text-[#AFA496]">This helps us suggest the right business model for you</p>
              </div>
            </CardContent>
          </Card>
        );

      case 6:
        return (
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-[#0F3F4C]/10 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-[#0F3F4C]" />
              </div>
              <CardTitle className="text-2xl text-[#0F3F4C]">Time Commitment</CardTitle>
              <CardDescription className="text-[#AFA496]">
                How many hours per week can you dedicate?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-[#0F3F4C]">Hours per week</Label>
                  <span className="text-2xl font-bold text-[#0F3F4C]">{data.hoursPerWeek} hrs</span>
                </div>
                <Slider
                  value={[data.hoursPerWeek]}
                  onValueChange={(value) => updateData("hoursPerWeek", Array.isArray(value) ? value[0] : value)}
                  min={1}
                  max={80}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-[#AFA496]">
                  <span>1 hr</span>
                  <span>20 hrs</span>
                  <span>40 hrs</span>
                  <span>60 hrs</span>
                  <span>80 hrs</span>
                </div>
              </div>
              <div className="bg-[#E4DCD1]/30 rounded-lg p-4">
                <p className="text-sm text-[#0F3F4C]">
                  At {data.hoursPerWeek} hours/week, that&apos;s about {Math.round(data.hoursPerWeek / 7 * 10) / 10} hours per day
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 7:
        return (
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-[#0F3F4C]/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-[#0F3F4C]" />
              </div>
              <CardTitle className="text-2xl text-[#0F3F4C]">Biggest Challenge</CardTitle>
              <CardDescription className="text-[#AFA496]">
                What&apos;s your biggest obstacle right now?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="challenge" className="text-[#0F3F4C]">Describe your challenge</Label>
                <Textarea
                  id="challenge"
                  value={data.biggestChallenge}
                  onChange={(e) => updateData("biggestChallenge", e.target.value)}
                  placeholder="I'm struggling with..., I don't know how to..., My biggest issue is..."
                  className="min-h-[120px] border-[#E4DCD1] focus:border-[#0F3F4C]"
                />
                <p className="text-sm text-[#AFA496]">We&apos;ll help you overcome this</p>
              </div>
            </CardContent>
          </Card>
        );

      case 8:
        return (
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-[#0F3F4C]/10 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-[#0F3F4C]" />
              </div>
              <CardTitle className="text-2xl text-[#0F3F4C]">Timeline</CardTitle>
              <CardDescription className="text-[#AFA496]">
                When do you want to hit your goal?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={data.timeline}
                onValueChange={(value) => updateData("timeline", value)}
                className="space-y-3"
              >
                {TIMELINE_OPTIONS.map((option) => (
                  <div key={option.value}>
                    <RadioGroupItem
                      value={option.value}
                      id={option.value}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={option.value}
                      className="flex items-center justify-between p-4 border-2 border-[#E4DCD1] rounded-lg cursor-pointer hover:border-[#0F3F4C]/50 peer-data-[state=checked]:border-[#0F3F4C] peer-data-[state=checked]:bg-[#0F3F4C]/5 transition-all"
                    >
                      <div>
                        <span className="font-semibold text-[#0F3F4C] block">{option.label}</span>
                        <span className="text-sm text-[#AFA496]">{option.description}</span>
                      </div>
                      {data.timeline === option.value && (
                        <Check className="w-5 h-5 text-[#0F3F4C]" />
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-[#AFA496] mb-2">
          <span>Step {currentStep + 1} of {totalSteps}</span>
          <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}% complete</span>
        </div>
        <div className="h-2 bg-[#E4DCD1] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0F3F4C] transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        {currentStep > 0 && (
          <Button
            variant="outline"
            onClick={prevStep}
            className="flex-1 border-[#E4DCD1] text-[#0F3F4C] hover:bg-[#E4DCD1]/20"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
        {currentStep < totalSteps - 1 ? (
          <Button
            onClick={nextStep}
            disabled={!canProceed()}
            className="flex-1 bg-[#0F3F4C] text-white hover:bg-[#0a2f39] disabled:opacity-50"
          >
            Continue
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={!canProceed()}
            className="flex-1 bg-[#0F3F4C] text-white hover:bg-[#0a2f39] disabled:opacity-50"
          >
            <Check className="w-4 h-4 mr-2" />
            Complete
          </Button>
        )}
      </div>
    </div>
  );
}
