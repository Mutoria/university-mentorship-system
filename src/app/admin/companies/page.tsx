"use client";

import { useEffect, useState } from "react";
import { Building2, Check, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

interface CompanyItem {
  id: string;
  companyName: string;
  verified: boolean;
  user: { name: string; email: string };
}

export default function AdminCompaniesPage() {
  const { showToast } = useToast();
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/companies");
    const data = await res.json().catch(() => []);
    setCompanies(Array.isArray(data) ? data : []);
    setIsLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function setVerified(id: string, verified: boolean) {
    setBusyId(id);
    const res = await fetch(`/api/admin/companies/${id}/verify`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verified }),
    });
    setBusyId(null);
    if (res.ok) {
      showToast(verified ? "Company approved" : "Approval revoked", "success");
      load();
    } else {
      showToast("Something went wrong", "error");
    }
  }

  const pending = companies.filter((c) => !c.verified);
  const approved = companies.filter((c) => c.verified);

  function row(c: CompanyItem) {
    return (
      <Card key={c.id}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-heading text-sm font-semibold text-charcoal dark:text-white">
              {c.companyName}
            </p>
            <p className="text-xs text-slate">
              {c.user.name} · {c.user.email}
            </p>
          </div>
          {c.verified ? (
            <Button
              size="sm"
              variant="outline"
              isLoading={busyId === c.id}
              onClick={() => setVerified(c.id, false)}
            >
              <X className="h-3.5 w-3.5" />
              Revoke
            </Button>
          ) : (
            <Button
              size="sm"
              isLoading={busyId === c.id}
              onClick={() => setVerified(c.id, true)}
            >
              <Check className="h-3.5 w-3.5" />
              Approve
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-white">
          Company approval
        </h1>
        <p className="mt-1 text-sm text-slate">
          Students only see jobs from approved companies.
        </p>
      </div>

      {isLoading ? (
        <CardSkeleton />
      ) : companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies yet"
          description="Companies that register will appear here for approval."
        />
      ) : (
        <>
          <div className="space-y-3">
            <h2 className="flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wide text-slate">
              Pending <Badge variant="warning">{pending.length}</Badge>
            </h2>
            {pending.length === 0 ? (
              <p className="text-sm text-slate">Nothing waiting for approval.</p>
            ) : (
              pending.map(row)
            )}
          </div>
          <div className="space-y-3">
            <h2 className="flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wide text-slate">
              Approved <Badge variant="success">{approved.length}</Badge>
            </h2>
            {approved.map(row)}
          </div>
        </>
      )}
    </div>
  );
}
