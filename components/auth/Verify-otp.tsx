"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ApiResponse, parseJsonResponse } from "@/lib/api";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";

type VerifyVendorOtpResponse = ApiResponse;

type VendorProfileResponse = ApiResponse<never> & {
  user?: {
    vendorStatus?: string;
    role?: string;
  };
};

export default function VerifyOtpPage() {
  const apiBaseUrl = getApiBaseUrl();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const notice = searchParams.get("notice") || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [msLeft, setMsLeft] = useState(0);
  const [info, setInfo] = useState("");

  useEffect(() => {
    let mounted = true;
    const fetchStatus = async () => {
      if (!email) return;
      try {
        const res = await fetch(
          `${apiBaseUrl}/api/vendor/otp-status?email=${encodeURIComponent(email)}`,
          { credentials: "include" },
        );
        const data = await parseJsonResponse<ApiResponse>(res);
        if (!mounted) return;
        if (typeof data?.msLeft === "number") {
          setMsLeft(data.msLeft);
        }
      } catch {
        // ignore
      }
    };

    fetchStatus();
    const iv = setInterval(() => {
      fetchStatus();
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, [email, apiBaseUrl]);

  useEffect(() => {
    if (msLeft <= 0) return;
    const iv = setInterval(() => {
      setMsLeft((s) => Math.max(0, s - 1000));
    }, 1000);
    return () => clearInterval(iv);
  }, [msLeft]);

  if (!email) {
    return <p className="text-center mt-10">Invalid request</p>;
  }

  const handleVerify = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${apiBaseUrl}/api/vendor/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, otp }),
        },
      );

      const data = await parseJsonResponse<VerifyVendorOtpResponse>(res);

      if (res.ok && data?.success) {
        const profileRes = await fetch(
          `${apiBaseUrl}/api/vendor/profile`,
          {
            credentials: "include",
            headers: { "Cache-Control": "no-cache" },
          },
        );

        if (profileRes.ok) {
          const profileData = await parseJsonResponse<VendorProfileResponse>(
            profileRes,
          );
          const status =
            profileData?.user?.vendorStatus ||
            (profileData?.user?.role === "vendor" ? "APPROVED" : "NEW");

          if (status === "APPROVED") {
            router.replace("/vendor/dashboard");
          } else if (status === "PENDING") {
            router.replace("/vendor/pending");
          } else {
            router.replace("/vendor/onboarding");
          }
        } else {
          router.replace("/vendor/dashboard");
        }
      } else {
        setError(data?.message || "Invalid OTP");
      }
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResendLoading(true);
    setInfo("");
    try {
      const res = await fetch(
        `${apiBaseUrl}/api/vendor/resend-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email }),
        },
      );
      const data = await parseJsonResponse<ApiResponse>(res);
      if (res.ok && data?.success) {
        setInfo("OTP resent. Check your email.");
        setMsLeft(typeof data?.msLeft === "number" ? data.msLeft : 30 * 1000);
      } else if (typeof data?.msLeft === "number") {
        setMsLeft(data.msLeft);
        setInfo(data?.message || "Please wait before resending OTP.");
      } else {
        setInfo(data?.message || "Could not resend OTP");
      }
    } catch {
      setInfo("Server error");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="grid place-items-center h-screen">
      <div className="shadow-lg rounded-lg border-t-4 p-6 border-green-500 w-[420px]">
        <h1 className="text-2xl font-bold mb-2">Verify OTP</h1>
        <p className="text-sm text-gray-600 mb-4">
          Enter the 6-digit code sent to <b>{email}</b>
        </p>

        <input
          type="text"
          maxLength={6}
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="border w-full px-4 py-2 rounded mb-3 text-center tracking-widest text-lg"
        />

        <button
          onClick={handleVerify}
          disabled={loading || otp.length !== 6}
          className="bg-green-500 text-white w-full py-2 rounded font-semibold"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        <div className="flex items-center justify-between mt-3 gap-3">
          <button
            onClick={handleResend}
            disabled={resendLoading || msLeft > 0}
            className={`px-3 py-2 rounded ${
              msLeft > 0 || resendLoading
                ? "bg-gray-300 text-gray-700"
                : "bg-blue-500 text-white"
            }`}
          >
            {resendLoading
              ? "Sending..."
              : msLeft > 0
                ? `Resend available in ${Math.ceil(msLeft / 1000)}s`
                : "Resend OTP"}
          </button>

          <div className="text-sm text-gray-600">{info}</div>
        </div>

        {notice && !error && !info && (
          <p className="bg-blue-500 text-white text-sm p-2 rounded mt-3">
            {notice}
          </p>
        )}

        {error && (
          <p className="bg-red-500 text-white text-sm p-2 rounded mt-3">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
