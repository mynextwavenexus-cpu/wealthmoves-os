// Access Control - Maps pricing tiers to dashboard features

export type PricingTier = "starter" | "pro" | "sprint" | null;

export interface FeatureAccess {
  dashboard: boolean;
  dreamLife: boolean;
  revenue: boolean;
  offers: boolean;
  systems: boolean;
  aiCoach: boolean;
  sprint: boolean;
  resources: boolean;
  downloads: boolean;
  pdfExports: boolean;
  gapAnalysis: boolean;
  actionPlan: boolean;
  reminders: boolean;
  oneOnOneCalls: boolean;
  community: boolean;
}

// Feature access by tier
export const tierAccess: Record<NonNullable<PricingTier>, FeatureAccess> = {
  starter: {
    dashboard: true,
    dreamLife: true,
    revenue: true,
    offers: false,
    systems: false,
    aiCoach: true,
    sprint: false,
    resources: true,
    downloads: false,
    pdfExports: false,
    gapAnalysis: false,
    actionPlan: false,
    reminders: false,
    oneOnOneCalls: false,
    community: true,
  },
  pro: {
    dashboard: true,
    dreamLife: true,
    revenue: true,
    offers: true,
    systems: true,
    aiCoach: true,
    sprint: false,
    resources: true,
    downloads: true,
    pdfExports: true,
    gapAnalysis: true,
    actionPlan: true,
    reminders: true,
    oneOnOneCalls: false,
    community: true,
  },
  sprint: {
    dashboard: true,
    dreamLife: true,
    revenue: true,
    offers: true,
    systems: true,
    aiCoach: true,
    sprint: true,
    resources: true,
    downloads: true,
    pdfExports: true,
    gapAnalysis: true,
    actionPlan: true,
    reminders: true,
    oneOnOneCalls: true,
    community: true,
  },
};

// Get user's tier from localStorage (sync with auth context)
export function getUserTier(): PricingTier {
  if (typeof window !== "undefined") {
    // Check for auth token first (indicates logged in)
    const hasAuth = document.cookie.includes("auth_token");
    if (!hasAuth) return null;
    
    const tier = localStorage.getItem("wealthmoves_tier");
    if (tier === "starter" || tier === "pro" || tier === "sprint") {
      return tier;
    }
    // Default to starter if logged in but no tier set
    return "starter";
  }
  return null;
}

// Check if user has access to a feature
export function hasAccess(feature: keyof FeatureAccess, tier?: PricingTier): boolean {
  const userTier = tier || getUserTier();
  
  // Allow unauthenticated (demo) users to access Systems page
  if (!userTier && feature === "systems") return true;
  
  if (!userTier) return false;
  return tierAccess[userTier][feature];
}

// Navigation items with access requirements
export const navigationItems = [
  { name: "Dashboard", href: "/", requires: "dashboard" as const },
  { name: "Dream Life", href: "/dream-life", requires: "dreamLife" as const },
  { name: "Revenue", href: "/revenue", requires: "revenue" as const },
  { name: "Offers", href: "/offers", requires: "offers" as const },
  { name: "Systems", href: "/systems", requires: "systems" as const },
  { name: "AI Coach", href: "/coach", requires: "aiCoach" as const },
  { name: "Sprint", href: "/sprint", requires: "sprint" as const },
  { name: "Resources", href: "/resources", requires: "resources" as const },
];

// Upgrade prompts by tier
export const upgradePrompts = {
  starter: {
    title: "Unlock Pro Features",
    description: "Build offers, create systems, and download your blueprints.",
    cta: "Upgrade to Pro",
    price: "$49 one-time (founder pricing)",
    link: "https://dreamlife-blueprint.vercel.app/#pricing",
  },
  pro: {
    title: "Sprint Coming Soon",
    description: "1-on-1 coaching and done-with-you implementation launching soon.",
    cta: "Coming Soon",
    price: "Launching Q3 2026",
    link: "https://dreamlife-blueprint.vercel.app/#pricing",
  },
};
