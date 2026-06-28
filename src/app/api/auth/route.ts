import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { compare, hash } from "bcryptjs";
import { enrollUserInCourse } from "@/lib/coursesprout";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "wealthmoves-secret-key-change-in-production"
);

export interface User {
  id: string;
  email: string;
  name: string;
  tier: "starter" | "pro" | "sprint" | null;
  stripeCustomerId?: string;
}

// In-memory user store (replace with database in production)
const users: Map<string, { password: string; user: User }> = new Map();

// Initialize Emma as admin user with pre-hashed password
// Password: wealthmoves2026
users.set("emma@wealthmoves.ai", {
  password: "$2b$10$jMbr7.R8KtY6UcJ24SYZmevKb2x0TNP0eu5qjYiiYBS2V1lpvzuXW", // wealthmoves2026
  user: {
    id: "user_001",
    email: "emma@wealthmoves.ai",
    name: "Emma Jackson",
    tier: "sprint",
  },
});

// Demo Account 1 - Starter Tier
// Email: demo1@wealthmoves.ai
// Password: demo1
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
// Email: demo2@wealthmoves.ai
// Password: demo2
users.set("demo2@wealthmoves.ai", {
  password: "$2b$10$w7nx2kKVYTwz7FZwrrQAB.ukReomgXVla4efnTjSB96vjqf5bckmi", // demo2
  user: {
    id: "user_demo2",
    email: "demo2@wealthmoves.ai",
    name: "Demo User (Pro)",
    tier: "pro",
  },
});

export async function POST(request: NextRequest) {
  try {
    const { action, email, password, name, tier } = await request.json();

    if (action === "login") {
      const userData = users.get(email);
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

      const token = await new SignJWT({ userId: userData.user.id })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("7d")
        .sign(JWT_SECRET);

      const response = NextResponse.json({ user: userData.user });
      response.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return response;
    }

    if (action === "register") {
      if (users.has(email)) {
        return NextResponse.json(
          { error: "User already exists" },
          { status: 400 }
        );
      }

      const hashedPassword = await hash(password, 10);
      const newUser: User = {
        id: `user_${Date.now()}`,
        email,
        name,
        tier: tier || null,
      };

      users.set(email, { password: hashedPassword, user: newUser });

      // Enroll user in CourseSprout automatically
      const enrollmentResult = await enrollUserInCourse(email, name || email.split("@")[0]);
      
      if (enrollmentResult.success) {
        console.log(`CourseSprout enrollment: ${enrollmentResult.message}`);
      } else {
        console.error(`CourseSprout enrollment failed: ${enrollmentResult.message}`);
        // Don't fail registration if enrollment fails - log it for manual follow-up
      }

      const token = await new SignJWT({ userId: newUser.id })
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

    if (action === "logout") {
      const response = NextResponse.json({ success: true });
      response.cookies.delete("auth_token");
      return response;
    }

    if (action === "upgrade") {
      const token = request.cookies.get("auth_token")?.value;
      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { payload } = await jwtVerify(token, JWT_SECRET);
      const userId = payload.userId as string;

      // Find and upgrade user
      for (const [email, data] of users.entries()) {
        if (data.user.id === userId) {
          data.user.tier = tier;
          return NextResponse.json({ user: data.user });
        }
      }

      return NextResponse.json({ error: "User not found" }, { status: 404 });
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

    for (const [, data] of users.entries()) {
      if (data.user.id === userId) {
        return NextResponse.json({ user: data.user });
      }
    }

    return NextResponse.json({ user: null });
  } catch {
    return NextResponse.json({ user: null });
  }
}
