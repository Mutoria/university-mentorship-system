"use client";

import { useEffect, useState } from "react";
import { GraduationCap, Clock, Send } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

interface Opening {
  id: string;
  title: string;
  description: string;
  mentorName: string;
  mentorTitle: string;
  deadline: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  myStatus: "UNDER_VERIFICATION" | "SHORTLISTED" | "NOT_SELECTED" | null;
}

const statusBadge = {
  UNDER_VERIFICATION: { label: "Under verification", variant: "warning" as const },
  SHORTLISTED: { label: "Shortlisted", variant: "success" as const },
  NOT_SELECTED: { label: "Not selected", variant: "danger" as const },
};

export default function StudentOpeningsPage() {
  const { showToast } = useToast();
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<Opening | null>(null);
  const [coverNote, setCoverNote] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function load() {
    const res = await fetch("/api/opportunities");
    const data = await res.json().catch(() => []);
    setOpenings(Array.isArray(data) ? data : []);
    setIsLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleApply() {
    if (!selected) return;
    setIsSending(true);
    const res = await fetch(`/api/opportunities/${selected.id}/apply`, {
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

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-white">
          Mentorship openings
        </h1>
        <p className="mt-1 text-sm text-slate">
          Apply for places with verified mentors. Applications are verified, then
          qualified students are shortlisted.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : openings.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No openings available"
          description="Openings from verified mentors appear here until their deadline."
        />
      ) : (
        <div className="space-y-4">
          {openings.map((o) => {
            const status = o.myStatus ? statusBadge[o.myStatus] : null;
            return (
              <Card key={o.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-heading text-base font-semibold text-charcoal dark:text-white">
                      {o.title}
                    </h3>
                    <p className="text-sm text-slate">
                      {o.mentorName}
                      {o.mentorTitle ? ` · ${o.mentorTitle}` : ""}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate">
                      <Clock className="h-3 w-3" />
                      Closes{" "}
                      {new Date(o.deadline).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge variant="info">{o.matchScore}% match</Badge>
                </div>

                <p className="mt-3 line-clamp-3 text-sm text-slate">{o.description}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {o.matchedSkills.map((s) => (
                    <Badge key={s} variant="success">{s}</Badge>
                  ))}
                  {o.missingSkills.map((s) => (
                    <Badge key={s} variant="outline">{s}</Badge>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-border dark:border-white/10 pt-4">
                  {status ? (
                    <Badge variant={status.variant}>{status.label}</Badge>
                  ) : (
                    <span className="text-xs text-slate">Not applied yet</span>
                  )}
                  {!status && (
                    <Button size="sm" onClick={() => setSelected(o)}>
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
          Why do you want this mentorship? (optional)
        </label>
        <textarea
          value={coverNote}
          onChange={(e) => setCoverNote(e.target.value)}
          rows={4}
          className="w-full rounded-xl border border-slate-border bg-surface dark:bg-navy-light dark:border-white/10 px-3.5 py-2.5 text-sm text-charcoal dark:text-white placeholder:text-slate/70 focus:outline-none focus:ring-2 focus:ring-indigo"
        />
      </Modal>
    </div>
  );
}
