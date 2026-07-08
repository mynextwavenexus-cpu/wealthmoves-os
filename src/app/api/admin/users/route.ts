import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "wealthmoves-secret-key-change-in-production"
);

// Extended user type with more details
type UserTier = "starter" | "pro" | "sprint" | "elite";

interface User {
  id: string;
  email: string;
  name: string;
  tier: UserTier;
  createdAt: string;
  lastLogin: string;
  stripeCustomerId?: string;
  totalRevenue: number;
  blueprintsCount: number;
  offersCount: number;
  sprintsCompleted: number;
  isActive: boolean;
}

// In-memory user store (replace with database in production)
let users: User[] = [
  {
    id: "user_001",
    email: "emma@wealthmoves.ai",
    name: "Emma Jackson",
    tier: "elite",
    createdAt: "2026-01-01T00:00:00Z",
    lastLogin: "2026-07-08T10:00:00Z",
    stripeCustomerId: "cus_elite_001",
    totalRevenue: 0,
    blueprintsCount: 3,
    offersCount: 5,
    sprintsCompleted: 2,
    isActive: true,
  },
  {
    id: "user_demo1",
    email: "demo1@wealthmoves.ai",
    name: "Demo User (Starter)",
    tier: "starter",
    createdAt: "2026-06-01T00:00:00Z",
    lastLogin: "2026-07-08T09:00:00Z",
    stripeCustomerId: "cus_starter_001",
    totalRevenue: 27,
    blueprintsCount: 1,
    offersCount: 0,
    sprintsCompleted: 0,
    isActive: true,
  },
  {
    id: "user_demo2",
    email: "demo2@wealthmoves.ai",
    name: "Demo User (Pro)",
    tier: "pro",
    createdAt: "2026-06-01T00:00:00Z",
    lastLogin: "2026-07-08T08:00:00Z",
    stripeCustomerId: "cus_pro_001",
    totalRevenue: 97,
    blueprintsCount: 2,
    offersCount: 3,
    sprintsCompleted: 0,
    isActive: true,
  },
  {
    id: "user_demo3",
    email: "demo3@wealthmoves.ai",
    name: "Demo User (Sprint)",
    tier: "sprint",
    createdAt: "2026-07-08T12:00:00Z",
    lastLogin: "2026-07-08T12:00:00Z",
    stripeCustomerId: "cus_sprint_001",
    totalRevenue: 297,
    blueprintsCount: 1,
    offersCount: 2,
    sprintsCompleted: 0,
    isActive: true,
  },
];

async function isAdmin(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.userId === "user_001"; // Only Emma is admin
  } catch {
    return false;
  }
}

// GET /api/admin/users - List users with filtering
export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase();
    const tier = searchParams.get("tier") as UserTier | null;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    let filtered = [...users];

    // Search filter
    if (search) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search)
      );
    }

    // Tier filter
    if (tier) {
      filtered = filtered.filter((u) => u.tier === tier);
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortBy as keyof User];
      const bVal = b[sortBy as keyof User];
      const comparison = String(aVal).localeCompare(String(bVal));
      return sortOrder === "asc" ? comparison : -comparison;
    });

    // Paginate
    const total = filtered.length;
    const paginatedUsers = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      users: paginatedUsers,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users - Update user (tier, status, etc.)
export async function PATCH(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, tier, isActive, name, email } = body;

    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updates: Partial<User> = {};

    if (tier && ["starter", "pro", "sprint", "elite"].includes(tier)) {
      updates.tier = tier;
    }

    if (typeof isActive === "boolean") {
      updates.isActive = isActive;
    }

    if (name) {
      updates.name = name;
    }

    if (email) {
      updates.email = email;
    }

    users[userIndex] = { ...users[userIndex], ...updates };

    return NextResponse.json({
      success: true,
      user: users[userIndex],
    });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users - Delete user
export async function DELETE(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 400 }
      );
    }

    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deleting admin
    if (userId === "user_001") {
      return NextResponse.json(
        { error: "Cannot delete admin user" },
        { status: 403 }
      );
    }

    users.splice(userIndex, 1);

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users/impersonate - Impersonate user for support
export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, action } = body;

    if (action === "impersonate") {
      const user = users.find((u) => u.id === userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Prevent impersonating admin
      if (userId === "user_001") {
        return NextResponse.json(
          { error: "Cannot impersonate admin" },
          { status: 403 }
        );
      }

      // Generate impersonation token
      // In production, this would create a temporary session
      return NextResponse.json({
        success: true,
        impersonationToken: `impersonate_${userId}_${Date.now()}`,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          tier: user.tier,
        },
        message: `Impersonating user: ${user.name}`,
      });
    }

    if (action === "export") {
      // Export user data
      const user = users.find((u) => u.id === userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        exportData: {
          user,
          exportDate: new Date().toISOString(),
          format: "json",
        },
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Failed to process user action:", error);
    return NextResponse.json(
      { error: "Failed to process action" },
      { status: 500 }
    );
  }
}
