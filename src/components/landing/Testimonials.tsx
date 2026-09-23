import { Star, Quote } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { demoTestimonials } from "@/lib/demo-data";

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="bg-background dark:bg-navy/40 py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold text-charcoal dark:text-white sm:text-4xl">
            Students are seeing real results
          </h2>
          <p className="mt-4 text-base text-slate">
            Real feedback from students who found the right mentor.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {demoTestimonials.map((t) => (
            <Card key={t.id} className="relative">
              <Quote className="h-7 w-7 text-indigo/15" />
              <p className="mt-3 text-sm leading-relaxed text-charcoal dark:text-white/90">
                "{t.quote}"
              </p>
              <div className="mt-5 flex items-center gap-3">
                <Avatar initials={t.avatarInitials} colorClass={t.avatarColor} />
                <div>
                  <p className="font-heading text-sm font-semibold text-charcoal dark:text-white">
                    {t.name}
                  </p>
                  <p className="text-xs text-slate">{t.role}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < t.rating
                        ? "fill-gold text-gold"
                        : "text-slate-border"
                    }`}
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}