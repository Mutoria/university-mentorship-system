import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AnnouncementsBanner } from "@/components/layout/AnnouncementsBanner";

export default async function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "MENTOR") {
    redirect("/login");
  }

  return (
    <DashboardShell role="MENTOR">
      <div className="mx-auto mb-6 max-w-5xl">
        <AnnouncementsBanner />
      </div>
      {children}
    </DashboardShell>
  );
}
