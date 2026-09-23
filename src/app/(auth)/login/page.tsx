"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { GraduationCap, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const nextErrors: typeof errors = {};

    if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = "Enter a valid email address";
    if (password.length < 6)
      nextErrors.password = "Password must be at least 6 characters";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (!result || result.error) {
      showToast("Invalid email or password. Please try again.", "error");
      return;
    }

    showToast("Welcome back!", "success");

    // Fetch the session to know which role dashboard to send them to
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    const role = session?.user?.role;

    if (role === "ADMIN") router.push("/admin");
    else if (role === "MENTOR") router.push("/mentor");
    else router.push("/student");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background dark:bg-navy px-4 py-16">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-heading text-base font-bold text-charcoal dark:text-white">
              MentorHub
            </span>
          </Link>
          <h1 className="mt-6 font-heading text-2xl font-bold text-charcoal dark:text-white">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate">
            Log in to continue your mentorship journey.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-8 space-y-4 rounded-xl2 border border-slate-border dark:border-white/10 bg-surface dark:bg-navy-light p-6 shadow-card sm:p-8"
        >
          <Input
            name="email"
            type="email"
            label="Email address"
            placeholder="you@university.edu"
            icon={<Mail className="h-4 w-4" />}
            error={errors.email}
            autoComplete="email"
          />

          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="••••••••"
              icon={<Lock className="h-4 w-4" />}
              error={errors.password}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-[38px] text-slate hover:text-charcoal dark:hover:text-white"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-border text-indigo focus:ring-indigo"
              />
              Remember me
            </label>
            <Link
              href="/forgot-password"
              className="font-medium text-indigo hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Log in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate">
          Don't have an account?{" "}
          <Link
            href="/role-selection"
            className="font-medium text-indigo hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}