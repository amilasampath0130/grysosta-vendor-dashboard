"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VendorGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      if (payload.role !== "admin") { //change after completing this part still are in admin 
        router.replace("/");
      }
    } catch {
      router.replace("/");
    }
  }, []);

  return <>{children}</>;
}
