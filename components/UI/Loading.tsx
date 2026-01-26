"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-green-600" />

        <div className="text-center">
          <h3 className="text-base font-semibold">Preparing your dashboard</h3>
          <p className="text-sm text-gray-500">Please wait a moment</p>
        </div>
      </div>
    </div>
  );
}
