import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "wealthmoves-secret-key-change-in-production"
);

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/about",
  "/pricing",
  "/contact",
  "/dream-life-quiz", // Free lead magnet - no auth required
  "/api/auth",
  "/api/webhooks", // Stripe webhooks need to be public
];

// Static assets and API routes that should be ignored
const IGNORED_PATHS = [
  "/_next",
  "/static",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/api/test",
];

// Admin-only routes
const ADMIN_ROUTES = [
  "/admin",
  "/api/admin",
];

// Routes that require specific tiers
const TIER_ROUTES: Record<string, string[]> = {
  pro: ["/offers", "/systems"],
  sprint: ["/sprint", "/coach"],
};

/**
 * Check if a path is public
 */
function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
}

/**
 * Check if a path should be ignored
 */
function isIgnoredPath(path: string): boolean {
  return IGNORED_PATHS.some(ignored => 
    path.startsWith(ignored)
  );
}

/**
 * Check if a path is an admin route
 */
function isAdminRoute(path: string): boolean {
  return ADMIN_ROUTES.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
}

/**
 * Verify JWT token and return payload
 */
async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore static assets and certain paths
  if (isIgnoredPath(pathname)) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check for auth token
  const token = request.cookies.get("auth_token")?.value;

  // If no token and route requires auth, redirect to login
  if (!token) {
    // API routes return 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Page routes redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token
  const payload = await verifyToken(token);

  if (!payload) {
    // Clear invalid token
    const response = pathname.startsWith("/api/")
      ? NextResponse.json({ error: "Invalid token" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", request.url));
    
    response.cookies.delete("auth_token");
    return response;
  }

  // Check admin routes
  if (isAdminRoute(pathname)) {
    const isAdmin = payload.isAdmin === true || 
                   payload.userId === "user_001" || // Emma
                   payload.userId === "user_admin"; // Admin

    if (!isAdmin) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Forbidden - Admin access required" },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Add user info to headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", payload.userId as string);
  requestHeaders.set("x-user-email", (payload.email as string) || "");
  requestHeaders.set("x-user-is-admin", String(payload.isAdmin === true));

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};