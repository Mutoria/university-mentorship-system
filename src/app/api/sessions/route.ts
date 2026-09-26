import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { requestId, scheduledAt, durationMins } = await request.json();

  const mentorshipRequest = await prisma.mentorshipRequest.findUnique({
    where: { id: requestId },
    include: { student: true },
  });

  if (!mentorshipRequest || mentorshipRequest.status !== "ACCEPTED") {
    return NextResponse.json(
      { error: "This mentorship is not active" },
      { status: 400 }
    );
  }

  const newSession = await prisma.mentorshipSession.create({
    data: {
      requestId,
      scheduledAt: new Date(scheduledAt),
      durationMins: Number(durationMins) || 30,
      status: "SCHEDULED",
    },
  });

  const mentorProfile = await prisma.mentorProfile.findUnique({
    where: { id: mentorshipRequest.mentorId },
  });

  if (mentorProfile) {
    await prisma.notification.create({
      data: {
        userId: mentorProfile.userId,
        title: "New session booked",
        message: `A session has been booked for ${new Date(
          scheduledAt
        ).toLocaleDateString()}.`,
      },
    });
  }

  return NextResponse.json(newSession);
}
