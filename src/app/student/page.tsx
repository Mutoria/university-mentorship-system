import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CalendarClock, Target, Users, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function StudentDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!studentProfile) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={Users}
          title="Profile not found"
          description="We couldn't find a student profile for this account."
        />
      </div>
    );
  }

  const [acceptedRequests, upcomingSessions, activeGoals] = await Promise.all([
    prisma.mentorshipRequest.findMany({
      where: { studentId: studentProfile.id, status: "ACCEPTED" },
      include: { mentor: { include: { user: true } } },
    }),
    prisma.mentorshipSession.findMany({
      where: {
        request: { studentId: studentProfile.id },
        status: "SCHEDULED",
      },
      include: { request: { include: { mentor: { include: { user: true } } } } },
      orderBy: { scheduledAt: "asc" },
      take: 3,
    }),
    prisma.goal.findMany({
      where: { studentId: studentProfile.id, completed: false },
      include: { progressUpdates: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const stats = [
    { label: "Active Mentors", value: acceptedRequests.length, icon: Users },
    { label: "Upcoming Sessions", value: upcomingSessions.length, icon: CalendarClock },
    { label: "Goals in Progress", value: activeGoals.length, icon: Target },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-white">
          Welcome back, {session.user.name?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-slate">
          Here's what's happening with your mentorship journey.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
            Upcoming sessions
          </h2>
          <Link href="/student/mentors" className="text-sm font-medium text-indigo hover:underline">
            Find a mentor
          </Link>
        </div>

        {upcomingSessions.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={CalendarClock}
              title="No upcoming sessions"
              description="Once a mentor accepts your request, you can book sessions together."
              action={
                <Link href="/student/mentors">
                  <Button size="sm">
                    Browse mentors
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {upcomingSessions.map((s) => (
              <Card key={s.id}>
                <div className="flex items-center gap-3">
                  <Avatar
                    initials={s.request.mentor.user.avatarInitials}
                    colorClass={s.request.mentor.user.avatarColor}
                  />
                  <div>
                    <p className="font-heading text-sm font-semibold text-charcoal dark:text-white">
                      {s.request.mentor.user.name}
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

      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-charcoal dark:text-white">
            Active goals
          </h2>
          <Link href="/student/goals" className="text-sm font-medium text-indigo hover:underline">
            View all goals
          </Link>
        </div>

        {activeGoals.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={Target}
              title="No goals yet"
              description="Set a goal with your mentor to start tracking progress."
            />
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {activeGoals.map((goal) => {
              const latest = goal.progressUpdates[goal.progressUpdates.length - 1];
              const pct = latest?.percentage ?? 0;
              return (
                <Card key={goal.id}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-sm font-semibold text-charcoal dark:text-white">
                      {goal.title}
                    </h3>
                    <Badge variant="info">{pct}%</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate">{goal.description}</p>
                  <div className="mt-3 h-2 w-full rounded-full bg-slate-border dark:bg-white/10">
                    <div
                      className="h-2 rounded-full bg-teal transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
