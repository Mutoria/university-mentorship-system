"use client";

import { useEffect, useState } from "react";
import { Sparkles, Star, Send } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";

interface MatchResult {
  id: string;
  name: string;
  title: string;
  department: string;
  bio: string;
  expertise: string[];
  avatarInitials: string;
  avatarColor: string;
  rating: number;
  reviewCount: number;
  score: number;
  reasons: string[];
}

export default function StudentMatchesPage() {
  const { showToast } = useToast();
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<MatchResult | null>(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const res = await fetch("/api/match");
      const data = await res.json();
      setMatches(Array.isArray(data) ? data : []);
      setIsLoading(false);
    }
    load();
  }, []);

  async function handleSendRequest() {
    if (!selected) return;
    setIsSending(true);
    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mentorId: selected.id, message: requestMessage }),
    });
    setIsSending(false);

    if (res.ok) {
      showToast(`Request sent to ${selected.name}!`, "success");
      setSelected(null);
      setRequestMessage("");
    } else {
      const data = await res.json();
      showToast(data.error ?? "Something went wrong", "error");
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-heading text-2xl font-bold text-charcoal dark:text-white">
          <Sparkles className="h-6 w-6 text-indigo" />
          Your top mentor matches
        </h1>
        <p className="mt-1 text-sm text-slate">
          Ranked by shared interests, department, and mentor track record.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No mentors to match yet"
          description="Check back once more mentors have been verified."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {matches.map((m, i) => (
            <Card key={m.id} hoverable className="flex flex-col">
              <div className="flex items-start justify-between">
                <Avatar initials={m.avatarInitials} colorClass={m.avatarColor} size="lg" />
                <div className="flex items-center gap-1 rounded-full bg-indigo/10 px-2.5 py-1 text-xs font-semibold text-indigo">
                  <Sparkles className="h-3 w-3" />
                  {m.score}% match
                </div>
              </div>

              <h3 className="mt-4 font-heading text-base font-semibold text-charcoal dark:text-white">
                {i === 0 && <Badge variant="success" className="mr-2">Top pick</Badge>}
                {m.name}
              </h3>
              <p className="text-xs text-slate">{m.title}</p>

              <div className="mt-3 space-y-1">
                {m.reasons.map((r) => (
                  <p key={r} className="text-xs text-slate">· {r}</p>
                ))}
              </div>

              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate flex-1">
                {m.bio}
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-slate-border dark:border-white/10 pt-4">
                <div className="flex items-center gap-1 text-sm font-medium text-charcoal dark:text-white">
                  <Star className="h-4 w-4 fill-gold text-gold" />
                  {m.rating || "New"}
                  {m.reviewCount > 0 && (
                    <span className="text-slate font-normal">({m.reviewCount})</span>
                  )}
                </div>
                <Button size="sm" onClick={() => setSelected(m)}>
                  <Send className="h-3.5 w-3.5" />
                  Request
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={`Request mentorship from ${selected?.name ?? ""}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendRequest}
              isLoading={isSending}
              disabled={!requestMessage.trim()}
            >
              Send request
            </Button>
          </>
        }
      >
        <label className="mb-1.5 block text-sm font-medium text-charcoal dark:text-white">
          Introduce yourself
        </label>
        <textarea
          value={requestMessage}
          onChange={(e) => setRequestMessage(e.target.value)}
          rows={4}
          placeholder="Hi, I'd love your guidance on..."
          className="w-full rounded-xl border border-slate-border bg-surface dark:bg-navy-light dark:border-white/10 px-3.5 py-2.5 text-sm text-charcoal dark:text-white placeholder:text-slate/70 focus:outline-none focus:ring-2 focus:ring-indigo"
        />
      </Modal>
    </div>
  );
}
