"use client";

import { useEffect, useState } from "react";
import { Users, Check, X, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

interface Applicant {
  id: string;
  status: "UNDER_VERIFICATION" | "SHORTLISTED" | "NOT_SELECTED";
  matchScore: number;
  coverNote: string;
  jobId: string;
  jobTitle: string;
  studentName: string;
  email: string;
  department: string;
  yearOfStudy: string;
  headline: string;
  matched: string[];
  missing: string[];
  projects: string[];
}

const statusBadge = {
  UNDER_VERIFICATION: { label: "Under verification", variant: "warning" as const },
  SHORTLISTED: { label: "Shortlisted", variant: "success" as const },
  NOT_SELECTED: { label: "Not selected", variant: "danger" as const },
};

export default function CompanyApplicantsPage() {
  const { showToast } = useToast();
  const [apps, setApps] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/company/applicants");
    const data = await res.json().catch(() => []);
    setApps(Array.isArray(data) ? data : []);
    setIsLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function runShortlist(jobId: string) {
    setBusy(jobId);
    const res = await fetch(`/api/company/jobs/${jobId}/shortlist`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (res.ok) {
      showToast(
        `Verified ${data.processed} applicant(s). ${data.shortlisted} shortlisted.`,
        "success"
      );
      load();
    } else {
      showToast(data.error ?? "Something went wrong", "error");
    }
  }

  async function override(id: string, status: "SHORTLISTED" | "NOT_SELECTED") {
    setBusy(id);
    const res = await fetch(`/api/company/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(null);
    if (res.ok) {
      showToast("Decision saved and the student was notified", "success");
      load();
    } else {
      showToast("Something went wrong", "error");
    }
  }

  const groups = new Map<string, { title: string; items: Applicant[] }>();
  apps.forEach((a) => {
    const g = groups.get(a.jobId) ?? { title: a.jobTitle, items: [] };
    g.items.push(a);
    groups.set(a.jobId, g);
  });

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-white">
          Applicants
        </h1>
        <p className="mt-1 text-sm text-slate">
          New applications are under verification. Run verification to shortlist
          qualified students (score of 50 or more), then override any decision.
        </p>
      </div>

      {isLoading ? (
        <CardSkeleton />
      ) : apps.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No applicants yet"
          description="Applications will appear here once students apply to your jobs."
        />
      ) : (
        Array.from(groups.entries()).map(([jobId, group]) => {
          const waiting = group.items.filter((a) => a.status === "UNDER_VERIFICATION").length;
          return (
            <div key={jobId} className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-heading text-lg font-semibold text-charcoal dark:text-white">
                  {group.title}
                </h2>
                <Button
                  size="sm"
                  disabled={waiting === 0}
                  isLoading={busy === jobId}
                  onClick={() => runShortlist(jobId)}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Verify and shortlist ({waiting})
                </Button>
              </div>

              {group.items.map((a) => {
                const badge = statusBadge[a.status];
                return (
                  <Card key={a.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-heading text-sm font-semibold text-charcoal dark:text-white">
                          {a.studentName}
                        </p>
                        <p className="text-xs text-slate">
                          {a.department} · {a.yearOfStudy} · {a.email}
                        </p>
                        {a.headline && <p className="mt-1 text-xs text-slate">{a.headline}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="info">{a.matchScore}%</Badge>
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {a.matched.map((s) => (
                        <Badge key={s} variant="success">{s}</Badge>
                      ))}
                      {a.missing.map((s) => (
                        <Badge key={s} variant="outline">{s}</Badge>
                      ))}
                    </div>

                    {a.projects.length > 0 && (
                      <p className="mt-3 text-xs text-slate">
                        Portfolio: {a.projects.join(", ")}
                      </p>
                    )}
                    {a.coverNote && (
                      <p className="mt-2 text-sm text-slate">"{a.coverNote}"</p>
                    )}

                    <div className="mt-4 flex gap-2 border-t border-slate-border dark:border-white/10 pt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={a.status === "SHORTLISTED"}
                        isLoading={busy === a.id}
                        onClick={() => override(a.id, "SHORTLISTED")}
                      >
                        <Check className="h-3.5 w-3.5" />
                        Shortlist
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={a.status === "NOT_SELECTED"}
                        isLoading={busy === a.id}
                        onClick={() => override(a.id, "NOT_SELECTED")}
                      >
                        <X className="h-3.5 w-3.5" />
                        Reject
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          );
        })
      )}
    </div>
  );
}
