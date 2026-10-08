import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "MENTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await request.json();

  if (!["ACCEPTED", "DECLINED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const mentorProfile = await prisma.mentorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!mentorProfile) {
    return NextResponse.json({ error: "Mentor profile not found" }, { status: 404 });
  }

  const mentorshipRequest = await prisma.mentorshipRequest.findUnique({
    where: { id },
    include: { student: { include: { user: true } } },
  });

  if (!mentorshipRequest || mentorshipRequest.mentorId !== mentorProfile.id) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (mentorshipRequest.status !== "PENDING") {
    return NextResponse.json(
      { error: "This request has already been handled" },
      { status: 400 }
    );
  }

  const updated = await prisma.mentorshipRequest.update({
    where: { id },
    data: { status },
  });

  if (status === "ACCEPTED" && mentorshipRequest.message.trim()) {
    await prisma.message.create({
      data: {
        senderId: mentorshipRequest.student.userId,
        receiverId: session.user.id,
        content: mentorshipRequest.message,
      },
    });
  }

  await prisma.notification.create({
    data: {
      userId: mentorshipRequest.student.userId,
      title: status === "ACCEPTED" ? "Request accepted!" : "Request declined",
      message:
        status === "ACCEPTED"
          ? `${session.user.name} has accepted your mentorship request.`
          : `${session.user.name} has declined your mentorship request.`,
    },
  });

  return NextResponse.json(updated);
}
