import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { hash } from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "wealthmoves-secret-key-change-in-production"
);

const RESET_TOKEN_SECRET = new TextEncoder().encode(
  process.env.RESET_TOKEN_SECRET || process.env.JWT_SECRET || "wealthmoves-reset-secret"
);

// In-memory token store for fallback (in production, use database)
const resetTokens: Map<string, { email: string; expires: number }> = new Map();

// Supabase admin client for user management
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;

// In-memory user store (replace with database in production)
const users: Map<string, { password: string; user: any }> = new Map();

// Initialize with existing users from main auth route
// This is a temporary solution - in production, use Supabase Auth
users.set("emma@wealthmoves.ai", {
  password: "$2b$10$jMbr7.R8KtY6UcJ24SYZmevKb2x0TNP0eu5qjYiiYBS2V1lpvzuXW",
  user: { id: "user_001", email: "emma@wealthmoves.ai", name: "Emma Jackson", tier: "sprint" },
});
users.set("demo1@wealthmoves.ai", {
  password: "$2b$10$CI6dME2HekC3bm/jRmgx3eamhcwUiuXG66DcG7f/cSUxZt9vbz85G",
  user: { id: "user_demo1", email: "demo1@wealthmoves.ai", name: "Demo User (Starter)", tier: "starter" },
});
users.set("demo2@wealthmoves.ai", {
  password: "$2b$10$w7nx2kKVYTwz7FZwrrQAB.ukReomgXVla4efnTjSB96vjqf5bckmi",
  user: { id: "user_demo2", email: "demo2@wealthmoves.ai", name: "Demo User (Pro)", tier: "pro" },
});

/**
 * POST /api/auth/reset-password
 * 
 * Request body for requesting reset:
 * { action: "request", email: "user@example.com" }
 * 
 * Request body for confirming reset:
 * { action: "confirm", token: "reset-token", newPassword: "newpassword123" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, token, newPassword } = body;

    // Request password reset
    if (action === "request") {
      if (!email) {
        return NextResponse.json(
          { error: "Email is required" },
          { status: 400 }
        );
      }

      // Normalize email
      const normalizedEmail = email.toLowerCase().trim();

      // Check if user exists (don't reveal if they don't for security)
      const userExists = users.has(normalizedEmail);

      if (userExists) {
        // Generate reset token
        const resetToken = await new SignJWT({ email: normalizedEmail })
          .setProtectedHeader({ alg: "HS256" })
          .setExpirationTime("1h")
          .setJti(crypto.randomUUID())
          .sign(RESET_TOKEN_SECRET);

        // Store token (in production, store in database with expiration)
        resetTokens.set(resetToken, {
          email: normalizedEmail,
          expires: Date.now() + 60 * 60 * 1000, // 1 hour
        });

        // TODO: Send email with reset link
        // In production, integrate with email service (SendGrid, AWS SES, etc.)
        console.log(`[PASSWORD RESET] Token for ${normalizedEmail}: ${resetToken}`);
        
        // For development, return the token
        if (process.env.NODE_ENV !== "production") {
          return NextResponse.json({
            success: true,
            message: "Password reset email sent",
            devToken: resetToken, // Only in development
          });
        }
      }

      // Always return success to prevent email enumeration
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, you will receive a password reset link",
      });
    }

    // Confirm password reset
    if (action === "confirm") {
      if (!token || !newPassword) {
        return NextResponse.json(
          { error: "Token and new password are required" },
          { status: 400 }
        );
      }

      // Validate password strength
      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: "Password must be at least 8 characters long" },
          { status: 400 }
        );
      }

      try {
        // Verify token
        const { payload } = await jwtVerify(token, RESET_TOKEN_SECRET);
        const email = (payload.email || payload.sub) as string;

        // Check if token is still valid in our store
        const tokenData = resetTokens.get(token);
        if (!tokenData || tokenData.expires < Date.now()) {
          return NextResponse.json(
            { error: "Invalid or expired reset token" },
            { status: 400 }
          );
        }

        // Hash new password
        const hashedPassword = await hash(newPassword, 10);

        // Update user password
        const userData = users.get(email);
        if (userData) {
          userData.password = hashedPassword;
          users.set(email, userData);
        }

        // If using Supabase Auth, update there too
        if (supabaseAdmin) {
          const { data: user } = await supabaseAdmin.auth.admin.listUsers();
          const targetUser = user?.users.find(u => u.email === email);
          if (targetUser) {
            await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
              password: newPassword,
            });
          }
        }

        // Invalidate token
        resetTokens.delete(token);

        return NextResponse.json({
          success: true,
          message: "Password has been reset successfully",
        });
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid or expired reset token" },
          { status: 400 }
        );
      }
    }

    // Validate reset token (for frontend to check if token is valid)
    if (action === "validate") {
      if (!token) {
        return NextResponse.json(
          { error: "Token is required" },
          { status: 400 }
        );
      }

      try {
        const { payload } = await jwtVerify(token, RESET_TOKEN_SECRET);
        const tokenData = resetTokens.get(token);
        
        if (!tokenData || tokenData.expires < Date.now()) {
          return NextResponse.json(
            { valid: false, error: "Token expired" },
            { status: 400 }
          );
        }

        return NextResponse.json({
          valid: true,
          email: payload.email,
        });
      } catch {
        return NextResponse.json(
          { valid: false, error: "Invalid token" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/reset-password?token=xxx
 * Validate a reset token
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Token is required" },
        { status: 400 }
      );
    }

    try {
      const { payload } = await jwtVerify(token, RESET_TOKEN_SECRET);
      const tokenData = resetTokens.get(token);
      
      if (!tokenData || tokenData.expires < Date.now()) {
        return NextResponse.json(
          { valid: false, error: "Token expired" },
          { status: 400 }
        );
      }

      return NextResponse.json({
        valid: true,
        email: payload.email,
      });
    } catch {
      return NextResponse.json(
        { valid: false, error: "Invalid token" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Token validation error:", error);
    return NextResponse.json(
      { valid: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}