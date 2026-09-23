import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default async function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "MENTOR") {
    redirect("/login");
  }

  return <DashboardShell role="MENTOR">{children}</DashboardShell>;
}
