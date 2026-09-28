import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function areConnected(userA: string, userB: string) {
  const link = await prisma.mentorshipRequest.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { student: { userId: userA }, mentor: { userId: userB } },
        { student: { userId: userB }, mentor: { userId: userA } },
      ],
    },
  });
  return !!link;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const withUserId = new URL(request.url).searchParams.get("with");
  if (!withUserId) {
    return NextResponse.json({ error: "Missing 'with' param" }, { status: 400 });
  }
  if (!(await areConnected(session.user.id, withUserId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: session.user.id, receiverId: withUserId },
        { senderId: withUserId, receiverId: session.user.id },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  await prisma.message.updateMany({
    where: { senderId: withUserId, receiverId: session.user.id, read: false },
    data: { read: true },
  });

  return NextResponse.json(messages);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { receiverId, content } = await request.json();
  const text = String(content ?? "").trim();

  if (!receiverId || !text || text.length > 2000) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }
  if (!(await areConnected(session.user.id, receiverId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const message = await prisma.message.create({
    data: { senderId: session.user.id, receiverId, content: text },
  });

  return NextResponse.json(message);
}
