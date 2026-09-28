"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/ui/Skeleton";

interface MentorRating {
  name: string;
  rating: number;
  reviews: number;
  sessions: number;
  verified: boolean;
}

interface Analytics {
  mentorRatings: MentorRating[];
  sessionsByStatus: Record<string, number>;
  monthly: { month: string; requests: number; signups: number }[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/analytics");
      setData(await res.json());
    }
    load();
  }, []);

  if (!data) {
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const statusCards = [
    { label: "Scheduled", value: data.sessionsByStatus.SCHEDULED },
    { label: "Completed", value: data.sessionsByStatus.COMPLETED },
    { label: "Cancelled", value: data.sessionsByStatus.CANCELLED },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-white">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-slate">
          Mentor performance and platform activity over time.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statusCards.map((s) => (
          <Card key={s.label}>
            <p className="text-sm text-slate">{s.label} sessions</p>
            <p className="mt-1 font-heading text-2xl font-bold text-charcoal dark:text-white">
              {s.value}
            </p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="font-heading text-sm font-semibold text-charcoal dark:text-white">
          Monthly requests and sign-ups
        </h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.monthly}>
              <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="requests" name="Requests" fill="#4F46E5" radius={[6, 6, 0, 0]} />
              <Bar dataKey="signups" name="Sign-ups" fill="#14B8A6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h2 className="font-heading text-sm font-semibold text-charcoal dark:text-white">
          Mentor ratings
        </h2>
        <div className="mt-4 divide-y divide-slate-border dark:divide-white/10">
          {data.mentorRatings.map((m) => (
            <div key={m.name} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-charcoal dark:text-white">
                  {m.name}
                </p>
                <p className="text-xs text-slate">
                  {m.reviews} reviews · {m.sessions} sessions
                </p>
              </div>
              <div className="flex items-center gap-3">
                {!m.verified && <Badge variant="warning">Unverified</Badge>}
                <div className="flex items-center gap-1 text-sm font-medium text-charcoal dark:text-white">
                  <Star className="h-4 w-4 fill-gold text-gold" />
                  {m.rating || "—"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
