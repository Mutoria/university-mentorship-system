import Link from "next/link";
import { GraduationCap, Users, ShieldCheck, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";

const roles = [
  {
    role: "student",
    icon: GraduationCap,
    title: "I'm a Student",
    description:
      "Find a mentor, book sessions, track your goals, and grow with support.",
    color: "text-indigo bg-indigo/10",
  },
  {
    role: "mentor",
    icon: Users,
    title: "I'm a Mentor",
    description:
      "Share your experience, manage mentees, and make a real impact.",
    color: "text-teal-dark bg-teal/10",
  },
  {
    role: "admin",
    icon: ShieldCheck,
    title: "I'm an Administrator",
    description: "Manage the platform, verify mentors, and review analytics.",
    color: "text-gold bg-gold/10",
  },
];

export default function RoleSelectionPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background dark:bg-navy px-4 py-16">
      <div className="w-full max-w-4xl animate-fade-in">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-heading text-base font-bold text-charcoal dark:text-white">
              MentorHub
            </span>
          </Link>
          <h1 className="mt-6 font-heading text-3xl font-bold text-charcoal dark:text-white sm:text-4xl">
            How will you be joining us?
          </h1>
          <p className="mt-3 text-base text-slate">
            Choose your role to get a registration experience built for you.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {roles.map((r) => (
            <Link key={r.role} href={`/register?role=${r.role}`}>
              <Card hoverable className="h-full cursor-pointer">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${r.color}`}
                >
                  <r.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-heading text-base font-semibold text-charcoal dark:text-white">
                  {r.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate">
                  {r.description}
                </p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-indigo">
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-slate">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-indigo hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}