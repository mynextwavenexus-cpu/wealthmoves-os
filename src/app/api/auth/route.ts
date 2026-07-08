import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { compare, hash } from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { enrollUserInCourse } from "@/lib/coursesprout";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "wealthmoves-secret-key-change-in-production"
);

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Create Supabase clients
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;

export interface User {
  id: string;
  email: string;
  name: string;
  tier: "starter" | "pro" | "sprint" | "admin" | null;
  isAdmin?: boolean;
  stripeCustomerId?: string;
  onboardingCompleted?: boolean;
}

// In-memory user store (fallback when Supabase is not configured)
const users: Map<string, { password: string; user: User }> = new Map();

// Initialize default users
function initializeDefaultUsers() {
  // Admin user
  users.set("admin@wealthmoves.ai", {
    password: "$2b$10$jMbr7.R8KtY6UcJ24SYZmevKb2x0TNP0eu5qjYiiYBS2V1lpvzuXW", // wealthmoves2026
    user: {
      id: "user_admin",
      email: "admin@wealthmoves.ai",
      name: "Admin",
      tier: "admin",
      isAdmin: true,
    },
  });

  // Emma as admin
  users.set("emma@wealthmoves.ai", {
    password: "$2b$10$jMbr7.R8KtY6UcJ24SYZmevKb2x0TNP0eu5qjYiiYBS2V1lpvzuXW", // wealthmoves2026
    user: {
      id: "user_001",
      email: "emma@wealthmoves.ai",
      name: "Emma Jackson",
      tier: "sprint",
      isAdmin: true,
    },
  });

  // Demo Account 1 - Starter Tier
  users.set("demo1@wealthmoves.ai", {
    password: "$2b$10$CI6dME2HekC3bm/jRmgx3eamhcwUiuXG66DcG7f/cSUxZt9vbz85G", // demo1
    user: {
      id: "user_demo1",
      email: "demo1@wealthmoves.ai",
      name: "Demo User (Starter)",
      tier: "starter",
    },
  });

  // Demo Account 2 - Pro Tier
  users.set("demo2@wealthmoves.ai", {
    password: "$2b$10$w7nx2kKVYTwz7FZwrrQAB.ukReomgXVla4efnTjSB96vjqf5bckmi", // demo2
    user: {
      id: "user_demo2",
      email: "demo2@wealthmoves.ai",
      name: "Demo User (Pro)",
      tier: "pro",
    },
  });
}

initializeDefaultUsers();

// Helper to check if Supabase is configured
const isSupabaseConfigured = () => supabase !== null && supabaseAdmin !== null;

// Helper to sync user with Supabase profile
async function syncUserWithProfile(user: User): Promise<User> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return user;

  try {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("tier, is_admin, onboarding_completed, stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (profile) {
      return {
        ...user,
        tier: profile.tier || user.tier,
        isAdmin: profile.is_admin || user.isAdmin,
        onboardingCompleted: profile.onboarding_completed,
        stripeCustomerId: profile.stripe_customer_id,
      };
    }
  } catch (error) {
    console.error("Profile sync error:", error);
  }

  return user;
}

export async function POST(request: NextRequest) {
  try {
    const { action, email, password, name, tier } = await request.json();

    // LOGIN
    if (action === "login") {
      // Try Supabase Auth first
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password,
        });

        if (!error && data.user) {
          // Get user profile
          const { data: profile } = await supabaseAdmin!
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();

          const user: User = {
            id: data.user.id,
            email: data.user.email!,
            name: profile?.name || data.user.user_metadata?.name || email.split("@")[0],
            tier: profile?.tier || "starter",
            isAdmin: profile?.is_admin || false,
            onboardingCompleted: profile?.onboarding_completed,
            stripeCustomerId: profile?.stripe_customer_id,
          };

          // Update last login
          await supabaseAdmin!
            .from("profiles")
            .update({ last_login_at: new Date().toISOString() })
            .eq("id", data.user.id);

          // Create JWT token
          const token = await new SignJWT({ 
            userId: user.id,
            email: user.email,
            isAdmin: user.isAdmin 
          })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("7d")
            .sign(JWT_SECRET);

          const response = NextResponse.json({ user });
          response.cookies.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60, // 7 days
          });

          return response;
        }
      }

      // Fallback to in-memory store
      const normalizedEmail = email.toLowerCase().trim();
      const userData = users.get(normalizedEmail);
      
      if (!userData) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      const isValid = await compare(password, userData.password);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      // Sync with profile if Supabase is available
      const syncedUser = await syncUserWithProfile(userData.user);

      const token = await new SignJWT({ 
        userId: syncedUser.id,
        email: syncedUser.email,
        isAdmin: syncedUser.isAdmin 
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("7d")
        .sign(JWT_SECRET);

      const response = NextResponse.json({ user: syncedUser });
      response.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
      });

      return response;
    }

    // REGISTER
    if (action === "register") {
      const normalizedEmail = email.toLowerCase().trim();

      // Check if user exists in Supabase
      if (isSupabaseConfigured() && supabaseAdmin) {
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users.find(u => u.email === normalizedEmail);

        if (existingUser) {
          return NextResponse.json(
            { error: "User already exists" },
            { status: 400 }
          );
        }

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: normalizedEmail,
          password,
          email_confirm: true,
          user_metadata: { name: name || normalizedEmail.split("@")[0] },
        });

        if (authError || !authData.user) {
          return NextResponse.json(
            { error: authError?.message || "Failed to create user" },
            { status: 500 }
          );
        }

        // Profile will be auto-created by trigger
        // Update profile with additional data
        await supabaseAdmin
          .from("profiles")
          .update({ 
            name: name || normalizedEmail.split("@")[0],
            tier: tier || "starter"
          })
          .eq("id", authData.user.id);

        const newUser: User = {
          id: authData.user.id,
          email: normalizedEmail,
          name: name || normalizedEmail.split("@")[0],
          tier: tier || "starter",
        };

        // Enroll in CourseSprout
        const enrollmentResult = await enrollUserInCourse(normalizedEmail, newUser.name);
        
        if (enrollmentResult.success) {
          console.log(`CourseSprout enrollment: ${enrollmentResult.message}`);
        }

        const token = await new SignJWT({ 
          userId: newUser.id,
          email: newUser.email,
          isAdmin: false 
        })
          .setProtectedHeader({ alg: "HS256" })
          .setExpirationTime("7d")
          .sign(JWT_SECRET);

        const response = NextResponse.json({ 
          user: newUser,
          enrollment: enrollmentResult.success ? {
            status: "enrolled",
            message: enrollmentResult.message,
          } : {
            status: "pending",
            message: "Course access will be granted shortly",
          }
        });
        
        response.cookies.set("auth_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60,
        });

        return response;
      }

      // Fallback to in-memory store
      if (users.has(normalizedEmail)) {
        return NextResponse.json(
          { error: "User already exists" },
          { status: 400 }
        );
      }

      const hashedPassword = await hash(password, 10);
      const newUser: User = {
        id: `user_${Date.now()}`,
        email: normalizedEmail,
        name: name || normalizedEmail.split("@")[0],
        tier: tier || "starter",
      };

      users.set(normalizedEmail, { password: hashedPassword, user: newUser });

      const enrollmentResult = await enrollUserInCourse(normalizedEmail, newUser.name);

      const token = await new SignJWT({ 
        userId: newUser.id,
        email: newUser.email,
        isAdmin: false 
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("7d")
        .sign(JWT_SECRET);

      const response = NextResponse.json({ 
        user: newUser,
        enrollment: enrollmentResult.success ? {
          status: "enrolled",
          message: enrollmentResult.message,
        } : {
          status: "pending",
          message: "Course access will be granted shortly",
        }
      });
      
      response.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
      });

      return response;
    }

    // LOGOUT
    if (action === "logout") {
      // Sign out from Supabase if configured
      if (isSupabaseConfigured() && supabase) {
        await supabase.auth.signOut();
      }

      const response = NextResponse.json({ success: true });
      response.cookies.delete("auth_token");
      response.cookies.delete("sb-access-token");
      response.cookies.delete("sb-refresh-token");
      return response;
    }

    // UPGRADE TIER
    if (action === "upgrade") {
      const token = request.cookies.get("auth_token")?.value;
      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { payload } = await jwtVerify(token, JWT_SECRET);
      const userId = payload.userId as string;

      // Update in Supabase
      if (isSupabaseConfigured() && supabaseAdmin) {
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({ tier })
          .eq("id", userId);

        if (error) {
          return NextResponse.json({ error: "Failed to upgrade" }, { status: 500 });
        }

        return NextResponse.json({ success: true, tier });
      }

      // Update in-memory
      for (const entry of Array.from(users.entries())) {
        const [, data] = entry;
        if (data.user.id === userId) {
          data.user.tier = tier;
          return NextResponse.json({ user: data.user });
        }
      }

      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // UPDATE PROFILE
    if (action === "update_profile") {
      const token = request.cookies.get("auth_token")?.value;
      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { payload } = await jwtVerify(token, JWT_SECRET);
      const userId = payload.userId as string;

      const updates = await request.json();
      delete updates.action; // Remove action from updates

      // Update in Supabase
      if (isSupabaseConfigured() && supabaseAdmin) {
        const { error } = await supabaseAdmin
          .from("profiles")
          .update(updates)
          .eq("id", userId);

        if (error) {
          return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    
    if (!token) {
      return NextResponse.json({ user: null });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;
    const email = payload.email as string;

    // Try to get fresh data from Supabase
    if (isSupabaseConfigured() && supabaseAdmin) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profile) {
        const user: User = {
          id: userId,
          email: profile.email || email,
          name: profile.name,
          tier: profile.tier,
          isAdmin: profile.is_admin,
          onboardingCompleted: profile.onboarding_completed,
          stripeCustomerId: profile.stripe_customer_id,
        };
        return NextResponse.json({ user });
      }
    }

    // Fallback to in-memory
    for (const entry of Array.from(users.entries())) {
      const [, data] = entry;
      if (data.user.id === userId) {
        const syncedUser = await syncUserWithProfile(data.user);
        return NextResponse.json({ user: syncedUser });
      }
    }

    return NextResponse.json({ user: null });
  } catch {
    return NextResponse.json({ user: null });
  }
}