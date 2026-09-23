"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | undefined>();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    setError(undefined);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
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
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-slate">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        <div className="mt-8 rounded-xl2 border border-slate-border dark:border-white/10 bg-surface dark:bg-navy-light p-6 shadow-card sm:p-8">
          {submitted ? (
            <div className="flex flex-col items-center py-4 text-center animate-fade-in">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal/10">
                <CheckCircle2 className="h-6 w-6 text-teal-dark" />
              </div>
              <h2 className="mt-4 font-heading text-base font-semibold text-charcoal dark:text-white">
                Check your inbox
              </h2>
              <p className="mt-2 text-sm text-slate">
                If an account exists for that email, a reset link is on its
                way.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <Input
                name="email"
                type="email"
                label="Email address"
                placeholder="you@university.edu"
                icon={<Mail className="h-4 w-4" />}
                error={error}
                autoComplete="email"
              />
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Send reset link
              </Button>
            </form>
          )}
        </div>

        <Link
          href="/login"
          className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-indigo hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to log in
        </Link>
      </div>
    </main>
  );
}