"use client";

import { useEffect, useState } from "react";
import { Briefcase, Search, MapPin, Clock, Send } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

interface Job {
  id: string;
  title: string;
  description: string;
  companyName: string;
  employmentType: string | null;
  location: string;
  deadline: string;
  requiredSkills: string[];
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  myStatus: "UNDER_VERIFICATION" | "SHORTLISTED" | "NOT_SELECTED" | null;
}

const typeLabels: Record<string, string> = {
  PART_TIME: "Part-time",
  FULL_TIME: "Full-time",
  INTERNSHIP: "Internship",
};

const statusBadge = {
  UNDER_VERIFICATION: { label: "Under verification", variant: "warning" as const },
  SHORTLISTED: { label: "Shortlisted", variant: "success" as const },
  NOT_SELECTED: { label: "Not selected", variant: "danger" as const },
};

export default function StudentJobsPage() {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Job | null>(null);
  const [coverNote, setCoverNote] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function load() {
    const res = await fetch("/api/jobs");
    const data = await res.json().catch(() => []);
    setJobs(Array.isArray(data) ? data : []);
    setIsLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleApply() {
    if (!selected) return;
    setIsSending(true);
    const res = await fetch(`/api/jobs/${selected.id}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coverNote }),
    });
    const data = await res.json().catch(() => ({}));
    setIsSending(false);

    if (res.ok) {
      showToast("Application sent. Your CV is under verification.", "success");
      setSelected(null);
      setCoverNote("");
      load();
    } else {
      showToast(data.error ?? "Something went wrong", "error");
    }
  }

  const q = query.trim().toLowerCase();
  const visible = jobs.filter(
    (j) =>
      !q ||
      j.title.toLowerCase().includes(q) ||
      j.companyName.toLowerCase().includes(q) ||
      j.requiredSkills.some((s) => s.toLowerCase().includes(q))
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-white">
          Jobs and opportunities
        </h1>
        <p className="mt-1 text-sm text-slate">
          Apply with your CV. Applications are verified, then qualified students are
          shortlisted.
        </p>
      </div>

      <Input
        placeholder="Search by job, company or skill"
        icon={<Search className="h-4 w-4" />}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs available"
          description="Jobs from approved companies appear here until their deadline."
        />
      ) : (
        <div className="space-y-4">
          {visible.map((job) => {
            const status = job.myStatus ? statusBadge[job.myStatus] : null;
            return (
              <Card key={job.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-heading text-base font-semibold text-charcoal dark:text-white">
                      {job.title}
                    </h3>
                    <p className="text-sm text-slate">{job.companyName}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate">
                      {job.employmentType && (
                        <span>{typeLabels[job.employmentType]}</span>
                      )}
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Closes{" "}
                        {new Date(job.deadline).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </p>
                  </div>
                  <Badge variant="info">{job.matchScore}% match</Badge>
                </div>

                <p className="mt-3 line-clamp-3 text-sm text-slate">{job.description}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {job.matchedSkills.map((s) => (
                    <Badge key={s} variant="success">
                      {s}
                    </Badge>
                  ))}
                  {job.missingSkills.map((s) => (
                    <Badge key={s} variant="outline">
                      {s}
                    </Badge>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-border dark:border-white/10 pt-4">
                  {status ? (
                    <Badge variant={status.variant}>{status.label}</Badge>
                  ) : (
                    <span className="text-xs text-slate">Not applied yet</span>
                  )}
                  {!status && (
                    <Button size="sm" onClick={() => setSelected(job)}>
                      <Send className="h-3.5 w-3.5" />
                      Apply
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={`Apply for ${selected?.title ?? ""}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Cancel
            </Button>
            <Button onClick={handleApply} isLoading={isSending}>
              Submit application
            </Button>
          </>
        }
      >
        <p className="mb-3 text-sm text-slate">
          Your CV and portfolio are attached automatically.
        </p>
        <label className="mb-1.5 block text-sm font-medium text-charcoal dark:text-white">
          Cover note (optional)
        </label>
        <textarea
          value={coverNote}
          onChange={(e) => setCoverNote(e.target.value)}
          rows={4}
          placeholder="Why are you a good fit?"
          className="w-full rounded-xl border border-slate-border bg-surface dark:bg-navy-light dark:border-white/10 px-3.5 py-2.5 text-sm text-charcoal dark:text-white placeholder:text-slate/70 focus:outline-none focus:ring-2 focus:ring-indigo"
        />
      </Modal>
    </div>
  );
}
