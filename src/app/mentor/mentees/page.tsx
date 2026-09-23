import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function MenteesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const mentorProfile = await prisma.mentorProfile.findUnique({
    where: { userId: session.user.id },
  });

  const mentees = mentorProfile
    ? await prisma.mentorshipRequest.findMany({
        where: { mentorId: mentorProfile.id, status: "ACCEPTED" },
        include: {
          student: { include: { user: true } },
          goals: true,
        },
      })
    : [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-white">
          My mentees
        </h1>
        <p className="mt-1 text-sm text-slate">
          Students you're actively mentoring.
        </p>
      </div>

      {mentees.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No mentees yet"
          description="Once you accept a mentorship request, the student will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {mentees.map((m) => (
            <Card key={m.id}>
              <div className="flex items-center gap-3">
                <Avatar
                  initials={m.student.user.avatarInitials}
                  colorClass={m.student.user.avatarColor}
                  size="lg"
                />
                <div>
                  <p className="font-heading text-sm font-semibold text-charcoal dark:text-white">
                    {m.student.user.name}
                  </p>
                  <p className="text-xs text-slate">
                    {m.student.department} · {m.student.yearOfStudy}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="info">{m.goals.length} active goals</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
