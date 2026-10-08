import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function overlap(a: string[], b: string[]) {
  const setB = new Set(b.map(normalize));
  return a.filter((item) => setB.has(normalize(item)));
}

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!studentProfile) {
    return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
  }

  const mentors = await prisma.mentorProfile.findMany({
    where: { verified: true },
    include: { user: true, reviews: true },
  });

  const results = mentors.map((m) => {
    const sharedInterests = overlap(studentProfile.interests, m.expertise);
    const interestScore = Math.min(sharedInterests.length * 25, 50);

    const sameDept =
      normalize(studentProfile.department).includes(normalize(m.department)) ||
      normalize(m.department).includes(normalize(studentProfile.department));
    const deptScore = sameDept ? 20 : 0;

    const avgRating =
      m.reviews.length > 0
        ? m.reviews.reduce((sum, r) => sum + r.rating, 0) / m.reviews.length
        : null;
    const ratingScore = avgRating !== null ? (avgRating / 5) * 20 : 10;

    const experienceScore = Math.min(m.sessionsCompleted / 50, 1) * 10;

    const score = Math.round(interestScore + deptScore + ratingScore + experienceScore);

    const reasons: string[] = [];
    if (sharedInterests.length > 0) {
      reasons.push(
        `Shares your interest in ${sharedInterests.slice(0, 3).join(", ")}`
      );
    }
    if (sameDept) {
      reasons.push(`Same department: ${m.department}`);
    }
    if (avgRating !== null && avgRating >= 4) {
      reasons.push(`Highly rated by past mentees (${avgRating.toFixed(1)}/5)`);
    }
    if (m.sessionsCompleted >= 50) {
      reasons.push(`Experienced mentor (${m.sessionsCompleted}+ sessions)`);
    }
    if (reasons.length === 0) {
      reasons.push("A new mentor worth exploring");
    }

    return {
      id: m.id,
      name: m.user.name,
      title: m.title,
      department: m.department,
      bio: m.bio,
      expertise: m.expertise,
      avatarInitials: m.user.avatarInitials,
      avatarColor: m.user.avatarColor,
      rating: avgRating ? Math.round(avgRating * 10) / 10 : 0,
      reviewCount: m.reviews.length,
      score: Math.min(score, 100),
      reasons,
    };
  });

  results.sort((a, b) => b.score - a.score);

  return NextResponse.json(results);
}
