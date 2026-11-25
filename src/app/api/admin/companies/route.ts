import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companies = await prisma.companyProfile.findMany({
    include: { user: { select: { name: true, email: true, createdAt: true } } },
    orderBy: { user: { createdAt: "desc" } },
  });

  return NextResponse.json(companies);
}
