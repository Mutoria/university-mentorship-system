import { UserPlus, Search, CalendarClock, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Create your profile",
    description:
      "Sign up as a student or mentor and tell us about your goals, interests, or expertise.",
  },
  {
    icon: Search,
    title: "Find your match",
    description:
      "Browse verified mentors, filter by expertise, and send a mentorship request.",
  },
  {
    icon: CalendarClock,
    title: "Book sessions",
    description:
      "Once accepted, schedule sessions around your mentor's real availability.",
  },
  {
    icon: TrendingUp,
    title: "Track your growth",
    description:
      "Set goals together, log progress, and look back on how far you've come.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-background dark:bg-navy/40 py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold text-charcoal dark:text-white sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-base text-slate">
            From sign-up to your first breakthrough session — in four simple
            steps.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.title} className="relative text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo text-white shadow-soft">
                <step.icon className="h-6 w-6" />
              </div>
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full font-heading text-5xl font-extrabold text-indigo/10">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-5 font-heading text-base font-semibold text-charcoal dark:text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}