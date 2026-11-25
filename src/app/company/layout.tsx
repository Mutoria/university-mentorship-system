import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") {
    redirect("/login");
  }

  return <DashboardShell role="COMPANY">{children}</DashboardShell>;
}
