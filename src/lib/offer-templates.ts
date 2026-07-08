// Offer Templates Library
// Pre-built templates for different types of offers

export interface OfferTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  defaultData: Partial<OfferFormData>;
}

export interface OfferFormData {
  name: string;
  description: string;
  price: number;
  type: "one-time" | "subscription" | "payment-plan";
  deliveryFormat: "digital" | "service" | "coaching" | "course" | "membership";
  targetAudience: string;
  keyBenefits: string[];
  deliverables: string[];
  bonuses: Array<{
    name: string;
    description: string;
    value: number;
  }>;
  guarantee: {
    enabled: boolean;
    type: string;
    days: number;
    description: string;
  };
  urgency: {
    enabled: boolean;
    type: "deadline" | "limited-spots" | "price-increase" | "bonus-expires";
    description: string;
    deadline?: string;
    spots?: number;
  };
  status: "draft" | "active" | "paused";
}

export const offerTemplates: OfferTemplate[] = [
  {
    id: "coaching-package",
    name: "Coaching Package",
    description: "One-on-one or group coaching program with structured sessions",
    icon: "Users",
    category: "coaching",
    defaultData: {
      type: "one-time",
      deliveryFormat: "coaching",
      keyBenefits: [
        "Personalized guidance tailored to your specific situation",
        "Accountability and support throughout your journey",
        "Proven strategies that have worked for dozens of clients",
        "Direct access to expert advice and feedback"
      ],
      deliverables: [
        "6 x 60-minute coaching sessions",
        "Session recordings for your reference",
        "Custom action plan and worksheets",
        "Email support between sessions"
      ],
      bonuses: [
        { name: "Quick-Start Guide", description: "Get started immediately with our prep work", value: 97 },
        { name: "Resource Library", description: "Access to templates, scripts, and tools", value: 197 }
      ],
      guarantee: {
        enabled: true,
        type: "satisfaction",
        days: 14,
        description: "If after our first session you don't feel this is the right fit, I'll refund 100% of your investment."
      },
      urgency: {
        enabled: true,
        type: "limited-spots",
        description: "I only take on 5 new clients per month to ensure quality attention",
        spots: 3
      }
    }
  },
  {
    id: "digital-course",
    name: "Digital Course",
    description: "Self-paced online course with video lessons and resources",
    icon: "BookOpen",
    category: "digital",
    defaultData: {
      type: "one-time",
      deliveryFormat: "course",
      keyBenefits: [
        "Learn at your own pace, on your own schedule",
        "Lifetime access to all course materials",
        "Step-by-step system that's easy to follow",
        "Join a community of like-minded learners"
      ],
      deliverables: [
        "8 comprehensive video modules",
        "Downloadable workbooks and templates",
        "Private community access",
        "BONUS: Monthly live Q&A calls"
      ],
      bonuses: [
        { name: "Fast-Action Bonus", description: "Private 1-on-1 strategy call (first 10 buyers)", value: 297 },
        { name: "Template Vault", description: "Done-for-you templates and scripts", value: 147 }
      ],
      guarantee: {
        enabled: true,
        type: "money-back",
        days: 30,
        description: "Complete the first 2 modules and if you're not satisfied, get a full refund."
      },
      urgency: {
        enabled: true,
        type: "bonus-expires",
        description: "Fast-action bonus expires in 48 hours",
        deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      }
    }
  },
  {
    id: "consulting-session",
    name: "Consulting Session",
    description: "Single high-value consulting call to solve a specific problem",
    icon: "MessageCircle",
    category: "service",
    defaultData: {
      type: "one-time",
      deliveryFormat: "service",
      keyBenefits: [
        "Get clarity on your biggest challenge in one call",
        "Receive a custom action plan you can implement immediately",
        "Avoid costly mistakes with expert guidance",
        "Save weeks of trial and error"
      ],
      deliverables: [
        "90-minute strategy session",
        "Recorded call for your reference",
        "Written summary and action plan",
        "7 days of follow-up email support"
      ],
      bonuses: [
        { name: "Pre-Session Assessment", description: "I'll review your situation before we meet", value: 197 },
        { name: "Resource Recommendations", description: "Curated tools and resources for your needs", value: 97 }
      ],
      guarantee: {
        enabled: true,
        type: "value",
        days: 0,
        description: "If you don't get at least 3 actionable insights you can use immediately, I'll refund your investment."
      },
      urgency: {
        enabled: false,
        type: "limited-spots",
        description: "Limited availability - book now to secure your spot"
      }
    }
  },
  {
    id: "done-for-you",
    name: "Done-For-You Service",
    description: "Complete service where you do the work for the client",
    icon: "Zap",
    category: "service",
    defaultData: {
      type: "one-time",
      deliveryFormat: "service",
      keyBenefits: [
        "Save hours of your valuable time",
        "Get professional results without learning new skills",
        "Focus on what you do best while we handle the rest",
        "Done right the first time by experts"
      ],
      deliverables: [
        "Initial discovery call to understand your needs",
        "Complete deliverable within agreed timeframe",
        "2 rounds of revisions included",
        "Handoff call with implementation guidance"
      ],
      bonuses: [
        { name: "30-Day Support", description: "Email support after delivery", value: 297 },
        { name: "Training Video", description: "How to use and maintain your deliverable", value: 147 }
      ],
      guarantee: {
        enabled: true,
        type: "satisfaction",
        days: 7,
        description: "Not happy with the initial draft? We'll revise until you're satisfied or refund 100%."
      },
      urgency: {
        enabled: true,
        type: "limited-spots",
        description: "Only accepting 3 new projects this month",
        spots: 3
      }
    }
  },
  {
    id: "group-program",
    name: "Group Program",
    description: "Cohort-based program with live sessions and community",
    icon: "Users",
    category: "coaching",
    defaultData: {
      type: "one-time",
      deliveryFormat: "course",
      keyBenefits: [
        "Learn alongside peers on the same journey",
        "Weekly live coaching and Q&A sessions",
        "Accountability partners to keep you on track",
        "Network with other motivated individuals"
      ],
      deliverables: [
        "8-week structured program",
        "Weekly 90-minute group calls",
        "Private community access",
        "Course materials and resources"
      ],
      bonuses: [
        { name: "1-on-1 Kickoff Call", description: "Private session to set your goals", value: 197 },
        { name: "Alumni Network", description: "Lifetime access to our private community", value: 497 }
      ],
      guarantee: {
        enabled: true,
        type: "money-back",
        days: 14,
        description: "Attend the first 2 weeks and if it's not for you, get a full refund."
      },
      urgency: {
        enabled: true,
        type: "deadline",
        description: "Doors close Friday at midnight",
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    }
  },
  {
    id: "membership",
    name: "Membership/Subscription",
    description: "Recurring membership with ongoing value and community",
    icon: "Repeat",
    category: "digital",
    defaultData: {
      type: "subscription",
      deliveryFormat: "membership",
      keyBenefits: [
        "Continuous learning and growth",
        "New content and resources every month",
        "Direct access to me and the community",
        "Cancel anytime - no long-term commitment"
      ],
      deliverables: [
        "New training content monthly",
        "Monthly live group call",
        "Private community access",
        "Member-only resources and discounts"
      ],
      bonuses: [
        { name: "Founding Member Rate", description: "Lock in this price forever", value: 0 },
        { name: "Welcome Kit", description: "Exclusive resources to get started", value: 147 }
      ],
      guarantee: {
        enabled: true,
        type: "cancel-anytime",
        days: 30,
        description: "Try it risk-free for 30 days. Cancel anytime if it's not for you."
      },
      urgency: {
        enabled: true,
        type: "price-increase",
        description: "Price increases to $97/month after this week"
      }
    }
  },
  {
    id: "payment-plan-offer",
    name: "High-Ticket with Payment Plan",
    description: "Premium offer with flexible payment options",
    icon: "CreditCard",
    category: "coaching",
    defaultData: {
      type: "payment-plan",
      deliveryFormat: "coaching",
      keyBenefits: [
        "Premium results without the upfront investment",
        "Same value, easier on your cash flow",
        "Flexible payment schedule",
        "No credit check required"
      ],
      deliverables: [
        "Complete premium package",
        "All bonuses included",
        "Full support and access",
        "Payment plan: 6 monthly payments"
      ],
      bonuses: [
        { name: "Payment Plan Bonus", description: "Extra 1-on-1 call for payment plan buyers", value: 297 },
        { name: "Resource Library", description: "Complete access to all materials", value: 497 }
      ],
      guarantee: {
        enabled: true,
        type: "satisfaction",
        days: 30,
        description: "30-day money-back guarantee. Try it risk-free."
      },
      urgency: {
        enabled: false,
        type: "limited-spots",
        description: "Payment plan option available for a limited time"
      }
    }
  },
  {
    id: "blank",
    name: "Start from Scratch",
    description: "Build your offer completely from scratch",
    icon: "FilePlus",
    category: "custom",
    defaultData: {
      type: "one-time",
      deliveryFormat: "digital",
      keyBenefits: [],
      deliverables: [],
      bonuses: [],
      guarantee: {
        enabled: false,
        type: "satisfaction",
        days: 30,
        description: ""
      },
      urgency: {
        enabled: false,
        type: "limited-spots",
        description: ""
      }
    }
  }
];

export function getTemplateById(id: string): OfferTemplate | undefined {
  return offerTemplates.find(t => t.id === id);
}

export function getTemplatesByCategory(category: string): OfferTemplate[] {
  return offerTemplates.filter(t => t.category === category);
}
