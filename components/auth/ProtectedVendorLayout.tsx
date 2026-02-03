"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Loading from "@/components/UI/Loading";

export default function VendorGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [vendorStatus, setVendorStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const isOnboardingRoute = pathname.startsWith("/vendor/onboarding");
  const isPendingRoute = pathname.startsWith("/vendor/pending");
  const isPublicFlow = isOnboardingRoute || isPendingRoute;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have the auth cookie by making an API call
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/vendor/profile`,
          {
            credentials: "include",
            headers: { "Cache-Control": "no-cache" },
          },
        );
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(true);
          setVendorStatus(data.user?.vendorStatus || "NEW");
        } else {
          setIsAuthenticated(false);
          if (!isPublicFlow) {
            router.replace("/auth/login");
            return;
          }
        }
      } catch (error) {
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
  }, [router, pathname, isPublicFlow]);

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
  }, [
    pathname,
    router,
    vendorStatus,
    loading,
    isAuthenticated,
    isOnboardingRoute,
    isPendingRoute,
  ]);

  if (loading) return <Loading />;

  if (!isAuthenticated && !isPublicFlow) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
