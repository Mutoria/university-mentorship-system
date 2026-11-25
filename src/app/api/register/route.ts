import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const colors = ["bg-indigo", "bg-teal", "bg-gold", "bg-navy"];

async function handle(request: Request) {
  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  const role = String(body?.role ?? "").toUpperCase();
  const department = String(body?.department ?? "").trim();
  const companyName = String(body?.companyName ?? "").trim();

  if (name.length < 2) {
    return NextResponse.json({ error: "Enter your full name" }, { status: 400 });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }
  if (role !== "STUDENT" && role !== "MENTOR" && role !== "COMPANY") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  if (role === "COMPANY" && companyName.length < 2) {
    return NextResponse.json({ error: "Enter your company name" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const initials = (role === "COMPANY" ? companyName : name)
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  const avatarColor = colors[Math.floor(Math.random() * colors.length)];
  const dept = department || "General";

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      avatarInitials: initials || "U",
      avatarColor,
      ...(role === "STUDENT"
        ? {
            studentProfile: {
              create: { department: dept, yearOfStudy: "1st Year" },
            },
          }
        : role === "MENTOR"
        ? {
            mentorProfile: {
              create: { title: "Mentor", department: dept, verified: false },
            },
          }
        : {
            companyProfile: {
              create: { companyName, verified: false },
            },
          }),
    },
  });

  return NextResponse.json({ success: true });
}

export async function POST(request: Request) {
  try {
    return await handle(request);
  } catch (error) {
    console.error("Registration failed:", error);
    return NextResponse.json(
      { error: "The database is not responding. Wait a few seconds and try again." },
      { status: 503 }
    );
  }
}
