"use client";

import { useEffect, useState } from "react";
import { Target, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

interface ProgressUpdate {
  id: string;
  note: string;
  percentage: number;
  createdAt: string;
}

interface GoalItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  targetDate: string | null;
  progressUpdates: ProgressUpdate[];
}

export default function StudentGoalsPage() {
  const { showToast } = useToast();
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [progressGoalId, setProgressGoalId] = useState<string | null>(null);
  const [progressNote, setProgressNote] = useState("");
  const [progressPct, setProgressPct] = useState(50);

  async function fetchGoals() {
    setIsLoading(true);
    const res = await fetch("/api/goals");
    const data = await res.json();
    setGoals(data);
    setIsLoading(false);
  }

  useEffect(() => {
    fetchGoals();
  }, []);

  async function handleCreateGoal() {
    if (!newTitle.trim()) return;
    setIsSaving(true);
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, description: newDescription }),
    });
    setIsSaving(false);
    if (res.ok) {
      showToast("Goal created!", "success");
      setIsCreateOpen(false);
      setNewTitle("");
      setNewDescription("");
      fetchGoals();
    }
  }

  async function handleAddProgress() {
    if (!progressGoalId) return;
    setIsSaving(true);
    const res = await fetch(`/api/goals/${progressGoalId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: progressNote, percentage: progressPct }),
    });
    setIsSaving(false);
    if (res.ok) {
      showToast("Progress updated!", "success");
      setProgressGoalId(null);
      setProgressNote("");
      setProgressPct(50);
      fetchGoals();
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-white">
            Goals
          </h1>
          <p className="mt-1 text-sm text-slate">
            Track your progress toward what matters.
          </p>
        </div>
        <Button size="sm" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New goal
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals yet"
          description="Create your first goal to start tracking progress."
          action={
            <Button size="sm" onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              New goal
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const latest = goal.progressUpdates[goal.progressUpdates.length - 1];
            const pct = latest?.percentage ?? 0;
            return (
              <Card key={goal.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-heading text-base font-semibold text-charcoal dark:text-white">
                      {goal.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate">{goal.description}</p>
                  </div>
                  <Badge variant={goal.completed ? "success" : "info"}>
                    {goal.completed ? "Completed" : `${pct}%`}
                  </Badge>
                </div>

                <div className="mt-4 h-2 w-full rounded-full bg-slate-border dark:bg-white/10">
                  <div
                    className="h-2 rounded-full bg-teal transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {goal.progressUpdates.length > 0 && (
                  <div className="mt-4 space-y-2 border-t border-slate-border dark:border-white/10 pt-4">
                    {goal.progressUpdates.slice(-2).reverse().map((u) => (
                      <p key={u.id} className="text-xs text-slate">
                        <span className="font-medium text-charcoal dark:text-white">
                          {u.percentage}%
                        </span>{" "}
                        — {u.note}
                      </p>
                    ))}
                  </div>
                )}

                {!goal.completed && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setProgressGoalId(goal.id);
                      setProgressPct(pct);
                    }}
                  >
                    Log progress
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create a new goal"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateGoal} isLoading={isSaving} disabled={!newTitle.trim()}>
              Create goal
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Goal title"
            placeholder="e.g. Land a summer internship"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal dark:text-white">
              Description
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={3}
              placeholder="What does success look like?"
              className="w-full rounded-xl border border-slate-border bg-surface dark:bg-navy-light dark:border-white/10 px-3.5 py-2.5 text-sm text-charcoal dark:text-white placeholder:text-slate/70 focus:outline-none focus:ring-2 focus:ring-indigo"
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!progressGoalId}
        onClose={() => setProgressGoalId(null)}
        title="Log progress"
        footer={
          <>
            <Button variant="outline" onClick={() => setProgressGoalId(null)}>
              Cancel
            </Button>
            <Button onClick={handleAddProgress} isLoading={isSaving}>
              Save progress
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal dark:text-white">
              Progress: {progressPct}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={progressPct}
              onChange={(e) => setProgressPct(Number(e.target.value))}
              className="w-full accent-indigo"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal dark:text-white">
              Note
            </label>
            <textarea
              value={progressNote}
              onChange={(e) => setProgressNote(e.target.value)}
              rows={3}
              placeholder="What did you accomplish?"
              className="w-full rounded-xl border border-slate-border bg-surface dark:bg-navy-light dark:border-white/10 px-3.5 py-2.5 text-sm text-charcoal dark:text-white placeholder:text-slate/70 focus:outline-none focus:ring-2 focus:ring-indigo"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
