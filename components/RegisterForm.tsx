"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const RegisterForm = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }
    try {
      const resUserExists = await fetch("/api/userExists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!resUserExists.ok) throw new Error("Failed to check user");

      const { user }: { user?: any } = await resUserExists.json();
      if (user) {
        setError("User already exists.");
      }

      const res = await fetch("api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });
      if (res.ok) {
        router.push("/");
      } else {
        console.log("User registration failed.");
      }
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        console.log("User registration failed", data);
      }
    } catch (error) {
      console.log("Error during registration: ", error);
    }
  };
  return (
    <div className="grid place-items-center h-screen">
      <div className="shadow-lg rounded-lg border-t-4 p-5 border-green-400">
        <h1 className="text-xl font-bold my-4">Register.</h1>
        <form action="" className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <input
            type="text"
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder="Enter your Name"
            className="w-[400px] border border-gray-200 py-2 px-6 bg-zinc-100/40"
          />
          <input
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            type="email"
            placeholder="Enter your Email"
            className="w-[400px] border border-gray-200 py-2 px-6 bg-zinc-100/40"
          />
          <input
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            type="password"
            placeholder="Enter your Password"
            className="w-[400px] border border-gray-200 py-2 px-6 bg-zinc-100/40"
          />
          <button className="bg-green-500 text-white font-bold cursor-pointer px-6 py-2 ">
            Register
          </button>
          {error && (
            <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
              {error}
            </div>
          )}
          <Link href={"/"} className="text-sm mt-3 text-right">
            Already have an account? <span className="underline">Login</span>
          </Link>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
