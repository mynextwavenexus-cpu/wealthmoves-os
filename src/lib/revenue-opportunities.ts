// Revenue Opportunities Database and Matching Algorithm

export type RevenueOpportunityType = 
  | "digital-products"
  | "coaching-consulting"
  | "ai-automation-agency"
  | "affiliate-marketing"
  | "newsletter-content"
  | "saas-micro-products"
  | "service-based";

export interface RevenueOpportunity {
  id: string;
  type: RevenueOpportunityType;
  title: string;
  description: string;
  potential: {
    min: number;
    max: number;
    timeframe: "monthly" | "yearly";
  };
  timeToFirstRevenue: {
    minDays: number;
    maxDays: number;
    display: string;
  };
  requiredSkills: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  startupCost: {
    min: number;
    max: number;
    display: string;
  };
  scalability: "low" | "medium" | "high";
  passiveIncomePotential: "low" | "medium" | "high";
  matchWeights: {
    skills: number;
    experience: number;
    passion: number;
    timeAvailability: number;
    riskTolerance: number;
  };
}

export interface UserProfile {
  skills: string[];
  experience: string;
  passion: string;
  monthlyIncomeGoal: number;
  currentIncome: number;
  timeAvailability: "limited" | "moderate" | "abundant";
  riskTolerance: "low" | "medium" | "high";
  preferredWorkStyle: "solo" | "team" | "either";
  hasAudience: boolean;
  technicalLevel: "none" | "basic" | "intermediate" | "advanced";
}

export interface MatchedOpportunity extends RevenueOpportunity {
  matchScore: number;
  matchReasons: string[];
  estimatedTimeline: string;
  recommendedFirstSteps: string[];
}

// Revenue Opportunities Database
export const revenueOpportunities: RevenueOpportunity[] = [
  {
    id: "digital-products",
    type: "digital-products",
    title: "Digital Products",
    description: "Create and sell ebooks, templates, courses, and digital downloads. Build once, sell forever. Perfect for scaling without trading time for money.",
    potential: { min: 3000, max: 15000, timeframe: "monthly" },
    timeToFirstRevenue: { minDays: 30, maxDays: 90, display: "30-90 days" },
    requiredSkills: ["Writing", "Teaching", "Design", "Marketing"],
    difficulty: "intermediate",
    startupCost: { min: 0, max: 500, display: "$0-500" },
    scalability: "high",
    passiveIncomePotential: "high",
    matchWeights: {
      skills: 0.25,
      experience: 0.20,
      passion: 0.25,
      timeAvailability: 0.15,
      riskTolerance: 0.15,
    },
  },
  {
    id: "coaching-consulting",
    type: "coaching-consulting",
    title: "Coaching & Consulting",
    description: "Leverage your expertise to help others solve problems. High-ticket, immediate revenue. Start with 1-on-1, scale to group programs.",
    potential: { min: 5000, max: 25000, timeframe: "monthly" },
    timeToFirstRevenue: { minDays: 14, maxDays: 45, display: "14-45 days" },
    requiredSkills: ["Communication", "Problem Solving", "Strategy", "Sales"],
    difficulty: "beginner",
    startupCost: { min: 0, max: 200, display: "$0-200" },
    scalability: "medium",
    passiveIncomePotential: "low",
    matchWeights: {
      skills: 0.20,
      experience: 0.30,
      passion: 0.20,
      timeAvailability: 0.20,
      riskTolerance: 0.10,
    },
  },
  {
    id: "ai-automation-agency",
    type: "ai-automation-agency",
    title: "AI Automation Agency",
    description: "Help businesses implement AI tools and automation. High demand, recurring revenue. Perfect for tech-savvy entrepreneurs.",
    potential: { min: 8000, max: 30000, timeframe: "monthly" },
    timeToFirstRevenue: { minDays: 30, maxDays: 60, display: "30-60 days" },
    requiredSkills: ["Tech", "Systems Thinking", "Sales", "Client Management"],
    difficulty: "advanced",
    startupCost: { min: 500, max: 2000, display: "$500-2,000" },
    scalability: "high",
    passiveIncomePotential: "medium",
    matchWeights: {
      skills: 0.30,
      experience: 0.20,
      passion: 0.15,
      timeAvailability: 0.20,
      riskTolerance: 0.15,
    },
  },
  {
    id: "affiliate-marketing",
    type: "affiliate-marketing",
    title: "Affiliate Marketing",
    description: "Promote products you believe in and earn commissions. Requires audience building but can become highly passive.",
    potential: { min: 2000, max: 10000, timeframe: "monthly" },
    timeToFirstRevenue: { minDays: 60, maxDays: 180, display: "60-180 days" },
    requiredSkills: ["Content Creation", "Marketing", "Relationship Building", "SEO"],
    difficulty: "beginner",
    startupCost: { min: 0, max: 300, display: "$0-300" },
    scalability: "high",
    passiveIncomePotential: "high",
    matchWeights: {
      skills: 0.25,
      experience: 0.15,
      passion: 0.25,
      timeAvailability: 0.25,
      riskTolerance: 0.10,
    },
  },
  {
    id: "newsletter-content",
    type: "newsletter-content",
    title: "Newsletter & Content",
    description: "Build an engaged audience through valuable content. Monetize via sponsorships, premium subscriptions, and product sales.",
    potential: { min: 3000, max: 20000, timeframe: "monthly" },
    timeToFirstRevenue: { minDays: 90, maxDays: 180, display: "90-180 days" },
    requiredSkills: ["Writing", "Consistency", "Community Building", "Storytelling"],
    difficulty: "beginner",
    startupCost: { min: 0, max: 100, display: "$0-100" },
    scalability: "high",
    passiveIncomePotential: "medium",
    matchWeights: {
      skills: 0.30,
      experience: 0.15,
      passion: 0.30,
      timeAvailability: 0.15,
      riskTolerance: 0.10,
    },
  },
  {
    id: "saas-micro-products",
    type: "saas-micro-products",
    title: "SaaS & Micro-Products",
    description: "Build small software tools that solve specific problems. Higher barrier to entry but massive scalability potential.",
    potential: { min: 5000, max: 50000, timeframe: "monthly" },
    timeToFirstRevenue: { minDays: 90, maxDays: 180, display: "90-180 days" },
    requiredSkills: ["Coding", "Product Management", "Marketing", "Technical Skills"],
    difficulty: "advanced",
    startupCost: { min: 1000, max: 5000, display: "$1,000-5,000" },
    scalability: "high",
    passiveIncomePotential: "high",
    matchWeights: {
      skills: 0.35,
      experience: 0.25,
      passion: 0.15,
      timeAvailability: 0.15,
      riskTolerance: 0.10,
    },
  },
  {
    id: "service-based",
    type: "service-based",
    title: "Service-Based Business",
    description: "Offer done-for-you services. Fastest path to revenue. Start solo, build agency model for scale.",
    potential: { min: 4000, max: 20000, timeframe: "monthly" },
    timeToFirstRevenue: { minDays: 7, maxDays: 30, display: "7-30 days" },
    requiredSkills: ["Delivery Excellence", "Client Management", "Sales", "Time Management"],
    difficulty: "beginner",
    startupCost: { min: 0, max: 500, display: "$0-500" },
    scalability: "medium",
    passiveIncomePotential: "low",
    matchWeights: {
      skills: 0.20,
      experience: 0.25,
      passion: 0.20,
      timeAvailability: 0.25,
      riskTolerance: 0.10,
    },
  },
];

// Skill keywords mapping for matching
const skillKeywords: Record<string, string[]> = {
  "Writing": ["write", "writer", "writing", "content", "blog", "copy", "author", "editorial"],
  "Teaching": ["teach", "coach", "mentor", "training", "educator", "instructor", "course"],
  "Design": ["design", "designer", "graphic", "ui", "ux", "visual", "creative"],
  "Marketing": ["market", "marketing", "promote", "brand", "growth", "advertising"],
  "Communication": ["communicate", "speak", "present", "interpersonal", "talk", "listen"],
  "Problem Solving": ["solve", "solution", "analytical", "troubleshoot", "strategic"],
  "Strategy": ["strategy", "strategic", "plan", "vision", "roadmap", "consulting"],
  "Sales": ["sell", "sales", "closer", "negotiate", "persuasion", "deal"],
  "Tech": ["tech", "technology", "software", "digital", "ai", "automation", "tools"],
  "Systems Thinking": ["system", "process", "workflow", "automation", "operations"],
  "Client Management": ["client", "customer", "relationship", "account", "service"],
  "Content Creation": ["content", "create", "creator", "video", "podcast", "media"],
  "Relationship Building": ["network", "relationship", "connect", "community", "partnership"],
  "SEO": ["seo", "search", "google", "ranking", "organic", "traffic"],
  "Consistency": ["consistent", "discipline", "habit", "routine", "regular"],
  "Community Building": ["community", "audience", "tribe", "followers", "engagement"],
  "Storytelling": ["story", "narrative", "storytelling", "engage", "captivate"],
  "Coding": ["code", "coding", "program", "developer", "engineering", "software", "build"],
  "Product Management": ["product", "pm", "roadmap", "feature", "user experience"],
  "Technical Skills": ["technical", "tech", "software", "tools", "platforms"],
  "Delivery Excellence": ["deliver", "execution", "quality", "results", "outcome"],
  "Time Management": ["time", "organize", "prioritize", "efficient", "productive"],
};

// Calculate match score between user profile and opportunity
function calculateMatchScore(
  opportunity: RevenueOpportunity,
  profile: UserProfile
): { score: number; reasons: string[] } {
  let score = 50; // Base score
  const reasons: string[] = [];

  // Skills match (0-25 points)
  const userSkillsLower = profile.skills.map(s => s.toLowerCase());
  let skillsMatch = 0;
  
  for (const requiredSkill of opportunity.requiredSkills) {
    const keywords = skillKeywords[requiredSkill] || [requiredSkill.toLowerCase()];
    for (const keyword of keywords) {
      if (userSkillsLower.some(us => us.includes(keyword))) {
        skillsMatch++;
        break;
      }
    }
  }
  
  const skillsScore = (skillsMatch / opportunity.requiredSkills.length) * 25;
  score += skillsScore * opportunity.matchWeights.skills;
  
  if (skillsMatch >= opportunity.requiredSkills.length * 0.7) {
    reasons.push(`Strong skills match (${skillsMatch}/${opportunity.requiredSkills.length})`);
  } else if (skillsMatch > 0) {
    reasons.push(`Some skills align (${skillsMatch}/${opportunity.requiredSkills.length})`);
  }

  // Experience match (0-25 points)
  const experienceLower = profile.experience.toLowerCase();
  let expScore = 0;
  
  // Check for relevant experience keywords
  const expKeywords = [
    "years", "experience", "worked", "built", "created", "managed", "led",
    "consultant", "coach", "freelance", "entrepreneur", "business", "startup"
  ];
  
  for (const keyword of expKeywords) {
    if (experienceLower.includes(keyword)) {
      expScore += 5;
    }
  }
  expScore = Math.min(expScore, 25);
  score += expScore * opportunity.matchWeights.experience;
  
  if (expScore > 15) {
    reasons.push("Relevant experience detected");
  }

  // Passion alignment (0-25 points)
  const passionLower = profile.passion.toLowerCase();
  let passionScore = 0;
  
  // Check if passion aligns with opportunity type
  const passionMappings: Record<RevenueOpportunityType, string[]> = {
    "digital-products": ["teach", "help", "share", "create", "write", "course"],
    "coaching-consulting": ["help", "people", "coach", "mentor", "guide", "transform"],
    "ai-automation-agency": ["tech", "ai", "automation", "business", "systems", "efficiency"],
    "affiliate-marketing": ["market", "promote", "recommend", "share", "review"],
    "newsletter-content": ["write", "share", "story", "teach", "community", "content"],
    "saas-micro-products": ["build", "code", "product", "solve", "tech", "software"],
    "service-based": ["help", "service", "deliver", "results", "client", "work"],
  };
  
  const relevantPassions = passionMappings[opportunity.type] || [];
  for (const passion of relevantPassions) {
    if (passionLower.includes(passion)) {
      passionScore += 8;
    }
  }
  passionScore = Math.min(passionScore, 25);
  score += passionScore * opportunity.matchWeights.passion;
  
  if (passionScore > 15) {
    reasons.push("Aligns with your passions");
  }

  // Time availability adjustment
  if (profile.timeAvailability === "limited") {
    if (opportunity.passiveIncomePotential === "high") {
      score += 10;
      reasons.push("Good for limited time (passive potential)");
    } else if (opportunity.timeToFirstRevenue.maxDays < 30) {
      score += 5;
      reasons.push("Quick to first revenue");
    }
  } else if (profile.timeAvailability === "abundant") {
    if (opportunity.scalability === "high") {
      score += 5;
      reasons.push("High scalability with your available time");
    }
  }

  // Risk tolerance adjustment
  if (profile.riskTolerance === "low") {
    if (opportunity.startupCost.max < 500) {
      score += 10;
      reasons.push("Low startup cost");
    }
    if (opportunity.timeToFirstRevenue.maxDays < 45) {
      score += 5;
      reasons.push("Fast path to revenue");
    }
  } else if (profile.riskTolerance === "high") {
    if (opportunity.potential.max > 20000) {
      score += 5;
      reasons.push("High income potential");
    }
  }

  // Technical level adjustment
  if (opportunity.difficulty === "advanced" && profile.technicalLevel === "none") {
    score -= 15;
    reasons.push("May require technical skills development");
  } else if (opportunity.difficulty === "beginner" && profile.technicalLevel === "advanced") {
    score += 5;
    reasons.push("Easy entry with your technical background");
  }

  // Income gap consideration
  const incomeGap = profile.monthlyIncomeGoal - profile.currentIncome;
  const monthlyPotential = opportunity.potential.max;
  
  if (monthlyPotential >= incomeGap * 0.8) {
    score += 10;
    reasons.push("Can close your income gap");
  } else if (monthlyPotential >= incomeGap * 0.5) {
    score += 5;
    reasons.push("Significant contribution to income goal");
  }

  // Cap score at 100
  score = Math.min(Math.max(score, 0), 100);

  return { score: Math.round(score), reasons };
}

// Generate first steps based on opportunity and profile
function generateFirstSteps(
  opportunity: RevenueOpportunity,
  profile: UserProfile
): string[] {
  const steps: string[] = [];
  const incomeGap = profile.monthlyIncomeGoal - profile.currentIncome;

  switch (opportunity.type) {
    case "coaching-consulting":
      steps.push(
        "Define your niche: What specific problem do you solve better than anyone?",
        "Create a simple offer package (price it at 10% of the value you deliver)",
        "Reach out to 10 people in your network who fit your ideal client profile"
      );
      break;
    
    case "digital-products":
      steps.push(
        "Identify your expertise that others would pay to learn",
        "Create a free lead magnet to build your email list",
        "Outline your first digital product (start small - ebook or template)"
      );
      break;
    
    case "service-based":
      steps.push(
        "List 3 services you can offer immediately with your current skills",
        "Set up a simple portfolio or case study page",
        "Post on social media offering your service to 5 beta clients at a discount"
      );
      break;
    
    case "ai-automation-agency":
      steps.push(
        "Learn one AI tool deeply (ChatGPT API, Make.com, or Zapier)",
        "Build a demo automation for a common business problem",
        "Reach out to 5 local businesses with a specific automation proposal"
      );
      break;
    
    case "affiliate-marketing":
      steps.push(
        "Choose a niche you genuinely care about and know well",
        "Join 2-3 affiliate programs with products you already use",
        "Start creating content reviewing and recommending these products"
      );
      break;
    
    case "newsletter-content":
      steps.push(
        "Choose a specific niche topic you can write about consistently",
        "Set up a newsletter platform (Substack, Beehiiv, or ConvertKit)",
        "Commit to publishing 2x per week for the first month"
      );
      break;
    
    case "saas-micro-products":
      steps.push(
        "Identify a painful problem you've experienced that lacks a good solution",
        "Validate demand by posting about the problem in relevant communities",
        "Build a simple MVP using no-code tools before writing code"
      );
      break;
  }

  // Add urgency-based step
  if (incomeGap > 5000 && opportunity.timeToFirstRevenue.maxDays > 45) {
    steps.push("Consider starting with a faster revenue stream while building this long-term");
  }

  return steps;
}

// Main matching function
export function matchOpportunities(profile: UserProfile): MatchedOpportunity[] {
  const matches: MatchedOpportunity[] = revenueOpportunities.map(opp => {
    const { score, reasons } = calculateMatchScore(opp, profile);
    const firstSteps = generateFirstSteps(opp, profile);
    
    // Generate estimated timeline
    const timeline = opp.timeToFirstRevenue.display;
    
    return {
      ...opp,
      matchScore: score,
      matchReasons: reasons,
      estimatedTimeline: timeline,
      recommendedFirstSteps: firstSteps,
    };
  });

  // Sort by match score descending
  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

// Get top N opportunities
export function getTopOpportunities(profile: UserProfile, count: number = 3): MatchedOpportunity[] {
  return matchOpportunities(profile).slice(0, count);
}

// Filter opportunities
export function filterOpportunities(
  opportunities: MatchedOpportunity[],
  filters: {
    maxTimeToRevenue?: number;
    minIncomePotential?: number;
    difficulty?: ("beginner" | "intermediate" | "advanced")[];
    maxStartupCost?: number;
  }
): MatchedOpportunity[] {
  return opportunities.filter(opp => {
    if (filters.maxTimeToRevenue && opp.timeToFirstRevenue.maxDays > filters.maxTimeToRevenue) {
      return false;
    }
    if (filters.minIncomePotential && opp.potential.max < filters.minIncomePotential) {
      return false;
    }
    if (filters.difficulty && !filters.difficulty.includes(opp.difficulty)) {
      return false;
    }
    if (filters.maxStartupCost && opp.startupCost.max > filters.maxStartupCost) {
      return false;
    }
    return true;
  });
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Parse skills from string
export function parseSkills(skillsString: string): string[] {
  return skillsString
    .split(/[,;]/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}
