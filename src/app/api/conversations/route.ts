import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let partners: { userId: string; name: string; avatarInitials: string; avatarColor: string }[] = [];

  if (session.user.role === "STUDENT") {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (studentProfile) {
      const requests = await prisma.mentorshipRequest.findMany({
        where: { studentId: studentProfile.id, status: "ACCEPTED" },
        include: { mentor: { include: { user: true } } },
      });
      partners = requests.map((r) => ({
        userId: r.mentor.user.id,
        name: r.mentor.user.name,
        avatarInitials: r.mentor.user.avatarInitials,
        avatarColor: r.mentor.user.avatarColor,
      }));
    }
  } else if (session.user.role === "MENTOR") {
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (mentorProfile) {
      const requests = await prisma.mentorshipRequest.findMany({
        where: { mentorId: mentorProfile.id, status: "ACCEPTED" },
        include: { student: { include: { user: true } } },
      });
      partners = requests.map((r) => ({
        userId: r.student.user.id,
        name: r.student.user.name,
        avatarInitials: r.student.user.avatarInitials,
        avatarColor: r.student.user.avatarColor,
      }));
    }
  }

  const unique = Array.from(new Map(partners.map((p) => [p.userId, p])).values());

  return NextResponse.json(unique);
}
