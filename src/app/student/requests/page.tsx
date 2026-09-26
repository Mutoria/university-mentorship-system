"use client";

import { useEffect, useState } from "react";
import { Send, CalendarClock, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

interface RequestItem {
  id: string;
  message: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "COMPLETED";
  mentor: {
    user: { name: string; avatarInitials: string; avatarColor: string };
  };
  sessions: { id: string; scheduledAt: string; status: string }[];
}

interface ActiveMentor {
  requestId: string;
  mentorName: string;
  availability: { id: string; dayOfWeek: number; startTime: string; endTime: string }[];
}

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function StudentRequestsPage() {
  const { showToast } = useToast();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [activeMentors, setActiveMentors] = useState<ActiveMentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingRequestId, setBookingRequestId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  async function fetchData() {
    setIsLoading(true);
    const [reqRes, mentorRes] = await Promise.all([
      fetch("/api/student/requests"),
      fetch("/api/student/active-mentors"),
    ]);
    setRequests(await reqRes.json());
    setActiveMentors(await mentorRes.json());
    setIsLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  const currentMentor = activeMentors.find((m) => m.requestId === bookingRequestId);

  async function handleBook() {
    if (!bookingRequestId || !selectedSlot) return;
    setIsBooking(true);

    const now = new Date();
    const daysUntilNext = (targetDay: number) => {
      const diff = (targetDay + 7 - now.getDay()) % 7;
      return diff === 0 ? 7 : diff;
    };

    const [dayStr, time] = selectedSlot.split("|");
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + daysUntilNext(Number(dayStr)));
    const [hours, minutes] = time.split(":").map(Number);
    targetDate.setHours(hours, minutes, 0, 0);

    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestId: bookingRequestId,
        scheduledAt: targetDate.toISOString(),
        durationMins: 30,
      }),
    });

    setIsBooking(false);
    if (res.ok) {
      showToast("Session booked!", "success");
      setBookingRequestId(null);
      setSelectedSlot("");
      fetchData();
    } else {
      showToast("Something went wrong", "error");
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-white">
          My requests
        </h1>
        <p className="mt-1 text-sm text-slate">
          Track your mentorship requests and book sessions.
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
          description="Browse mentors and send your first request to get started."
        />
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <Card key={req.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-heading text-sm font-semibold text-charcoal dark:text-white">
                    {req.mentor.user.name}
                  </p>
                  <p className="mt-1 text-sm text-slate">{req.message}</p>
                </div>
                <Badge
                  variant={
                    req.status === "ACCEPTED"
                      ? "success"
                      : req.status === "PENDING"
                      ? "warning"
                      : "danger"
                  }
                >
                  {req.status}
                </Badge>
              </div>

              {req.status === "ACCEPTED" && (
                <div className="mt-4 border-t border-slate-border dark:border-white/10 pt-4">
                  {req.sessions.length > 0 && (
                    <div className="mb-3 space-y-2">
                      {req.sessions.map((s) => (
                        <div key={s.id} className="flex items-center gap-2 text-sm text-slate">
                          <CalendarClock className="h-3.5 w-3.5" />
                          {new Date(s.scheduledAt).toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                          {" · "}
                          {new Date(s.scheduledAt).toLocaleTimeString(undefined, {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setBookingRequestId(req.id)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Book a session
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!bookingRequestId}
        onClose={() => setBookingRequestId(null)}
        title={`Book a session with ${currentMentor?.mentorName ?? ""}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setBookingRequestId(null)}>
              Cancel
            </Button>
            <Button onClick={handleBook} isLoading={isBooking} disabled={!selectedSlot}>
              Confirm booking
            </Button>
          </>
        }
      >
        {currentMentor && currentMentor.availability.length > 0 ? (
          <Select
            label="Choose a time slot"
            placeholder="Select an available time"
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            options={currentMentor.availability.map((a) => ({
              label: `${dayNames[a.dayOfWeek]} · ${a.startTime} – ${a.endTime}`,
              value: `${a.dayOfWeek}|${a.startTime}`,
            }))}
          />
        ) : (
          <p className="text-sm text-slate">
            This mentor hasn't set their availability yet.
          </p>
        )}
      </Modal>
    </div>
  );
}
