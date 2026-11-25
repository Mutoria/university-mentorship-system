import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Briefcase, Users, CheckCircle2, Clock, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

const typeLabels: Record<string, string> = {
  PART_TIME: "Part-time",
  FULL_TIME: "Full-time",
  INTERNSHIP: "Internship",
};

export default async function CompanyDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const company = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!company) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Company profile not found"
        description="We couldn't find a company profile for this account."
      />
    );
  }

  const jobs = await prisma.opportunity.findMany({
    where: { posterId: session.user.id, type: "JOB" },
    include: { applications: { select: { status: true } } },
    orderBy: { createdAt: "desc" },
  });

  const all = jobs.flatMap((j) => j.applications);
  const stats = [
    { label: "Jobs posted", value: jobs.length, icon: Briefcase },
    { label: "Applicants", value: all.length, icon: Users },
    {
      label: "Under verification",
      value: all.filter((a) => a.status === "UNDER_VERIFICATION").length,
      icon: Clock,
    },
    {
      label: "Shortlisted",
      value: all.filter((a) => a.status === "SHORTLISTED").length,
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-white">
            {company.companyName}
          </h1>
          <p className="mt-1 text-sm text-slate">Your job postings and applicants.</p>
        </div>
        <Badge variant={company.verified ? "success" : "warning"}>
          {company.verified ? "Verified" : "Pending approval"}
        </Badge>
      </div>

      {!company.verified && (
        <div className="rounded-xl2 border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-charcoal dark:text-white">
          Your company is waiting for admin approval. You can post jobs now, but students
          will only see them once you are approved.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate">{s.label}</p>
                <p className="mt-1 font-heading text-2xl font-bold text-charcoal dark:text-white">
                  {s.value}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo/10 text-indigo">
                <s.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-charcoal dark:text-white">
            Your jobs
          </h2>
          <Link href="/company/post">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Post a job
            </Button>
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={Briefcase}
              title="No jobs posted yet"
              description="Post your first job and qualified students will be shortlisted for you."
            />
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {jobs.map((job) => (
              <Card key={job.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-heading text-sm font-semibold text-charcoal dark:text-white">
                      {job.title}
                    </p>
                    <p className="mt-1 text-xs text-slate">
                      {job.employmentType ? typeLabels[job.employmentType] : ""}
                      {job.location ? ` · ${job.location}` : ""}
                      {" · Deadline "}
                      {job.deadline.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {job.requiredSkills.map((skill) => (
                        <Badge key={skill} variant="default">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Badge variant="info">{job.applications.length} applicants</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
