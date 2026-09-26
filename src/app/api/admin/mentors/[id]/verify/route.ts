import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { verified } = await request.json();

  const mentor = await prisma.mentorProfile.update({
    where: { id },
    data: { verified },
    include: { user: true },
  });

  await prisma.notification.create({
    data: {
      userId: mentor.userId,
      title: verified ? "You're verified!" : "Verification update",
      message: verified
        ? "Congratulations! Your mentor profile has been verified and is now visible to students."
        : "Your mentor verification status has been updated.",
    },
  });

  return NextResponse.json(mentor);
}
