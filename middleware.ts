import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";

const API_URL = getApiBaseUrl();

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute =
    pathname.startsWith("/vendor") || pathname.startsWith("/dashboard");
  const isOnboardingRoute = pathname.startsWith("/vendor/onboarding");
  const isPendingRoute = pathname.startsWith("/vendor/pending");
  const isPublicFlow = isOnboardingRoute || isPendingRoute;

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
      user?: {
        vendorStatus?: string;
        role?: string;
        vendorSubscription?: { status?: string };
      };
    };

    const status =
      data.user?.vendorStatus || (data.user?.role === "vendor" ? "APPROVED" : "NEW");

    const subscriptionStatus = String(
      data.user?.vendorSubscription?.status || "",
    ).trim();
    const hasActiveSubscription =
      subscriptionStatus === "active" || subscriptionStatus === "trialing";

    const requiresSubscription =
      pathname.startsWith("/vendor/dashboard/create-offer") ||
      pathname.startsWith("/vendor/dashboard/create-advertisement");

    if (pathname.startsWith("/auth/login")) {
      if (status === "APPROVED") {
        return NextResponse.redirect(new URL("/vendor/dashboard", request.url));
      }
      if (status === "PENDING") {
        return NextResponse.redirect(new URL("/vendor/pending", request.url));
      }
      return NextResponse.redirect(new URL("/vendor/onboarding", request.url));
    }

    if (status === "APPROVED") {
      if (isOnboardingRoute || isPendingRoute) {
        return NextResponse.redirect(new URL("/vendor/dashboard", request.url));
      }

      if (requiresSubscription && !hasActiveSubscription) {
        const billingUrl = new URL("/vendor/billing", request.url);
        billingUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(billingUrl);
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
