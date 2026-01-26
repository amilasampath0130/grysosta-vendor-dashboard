import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const { pathname } = request.nextUrl;

  // If already authenticated, block access to login page
  if (token && pathname.startsWith("/auth/login")) {
    return NextResponse.redirect(new URL("/vendor/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth/login",
    "/dashboard/:path*",
    "/products/:path*",
    "/vendor/:path*",
  ],
};
