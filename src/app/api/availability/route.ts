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

  if (!mentorProfile) return NextResponse.json([]);

  const slots = await prisma.availabilitySlot.findMany({
    where: { mentorId: mentorProfile.id },
    orderBy: { dayOfWeek: "asc" },
  });

  return NextResponse.json(slots);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "MENTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { dayOfWeek, startTime, endTime } = await request.json();

  const mentorProfile = await prisma.mentorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!mentorProfile) {
    return NextResponse.json({ error: "Mentor profile not found" }, { status: 404 });
  }

  const slot = await prisma.availabilitySlot.create({
    data: {
      mentorId: mentorProfile.id,
      dayOfWeek: Number(dayOfWeek),
      startTime,
      endTime,
    },
  });

  return NextResponse.json(slot);
}
