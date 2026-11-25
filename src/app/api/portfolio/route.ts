import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const title = String(body?.title ?? "").trim().slice(0, 120);
  const description = String(body?.description ?? "").trim().slice(0, 500);
  const url = String(body?.url ?? "").trim().slice(0, 300);

  if (!title) {
    return NextResponse.json({ error: "Project title is required" }, { status: 400 });
  }
  if (url && !/^https?:\/\//i.test(url)) {
    return NextResponse.json(
      { error: "Link must start with http:// or https://" },
      { status: 400 }
    );
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const project = await prisma.portfolioProject.create({
    data: { studentId: profile.id, title, description, url },
  });

  return NextResponse.json(project);
}
