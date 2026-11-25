import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !["COMPANY", "MENTOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const status = body?.status;
  if (status !== "SHORTLISTED" && status !== "NOT_SELECTED") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const application = await prisma.application.findFirst({
    where: { id, opportunity: { posterId: session.user.id } },
    include: {
      student: { select: { userId: true } },
      opportunity: { select: { title: true } },
    },
  });
  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }
  if (application.status === status) {
    return NextResponse.json({ success: true });
  }

  await prisma.application.update({ where: { id }, data: { status } });
  await prisma.notification.create({
    data: {
      userId: application.student.userId,
      title: status === "SHORTLISTED" ? "You have been shortlisted" : "Application update",
      message:
        status === "SHORTLISTED"
          ? `You were shortlisted for ${application.opportunity.title}.`
          : `You were not selected for ${application.opportunity.title}.`,
    },
  });

  return NextResponse.json({ success: true });
}
