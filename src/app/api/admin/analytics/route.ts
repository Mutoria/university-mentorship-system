import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [mentors, sessionGroups, requests, users] = await Promise.all([
    prisma.mentorProfile.findMany({ include: { user: true, reviews: true } }),
    prisma.mentorshipSession.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.mentorshipRequest.findMany({ select: { createdAt: true } }),
    prisma.user.findMany({ select: { createdAt: true } }),
  ]);

  const mentorRatings = mentors
    .map((m) => {
      const count = m.reviews.length;
      const avg = count
        ? m.reviews.reduce((sum, r) => sum + r.rating, 0) / count
        : 0;
      return {
        name: m.user.name,
        rating: Math.round(avg * 10) / 10,
        reviews: count,
        sessions: m.sessionsCompleted,
        verified: m.verified,
      };
    })
    .sort((a, b) => b.rating - a.rating);

  const sessionsByStatus = { SCHEDULED: 0, COMPLETED: 0, CANCELLED: 0 };
  sessionGroups.forEach((g) => {
    sessionsByStatus[g.status] = g._count.status;
  });

  const buckets: Record<string, { requests: number; signups: number }> = {};
  requests.forEach((r) => {
    const k = monthKey(new Date(r.createdAt));
    buckets[k] = buckets[k] ?? { requests: 0, signups: 0 };
    buckets[k].requests += 1;
  });
  users.forEach((u) => {
    const k = monthKey(new Date(u.createdAt));
    buckets[k] = buckets[k] ?? { requests: 0, signups: 0 };
    buckets[k].signups += 1;
  });

  const monthly = Object.keys(buckets)
    .sort()
    .map((k) => ({ month: monthLabel(k), ...buckets[k] }));

  return NextResponse.json({ mentorRatings, sessionsByStatus, monthly });
}
