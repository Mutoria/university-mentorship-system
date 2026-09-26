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
    where: { studentId: studentProfile.id, status: "ACCEPTED" },
    include: {
      mentor: {
        include: { user: true, availability: true },
      },
    },
  });

  const result = requests.map((r) => ({
    requestId: r.id,
    mentorName: r.mentor.user.name,
    availability: r.mentor.availability,
  }));

  return NextResponse.json(result);
}
