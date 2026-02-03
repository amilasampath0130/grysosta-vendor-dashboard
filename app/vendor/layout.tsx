"use client";

import VendorGuard from "@/components/auth/ProtectedVendorLayout";
import Header from "@/components/UI/Header";
import Sidebar from "@/components/UI/SideBar";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isOnboardingOrPending =
    pathname.startsWith("/vendor/onboarding") ||
    pathname.startsWith("/vendor/pending");

  return (
    <VendorGuard>
      {isOnboardingOrPending ? (
        <div className="min-h-screen bg-gray-50">{children}</div>
      ) : (
        <div className="flex h-screen overflow-hidden">
          <Sidebar open={open} setOpen={setOpen} />

          <div className="flex flex-col flex-1">
            <Header setOpen={setOpen} />
            <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-gray-50">
              {children}
            </main>
          </div>
        </div>
      )}
    </VendorGuard>
  );
}
