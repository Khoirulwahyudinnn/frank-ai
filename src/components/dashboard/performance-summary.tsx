"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { formatKpi, kpis, type KpiFormat } from "@/lib/dashboard-data";
import { DeltaBadge } from "./delta-badge";
import { ViewButton } from "./view-button";

export function PerformanceSummary() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const end = Number(el.dataset.count);
        const format = el.dataset.format as KpiFormat;
        const counter = { value: 0 };
        gsap.to(counter, {
          value: end,
          duration: 1.4,
          delay: 0.45,
          ease: "power3.out",
          onUpdate: () => {
            el.textContent = formatKpi(counter.value, format);
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} data-anim="section" className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm leading-[1.4] font-medium text-n-900">Business performance summary</h2>
        <ViewButton>View Analytics</ViewButton>
      </div>

      <div className="grid overflow-hidden rounded-[10px] bg-[#fbfbfb] shadow-card sm:grid-cols-3">
        {kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className={`flex flex-col justify-center gap-4 p-4 transition-colors duration-300 hover:bg-white ${i > 0 ? "border-line max-sm:border-t sm:border-l" : ""}`}
          >
            <div className="flex items-center gap-1.5">
              <span
                className="swatch size-2 rounded-[3px]"
                style={{ "--swatch": kpi.color } as React.CSSProperties}
              />
              <span className="text-xs leading-[1.4] font-medium text-n-400">{kpi.label}</span>
            </div>
            <div className="flex flex-col gap-1">
              <p
                data-count={kpi.value}
                data-format={kpi.format}
                className="font-mono text-lg leading-[1.4] font-medium tracking-[-0.72px] text-n-900 tabular-nums"
              >
                {formatKpi(kpi.value, kpi.format)}
              </p>
              <div className="flex items-center gap-1.5">
                <DeltaBadge value={kpi.delta} />
                <span className="text-[11px] leading-[11px] text-n-600">vs previous period</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
