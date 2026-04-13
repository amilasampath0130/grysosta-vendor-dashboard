"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Loading from "@/components/UI/Loading";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";

export default function VendorGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const apiBaseUrl = getApiBaseUrl();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [vendorStatus, setVendorStatus] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(
    null,
  );
  const [onboardingPlanKey, setOnboardingPlanKey] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const isOnboardingRoute = pathname.startsWith("/vendor/onboarding");
  const isPendingRoute = pathname.startsWith("/vendor/pending");
  const isBillingRoute = pathname.startsWith("/vendor/billing");
  const isPublicFlow = isOnboardingRoute || isPendingRoute;

  const isActiveSubscriptionStatus = (status?: string | null) =>
    status === "active" || status === "trialing";

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have the auth cookie by making an API call
        const res = await fetch(
          `${apiBaseUrl}/api/vendor/profile`,
          {
            credentials: "include",
            headers: { "Cache-Control": "no-cache" },
          },
        );
        if (res.ok) {
          const data = await res.json();
          const normalizedStatus =
            data.user?.vendorStatus ||
            (data.user?.role === "vendor" ? "APPROVED" : "NEW");
          setIsAuthenticated(true);
          setVendorStatus(normalizedStatus);
          setSubscriptionStatus(data.user?.vendorSubscription?.status || null);
          setOnboardingPlanKey(
            data.user?.vendorApplication?.business?.planKey || null,
          );
        } else {
          setIsAuthenticated(false);
          if (!isPublicFlow) {
            router.replace("/auth/login");
            return;
          }
        }
      } catch {
        setIsAuthenticated(false);
        if (!isPublicFlow) {
          router.replace("/auth/login");
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname, isPublicFlow, apiBaseUrl]);

  useEffect(() => {
    if (loading || !isAuthenticated || !vendorStatus) return;

    if (vendorStatus === "NEW" && !isOnboardingRoute) {
      router.replace("/vendor/onboarding");
    }

    if (vendorStatus === "PENDING" && !isPendingRoute) {
      router.replace("/vendor/pending");
    }

    if (vendorStatus === "REJECTED" && !isOnboardingRoute) {
      router.replace("/vendor/onboarding");
    }

    if (vendorStatus === "APPROVED" && (isOnboardingRoute || isPendingRoute)) {
      router.replace("/vendor/dashboard");
    }

    if (
      vendorStatus === "APPROVED" &&
      !isOnboardingRoute &&
      !isPendingRoute &&
      !isBillingRoute &&
      !isActiveSubscriptionStatus(subscriptionStatus)
    ) {
      const params = new URLSearchParams();
      params.set("next", pathname || "/vendor/dashboard");
      if (onboardingPlanKey) params.set("planKey", onboardingPlanKey);
      router.replace(`/vendor/billing?${params.toString()}`);
    }
  }, [
    pathname,
    router,
    vendorStatus,
    loading,
    isAuthenticated,
    isOnboardingRoute,
    isPendingRoute,
    isBillingRoute,
    subscriptionStatus,
    onboardingPlanKey,
  ]);

  if (loading) return <Loading />;

  if (!isAuthenticated && !isPublicFlow) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
