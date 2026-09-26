"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Check, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

interface MentorItem {
  id: string;
  title: string;
  department: string;
  bio: string;
  expertise: string[];
  verified: boolean;
  user: { name: string; email: string; avatarInitials: string; avatarColor: string };
}

export default function AdminVerificationPage() {
  const { showToast } = useToast();
  const [mentors, setMentors] = useState<MentorItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function fetchMentors() {
    setIsLoading(true);
    const res = await fetch("/api/admin/users?role=MENTOR");
    const users = await res.json();
    const mentorList = users
      .filter((u: { mentorProfile: MentorItem | null }) => u.mentorProfile)
      .map((u: { mentorProfile: MentorItem; name: string; email: string; avatarInitials: string; avatarColor: string }) => ({
        ...u.mentorProfile,
        user: { name: u.name, email: u.email, avatarInitials: u.avatarInitials, avatarColor: u.avatarColor },
      }));
    setMentors(mentorList);
    setIsLoading(false);
  }

  useEffect(() => {
    fetchMentors();
  }, []);

  async function handleVerify(id: string, verified: boolean) {
    setProcessingId(id);
    const res = await fetch(`/api/admin/mentors/${id}/verify`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verified }),
    });
    setProcessingId(null);
    if (res.ok) {
      showToast(verified ? "Mentor verified!" : "Verification revoked", verified ? "success" : "info");
      fetchMentors();
    }
  }

  const unverified = mentors.filter((m) => !m.verified);
  const verified = mentors.filter((m) => m.verified);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-white">
          Mentor verification
        </h1>
        <p className="mt-1 text-sm text-slate">
          Review and verify mentor applications before they appear to students.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-slate">
              Pending review ({unverified.length})
            </h2>
            {unverified.length === 0 ? (
              <EmptyState
                icon={ShieldCheck}
                title="Nothing to review"
                description="All mentors are currently verified."
              />
            ) : (
              unverified.map((m) => (
                <Card key={m.id}>
                  <div className="flex items-start gap-4">
                    <Avatar initials={m.user.avatarInitials} colorClass={m.user.avatarColor} size="lg" />
                    <div className="flex-1">
                      <p className="font-heading text-sm font-semibold text-charcoal dark:text-white">
                        {m.user.name}
                      </p>
                      <p className="text-xs text-slate">{m.title} · {m.department}</p>
                      <p className="mt-2 text-sm text-slate">{m.bio}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {m.expertise.map((e) => (
                          <Badge key={e} variant="default">{e}</Badge>
                        ))}
                      </div>
                      <div className="mt-4 flex gap-3">
                        <Button
                          size="sm"
                          onClick={() => handleVerify(m.id, true)}
                          isLoading={processingId === m.id}
                        >
                          <Check className="h-3.5 w-3.5" />
                          Verify
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {verified.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-slate">
                Verified mentors ({verified.length})
              </h2>
              {verified.map((m) => (
                <Card key={m.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar initials={m.user.avatarInitials} colorClass={m.user.avatarColor} />
                      <div>
                        <p className="font-heading text-sm font-semibold text-charcoal dark:text-white">
                          {m.user.name}
                        </p>
                        <p className="text-xs text-slate">{m.department}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVerify(m.id, false)}
                      isLoading={processingId === m.id}
                    >
                      <X className="h-3.5 w-3.5" />
                      Revoke
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
