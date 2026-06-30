import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "wealthmoves-secret-key-change-in-production"
);

// Routes that require authentication
const protectedRoutes = ["/", "/dream-life", "/revenue", "/offers", "/coach", "/sprint", "/resources"];

// Routes that are always accessible (demo mode available)
const publicRoutes = ["/login", "/api/auth", "/systems"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all API routes - they handle their own auth
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Allow public routes (exact match or starts with)
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.next();
  }

  // Check for auth token on protected routes
  if (protectedRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Default: allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
