"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!res) {
        setError("No response from server");
        return;
      }

      if (res.error) {
        setError("Invalid credentials");
        return;
      }
      router.replace("dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setError("Something went wrong");
    }
  };

  return (
    <div className="grid place-items-center h-screen">
      <div className="shadow-lg rounded-lg border-t-4 p-5 border-green-400">
        <h1 className="text-xl font-bold my-4">Login.</h1>
        <form onSubmit={handleSubmit} action="" className="flex flex-col gap-3">
          <input
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            className="w-[400] border border-gray-200 py-2 px-6 bg-zinc-100/40"
          />
          <input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="w-[400] border border-gray-200 py-2 px-6 bg-zinc-100/40"
          />
          <button className="bg-green-500 text-white font-bold cursor-pointer px-6 py-2 ">
            Login
          </button>
          {error && (
            <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
              {error}
            </div>
          )}
          <Link href={"/register"} className="text-sm mt-3 text-right">
            Don't have an account? <span className="underline">Register</span>
          </Link>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
