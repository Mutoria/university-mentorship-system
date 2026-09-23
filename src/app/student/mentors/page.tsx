"use client";

import { useEffect, useState } from "react";
import { Search, Star, Send } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";

interface MentorResult {
  id: string;
  name: string;
  title: string;
  department: string;
  bio: string;
  expertise: string[];
  avatarInitials: string;
  avatarColor: string;
  sessionsCompleted: number;
  rating: number;
  reviewCount: number;
}

export default function FindMentorsPage() {
  const { showToast } = useToast();
  const [mentors, setMentors] = useState<MentorResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("all");
  const [selectedMentor, setSelectedMentor] = useState<MentorResult | null>(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function fetchMentors() {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (department !== "all") params.set("department", department);
    const res = await fetch(`/api/mentors?${params.toString()}`);
    const data = await res.json();
    setMentors(data);
    setIsLoading(false);
  }

  useEffect(() => {
    fetchMentors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchMentors();
  }

  async function handleSendRequest() {
    if (!selectedMentor) return;
    setIsSending(true);
    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mentorId: selectedMentor.id,
        message: requestMessage,
      }),
    });
    setIsSending(false);

    if (res.ok) {
      showToast(`Request sent to ${selectedMentor.name}!`, "success");
      setSelectedMentor(null);
      setRequestMessage("");
    } else {
      const data = await res.json();
      showToast(data.error ?? "Something went wrong", "error");
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-white">
          Find a mentor
        </h1>
        <p className="mt-1 text-sm text-slate">
          Browse verified mentors and send a request to get started.
        </p>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Search by name, expertise, or department"
            icon={<Search className="h-4 w-4" />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="sm:w-56">
          <Select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            options={[
              { label: "All departments", value: "all" },
              { label: "School of Computing", value: "Computing" },
              { label: "Faculty of Business", value: "Business" },
              { label: "Industry Partner", value: "Industry" },
            ]}
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : mentors.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No mentors found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mentors.map((mentor) => (
            <Card key={mentor.id} hoverable className="flex flex-col">
              <div className="flex items-start justify-between">
                <Avatar
                  initials={mentor.avatarInitials}
                  colorClass={mentor.avatarColor}
                  size="lg"
                />
              </div>
              <h3 className="mt-4 font-heading text-base font-semibold text-charcoal dark:text-white">
                {mentor.name}
              </h3>
              <p className="text-xs text-slate">{mentor.title}</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {mentor.expertise.slice(0, 2).map((skill) => (
                  <Badge key={skill} variant="default">
                    {skill}
                  </Badge>
                ))}
              </div>

              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate flex-1">
                {mentor.bio}
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-slate-border dark:border-white/10 pt-4">
                <div className="flex items-center gap-1 text-sm font-medium text-charcoal dark:text-white">
                  <Star className="h-4 w-4 fill-gold text-gold" />
                  {mentor.rating || "New"}
                  {mentor.reviewCount > 0 && (
                    <span className="text-slate font-normal">
                      ({mentor.reviewCount})
                    </span>
                  )}
                </div>
                <Button size="sm" onClick={() => setSelectedMentor(mentor)}>
                  <Send className="h-3.5 w-3.5" />
                  Request
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!selectedMentor}
        onClose={() => setSelectedMentor(null)}
        title={`Request mentorship from ${selectedMentor?.name ?? ""}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setSelectedMentor(null)}>
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
