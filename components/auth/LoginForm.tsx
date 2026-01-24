"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

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
        `${process.env.NEXT_PUBLIC_API_URL}/api/vendor/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        },
      );

      let data: any = null;

      try {
        data = await response.json();
      } catch {
        throw new Error("Invalid server response.");
      }

      if (!response.ok) {
        // Handle known HTTP errors
        if (response.status === 401) {
          throw new Error("Invalid email or password.");
        }
        if (response.status === 404) {
          throw new Error("Login service not found.");
        }
        if (response.status >= 500) {
          throw new Error("Server error. Please try again later.");
        }

        throw new Error(data?.message || "Login failed.");
      }

      if (!data?.success) {
        throw new Error(data?.message || "Login failed.");
      }

      // ✅ Success
      router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
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
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
