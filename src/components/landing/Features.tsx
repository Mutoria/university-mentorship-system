import {
  Users,
  CalendarCheck,
  MessageSquare,
  Target,
  ShieldCheck,
  BarChart3,
} from "lucide-react";
import { Card } from "@/components/ui/Card";

const features = [
  {
    icon: Users,
    title: "Smart mentor matching",
    description:
      "Filter by department, expertise, and availability to find mentors who actually fit what you need.",
    color: "text-indigo bg-indigo/10",
  },
  {
    icon: CalendarCheck,
    title: "Effortless scheduling",
    description:
      "Book sessions around real mentor availability, with reminders so nothing slips through the cracks.",
    color: "text-teal-dark bg-teal/10",
  },
  {
    icon: MessageSquare,
    title: "Built-in messaging",
    description:
      "Stay in touch between sessions with a private thread for every mentorship relationship.",
    color: "text-indigo bg-indigo/10",
  },
  {
    icon: Target,
    title: "Goals & progress tracking",
    description:
      "Set clear goals with your mentor and track real progress, not just good intentions.",
    color: "text-gold bg-gold/10",
  },
  {
    icon: ShieldCheck,
    title: "Verified mentors",
    description:
      "Every mentor goes through university verification before they can accept students.",
    color: "text-teal-dark bg-teal/10",
  },
  {
    icon: BarChart3,
    title: "Real impact reporting",
    description:
      "Administrators get clear analytics on engagement, completion, and satisfaction.",
    color: "text-indigo bg-indigo/10",
  },
];

export function Features() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-heading text-3xl font-bold text-charcoal dark:text-white sm:text-4xl">
          Everything a mentorship program needs
        </h2>
        <p className="mt-4 text-base text-slate">
          Designed for students, mentors, and administrators — in one clean,
          connected system.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} hoverable>
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${feature.color}`}
            >
              <feature.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-heading text-base font-semibold text-charcoal dark:text-white">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate">
              {feature.description}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}