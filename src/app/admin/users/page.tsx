"use client";

import { useEffect, useState } from "react";
import { Search, Users } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "MENTOR" | "ADMIN";
  avatarInitials: string;
  avatarColor: string;
  createdAt: string;
  studentProfile: { department: string } | null;
  mentorProfile: { department: string; verified: boolean } | null;
}

const PAGE_SIZE = 8;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);

  async function fetchUsers() {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (role !== "all") params.set("role", role);
    const res = await fetch(`/api/admin/users?${params.toString()}`);
    const data = await res.json();
    setUsers(data);
    setPage(1);
    setIsLoading(false);
  }

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const paginated = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-white">
          Users
        </h1>
        <p className="mt-1 text-sm text-slate">
          All students, mentors, and administrators on the platform.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchUsers();
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <div className="flex-1">
          <Input
            placeholder="Search by name or email"
            icon={<Search className="h-4 w-4" />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="sm:w-48">
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={[
              { label: "All roles", value: "all" },
              { label: "Students", value: "STUDENT" },
              { label: "Mentors", value: "MENTOR" },
              { label: "Admins", value: "ADMIN" },
            ]}
          />
        </div>
      </form>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="No users found" description="Try adjusting your search." />
      ) : (
        <>
          <div className="space-y-3">
            {paginated.map((u) => (
              <Card key={u.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar initials={u.avatarInitials} colorClass={u.avatarColor} />
                    <div>
                      <p className="font-heading text-sm font-semibold text-charcoal dark:text-white">
                        {u.name}
                      </p>
                      <p className="text-xs text-slate">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {u.mentorProfile && (
                      <Badge variant={u.mentorProfile.verified ? "success" : "warning"}>
                        {u.mentorProfile.verified ? "Verified" : "Unverified"}
                      </Badge>
                    )}
                    <Badge variant="default">{u.role}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-slate">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-slate-border dark:border-white/10 px-3 py-1.5 text-sm text-charcoal dark:text-white disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-slate-border dark:border-white/10 px-3 py-1.5 text-sm text-charcoal dark:text-white disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
