import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { scoreApplicant } from "@/lib/matching";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: { cv: true, portfolio: { select: { id: true } } },
  });
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const skills =
    profile.cv && profile.cv.skills.length > 0 ? profile.cv.skills : profile.interests;
  const experienceCount = Array.isArray(profile.cv?.experience)
    ? profile.cv.experience.length
    : 0;

  const openings = await prisma.opportunity.findMany({
    where: {
      type: "MENTORSHIP",
      active: true,
      deadline: { gt: new Date() },
      poster: { mentorProfile: { is: { verified: true } } },
    },
    include: {
      poster: { select: { name: true, mentorProfile: { select: { title: true } } } },
      applications: { where: { studentId: profile.id }, select: { status: true } },
    },
    orderBy: { deadline: "asc" },
  });

  return NextResponse.json(
    openings.map((o) => {
      const { score, matched, missing } = scoreApplicant(
        o.requiredSkills,
        skills,
        profile.portfolio.length,
        experienceCount
      );
      return {
        id: o.id,
        title: o.title,
        description: o.description,
        mentorName: o.poster.name,
        mentorTitle: o.poster.mentorProfile?.title ?? "",
        deadline: o.deadline,
        requiredSkills: o.requiredSkills,
        matchScore: score,
        matchedSkills: matched,
        missingSkills: missing,
        myStatus: o.applications[0]?.status ?? null,
      };
    })
  );
}
