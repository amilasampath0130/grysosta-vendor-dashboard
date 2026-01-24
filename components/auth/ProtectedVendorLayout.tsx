"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

// TEMP MOCK (replace later with API)
const getMockVendorStatus = () => {
  return "NEW"; // NEW | PENDING | APPROVED
};

export default function VendorGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const status = getMockVendorStatus();

    if (status === "NEW" && pathname !== "/vendor/onboarding") {
      router.replace("/vendor/onboarding");
    }

    if (status === "PENDING" && pathname !== "/vendor/pending") {
      router.replace("/vendor/pending");
    }

    if (
      status === "APPROVED" &&
      (pathname === "/vendor/onboarding" || pathname === "/vendor/pending")
    ) {
      router.replace("/vendor/dashboard");
    }
  }, [pathname, router]);

  return <>{children}</>;
}
