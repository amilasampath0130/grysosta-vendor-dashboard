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
  const isOnboardingRoute = pathname === "/vendor/onboarding";

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
          if (!isOnboardingRoute) {
            router.replace("/auth/login");
            return;
          }
        }
      } catch (error) {
        setIsAuthenticated(false);
        if (!isOnboardingRoute) {
          router.replace("/auth/login");
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname, isOnboardingRoute]);

  useEffect(() => {
    if (loading || !isAuthenticated || !vendorStatus) return;

    if (vendorStatus === "NEW" && pathname !== "/vendor/onboarding") {
      router.replace("/vendor/onboarding");
    }

    if (vendorStatus === "PENDING" && pathname !== "/vendor/pending") {
      router.replace("/vendor/pending");
    }

    if (vendorStatus === "REJECTED" && pathname !== "/vendor/onboarding") {
      router.replace("/vendor/onboarding");
    }

    if (
      vendorStatus === "APPROVED" &&
      (pathname === "/vendor/onboarding" || pathname === "/vendor/pending")
    ) {
      router.replace("/vendor/dashboard");
    }
  }, [pathname, router, vendorStatus, loading, isAuthenticated]);

  if (loading) return <Loading />;

  if (!isAuthenticated && !isOnboardingRoute) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
