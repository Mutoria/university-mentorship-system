import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const TYPES = ["PART_TIME", "FULL_TIME", "INTERNSHIP"] as const;

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobs = await prisma.opportunity.findMany({
    where: { posterId: session.user.id, type: "JOB" },
    include: { applications: { select: { status: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(jobs);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const company = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!company) {
    return NextResponse.json({ error: "Company profile not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const title = String(body?.title ?? "").trim();
  const description = String(body?.description ?? "").trim();
  const location = String(body?.location ?? "").trim().slice(0, 120);
  const employmentType = String(body?.employmentType ?? "");
  const deadline = new Date(`${String(body?.deadline ?? "")}T23:59:59`);
  const rawSkills: unknown[] = Array.isArray(body?.requiredSkills)
    ? body.requiredSkills
    : String(body?.requiredSkills ?? "").split(",");
  const requiredSkills = rawSkills
    .map((s) => String(s).trim().slice(0, 50))
    .filter(Boolean)
    .slice(0, 20);

  if (title.length < 3 || title.length > 120) {
    return NextResponse.json({ error: "Title must be 3 to 120 characters" }, { status: 400 });
  }
  if (description.length < 10 || description.length > 3000) {
    return NextResponse.json({ error: "Describe the role in 10 to 3000 characters" }, { status: 400 });
  }
  if (!TYPES.includes(employmentType as (typeof TYPES)[number])) {
    return NextResponse.json({ error: "Choose an employment type" }, { status: 400 });
  }
  if (requiredSkills.length === 0) {
    return NextResponse.json({ error: "Add at least one required skill" }, { status: 400 });
  }
  if (isNaN(deadline.getTime()) || deadline.getTime() < Date.now()) {
    return NextResponse.json({ error: "Choose a deadline in the future" }, { status: 400 });
  }

  const job = await prisma.opportunity.create({
    data: {
      type: "JOB",
      posterId: session.user.id,
      title,
      description,
      requiredSkills,
      employmentType: employmentType as (typeof TYPES)[number],
      location,
      deadline,
    },
  });

  return NextResponse.json(job);
}
