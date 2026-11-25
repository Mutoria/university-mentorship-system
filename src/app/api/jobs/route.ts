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

  const jobs = await prisma.opportunity.findMany({
    where: {
      type: "JOB",
      active: true,
      deadline: { gt: new Date() },
      poster: { companyProfile: { is: { verified: true } } },
    },
    include: {
      poster: { select: { companyProfile: { select: { companyName: true } } } },
      applications: {
        where: { studentId: profile.id },
        select: { status: true },
      },
    },
    orderBy: { deadline: "asc" },
  });

  return NextResponse.json(
    jobs.map((j) => {
      const { score, matched, missing } = scoreApplicant(
        j.requiredSkills,
        skills,
        profile.portfolio.length,
        experienceCount
      );
      return {
        id: j.id,
        title: j.title,
        description: j.description,
        companyName: j.poster.companyProfile?.companyName ?? "Company",
        employmentType: j.employmentType,
        location: j.location,
        deadline: j.deadline,
        requiredSkills: j.requiredSkills,
        matchScore: score,
        matchedSkills: matched,
        missingSkills: missing,
        myStatus: j.applications[0]?.status ?? null,
      };
    })
  );
}
