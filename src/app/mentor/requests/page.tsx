"use client";

import { useEffect, useState } from "react";
import { Send, Check, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

interface RequestItem {
  id: string;
  message: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "COMPLETED";
  createdAt: string;
  student: {
    department: string;
    yearOfStudy: string;
    user: { name: string; avatarInitials: string; avatarColor: string };
  };
}

export default function MentorRequestsPage() {
  const { showToast } = useToast();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function fetchRequests() {
    setIsLoading(true);
    const res = await fetch("/api/mentor/requests");
    const data = await res.json();
    setRequests(data);
    setIsLoading(false);
  }

  useEffect(() => {
    fetchRequests();
  }, []);

  async function handleAction(id: string, status: "ACCEPTED" | "DECLINED") {
    setProcessingId(id);
    const res = await fetch(`/api/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setProcessingId(null);

    if (res.ok) {
      showToast(
        status === "ACCEPTED" ? "Request accepted!" : "Request declined",
        status === "ACCEPTED" ? "success" : "info"
      );
      fetchRequests();
    } else {
      showToast("Something went wrong", "error");
    }
  }

  const pending = requests.filter((r) => r.status === "PENDING");
  const others = requests.filter((r) => r.status !== "PENDING");

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-white">
          Mentorship requests
        </h1>
        <p className="mt-1 text-sm text-slate">
          Review and respond to students requesting your mentorship.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={Send}
          title="No requests yet"
          description="Student mentorship requests will appear here."
        />
      ) : (
        <>
          {pending.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-slate">
                Pending ({pending.length})
              </h2>
              {pending.map((req) => (
                <Card key={req.id}>
                  <div className="flex items-start gap-4">
                    <Avatar
                      initials={req.student.user.avatarInitials}
                      colorClass={req.student.user.avatarColor}
                      size="lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-heading text-sm font-semibold text-charcoal dark:text-white">
                            {req.student.user.name}
                          </p>
                          <p className="text-xs text-slate">
                            {req.student.department} · {req.student.yearOfStudy}
                          </p>
                        </div>
                        <Badge variant="warning">Pending</Badge>
                      </div>
                      <p className="mt-3 text-sm text-slate">{req.message}</p>
                      <div className="mt-4 flex gap-3">
                        <Button
                          size="sm"
                          onClick={() => handleAction(req.id, "ACCEPTED")}
                          isLoading={processingId === req.id}
                        >
                          <Check className="h-3.5 w-3.5" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(req.id, "DECLINED")}
                          isLoading={processingId === req.id}
                        >
                          <X className="h-3.5 w-3.5" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {others.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-slate">
                History
              </h2>
              {others.map((req) => (
                <Card key={req.id}>
                  <div className="flex items-center gap-4">
                    <Avatar
                      initials={req.student.user.avatarInitials}
                      colorClass={req.student.user.avatarColor}
                    />
                    <div className="flex-1">
                      <p className="font-heading text-sm font-semibold text-charcoal dark:text-white">
                        {req.student.user.name}
                      </p>
                      <p className="text-xs text-slate">{req.student.department}</p>
                    </div>
                    <Badge
                      variant={req.status === "ACCEPTED" ? "success" : "danger"}
                    >
                      {req.status === "ACCEPTED" ? "Accepted" : "Declined"}
                    </Badge>
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
