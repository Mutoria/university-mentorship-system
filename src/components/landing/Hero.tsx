import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { demoMentors } from "@/lib/demo-data";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-surface dark:from-navy dark:to-navy-light">
      <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-indigo/10 blur-3xl" />
      <div className="absolute top-40 -left-24 h-72 w-72 rounded-full bg-teal/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo/20 bg-indigo/5 px-3.5 py-1.5 text-xs font-semibold text-indigo">
            <Sparkles className="h-3.5 w-3.5" />
            Official university mentorship program
          </div>

          <h1 className="mt-6 font-heading text-4xl font-extrabold leading-tight tracking-tight text-charcoal dark:text-white sm:text-5xl lg:text-[3.25rem]">
            Find the mentor who gets you where you're going.
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-slate sm:text-lg">
            Connect with faculty, alumni, and senior students for real
            guidance — on your career, your coursework, and everything in
            between. Book sessions, track goals, and grow with someone in
            your corner.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/role-selection">
              <Button size="lg" className="w-full sm:w-auto">
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                See how it works
              </Button>
            </a>
          </div>

          <div className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-3">
              {demoMentors.slice(0, 4).map((m) => (
                <Avatar
                  key={m.id}
                  initials={m.avatarInitials}
                  colorClass={m.avatarColor}
                  size="sm"
                  ring
                />
              ))}
            </div>
            <p className="text-sm text-slate">
              <span className="font-semibold text-charcoal dark:text-white">
                180+ mentors
              </span>{" "}
              already helping students like you
            </p>
          </div>
        </div>

        <div className="relative animate-fade-in [animation-delay:150ms]">
          <div className="rounded-xl2 border border-slate-border dark:border-white/10 bg-surface dark:bg-navy-light p-6 shadow-card-hover">
            <div className="flex items-center justify-between">
              <p className="font-heading text-sm font-semibold text-charcoal dark:text-white">
                Upcoming session
              </p>
              <span className="rounded-full bg-teal/10 px-2.5 py-1 text-xs font-semibold text-teal-dark">
                Confirmed
              </span>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Avatar initials="AN" colorClass="bg-indigo" size="lg" />
              <div>
                <p className="font-heading text-sm font-semibold text-charcoal dark:text-white">
                  Dr. Amara Njeri
                </p>
                <p className="text-xs text-slate">Career strategy session</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-background dark:bg-navy px-3 py-2.5">
                <p className="text-[11px] text-slate">Date</p>
                <p className="text-sm font-medium text-charcoal dark:text-white">
                  Thu, Oct 2
                </p>
              </div>
              <div className="rounded-lg bg-background dark:bg-navy px-3 py-2.5">
                <p className="text-[11px] text-slate">Time</p>
                <p className="text-sm font-medium text-charcoal dark:text-white">
                  3:00 PM
                </p>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-6 -left-6 hidden rounded-xl2 border border-slate-border dark:border-white/10 bg-surface dark:bg-navy-light p-4 shadow-card sm:block">
            <p className="font-heading text-2xl font-bold text-teal-dark">94%</p>
            <p className="text-xs text-slate">Goal completion rate</p>
          </div>
        </div>
      </div>
    </section>
  );
}