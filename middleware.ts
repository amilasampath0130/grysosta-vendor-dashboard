import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const { pathname } = request.nextUrl;
  const isProtectedRoute =
    pathname.startsWith("/vendor") || pathname.startsWith("/dashboard");
  const isPublicOnboarding = pathname.startsWith("/vendor/onboarding");

  // If already authenticated, block access to login page
  if (token && pathname.startsWith("/auth/login")) {
    return NextResponse.redirect(new URL("/vendor/dashboard", request.url));
  }

  // Block access to protected routes when no auth cookie is present
  if (!token && isProtectedRoute && !isPublicOnboarding) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
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
