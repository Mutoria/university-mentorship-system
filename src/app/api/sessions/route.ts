import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { requestId, scheduledAt, durationMins } = await request.json();
  const when = new Date(scheduledAt);
  if (isNaN(when.getTime()) || when.getTime() < Date.now()) {
    return NextResponse.json({ error: "Choose a future date" }, { status: 400 });
  }

  const mentorshipRequest = await prisma.mentorshipRequest.findFirst({
    where: {
      id: requestId,
      status: "ACCEPTED",
      student: { userId: session.user.id },
    },
    include: { mentor: true },
  });

  if (!mentorshipRequest) {
    return NextResponse.json(
      { error: "This mentorship is not active" },
      { status: 400 }
    );
  }

  const newSession = await prisma.mentorshipSession.create({
    data: {
      requestId,
      scheduledAt: when,
      durationMins: Number(durationMins) || 30,
      status: "SCHEDULED",
    },
  });

  await prisma.notification.create({
    data: {
      userId: mentorshipRequest.mentor.userId,
      title: "New session booked",
      message: `A session has been booked for ${when.toLocaleDateString()}.`,
    },
  });

  return NextResponse.json(newSession);
}
