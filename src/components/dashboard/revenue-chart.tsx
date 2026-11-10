"use client";

import { useRef, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { chartData, chartMetrics, type MetricKey } from "@/lib/dashboard-data";
import { DeltaBadge } from "./delta-badge";

const tabs: MetricKey[] = ["revenue", "conversions", "orders"];
const xTicks = [1, 8, 15, 22, 30];

type TooltipContentProps = {
  active?: boolean;
  payload?: { value: number }[];
  metric: MetricKey;
};

function ChartTooltip({ active, payload, metric }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const config = chartMetrics[metric];
  return (
    <div className="flex w-20 flex-col gap-1.5 rounded-lg bg-[#1d1d1d] p-1.5 shadow-[0_1px_2px_0_rgba(0,0,0,0.25)]">
      <div className="flex items-center gap-1">
        <span className="swatch size-1.5 rounded-[2px]" style={{ "--swatch": "#2563eb" } as React.CSSProperties} />
        <span className="text-[10px] leading-[10px] font-medium text-white/60">{config.label}</span>
      </div>
      <span className="font-mono text-xs leading-3 font-medium text-white">{config.formatValue(payload[0].value)}</span>
    </div>
  );
}

export function RevenueChart() {
  const root = useRef<HTMLElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const totalRef = useRef<HTMLParagraphElement>(null);
  const mounted = useRef(false);
  const [metric, setMetric] = useState<MetricKey>("revenue");
  const config = chartMetrics[metric];

  useGSAP(
    () => {
      const tab = tabsRef.current?.querySelector<HTMLElement>(`[data-tab="${metric}"]`);
      const reduce = prefersReducedMotion();
      if (tab && pillRef.current) {
        const to = { x: tab.offsetLeft - 2, width: tab.offsetWidth, autoAlpha: 1 };
        if (mounted.current && !reduce) gsap.to(pillRef.current, { ...to, duration: 0.4, ease: "power3.out" });
        else gsap.set(pillRef.current, to);
      }

      if (reduce) {
        mounted.current = true;
        return;
      }

      // Draw the plot in from left to right.
      gsap.fromTo(
        ".chart-plot",
        { clipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 0% 0 0)", duration: 1.2, delay: mounted.current ? 0 : 0.5, ease: "power2.inOut" },
      );

      if (mounted.current && totalRef.current) {
        const el = totalRef.current;
        const counter = { value: 0 };
        gsap.to(counter, {
          value: config.total,
          duration: 0.8,
          ease: "power3.out",
          onUpdate: () => {
            el.textContent = config.formatTotal(counter.value);
          },
        });
        gsap.fromTo(".chart-delta", { autoAlpha: 0, y: 4 }, { autoAlpha: 1, y: 0, duration: 0.35, delay: 0.2 });
      }
      mounted.current = true;
    },
    { dependencies: [metric], scope: root },
  );

  return (
    <section ref={root} data-anim="section" className="flex w-full flex-col gap-3 rounded-xl bg-white p-4 shadow-card">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="text-sm leading-[1.4] font-medium text-n-900">Revenue performance</h2>
          <p className="text-xs leading-[1.5] text-n-500">Revenue generated across your marketing channels.</p>
        </div>
        <div
          ref={tabsRef}
          role="tablist"
          aria-label="Chart metric"
          className="relative flex items-start gap-0.5 overflow-hidden rounded-[10px] bg-n-25 p-0.5"
        >
          <span
            ref={pillRef}
            aria-hidden
            className="invisible absolute top-0.5 left-0.5 h-[26px] rounded-lg bg-white shadow-control"
          />
          {tabs.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              data-tab={key}
              aria-selected={metric === key}
              onClick={() => setMetric(key)}
              className={`relative z-10 flex items-center rounded-lg px-2 py-[5px] text-xs leading-4 font-medium transition-colors ${
                metric === key ? "text-n-900" : "text-n-700 hover:text-n-900"
              }`}
            >
              {chartMetrics[key].label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <p ref={totalRef} className="font-mono text-lg leading-[1.4] font-medium tracking-[-0.72px] text-n-900 tabular-nums">
          {config.formatTotal(config.total)}
        </p>
        <span className="chart-delta">
          <DeltaBadge value={config.delta} className="bg-white" />
        </span>
      </div>

      <div className="chart-plot h-[217px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 16, right: 16, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.24} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#ebebeb" strokeDasharray="2 2" />
            <XAxis
              dataKey="day"
              type="number"
              domain={[1, 30]}
              ticks={xTicks}
              tickFormatter={(d: number) => `Jun ${d}`}
              tick={{ fontSize: 10, fill: "#aaaaaa" }}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              interval={0}
            />
            <YAxis
              domain={[0, config.max]}
              ticks={[0, config.max / 4, config.max / 2, (config.max * 3) / 4, config.max]}
              tickFormatter={config.formatTick}
              tick={{ fontSize: 10, fill: "#aaaaaa" }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              cursor={false}
              defaultIndex={7}
              content={(props) => (
                <ChartTooltip
                  active={props.active}
                  payload={props.payload as unknown as { value: number }[]}
                  metric={metric}
                />
              )}
            />
            <Area
              type="monotone"
              dataKey={metric}
              stroke="#2563eb"
              strokeWidth={1}
              fill="url(#chart-fill)"
              isAnimationActive={false}
              activeDot={{ r: 3.5, fill: "#2563eb", stroke: "#fff", strokeWidth: 1 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
