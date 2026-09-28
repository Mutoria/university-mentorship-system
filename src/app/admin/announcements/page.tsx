"use client";

import { useEffect, useState } from "react";
import { Megaphone, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function AdminAnnouncementsPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function fetchItems() {
    setIsLoading(true);
    const res = await fetch("/api/announcements");
    setItems(await res.json());
    setIsLoading(false);
  }

  useEffect(() => {
    fetchItems();
  }, []);

  async function handlePost() {
    setIsSaving(true);
    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    setIsSaving(false);
    if (res.ok) {
      showToast("Announcement published!", "success");
      setTitle("");
      setContent("");
      fetchItems();
    } else {
      const data = await res.json();
      showToast(data.error ?? "Something went wrong", "error");
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Announcement removed", "info");
      fetchItems();
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-white">
          Announcements
        </h1>
        <p className="mt-1 text-sm text-slate">
          Share updates with every student and mentor on the platform.
        </p>
      </div>

      <Card>
        <h2 className="font-heading text-sm font-semibold text-charcoal dark:text-white">
          New announcement
        </h2>
        <div className="mt-4 space-y-4">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Mentor training session this Friday"
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal dark:text-white">
              Message
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-border bg-surface dark:bg-navy-light dark:border-white/10 px-3.5 py-2.5 text-sm text-charcoal dark:text-white placeholder:text-slate/70 focus:outline-none focus:ring-2 focus:ring-indigo"
            />
          </div>
        </div>
        <Button
          className="mt-4"
          size="sm"
          onClick={handlePost}
          isLoading={isSaving}
          disabled={!title.trim() || !content.trim()}
        >
          <Plus className="h-4 w-4" />
          Publish
        </Button>
      </Card>

      {isLoading ? (
        <CardSkeleton />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements yet"
          description="Published announcements will appear here."
        />
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <Card key={a.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-heading text-sm font-semibold text-charcoal dark:text-white">
                    {a.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate">{a.content}</p>
                  <p className="mt-2 text-xs text-slate">
                    {new Date(a.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(a.id)}
                  aria-label="Delete announcement"
                  className="text-slate hover:text-danger transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
