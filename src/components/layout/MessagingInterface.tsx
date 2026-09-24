"use client";

import { useEffect, useRef, useState } from "react";
import { Send as SendIcon, MessageSquare } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

interface Partner {
  userId: string;
  name: string;
  avatarInitials: string;
  avatarColor: string;
}

interface MessageItem {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

export function MessagingInterface({ currentUserId }: { currentUserId: string }) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selected, setSelected] = useState<Partner | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoadingPartners, setIsLoadingPartners] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadPartners() {
      const res = await fetch("/api/conversations");
      const data = await res.json();
      setPartners(data);
      setIsLoadingPartners(false);
      if (data.length > 0) setSelected(data[0]);
    }
    loadPartners();
  }, []);

  useEffect(() => {
    if (!selected) return;
    async function loadMessages() {
      const res = await fetch(`/api/messages?with=${selected!.userId}`);
      const data = await res.json();
      setMessages(data);
    }
    loadMessages();
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!draft.trim() || !selected) return;
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: selected.userId, content: draft }),
    });
    if (res.ok) {
      const newMessage = await res.json();
      setMessages((prev) => [...prev, newMessage]);
      setDraft("");
    }
  }

  if (isLoadingPartners) {
    return <div className="text-sm text-slate">Loading conversations...</div>;
  }

  if (partners.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No conversations yet"
        description="Once you have an active mentorship, you can message each other here."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-xl2 border border-slate-border dark:border-white/10 sm:grid-cols-[280px_1fr] h-[600px]">
      <div className="border-b sm:border-b-0 sm:border-r border-slate-border dark:border-white/10 bg-surface dark:bg-navy-light overflow-y-auto">
        {partners.map((p) => (
          <button
            key={p.userId}
            onClick={() => setSelected(p)}
            className={cn(
              "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
              selected?.userId === p.userId
                ? "bg-indigo/10"
                : "hover:bg-slate-border/30 dark:hover:bg-white/5"
            )}
          >
            <Avatar initials={p.avatarInitials} colorClass={p.avatarColor} size="sm" />
            <span className="text-sm font-medium text-charcoal dark:text-white">
              {p.name}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col bg-background dark:bg-navy">
        <div className="flex items-center gap-3 border-b border-slate-border dark:border-white/10 bg-surface dark:bg-navy-light px-4 py-3">
          {selected && (
            <>
              <Avatar initials={selected.avatarInitials} colorClass={selected.avatarColor} size="sm" />
              <span className="font-heading text-sm font-semibold text-charcoal dark:text-white">
                {selected.name}
              </span>
            </>
          )}
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((m) => {
            const isMine = m.senderId === currentUserId;
            return (
              <div
                key={m.id}
                className={cn("flex", isMine ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                    isMine
                      ? "bg-indigo text-white rounded-br-sm"
                      : "bg-surface dark:bg-navy-light border border-slate-border dark:border-white/10 text-charcoal dark:text-white rounded-bl-sm"
                  )}
                >
                  {m.content}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="flex items-center gap-2 border-t border-slate-border dark:border-white/10 p-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 rounded-xl border border-slate-border bg-surface dark:bg-navy-light dark:border-white/10 px-3.5 py-2.5 text-sm text-charcoal dark:text-white placeholder:text-slate/70 focus:outline-none focus:ring-2 focus:ring-indigo"
          />
          <button
            onClick={handleSend}
            disabled={!draft.trim()}
            aria-label="Send message"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo text-white disabled:opacity-50 hover:bg-indigo-dark transition-colors"
          >
            <SendIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
