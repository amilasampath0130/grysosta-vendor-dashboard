"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ApiResponse, parseJsonResponse } from "@/lib/api";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";

const buildVerifyOtpUrl = (email: string, notice?: string) => {
  const params = new URLSearchParams({ email });

  if (notice) {
    params.set("notice", notice);
  }

  return `/auth/verify-otp?${params.toString()}`;
};

type LoginResponse = ApiResponse & {
  vendorStatus?: string;
  canResubmit?: boolean;
  rejectionReason?: string;
};

const LoginForm = () => {
  const apiBaseUrl = getApiBaseUrl();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const notice = searchParams.get("notice");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/vendor/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        },
      );

      const data = await parseJsonResponse<LoginResponse>(response);

      if (!response.ok) {
        // If vendor was rejected, redirect to onboarding so they can resubmit
        if (data?.vendorStatus === "REJECTED" || data?.canResubmit) {
          const params = new URLSearchParams();
          params.set("email", email);
          if (data?.rejectionReason) params.set("reason", data.rejectionReason);
          router.push(`/vendor/onboarding?${params.toString()}`);
          return;
        }

        if (
          response.status === 429 &&
          data?.message?.toLowerCase().includes("otp already sent")
        ) {
          router.push(buildVerifyOtpUrl(email, data.message));
          return;
        }

        // Handle known HTTP errors - use backend message
        throw new Error(data?.message || "Login failed.");
      }

      if (!data?.success) {
        throw new Error(data?.message || "Login failed.");
      }

      // ✅ Success
      router.push(buildVerifyOtpUrl(email));
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid place-items-center h-screen">
      <div className="shadow-lg rounded-lg border-t-4 p-5 border-green-400 w-[420px]">
        <h1 className="text-xl font-bold my-4">Login</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            className="border border-gray-200 py-2 px-4 bg-zinc-100/40 rounded"
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="border border-gray-200 py-2 px-4 bg-zinc-100/40 rounded"
          />

          <button
            type="button"
            onClick={() =>
              router.push(
                `/auth/reset-password${
                  email.trim()
                    ? `?email=${encodeURIComponent(email.trim())}`
                    : ""
                }`,
              )
            }
            className="text-sm text-blue-600 text-left hover:underline"
          >
            Reset Password
          </button>

          <button
            disabled={loading}
            className={`bg-green-500 text-white font-bold px-6 py-2 rounded transition ${
              loading ? "opacity-60 cursor-not-allowed" : "hover:bg-green-600"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {error && (
            <div className="bg-red-500 text-white text-sm py-2 px-3 rounded-md">
              {error}
            </div>
          )}

          {!error && notice && (
            <div className="bg-blue-500 text-white text-sm py-2 px-3 rounded-md">
              {notice}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
