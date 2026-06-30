import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "wealthmoves-secret-key-change-in-production"
);

// Routes that always require authentication
const protectedRoutes = ["/", "/dream-life", "/revenue", "/offers", "/coach", "/sprint", "/resources"];

// Public routes (no auth required - includes demo pages)
const publicRoutes = ["/login", "/api", "/systems"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  for (const route of publicRoutes) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return NextResponse.next();
    }
  }

  // Check protected routes
  for (const route of protectedRoutes) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      const token = request.cookies.get("auth_token")?.value;

      if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      try {
        await jwtVerify(token, JWT_SECRET);
        return NextResponse.next();
      } catch {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }
  }

  // Default: allow
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
