import { Star, BadgeCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { demoMentors } from "@/lib/demo-data";

export function FeaturedMentors() {
  return (
    <section id="mentors" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="font-heading text-3xl font-bold text-charcoal dark:text-white sm:text-4xl">
            Meet a few of our mentors
          </h2>
          <p className="mt-3 max-w-xl text-base text-slate">
            A small sample of the faculty, alumni, and peer mentors ready to
            support you.
          </p>
        </div>
        <Button variant="outline">Browse all mentors</Button>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {demoMentors.map((mentor) => (
          <Card key={mentor.id} hoverable className="flex flex-col">
            <div className="flex items-start justify-between">
              <Avatar
                initials={mentor.avatarInitials}
                colorClass={mentor.avatarColor}
                size="lg"
              />
              {mentor.verified && (
                <Badge variant="info">
                  <BadgeCheck className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>

            <h3 className="mt-4 font-heading text-base font-semibold text-charcoal dark:text-white">
              {mentor.name}
            </h3>
            <p className="text-xs text-slate">{mentor.title}</p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {mentor.expertise.slice(0, 2).map((skill) => (
                <Badge key={skill} variant="default">
                  {skill}
                </Badge>
              ))}
            </div>

            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate">
              {mentor.bio}
            </p>

            <div className="mt-4 flex items-center justify-between border-t border-slate-border dark:border-white/10 pt-4">
              <div className="flex items-center gap-1 text-sm font-medium text-charcoal dark:text-white">
                <Star className="h-4 w-4 fill-gold text-gold" />
                {mentor.rating}
                <span className="text-slate font-normal">
                  ({mentor.reviewCount})
                </span>
              </div>
              <Button size="sm" variant="ghost">
                View profile
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}