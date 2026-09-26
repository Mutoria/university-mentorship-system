"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";

interface Slot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
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

const timeOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return { label: `${hour}:00`, value: `${hour}:00` };
});

export default function MentorAvailabilityPage() {
  const { showToast } = useToast();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [isSaving, setIsSaving] = useState(false);

  async function fetchSlots() {
    setIsLoading(true);
    const res = await fetch("/api/availability");
    const data = await res.json();
    setSlots(data);
    setIsLoading(false);
  }

  useEffect(() => {
    fetchSlots();
  }, []);

  async function handleAdd() {
    setIsSaving(true);
    const res = await fetch("/api/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayOfWeek, startTime, endTime }),
    });
    setIsSaving(false);
    if (res.ok) {
      showToast("Availability added!", "success");
      fetchSlots();
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/availability/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Slot removed", "info");
      fetchSlots();
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-white">
          Availability
        </h1>
        <p className="mt-1 text-sm text-slate">
          Set the times students can book sessions with you.
        </p>
      </div>

      <Card>
        <h2 className="font-heading text-sm font-semibold text-charcoal dark:text-white">
          Add a time slot
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Select
            label="Day"
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value)}
            options={dayNames.map((d, i) => ({ label: d, value: String(i) }))}
          />
          <Select
            label="Start time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            options={timeOptions}
          />
          <Select
            label="End time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            options={timeOptions}
          />
        </div>
        <Button size="sm" className="mt-4" onClick={handleAdd} isLoading={isSaving}>
          <Plus className="h-4 w-4" />
          Add slot
        </Button>
      </Card>

      {isLoading ? null : slots.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No availability set"
          description="Add time slots above so students know when they can book you."
        />
      ) : (
        <div className="space-y-3">
          {slots.map((slot) => (
            <Card key={slot.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CalendarClock className="h-4 w-4 text-indigo" />
                  <p className="text-sm font-medium text-charcoal dark:text-white">
                    {dayNames[slot.dayOfWeek]} · {slot.startTime} – {slot.endTime}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(slot.id)}
                  aria-label="Remove slot"
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
