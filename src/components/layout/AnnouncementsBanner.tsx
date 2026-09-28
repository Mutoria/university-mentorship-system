"use client";

import { useEffect, useState } from "react";
import { Megaphone, X } from "lucide-react";

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
}

export function AnnouncementsBanner() {
  const [latest, setLatest] = useState<AnnouncementItem | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/announcements");
      if (!res.ok) return;
      const items: AnnouncementItem[] = await res.json();
      if (items.length > 0) setLatest(items[0]);
    }
    load();
  }, []);

  if (!latest || dismissed) return null;

  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-xl2 border border-indigo/20 bg-indigo/5 px-4 py-3"
    >
      <Megaphone className="mt-0.5 h-5 w-5 shrink-0 text-indigo" />
      <div className="flex-1">
        <p className="font-heading text-sm font-semibold text-charcoal dark:text-white">
          {latest.title}
        </p>
        <p className="mt-0.5 text-sm text-slate">{latest.content}</p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss announcement"
        className="text-slate hover:text-charcoal dark:hover:text-white transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
