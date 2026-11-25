"use client";

import { useEffect, useState } from "react";
import { Send, GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";

interface Opening {
  id: string;
  title: string;
  requiredSkills: string[];
  deadline: string;
  applications: { status: string }[];
}

export default function MentorOpeningsPage() {
  const { showToast } = useToast();
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [skills, setSkills] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/mentor/opportunities");
    const data = await res.json().catch(() => []);
    setOpenings(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    const res = await fetch("/api/mentor/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, deadline, requiredSkills: skills, description }),
    });
    const data = await res.json().catch(() => ({}));
    setIsSaving(false);
    if (res.ok) {
      showToast("Mentorship opening posted!", "success");
      setTitle("");
      setDeadline("");
      setSkills("");
      setDescription("");
      load();
    } else {
      showToast(data.error ?? "Something went wrong", "error");
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-white">
          Mentorship openings
        </h1>
        <p className="mt-1 text-sm text-slate">
          Post an opening and qualified students are shortlisted automatically. Students
          only see openings once your mentor profile is verified.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Opening title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Final-year thesis mentoring"
          />
          <Input
            label="Application deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
          <Input
            label="Skills or interests you look for (comma-separated)"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="Machine Learning, Research Writing"
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal dark:text-white">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="What will you help the student with?"
              className="w-full rounded-xl border border-slate-border bg-surface dark:bg-navy-light dark:border-white/10 px-3.5 py-2.5 text-sm text-charcoal dark:text-white placeholder:text-slate/70 focus:outline-none focus:ring-2 focus:ring-indigo"
            />
          </div>
          <Button type="submit" isLoading={isSaving}>
            <Send className="h-4 w-4" />
            Publish opening
          </Button>
        </form>
      </Card>

      {openings.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No openings yet"
          description="Your posted openings will appear here."
        />
      ) : (
        <div className="space-y-3">
          {openings.map((o) => (
            <Card key={o.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-heading text-sm font-semibold text-charcoal dark:text-white">
                    {o.title}
                  </p>
                  <p className="mt-1 text-xs text-slate">
                    Deadline{" "}
                    {new Date(o.deadline).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {o.requiredSkills.map((s) => (
                      <Badge key={s} variant="default">{s}</Badge>
                    ))}
                  </div>
                </div>
                <Badge variant="info">{o.applications.length} applicants</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
