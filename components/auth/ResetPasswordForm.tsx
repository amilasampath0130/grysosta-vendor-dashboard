"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ApiResponse, parseJsonResponse } from "@/lib/api";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!]).{8,}$/;

const strongPasswordError =
  "Password must be at least 8 characters and include uppercase, lowercase, number, and one special character (@#$%^&*!).";

export default function ResetPasswordForm() {
  const apiBaseUrl = getApiBaseUrl();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialEmail = useMemo(() => searchParams.get("email") || "", [searchParams]);

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSendCode = async () => {
    if (sendingCode) return;

    setError(null);
    setInfo(null);

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
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to send reset code.");
      }

      setInfo("Reset code sent to your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset code.");
    } finally {
      setSendingCode(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (resetting) return;

    setError(null);
    setInfo(null);

    if (!email.trim() || !otp.trim() || !newPassword || !confirmPassword) {
      setError("Email, OTP, new password, and confirm password are required.");
      return;
    }

    if (!strongPasswordRegex.test(newPassword)) {
      setError(strongPasswordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
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
        throw new Error(data?.message || "Failed to reset password.");
      }

      router.push(
        `/auth/login?notice=${encodeURIComponent("Password reset successful. Please login.")}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="grid place-items-center h-screen px-4">
      <div className="shadow-lg rounded-lg border-t-4 p-6 border-green-500 w-full max-w-[460px]">
        <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
        <p className="text-sm text-gray-600 mb-4">
          Enter your vendor email, request a code, then set a new password.
        </p>

        <form onSubmit={handleResetPassword} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Registered vendor email"
              className="border border-gray-200 py-2 px-4 bg-zinc-100/40 rounded flex-1"
            />
            <button
              type="button"
              onClick={handleSendCode}
              disabled={sendingCode}
              className={`px-3 py-2 rounded text-white font-semibold ${
                sendingCode ? "bg-blue-400" : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {sendingCode ? "Sending..." : "Send Code"}
            </button>
          </div>

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
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-blue-600"
            >
              {showNewPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="relative">
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              className="border border-gray-200 py-2 px-4 pr-20 bg-zinc-100/40 rounded w-full"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-blue-600"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            disabled={resetting}
            className={`bg-green-500 text-white font-bold px-6 py-2 rounded transition ${
              resetting ? "opacity-60 cursor-not-allowed" : "hover:bg-green-600"
            }`}
          >
            {resetting ? "Resetting..." : "Reset Password"}
          </button>

          {info && <div className="bg-blue-500 text-white text-sm py-2 px-3 rounded-md">{info}</div>}

          {error && (
            <div className="bg-red-500 text-white text-sm py-2 px-3 rounded-md">{error}</div>
          )}
        </form>
      </div>
    </div>
  );
}
