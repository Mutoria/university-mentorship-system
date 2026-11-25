import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { scoreApplicant } from "@/lib/matching";

export async function GET() {
  const session = await auth();
  if (!session?.user || !["COMPANY", "MENTOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apps = await prisma.application.findMany({
    where: { opportunity: { posterId: session.user.id } },
    include: {
      opportunity: { select: { id: true, title: true, requiredSkills: true } },
      student: {
        include: {
          user: { select: { name: true, email: true } },
          cv: true,
          portfolio: { select: { id: true, title: true } },
        },
      },
    },
    orderBy: [{ matchScore: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(
    apps.map((a) => {
      const skills =
        a.student.cv && a.student.cv.skills.length > 0
          ? a.student.cv.skills
          : a.student.interests;
      const { matched, missing } = scoreApplicant(
        a.opportunity.requiredSkills,
        skills,
        0,
        0
      );
      return {
        id: a.id,
        status: a.status,
        matchScore: a.matchScore,
        coverNote: a.coverNote,
        jobId: a.opportunity.id,
        jobTitle: a.opportunity.title,
        studentName: a.student.user.name,
        email: a.student.user.email,
        department: a.student.department,
        yearOfStudy: a.student.yearOfStudy,
        headline: a.student.cv?.headline ?? "",
        matched,
        missing,
        projects: a.student.portfolio.map((p) => p.title),
      };
    })
  );
}
