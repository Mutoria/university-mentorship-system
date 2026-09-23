import Link from "next/link";
import { GraduationCap } from "lucide-react";

const columns = [
  {
    title: "Platform",
    links: ["How it works", "Find a mentor", "Become a mentor", "FAQ"],
  },
  {
    title: "Company",
    links: ["About the program", "Contact support", "Privacy policy", "Terms of use"],
  },
  {
    title: "Resources",
    links: ["Student guide", "Mentor guide", "Success stories", "Help center"],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-border dark:border-white/10 bg-navy text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="font-heading text-base font-bold">MentorHub</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-white/60">
              Connecting students with mentors who help them grow academically,
              professionally, and personally.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-heading text-sm font-semibold text-white/90">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-white/60 hover:text-teal transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} University Students Mentorship System.
            All rights reserved.
          </p>
          <p className="text-xs text-white/50">Built for student success.</p>
        </div>
      </div>
    </footer>
  );
}