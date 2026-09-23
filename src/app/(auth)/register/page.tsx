"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { GraduationCap, User, Mail, Lock } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

function RegisterForm() {
  const params = useSearchParams();
  const { showToast } = useToast();
  const defaultRole = params.get("role") ?? "student";
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "");
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const nextErrors: Record<string, string> = {};

    if (name.trim().length < 2) nextErrors.name = "Enter your full name";
    if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = "Enter a valid email address";
    if (password.length < 6)
      nextErrors.password = "Password must be at least 6 characters";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showToast(
        "Account creation connects to the database on Day 2 — this is UI-only for now.",
        "success"
      );
    }, 900);
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
            Create your account
          </h1>
          <p className="mt-2 text-sm text-slate">
            Join as a {defaultRole} in under a minute.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-8 space-y-4 rounded-xl2 border border-slate-border dark:border-white/10 bg-surface dark:bg-navy-light p-6 shadow-card sm:p-8"
        >
          <Input
            name="name"
            label="Full name"
            placeholder="Jane Wanjiku"
            icon={<User className="h-4 w-4" />}
            error={errors.name}
            autoComplete="name"
          />
          <Input
            name="email"
            type="email"
            label="Email address"
            placeholder="you@university.edu"
            icon={<Mail className="h-4 w-4" />}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            name="password"
            type="password"
            label="Password"
            placeholder="At least 6 characters"
            icon={<Lock className="h-4 w-4" />}
            error={errors.password}
            autoComplete="new-password"
          />
          <Select
            name="role"
            label="I am joining as a"
            defaultValue={defaultRole}
            options={[
              { label: "Student", value: "student" },
              { label: "Mentor", value: "mentor" },
              { label: "Administrator", value: "admin" },
            ]}
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Create account
          </Button>

          <p className="text-center text-xs text-slate">
            By signing up you agree to the Terms of Use and Privacy Policy.
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-slate">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-indigo hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}