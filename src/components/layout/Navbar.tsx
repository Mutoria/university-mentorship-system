"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Mentors", href: "#mentors" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-border/70 dark:border-white/10 bg-surface/80 dark:bg-navy/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-heading text-base font-bold text-charcoal dark:text-white">
            MentorHub
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            
              <a key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate hover:text-charcoal dark:hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/role-selection">
            <Button variant="primary" size="sm">
              Get started
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            className="rounded-lg p-2 text-charcoal dark:text-white hover:bg-slate-border/40 dark:hover:bg-white/10"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-slate-border dark:border-white/10 bg-surface dark:bg-navy px-4 py-4 md:hidden animate-fade-in">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              
                <a key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate hover:bg-slate-border/40 dark:hover:bg-white/10 hover:text-charcoal dark:hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2 border-t border-slate-border dark:border-white/10 pt-4">
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full">
                Log in
              </Button>
            </Link>
            <Link href="/role-selection" className="w-full">
              <Button variant="primary" className="w-full">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}