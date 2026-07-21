import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple middleware that allows all routes
// Authentication is handled client-side
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
