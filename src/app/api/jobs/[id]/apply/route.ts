import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { scoreApplicant } from "@/lib/matching";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const coverNote = String(body?.coverNote ?? "").trim().slice(0, 1000);

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: { cv: true, portfolio: { select: { id: true } } },
  });
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const skills =
    profile.cv && profile.cv.skills.length > 0 ? profile.cv.skills : profile.interests;
  if (skills.length === 0) {
    return NextResponse.json(
      { error: "Add your skills on the My CV page before applying" },
      { status: 400 }
    );
  }

  const job = await prisma.opportunity.findFirst({
    where: {
      id,
      type: "JOB",
      active: true,
      deadline: { gt: new Date() },
      poster: { companyProfile: { is: { verified: true } } },
    },
  });
  if (!job) {
    return NextResponse.json(
      { error: "This job is no longer available" },
      { status: 404 }
    );
  }

  const existing = await prisma.application.findUnique({
    where: { opportunityId_studentId: { opportunityId: id, studentId: profile.id } },
  });
  if (existing) {
    return NextResponse.json(
      { error: "You have already applied for this job" },
      { status: 409 }
    );
  }

  const experienceCount = Array.isArray(profile.cv?.experience)
    ? profile.cv.experience.length
    : 0;
  const { score } = scoreApplicant(
    job.requiredSkills,
    skills,
    profile.portfolio.length,
    experienceCount
  );

  const application = await prisma.application.create({
    data: {
      opportunityId: id,
      studentId: profile.id,
      matchScore: score,
      coverNote,
      status: "UNDER_VERIFICATION",
    },
  });

  await prisma.notification.create({
    data: {
      userId: job.posterId,
      title: "New application",
      message: `${session.user.name} applied for ${job.title}.`,
    },
  });

  return NextResponse.json(application);
}
