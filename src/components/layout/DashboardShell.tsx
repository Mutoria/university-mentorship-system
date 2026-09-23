"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  GraduationCap,
  LayoutDashboard,
  Search,
  Send,
  MessageSquare,
  Target,
  User,
  LogOut,
  Menu,
  X,
  Users,
  CalendarClock,
  ShieldCheck,
  Megaphone,
  BarChart3,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/utils";

const navByRole = {
  STUDENT: [
    { label: "Dashboard", href: "/student", icon: LayoutDashboard },
    { label: "Find Mentors", href: "/student/mentors", icon: Search },
    { label: "My Requests", href: "/student/requests", icon: Send },
    { label: "Messages", href: "/student/messages", icon: MessageSquare },
    { label: "Goals", href: "/student/goals", icon: Target },
    { label: "Profile", href: "/student/profile", icon: User },
  ],
  MENTOR: [
    { label: "Dashboard", href: "/mentor", icon: LayoutDashboard },
    { label: "My Mentees", href: "/mentor/mentees", icon: Users },
    { label: "Requests", href: "/mentor/requests", icon: Send },
    { label: "Availability", href: "/mentor/availability", icon: CalendarClock },
    { label: "Messages", href: "/mentor/messages", icon: MessageSquare },
    { label: "Profile", href: "/mentor/profile", icon: User },
  ],
  ADMIN: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Mentor Verification", href: "/admin/verification", icon: ShieldCheck },
    { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  ],
} as const;

export function DashboardShell({
  role,
  children,
}: {
  role: "STUDENT" | "MENTOR" | "ADMIN";
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = navByRole[role];

  return (
    <div className="min-h-screen bg-background dark:bg-navy">
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col border-r border-slate-border dark:border-white/10 bg-surface dark:bg-navy-light">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-slate-border dark:border-white/10">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-heading text-base font-bold text-charcoal dark:text-white">
            MentorHub
          </span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-indigo text-white"
                    : "text-slate hover:bg-slate-border/40 dark:hover:bg-white/10 hover:text-charcoal dark:hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-border dark:border-white/10 p-4">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate hover:bg-slate-border/40 dark:hover:bg-white/10 hover:text-charcoal dark:hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-border dark:border-white/10 bg-surface/80 dark:bg-navy/80 backdrop-blur-md px-4 sm:px-6">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden rounded-lg p-2 text-charcoal dark:text-white hover:bg-slate-border/40 dark:hover:bg-white/10"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {session?.user && (
              <div className="flex items-center gap-2">
                <Avatar
                  initials={session.user.avatarInitials}
                  colorClass={session.user.avatarColor}
                  size="sm"
                />
                <span className="hidden sm:block text-sm font-medium text-charcoal dark:text-white">
                  {session.user.name}
                </span>
              </div>
            )}
          </div>
        </header>

        {mobileOpen && (
          <div className="lg:hidden border-b border-slate-border dark:border-white/10 bg-surface dark:bg-navy px-4 py-3 animate-fade-in">
            <nav className="space-y-1">
              {nav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                      active
                        ? "bg-indigo text-white"
                        : "text-slate hover:bg-slate-border/40 dark:hover:bg-white/10"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate hover:bg-slate-border/40 dark:hover:bg-white/10"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </nav>
          </div>
        )}

        <main className="px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
