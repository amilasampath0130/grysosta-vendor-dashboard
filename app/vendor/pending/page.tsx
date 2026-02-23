"use client";

import { useRouter } from "next/navigation";

export default function PendingPage() {
  const router = useRouter();

  const handleBackToLogin = () => { 
    router.replace("/auth/login");
  };

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
      <h1 className="text-3xl font-bold mb-4">Account Under Review</h1>

      <p className="text-gray-600 max-w-md mb-8">
        Thank you for submitting your vendor information. Our team is currently
        reviewing your details.
        <br />
        <br />
        You will receive an email notification once your account is approved.
      </p>

      <div className="flex gap-4">
        <button
          onClick={handleBackToLogin}
          className="bg-green-600 text-white px-6 py-2 rounded font-medium hover:bg-green-700"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
