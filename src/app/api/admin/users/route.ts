import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  const query = searchParams.get("q")?.toLowerCase() ?? "";

  const users = await prisma.user.findMany({
    where: {
      ...(role && role !== "all" ? { role: role as "STUDENT" | "MENTOR" | "ADMIN" } : {}),
    },
    include: {
      studentProfile: true,
      mentorProfile: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const filtered = query
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query)
      )
    : users;

  return NextResponse.json(filtered);
}
