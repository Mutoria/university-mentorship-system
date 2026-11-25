"use client";

import { useEffect, useState } from "react";
import { Save, Plus, Trash2, Printer } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

interface Education {
  school: string;
  qualification: string;
  years: string;
}
interface Experience {
  role: string;
  company: string;
  years: string;
  details: string;
}
interface Project {
  id: string;
  title: string;
  description: string;
  url: string;
}

const textareaClass =
  "w-full rounded-xl border border-slate-border bg-surface dark:bg-navy-light dark:border-white/10 px-3.5 py-2.5 text-sm text-charcoal dark:text-white placeholder:text-slate/70 focus:outline-none focus:ring-2 focus:ring-indigo";

export default function StudentCvPage() {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("");
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newDesc, setNewDesc] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/cv");
      const data = await res.json();
      setName(data.name);
      setEmail(data.email);
      setPhone(data.cv.phone);
      setHeadline(data.cv.headline);
      setSummary(data.cv.summary);
      setSkills((data.cv.skills as string[]).join(", "));
      setEducation(data.cv.education as Education[]);
      setExperience(data.cv.experience as Experience[]);
      setProjects(data.portfolio as Project[]);
      setIsLoading(false);
    }
    load();
  }, []);

  function updateEdu(i: number, key: keyof Education, value: string) {
    setEducation((list) => list.map((e, idx) => (idx === i ? { ...e, [key]: value } : e)));
  }
  function updateExp(i: number, key: keyof Experience, value: string) {
    setExperience((list) => list.map((e, idx) => (idx === i ? { ...e, [key]: value } : e)));
  }

  async function handleSave() {
    setIsSaving(true);
    const res = await fetch("/api/cv", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, headline, summary, skills, education, experience }),
    });
    setIsSaving(false);
    showToast(res.ok ? "CV saved!" : "Could not save your CV", res.ok ? "success" : "error");
  }

  async function handleAddProject() {
    const res = await fetch("/api/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, url: newUrl, description: newDesc }),
    });
    const data = await res.json();
    if (res.ok) {
      setProjects((p) => [data, ...p]);
      setNewTitle("");
      setNewUrl("");
      setNewDesc("");
      showToast("Project added", "success");
    } else {
      showToast(data.error ?? "Something went wrong", "error");
    }
  }

  async function handleDeleteProject(id: string) {
    const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
    if (res.ok) setProjects((p) => p.filter((x) => x.id !== id));
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const skillList = skills.split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="no-print">
        <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-white">
          My CV and portfolio
        </h1>
        <p className="mt-1 text-sm text-slate">
          Fill in your details once. Your CV is generated automatically below and is used
          whenever you apply.
        </p>
      </div>

      <div className="no-print space-y-6">
        <Card>
          <h2 className="font-heading text-sm font-semibold text-charcoal dark:text-white">
            Personal details
          </h2>
          <div className="mt-4 space-y-4">
            <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input
              label="Headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal dark:text-white">
                Professional summary
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={4}
                className={textareaClass}
              />
            </div>
            <Input
              label="Skills (comma-separated)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Python, Data Analysis, Communication"
            />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold text-charcoal dark:text-white">
              Education
            </h2>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEducation((l) => [...l, { school: "", qualification: "", years: "" }])}
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>
          <div className="mt-4 space-y-4">
            {education.map((e, i) => (
              <div key={i} className="space-y-3 rounded-xl border border-slate-border dark:border-white/10 p-4">
                <Input label="Institution" value={e.school} onChange={(ev) => updateEdu(i, "school", ev.target.value)} />
                <Input label="Qualification" value={e.qualification} onChange={(ev) => updateEdu(i, "qualification", ev.target.value)} />
                <Input label="Years" value={e.years} onChange={(ev) => updateEdu(i, "years", ev.target.value)} />
                <button
                  onClick={() => setEducation((l) => l.filter((_, idx) => idx !== i))}
                  className="flex items-center gap-1 text-xs text-slate hover:text-danger"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold text-charcoal dark:text-white">
              Experience
            </h2>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setExperience((l) => [...l, { role: "", company: "", years: "", details: "" }])}
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>
          <div className="mt-4 space-y-4">
            {experience.length === 0 && (
              <p className="text-sm text-slate">No experience added yet.</p>
            )}
            {experience.map((e, i) => (
              <div key={i} className="space-y-3 rounded-xl border border-slate-border dark:border-white/10 p-4">
                <Input label="Role" value={e.role} onChange={(ev) => updateExp(i, "role", ev.target.value)} />
                <Input label="Company" value={e.company} onChange={(ev) => updateExp(i, "company", ev.target.value)} />
                <Input label="Years" value={e.years} onChange={(ev) => updateExp(i, "years", ev.target.value)} />
                <textarea
                  value={e.details}
                  onChange={(ev) => updateExp(i, "details", ev.target.value)}
                  rows={2}
                  placeholder="What did you do?"
                  className={textareaClass}
                />
                <button
                  onClick={() => setExperience((l) => l.filter((_, idx) => idx !== i))}
                  className="flex items-center gap-1 text-xs text-slate hover:text-danger"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Button onClick={handleSave} isLoading={isSaving}>
          <Save className="h-4 w-4" />
          Save CV
        </Button>

        <Card>
          <h2 className="font-heading text-sm font-semibold text-charcoal dark:text-white">
            Portfolio projects
          </h2>
          <div className="mt-4 space-y-3">
            <Input label="Project title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            <Input label="Link (optional)" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://github.com/..." />
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={2}
              placeholder="Short description"
              className={textareaClass}
            />
            <Button size="sm" onClick={handleAddProject} disabled={!newTitle.trim()}>
              <Plus className="h-4 w-4" />
              Add project
            </Button>
          </div>
          <div className="mt-4 divide-y divide-slate-border dark:divide-white/10">
            {projects.map((p) => (
              <div key={p.id} className="flex items-start justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-charcoal dark:text-white">{p.title}</p>
                  {p.description && <p className="text-xs text-slate">{p.description}</p>}
                  {p.url && <p className="text-xs text-indigo">{p.url}</p>}
                </div>
                <button
                  onClick={() => handleDeleteProject(p.id)}
                  aria-label="Remove project"
                  className="text-slate hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <div className="no-print flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-charcoal dark:text-white">
            Your generated CV
          </h2>
          <Button size="sm" variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Print or save as PDF
          </Button>
        </div>
        <div className="mt-4 rounded-xl2 border border-slate-border bg-white p-8 text-slate-900 shadow-card">
          <h1 className="font-heading text-2xl font-bold">{name}</h1>
          <p className="text-sm text-slate-600">{headline}</p>
          <p className="mt-1 text-xs text-slate-600">
            {email}
            {phone ? ` · ${phone}` : ""}
          </p>

          {summary && (
            <>
              <h3 className="mt-6 border-b border-slate-300 pb-1 font-heading text-sm font-bold uppercase tracking-wide">
                Summary
              </h3>
              <p className="mt-2 text-sm">{summary}</p>
            </>
          )}

          {skillList.length > 0 && (
            <>
              <h3 className="mt-6 border-b border-slate-300 pb-1 font-heading text-sm font-bold uppercase tracking-wide">
                Skills
              </h3>
              <p className="mt-2 text-sm">{skillList.join(" · ")}</p>
            </>
          )}

          {education.some((e) => e.school || e.qualification) && (
            <>
              <h3 className="mt-6 border-b border-slate-300 pb-1 font-heading text-sm font-bold uppercase tracking-wide">
                Education
              </h3>
              {education
                .filter((e) => e.school || e.qualification)
                .map((e, i) => (
                  <p key={i} className="mt-2 text-sm">
                    <span className="font-semibold">{e.qualification}</span>
                    {e.school ? `, ${e.school}` : ""}
                    {e.years ? ` (${e.years})` : ""}
                  </p>
                ))}
            </>
          )}

          {experience.some((e) => e.role || e.company) && (
            <>
              <h3 className="mt-6 border-b border-slate-300 pb-1 font-heading text-sm font-bold uppercase tracking-wide">
                Experience
              </h3>
              {experience
                .filter((e) => e.role || e.company)
                .map((e, i) => (
                  <div key={i} className="mt-2 text-sm">
                    <p>
                      <span className="font-semibold">{e.role}</span>
                      {e.company ? `, ${e.company}` : ""}
                      {e.years ? ` (${e.years})` : ""}
                    </p>
                    {e.details && <p className="text-slate-600">{e.details}</p>}
                  </div>
                ))}
            </>
          )}

          {projects.length > 0 && (
            <>
              <h3 className="mt-6 border-b border-slate-300 pb-1 font-heading text-sm font-bold uppercase tracking-wide">
                Portfolio
              </h3>
              {projects.map((p) => (
                <div key={p.id} className="mt-2 text-sm">
                  <p className="font-semibold">{p.title}</p>
                  {p.description && <p className="text-slate-600">{p.description}</p>}
                  {p.url && <p className="text-xs text-slate-600">{p.url}</p>}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
