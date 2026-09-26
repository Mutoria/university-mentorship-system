import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: true },
  });

  return NextResponse.json(profile);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, department, yearOfStudy, bio, interests } = await request.json();

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name },
  });

  const updated = await prisma.studentProfile.update({
    where: { userId: session.user.id },
    data: {
      department,
      yearOfStudy,
      bio,
      interests: Array.isArray(interests)
        ? interests
        : String(interests)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
    },
  });

  return NextResponse.json(updated);
}
