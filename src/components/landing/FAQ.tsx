"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { demoFAQs } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export function FAQ() {
  const [openId, setOpenId] = useState<string | null>(demoFAQs[0]?.id ?? null);

  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="font-heading text-3xl font-bold text-charcoal dark:text-white sm:text-4xl">
          Frequently asked questions
        </h2>
        <p className="mt-4 text-base text-slate">
          Can't find what you're looking for? Reach out to student support.
        </p>
      </div>

      <div className="mt-10 space-y-3">
        {demoFAQs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className="rounded-xl2 border border-slate-border dark:border-white/10 bg-surface dark:bg-navy-light overflow-hidden"
            >
              <button
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="font-heading text-sm font-semibold text-charcoal dark:text-white">
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-slate transition-transform duration-200",
                    isOpen && "rotate-180 text-indigo"
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-200 ease-out",
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-4 text-sm leading-relaxed text-slate">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}