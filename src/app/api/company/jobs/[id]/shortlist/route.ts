import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { scoreApplicant, SHORTLIST_THRESHOLD } from "@/lib/matching";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !["COMPANY", "MENTOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const job = await prisma.opportunity.findFirst({
    where: { id, posterId: session.user.id },
  });
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const apps = await prisma.application.findMany({
    where: { opportunityId: id, status: "UNDER_VERIFICATION" },
    include: {
      student: { include: { cv: true, portfolio: { select: { id: true } } } },
    },
  });

  let shortlisted = 0;
  for (const a of apps) {
    const skills =
      a.student.cv && a.student.cv.skills.length > 0
        ? a.student.cv.skills
        : a.student.interests;
    const experienceCount = Array.isArray(a.student.cv?.experience)
      ? a.student.cv.experience.length
      : 0;
    const { score } = scoreApplicant(
      job.requiredSkills,
      skills,
      a.student.portfolio.length,
      experienceCount
    );
    const pass = score >= SHORTLIST_THRESHOLD;
    if (pass) shortlisted += 1;

    await prisma.application.update({
      where: { id: a.id },
      data: { matchScore: score, status: pass ? "SHORTLISTED" : "NOT_SELECTED" },
    });
    await prisma.notification.create({
      data: {
        userId: a.student.userId,
        title: pass ? "You have been shortlisted" : "Application update",
        message: pass
          ? `You were shortlisted for ${job.title}.`
          : `You were not selected for ${job.title}.`,
      },
    });
  }

  return NextResponse.json({ processed: apps.length, shortlisted });
}
