import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!studentProfile) return NextResponse.json([]);

  const requests = await prisma.mentorshipRequest.findMany({
    where: { studentId: studentProfile.id },
    include: {
      mentor: { include: { user: true } },
      sessions: { orderBy: { scheduledAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(requests);
}
