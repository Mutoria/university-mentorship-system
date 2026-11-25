"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function PostJobPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [employmentType, setEmploymentType] = useState("PART_TIME");
  const [location, setLocation] = useState("");
  const [deadline, setDeadline] = useState("");
  const [skills, setSkills] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    const res = await fetch("/api/company/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        employmentType,
        location,
        deadline,
        requiredSkills: skills,
        description,
      }),
    });
    setIsSaving(false);

    if (res.ok) {
      showToast("Job posted!", "success");
      router.push("/company");
    } else {
      const data = await res.json();
      showToast(data.error ?? "Something went wrong", "error");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-white">
          Post a job
        </h1>
        <p className="mt-1 text-sm text-slate">
          Students whose skills match your requirements will be shortlisted automatically.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Job title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Part-time Data Entry Assistant"
          />
          <Select
            label="Employment type"
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            options={[
              { label: "Part-time", value: "PART_TIME" },
              { label: "Full-time", value: "FULL_TIME" },
              { label: "Internship", value: "INTERNSHIP" },
            ]}
          />
          <Input
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Nairobi, or Remote"
          />
          <Input
            label="Application deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
          <Input
            label="Required skills (comma-separated)"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="Excel, Communication, Data Analysis"
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal dark:text-white">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder="What will the student do? Hours, pay, expectations."
              className="w-full rounded-xl border border-slate-border bg-surface dark:bg-navy-light dark:border-white/10 px-3.5 py-2.5 text-sm text-charcoal dark:text-white placeholder:text-slate/70 focus:outline-none focus:ring-2 focus:ring-indigo"
            />
          </div>
          <Button type="submit" isLoading={isSaving}>
            <Send className="h-4 w-4" />
            Publish job
          </Button>
        </form>
      </Card>
    </div>
  );
}
