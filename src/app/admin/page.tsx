"use client";

import { useEffect, useState } from "react";
import { Users, GraduationCap, ShieldCheck, CalendarCheck, Star, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Stats {
  totalUsers: number;
  totalStudents: number;
  totalMentors: number;
  activeMentors: number;
  pendingVerifications: number;
  completedSessions: number;
  avgRating: number;
  requestStatusCounts: Record<string, number>;
  activityByMonth: Record<string, number>;
}

const statusColors: Record<string, string> = {
  PENDING: "#F59E0B",
  ACCEPTED: "#14B8A6",
  DECLINED: "#EF4444",
  COMPLETED: "#4F46E5",
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setStats(data);
    }
    load();
  }, []);

  if (!stats) {
    return <div className="text-sm text-slate">Loading analytics...</div>;
  }

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users },
    { label: "Total Students", value: stats.totalStudents, icon: GraduationCap },
    { label: "Active Mentors", value: stats.activeMentors, icon: ShieldCheck },
    { label: "Pending Verification", value: stats.pendingVerifications, icon: Clock },
    { label: "Completed Sessions", value: stats.completedSessions, icon: CalendarCheck },
    { label: "Avg Mentor Rating", value: stats.avgRating || "—", icon: Star },
  ];

  const requestData = Object.entries(stats.requestStatusCounts).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  const activityData = Object.entries(stats.activityByMonth).map(([month, count]) => ({
    month,
    sessions: count,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-white">
          Platform overview
        </h1>
        <p className="mt-1 text-sm text-slate">
          Key metrics across the mentorship program.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate">{stat.label}</p>
                <p className="mt-1 font-heading text-2xl font-bold text-charcoal dark:text-white">
                  {stat.value}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo/10 text-indigo">
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-heading text-sm font-semibold text-charcoal dark:text-white">
            Request status breakdown
          </h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={requestData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                >
                  {requestData.map((entry) => (
                    <Cell key={entry.name} fill={statusColors[entry.name]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="font-heading text-sm font-semibold text-charcoal dark:text-white">
            Monthly session activity
          </h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="sessions" fill="#4F46E5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
