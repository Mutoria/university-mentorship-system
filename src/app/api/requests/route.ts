import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { mentorId, message } = await request.json();

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!studentProfile) {
    return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
  }

  const existing = await prisma.mentorshipRequest.findFirst({
    where: {
      studentId: studentProfile.id,
      mentorId,
      status: { in: ["PENDING", "ACCEPTED"] },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "You already have an active request with this mentor" },
      { status: 400 }
    );
  }

  const newRequest = await prisma.mentorshipRequest.create({
    data: {
      studentId: studentProfile.id,
      mentorId,
      message,
      status: "PENDING",
    },
  });

  const mentorProfile = await prisma.mentorProfile.findUnique({
    where: { id: mentorId },
  });

  if (mentorProfile) {
    await prisma.notification.create({
      data: {
        userId: mentorProfile.userId,
        title: "New mentorship request",
        message: `${session.user.name} has requested mentorship from you.`,
      },
    });
  }

  return NextResponse.json(newRequest);
}
