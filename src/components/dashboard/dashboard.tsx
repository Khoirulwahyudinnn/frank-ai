"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { Automations } from "./automations";
import { ChatPanel } from "./chat-panel";
import { PerformanceSummary } from "./performance-summary";
import { RevenueChart } from "./revenue-chart";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { WhatsAppBanner } from "./whatsapp-banner";

export function Dashboard() {
  const root = useRef<HTMLDivElement>(null);
  const [chatOpen, setChatOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Page entrance choreography; skipped entirely for reduced-motion users.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ defaults: { ease: "power3.out", duration: 0.6 } })
          .from("[data-anim=sidebar]", { autoAlpha: 0, x: -12 })
          .from("[data-anim=nav-item]", { autoAlpha: 0, x: -8, duration: 0.4, stagger: 0.025 }, 0.1)
          .from("[data-anim=topbar]", { autoAlpha: 0, y: -8 }, 0.1)
          .from("[data-anim=main]", { autoAlpha: 0, y: 16 }, 0.15)
          .from("[data-anim=section]", { autoAlpha: 0, y: 14, stagger: 0.08 }, 0.3)
          .from("[data-anim=chat]", { autoAlpha: 0, x: 20 }, 0.35);
      });
      gsap.set(root.current, { autoAlpha: 1 });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="js-reveal invisible flex h-dvh bg-n-25">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((v) => !v)} />

      <div className="flex min-w-0 flex-1 flex-col px-3 pt-2 pb-3 lg:pl-0">
        <Topbar chatOpen={chatOpen} onToggleChat={() => setChatOpen((v) => !v)} />

        <div className="mt-3.5 flex min-h-0 flex-1">
          <main
            data-anim="main"
            className="flex min-w-0 flex-1 flex-col gap-4 scrollbar-none overflow-y-auto overscroll-contain rounded-2xl bg-white p-4 shadow-panel *:shrink-0"
          >
            <header data-anim="section" className="flex flex-col gap-0.5 leading-[1.4]">
              <h1 className="text-base font-medium text-n-900">Welcome to Frank</h1>
              <p className="text-xs text-n-500">Here&apos;s what Frank found across your marketing this week.</p>
            </header>
            <WhatsAppBanner />
            <PerformanceSummary />
            <RevenueChart />
            <Automations />
          </main>

          <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
        </div>
      </div>
    </div>
  );
}
