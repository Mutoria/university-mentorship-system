import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.toLowerCase() ?? "";
  const department = searchParams.get("department") ?? "";

  const mentors = await prisma.mentorProfile.findMany({
    where: {
      verified: true,
      ...(department && department !== "all"
        ? { department: { contains: department, mode: "insensitive" } }
        : {}),
    },
    include: {
      user: true,
      reviews: true,
    },
  });

  const filtered = query
    ? mentors.filter(
        (m) =>
          m.user.name.toLowerCase().includes(query) ||
          m.expertise.some((e) => e.toLowerCase().includes(query)) ||
          m.department.toLowerCase().includes(query)
      )
    : mentors;

  const result = filtered.map((m) => {
    const avgRating =
      m.reviews.length > 0
        ? m.reviews.reduce((sum, r) => sum + r.rating, 0) / m.reviews.length
        : 0;
    return {
      id: m.id,
      name: m.user.name,
      title: m.title,
      department: m.department,
      bio: m.bio,
      expertise: m.expertise,
      avatarInitials: m.user.avatarInitials,
      avatarColor: m.user.avatarColor,
      sessionsCompleted: m.sessionsCompleted,
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: m.reviews.length,
    };
  });

  return NextResponse.json(result);
}
