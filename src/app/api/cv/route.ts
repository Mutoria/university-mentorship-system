import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const clean = (v: unknown, max = 500) => String(v ?? "").trim().slice(0, max);

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
      cv: true,
      portfolio: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const cv = profile.cv;
  return NextResponse.json({
    name: profile.user.name,
    email: profile.user.email,
    cv: {
      phone: cv?.phone ?? "",
      headline: cv?.headline || `${profile.department} student, ${profile.yearOfStudy}`,
      summary: cv?.summary || profile.bio,
      skills: cv && cv.skills.length > 0 ? cv.skills : profile.interests,
      education: cv
        ? cv.education
        : [{ school: "", qualification: profile.department, years: profile.yearOfStudy }],
      experience: cv ? cv.experience : [],
    },
    portfolio: profile.portfolio,
  });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const rawSkills: unknown[] = Array.isArray(body.skills)
    ? body.skills
    : String(body.skills ?? "").split(",");
  const skills = rawSkills.map((s) => clean(s, 50)).filter(Boolean).slice(0, 30);

  const education = (Array.isArray(body.education) ? body.education : [])
    .slice(0, 10)
    .map((e: Record<string, unknown>) => ({
      school: clean(e.school, 120),
      qualification: clean(e.qualification, 120),
      years: clean(e.years, 40),
    }))
    .filter((e: { school: string; qualification: string }) => e.school || e.qualification);

  const experience = (Array.isArray(body.experience) ? body.experience : [])
    .slice(0, 10)
    .map((e: Record<string, unknown>) => ({
      role: clean(e.role, 120),
      company: clean(e.company, 120),
      years: clean(e.years, 40),
      details: clean(e.details, 500),
    }))
    .filter((e: { role: string; company: string }) => e.role || e.company);

  const data = {
    phone: clean(body.phone, 30),
    headline: clean(body.headline, 120),
    summary: clean(body.summary, 1000),
    skills,
    education,
    experience,
  };

  await prisma.cvProfile.upsert({
    where: { studentId: profile.id },
    update: data,
    create: { studentId: profile.id, ...data },
  });

  return NextResponse.json({ success: true });
}
