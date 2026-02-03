import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute =
    pathname.startsWith("/vendor") || pathname.startsWith("/dashboard");
  const isOnboardingRoute = pathname.startsWith("/vendor/onboarding");
  const isPendingRoute = pathname.startsWith("/vendor/pending");
  const isPublicFlow = isOnboardingRoute || isPendingRoute;

  // If already authenticated, block access to login page
  if (token && pathname.startsWith("/auth/login")) {
    return NextResponse.redirect(new URL("/vendor/dashboard", request.url));
  }

  // Block access to protected routes when no auth cookie is present
  if (!token && isProtectedRoute && !isPublicFlow) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!token || !API_URL) {
    return NextResponse.next();
  }

  try {
    const profileRes = await fetch(`${API_URL}/api/vendor/profile`, {
      headers: {
        cookie: `auth-token=${token}`,
        "Cache-Control": "no-cache",
      },
    });

    if (!profileRes.ok) {
      if (!isPublicFlow) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next();
    }

    const data = (await profileRes.json()) as {
      user?: { vendorStatus?: string };
    };

    const status = data.user?.vendorStatus || "NEW";

    if (status === "APPROVED") {
      if (isOnboardingRoute || isPendingRoute) {
        return NextResponse.redirect(new URL("/vendor/dashboard", request.url));
      }
      return NextResponse.next();
    }

    if (status === "PENDING") {
      if (!isPendingRoute) {
        return NextResponse.redirect(new URL("/vendor/pending", request.url));
      }
      return NextResponse.next();
    }

    // NEW or REJECTED
    if (!isOnboardingRoute) {
      return NextResponse.redirect(new URL("/vendor/onboarding", request.url));
    }
    return NextResponse.next();
  } catch {
    if (!isPublicFlow) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/auth/login",
    "/dashboard/:path*",
    "/products/:path*",
    "/vendor/:path*",
  ],
};
