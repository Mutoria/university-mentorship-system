import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "MENTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mentorProfile = await prisma.mentorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!mentorProfile) {
    return NextResponse.json([], { status: 200 });
  }

  const requests = await prisma.mentorshipRequest.findMany({
    where: { mentorId: mentorProfile.id },
    include: { student: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(requests);
}
