import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, Send, CalendarClock, Star, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function MentorDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const mentorProfile = await prisma.mentorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!mentorProfile) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={Users}
          title="Profile not found"
          description="We couldn't find a mentor profile for this account."
        />
      </div>
    );
  }

  const [pendingRequests, activeMentees, upcomingSessions, reviews] =
    await Promise.all([
      prisma.mentorshipRequest.findMany({
        where: { mentorId: mentorProfile.id, status: "PENDING" },
        include: { student: { include: { user: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.mentorshipRequest.findMany({
        where: { mentorId: mentorProfile.id, status: "ACCEPTED" },
        include: { student: { include: { user: true } } },
      }),
      prisma.mentorshipSession.findMany({
        where: {
          request: { mentorId: mentorProfile.id },
          status: "SCHEDULED",
        },
        include: { request: { include: { student: { include: { user: true } } } } },
        orderBy: { scheduledAt: "asc" },
        take: 3,
      }),
      prisma.review.findMany({ where: { mentorId: mentorProfile.id } }),
    ]);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "—";

  const stats = [
    { label: "Active Mentees", value: activeMentees.length, icon: Users },
    { label: "Pending Requests", value: pendingRequests.length, icon: Send },
    { label: "Upcoming Sessions", value: upcomingSessions.length, icon: CalendarClock },
    { label: "Average Rating", value: avgRating, icon: Star },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-white">
          Welcome back, {session.user.name?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-slate">
          Here's an overview of your mentorship activity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate">{stat.label}</p>
                <p className="mt-1 font-heading text-2xl font-bold text-charcoal dark:text-white">
                  {stat.value}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo/10 text-indigo">
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-charcoal dark:text-white">
            Pending requests
          </h2>
          <Link href="/mentor/requests" className="text-sm font-medium text-indigo hover:underline">
            View all
          </Link>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={Send}
              title="No pending requests"
              description="New mentorship requests from students will show up here."
            />
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {pendingRequests.slice(0, 4).map((req) => (
              <Card key={req.id}>
                <div className="flex items-center gap-3">
                  <Avatar
                    initials={req.student.user.avatarInitials}
                    colorClass={req.student.user.avatarColor}
                  />
                  <div className="flex-1">
                    <p className="font-heading text-sm font-semibold text-charcoal dark:text-white">
                      {req.student.user.name}
                    </p>
                    <p className="text-xs text-slate">{req.student.department}</p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-slate">{req.message}</p>
                <Link href="/mentor/requests">
                  <Button size="sm" variant="outline" className="mt-3 w-full">
                    Review request
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-heading text-lg font-semibold text-charcoal dark:text-white">
          Upcoming sessions
        </h2>
        {upcomingSessions.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={CalendarClock}
              title="No upcoming sessions"
              description="Sessions you schedule with mentees will appear here."
            />
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {upcomingSessions.map((s) => (
              <Card key={s.id}>
                <div className="flex items-center gap-3">
                  <Avatar
                    initials={s.request.student.user.avatarInitials}
                    colorClass={s.request.student.user.avatarColor}
                  />
                  <div>
                    <p className="font-heading text-sm font-semibold text-charcoal dark:text-white">
                      {s.request.student.user.name}
                    </p>
                    <p className="text-xs text-slate">
                      {new Date(s.scheduledAt).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                      {" · "}
                      {new Date(s.scheduledAt).toLocaleTimeString(undefined, {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
