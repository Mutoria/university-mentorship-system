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
  const body = await request.json().catch(() => null);
  if (typeof body?.verified !== "boolean") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const company = await prisma.companyProfile.update({
    where: { id },
    data: { verified: body.verified },
  });

  await prisma.notification.create({
    data: {
      userId: company.userId,
      title: body.verified ? "Company approved" : "Approval update",
      message: body.verified
        ? "Your company has been approved. Students can now see your jobs."
        : "Your company approval has been withdrawn.",
    },
  });

  return NextResponse.json(company);
}
