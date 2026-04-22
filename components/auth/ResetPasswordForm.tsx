"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ApiResponse, parseJsonResponse } from "@/lib/api";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!]).{8,}$/;

const OTP_RESEND_SECONDS = 60;

export default function ResetPasswordForm() {
  const apiBaseUrl = getApiBaseUrl();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialEmail = useMemo(() => searchParams.get("email") || "", [searchParams]);

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((value) => Math.max(0, value - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const isPasswordValid = strongPasswordRegex.test(newPassword);
  const isConfirmMatch = confirmPassword.length > 0 && confirmPassword === newPassword;
  const canReset = otp.trim().length > 0 && isPasswordValid && isConfirmMatch && !resetting;

  const normalizeResetError = (message?: string): string => {
    const normalized = String(message || "").toLowerCase();

    if (normalized.includes("invalid") || normalized.includes("expired")) {
      return "Invalid or expired code";
    }

    if (normalized.includes("password") && normalized.includes("special")) {
      return "Password must meet requirements";
    }

    if (normalized.includes("password") && normalized.includes("match")) {
      return "Passwords do not match";
    }

    if (normalized.includes("required") && normalized.includes("otp")) {
      return "Please enter OTP";
    }

    return message || "Unable to reset password right now.";
  };

  const handleSendCode = async () => {
    if (sendingCode || countdown > 0) return;

    setError(null);
    setInfo(null);

    if (!apiBaseUrl) {
      setError("API URL is not configured. Please contact support.");
      return;
    }

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setSendingCode(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/vendor/request-password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await parseJsonResponse<ApiResponse>(res);
      if (!res.ok) {
        throw new Error(data?.message || "Unable to send code right now.");
      }

      if (!data?.success) {
        throw new Error(data?.message || "Unable to send code right now.");
      }

      setInfo("Code sent to your email");
      setCountdown(OTP_RESEND_SECONDS);
      setStep(2);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to send code right now.",
      );
    } finally {
      setSendingCode(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (resetting) return;

    setError(null);
    setInfo(null);

    if (!otp.trim()) {
      setError("Please enter OTP");
      return;
    }

    if (!strongPasswordRegex.test(newPassword)) {
      setError("Password must meet requirements");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setResetting(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/vendor/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
          newPassword,
          confirmPassword,
        }),
      });

      const data = await parseJsonResponse<ApiResponse>(res);
      if (!res.ok || !data?.success) {
        throw new Error(normalizeResetError(data?.message));
      }

      router.push(
        `/auth/login?notice=${encodeURIComponent("Password reset successful. Please login.")}`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? normalizeResetError(err.message)
          : "Unable to reset password right now.",
      );
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="grid place-items-center h-screen px-4">
      <div className="shadow-lg rounded-lg border-t-4 p-6 border-green-500 w-full max-w-[460px]">
        <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
        {step === 1 ? (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Enter your registered vendor email to receive a reset code.
            </p>

            <div className="flex flex-col gap-3">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Registered vendor email"
                className="border border-gray-200 py-2 px-4 bg-zinc-100/40 rounded"
              />

              <button
                type="button"
                onClick={handleSendCode}
                disabled={sendingCode || countdown > 0}
                className={`px-3 py-2 rounded text-white font-semibold ${
                  sendingCode || countdown > 0
                    ? "bg-blue-400"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {sendingCode
                  ? "Sending..."
                  : countdown > 0
                    ? `Send Code (${countdown}s)`
                    : "Send Code"}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">Code sent to your email</p>

            <form onSubmit={handleResetPassword} className="flex flex-col gap-3">
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                type="text"
                maxLength={6}
                placeholder="Enter OTP"
                className="border border-gray-200 py-2 px-4 bg-zinc-100/40 rounded"
              />

              <div className="relative">
                <input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  type={showNewPassword ? "text" : "password"}
                  placeholder="New password"
                  className="border border-gray-200 py-2 px-4 pr-20 bg-zinc-100/40 rounded w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((value) => !value)}
                  aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-blue-600"
                >
                  {showNewPassword ? "Hide" : "Show"}
                </button>
              </div>

              <p className="text-xs text-gray-600">
                Password must be at least 8 characters and include uppercase, lowercase, number, and one special character (@#$%^&*!).
              </p>

              <div className="relative">
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  className="border border-gray-200 py-2 px-4 pr-20 bg-zinc-100/40 rounded w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-blue-600"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>

              <button
                type="button"
                onClick={handleSendCode}
                disabled={sendingCode || countdown > 0}
                className={`px-3 py-2 rounded text-white font-semibold ${
                  sendingCode || countdown > 0
                    ? "bg-blue-400"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {sendingCode
                  ? "Sending..."
                  : countdown > 0
                    ? `Send Code (${countdown}s)`
                    : "Send Code"}
              </button>

              <button
                type="submit"
                disabled={!canReset}
                className={`bg-green-500 text-white font-bold px-6 py-2 rounded transition ${
                  canReset ? "hover:bg-green-600" : "opacity-60 cursor-not-allowed"
                }`}
              >
                {resetting ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        )}

        {info && <div className="bg-blue-500 text-white text-sm py-2 px-3 rounded-md mt-3">{info}</div>}

        {error && (
          <div className="bg-red-500 text-white text-sm py-2 px-3 rounded-md mt-3">{error}</div>
        )}
      </div>
    </div>
  );
}
