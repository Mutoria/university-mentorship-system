import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    totalUsers,
    totalStudents,
    totalMentors,
    activeMentors,
    pendingVerifications,
    completedSessions,
    requestsByStatus,
    reviews,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "MENTOR" } }),
    prisma.mentorProfile.count({ where: { verified: true } }),
    prisma.mentorProfile.count({ where: { verified: false } }),
    prisma.mentorshipSession.count({ where: { status: "COMPLETED" } }),
    prisma.mentorshipRequest.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.review.findMany(),
  ]);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const requestStatusCounts = {
    PENDING: 0,
    ACCEPTED: 0,
    DECLINED: 0,
    COMPLETED: 0,
  };
  requestsByStatus.forEach((r) => {
    requestStatusCounts[r.status] = r._count.status;
  });

  const monthlyActivity = await prisma.mentorshipSession.findMany({
    select: { scheduledAt: true },
  });

  const activityByMonth: Record<string, number> = {};
  monthlyActivity.forEach((s) => {
    const key = new Date(s.scheduledAt).toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
    });
    activityByMonth[key] = (activityByMonth[key] ?? 0) + 1;
  });

  return NextResponse.json({
    totalUsers,
    totalStudents,
    totalMentors,
    activeMentors,
    pendingVerifications,
    completedSessions,
    avgRating: Math.round(avgRating * 10) / 10,
    requestStatusCounts,
    activityByMonth,
  });
}
