import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { createClient } from "@supabase/supabase-js";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "wealthmoves-secret-key-change-in-production"
);

// Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;

// Admin email list (fallback if Supabase is not configured)
const ADMIN_EMAILS = [
  "admin@wealthmoves.ai",
  "emma@wealthmoves.ai",
];

// Admin user IDs (fallback)
const ADMIN_USER_IDS = [
  "user_001", // Emma
];

export interface AdminCheckResult {
  isAdmin: boolean;
  userId?: string;
  email?: string;
  error?: string;
}

/**
 * Check if the current request is from an admin user
 * Supports both JWT cookie auth and Supabase session
 */
export async function checkAdmin(request: NextRequest): Promise<AdminCheckResult> {
  try {
    // Try JWT token from cookie first
    const token = request.cookies.get("auth_token")?.value;
    
    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;
        
        // Check if user ID is in admin list (fallback)
        if (ADMIN_USER_IDS.includes(userId)) {
          return { isAdmin: true, userId };
        }
        
        // Check Supabase profile for admin status
        if (supabaseAdmin) {
          const { data: profile, error } = await supabaseAdmin
            .from("profiles")
            .select("is_admin, email")
            .eq("id", userId)
            .single();
          
          if (!error && profile?.is_admin) {
            return { isAdmin: true, userId, email: profile.email };
          }
        }
      } catch {
        // JWT verification failed, continue to check Supabase session
      }
    }
    
    // Try Supabase session
    const supabaseToken = request.cookies.get("sb-access-token")?.value;
    if (supabaseToken && supabaseAdmin) {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(supabaseToken);
      
      if (!error && user) {
        // Check if email is in admin list
        if (user.email && ADMIN_EMAILS.includes(user.email)) {
          return { isAdmin: true, userId: user.id, email: user.email };
        }
        
        // Check profile for admin status
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();
        
        if (profile?.is_admin) {
          return { isAdmin: true, userId: user.id, email: user.email || undefined };
        }
      }
    }
    
    return { isAdmin: false, error: "Unauthorized" };
  } catch (error) {
    console.error("Admin check error:", error);
    return { isAdmin: false, error: "Internal server error" };
  }
}

/**
 * Middleware function to protect admin routes
 * Usage in API routes:
 * 
 * export async function GET(request: NextRequest) {
 *   const adminCheck = await requireAdmin(request);
 *   if (!adminCheck.isAdmin) {
 *     return NextResponse.json({ error: adminCheck.error }, { status: 401 });
 *   }
 *   // ... admin-only logic
 * }
 */
export async function requireAdmin(request: NextRequest): Promise<AdminCheckResult> {
  return checkAdmin(request);
}

/**
 * Higher-order function to wrap API handlers with admin check
 * 
 * Usage:
 * export const GET = withAdmin(async (request, adminInfo) => {
 *   // This only runs if user is admin
 *   return NextResponse.json({ data: "secret" });
 * });
 */
export function withAdmin(
  handler: (request: NextRequest, adminInfo: AdminCheckResult) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const adminCheck = await checkAdmin(request);
    
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: adminCheck.error || "Unauthorized" },
        { status: 401 }
      );
    }
    
    return handler(request, adminCheck);
  };
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers(request: NextRequest) {
  const adminCheck = await checkAdmin(request);
  
  if (!adminCheck.isAdmin) {
    return { error: "Unauthorized", status: 401 };
  }
  
  try {
    if (supabaseAdmin) {
      const { data: profiles, error } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      return { users: profiles || [], status: 200 };
    }
    
    // Fallback to in-memory users
    return {
      users: [
        { id: "user_001", email: "emma@wealthmoves.ai", name: "Emma Jackson", tier: "sprint", is_admin: true },
        { id: "user_demo1", email: "demo1@wealthmoves.ai", name: "Demo User (Starter)", tier: "starter", is_admin: false },
        { id: "user_demo2", email: "demo2@wealthmoves.ai", name: "Demo User (Pro)", tier: "pro", is_admin: false },
      ],
      status: 200
    };
  } catch (error) {
    console.error("Get all users error:", error);
    return { error: "Failed to fetch users", status: 500 };
  }
}

/**
 * Update user tier (admin only)
 */
export async function updateUserTier(
  request: NextRequest,
  userId: string,
  tier: "starter" | "pro" | "sprint"
) {
  const adminCheck = await checkAdmin(request);
  
  if (!adminCheck.isAdmin) {
    return { error: "Unauthorized", status: 401 };
  }
  
  try {
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({ tier })
        .eq("id", userId);
      
      if (error) throw error;
      
      return { success: true, status: 200 };
    }
    
    return { success: true, status: 200 };
  } catch (error) {
    console.error("Update user tier error:", error);
    return { error: "Failed to update user tier", status: 500 };
  }
}

/**
 * Delete user (admin only)
 */
export async function deleteUser(request: NextRequest, userId: string) {
  const adminCheck = await checkAdmin(request);
  
  if (!adminCheck.isAdmin) {
    return { error: "Unauthorized", status: 401 };
  }
  
  // Prevent admins from deleting themselves
  if (adminCheck.userId === userId) {
    return { error: "Cannot delete your own account", status: 400 };
  }
  
  try {
    if (supabaseAdmin) {
      // Delete from auth.users (this cascades to profiles due to FK)
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      
      if (error) throw error;
      
      return { success: true, status: 200 };
    }
    
    return { success: true, status: 200 };
  } catch (error) {
    console.error("Delete user error:", error);
    return { error: "Failed to delete user", status: 500 };
  }
}