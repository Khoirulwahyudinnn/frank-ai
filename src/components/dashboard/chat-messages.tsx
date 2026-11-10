"use client";

import { useRef, useState } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { campaign, stages, type QuickReply, type Stage } from "@/lib/chat-flow";
import { Icon } from "./icon";

const primaryButton =
  "flex items-center justify-center rounded-lg border border-[#3a3a3a] bg-linear-to-b from-[#191919] from-[9.6%] to-[#3b3b3b] to-[123%] p-[5px] shadow-[0_1px_2px_0_rgba(40,40,40,0.08)]";
const secondaryButton = "flex items-center justify-center rounded-lg bg-white p-[5px] shadow-control transition-colors hover:bg-n-25";

/** Quick bounce used on every clickable control inside the chat. */
function pressFx(el: HTMLElement) {
  if (prefersReducedMotion()) return;
  gsap.fromTo(el, { scale: 0.94 }, { scale: 1, duration: 0.4, ease: "back.out(3)" });
}

export function UserBubble({ text }: { text: string }) {
  return (
    <div className="chat-bubble flex justify-end">
      <p className="w-fit max-w-[224px] rounded-xl bg-n-25 p-2 text-xs leading-[1.5] font-medium text-n-800 shadow-panel">
        {text}
      </p>
    </div>
  );
}

type AiMessageProps = {
  stage: Stage;
  status: "running" | "done";
  latest: boolean;
  onReply: (reply: QuickReply) => void;
  onRegenerate: () => void;
};

export function AiMessage({ stage, status, latest, onReply, onRegenerate }: AiMessageProps) {
  const root = useRef<HTMLDivElement>(null);
  const { steps, summary, intro, followUp, replies } = stages[stage];

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      if (status === "running") {
        gsap
          .timeline({ delay: 0.2 })
          .from(".thinking-note", { autoAlpha: 0, y: 6, duration: 0.35 })
          .from(".thinking-step", { autoAlpha: 0, x: -6, duration: 0.35, stagger: 0.45, ease: "power2.out" }, "+=0.1");
        gsap.fromTo(
          ".thinking-label",
          { backgroundPosition: "0% 0" },
          { backgroundPosition: "-200% 0", duration: 2.2, ease: "none", repeat: -1 },
        );
        gsap.to(".thinking-star", { rotation: 360, duration: 3, ease: "none", repeat: -1 });
      } else {
        gsap.from(".ai-reveal", { autoAlpha: 0, y: 8, duration: 0.45, stagger: 0.12, ease: "power3.out" });
      }
    },
    { dependencies: [status], scope: root, revertOnUpdate: true },
  );

  if (status === "running") {
    return (
      <div ref={root} className="flex flex-col gap-3 rounded-[10px] p-2" aria-live="polite">
        {stage === "plan" && (
          <p className="thinking-note text-xs leading-[1.5] font-medium text-n-800">
            This might take time, you can close chat and I’ll run in background
          </p>
        )}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <Icon name="thinking-star-four" size={14} className="thinking-star" />
            <span className="thinking-label text-shimmer-ai text-xs leading-[1.5] font-medium">Thinking...</span>
          </div>
          {steps.length > 0 && (
            <div className="relative flex flex-col gap-1.5 overflow-hidden">
              {steps.map((step) => (
                <div key={step.label} className="thinking-step flex items-center gap-1.5">
                  <Icon name={step.icon} size={14} />
                  <span className="text-xs leading-[1.5] text-n-500">{step.label}</span>
                </div>
              ))}
              <div className="pointer-events-none absolute top-[-20px] left-0 h-[75px] w-full bg-linear-to-b from-white from-[16%] to-white/0" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={root} className="flex flex-col gap-3 p-2" aria-live="polite">
      {summary && <StepsSummary summary={summary} steps={steps} />}
      {intro && <p className="ai-reveal text-xs leading-[1.5] font-medium text-n-700">{intro}</p>}

      <div className="ai-reveal">
        {stage === "plan" && <PlanCard />}
        {stage === "drafts" && <DraftCard />}
        {stage === "review" && <ReviewCard onReply={onReply} disabled={!latest} />}
        {stage === "scheduled" && <SuccessCard />}
      </div>

      {stage === "drafts" && <MessageActions text={intro ?? ""} onRegenerate={onRegenerate} disabled={!latest} />}

      {stage === "review" && (
        <p className="ai-reveal text-[11px] leading-[1.5] text-n-400">You can pause or edit it anytime from Campaigns.</p>
      )}

      {latest && (followUp || replies.length > 0) && (
        <div className="ai-reveal flex flex-col gap-2">
          {followUp && <p className="text-xs leading-[1.5] font-medium text-n-700">{followUp}</p>}
          <div className="flex flex-wrap gap-1.5">
            {replies.map((reply) => (
              <button
                key={reply.label}
                type="button"
                onClick={(e) => {
                  pressFx(e.currentTarget);
                  onReply(reply);
                }}
                className="rounded-full bg-white px-2 py-[5px] text-xs leading-4 font-medium whitespace-nowrap text-n-700 shadow-control transition-colors hover:bg-n-25 hover:text-n-900"
              >
                {reply.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StepsSummary({ summary, steps }: { summary: string; steps: { label: string; icon: string }[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useGSAP(
    () => {
      const reduce = prefersReducedMotion();
      gsap.to(".summary-caret", { rotation: open ? 180 : 0, duration: reduce ? 0 : 0.3, ease: "power2.out" });
      if (open && !reduce) gsap.from(".summary-step", { autoAlpha: 0, x: -6, duration: 0.3, stagger: 0.05 });
    },
    { dependencies: [open], scope: root },
  );

  return (
    <div ref={root} className="ai-reveal flex flex-col gap-1.5">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 self-start text-xs leading-[1.5] text-n-500 transition-colors hover:text-n-700"
      >
        <Icon name="chat-check-circle" size={14} />
        <span className="flex items-center gap-1">
          {summary}
          <Icon name="chat-caret-down" className="summary-caret" />
        </span>
      </button>
      {open && (
        <ul className="flex flex-col gap-1.5 border-l border-line pl-3 ml-[6px]">
          {steps.map((step) => (
            <li key={step.label} className="summary-step flex items-center gap-1.5 text-xs leading-[1.5] text-n-500">
              <Icon name={step.icon} size={14} />
              {step.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PlanCard() {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white p-3 shadow-card">
      <div className="flex items-center gap-2.5">
        <span
          className="icon-tile flex rounded-md p-1.5"
          style={{ "--tile": "#fc712c", "--tile-ring": "#e46323" } as React.CSSProperties}
        >
          <Icon name="chat-megaphone" size={16} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="text-[13px] leading-[1.35] font-medium text-n-900">{campaign.name}</p>
          <p className="text-[11px] leading-[1.5] text-n-400">Campaign plan · Draft</p>
        </div>
      </div>
      <dl className="flex flex-col gap-2 text-xs leading-[1.5]">
        {campaign.details.map((row) => (
          <div key={row.label} className="flex items-start gap-2">
            <dt className="w-16 shrink-0 text-n-400">{row.label}</dt>
            <dd className="min-w-0 flex-1 text-n-900">{row.value}</dd>
          </div>
        ))}
        <div className="flex items-start gap-2">
          <dt className="w-16 shrink-0 text-n-400">Channels</dt>
          <dd className="flex gap-1.5">
            {campaign.channels.map((channel) => (
              <span
                key={channel}
                className="rounded-full bg-n-25 px-1.5 py-0.5 text-[11px] leading-4 font-medium text-n-700 shadow-[0_0_0_1px_#ebebeb]"
              >
                {channel}
              </span>
            ))}
          </dd>
        </div>
        <div className="flex items-start gap-2">
          <dt className="w-16 shrink-0 text-n-400">Send</dt>
          <dd className="min-w-0 flex-1 text-n-900">{campaign.sendAt}</dd>
        </div>
      </dl>
    </div>
  );
}

function DraftCard() {
  const root = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<"Email" | "SMS">("Email");

  useGSAP(
    () => {
      if (!prefersReducedMotion()) gsap.from(".draft-preview", { autoAlpha: 0, y: 6, duration: 0.3, ease: "power2.out" });
    },
    { dependencies: [tab], scope: root, revertOnUpdate: true },
  );

  return (
    <div ref={root} className="flex flex-col gap-3 rounded-xl bg-white p-3 shadow-card">
      <div className="flex items-center justify-between">
        <div role="tablist" className="flex gap-0.5 rounded-[10px] bg-n-25 p-0.5">
          {(["Email", "SMS"] as const).map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={tab === name}
              onClick={() => setTab(name)}
              className={`rounded-lg p-1 text-xs leading-4 font-medium transition-colors ${
                tab === name ? "bg-white text-n-900 shadow-[0_0_0_1px_#efefef,0_1px_2px_0_rgba(40,40,40,0.08)]" : "text-n-700 hover:text-n-900"
              }`}
            >
              <span className="px-0.5">{name}</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={(e) => pressFx(e.currentTarget)} className={secondaryButton}>
          <span className="flex p-0.5">
            <Icon name="chat-pencil" />
          </span>
          <span className="px-1 text-xs leading-4 font-medium text-n-900">Edit</span>
        </button>
      </div>

      <div className="flex flex-col gap-0.5">
        <p className="text-[11px] leading-[14px] font-medium text-n-400">SUBJECT</p>
        <p className="text-[13px] leading-[1.35] font-medium text-n-900">{campaign.subject}</p>
        <p className="text-xs leading-[1.5] text-n-500">{campaign.preheader}</p>
      </div>

      {tab === "Email" ? (
        <div className="draft-preview flex flex-col items-start gap-2 rounded-lg bg-n-25 p-2.5 shadow-[0_0_0_1px_#efefef]">
          <div className="flex h-[84px] w-full items-center justify-center gap-2.5 rounded-md bg-[rgba(252,113,44,0.08)]">
            <Icon name="chat-cake" size={28} />
            <Icon name="chat-coffee" size={28} />
          </div>
          <p className="text-[13px] leading-[1.35] font-medium text-n-900">{campaign.email.headline}</p>
          <p className="text-[11px] leading-[1.5] text-n-500">{campaign.email.body}</p>
          <span className={primaryButton}>
            <span className="px-1 text-xs leading-4 font-medium text-white">{campaign.email.cta}</span>
          </span>
        </div>
      ) : (
        <div className="draft-preview flex flex-col gap-2 rounded-[10px] bg-n-25 p-2.5 shadow-[0_0_0_1px_#efefef]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs leading-[1.5] font-medium text-n-900">
              <Icon name="chat-device-mobile" size={14} />
              SMS
            </span>
            <span className="font-mono text-[11px] leading-[14px] text-n-400">{campaign.sms.length}/160</span>
          </div>
          <p className="rounded-lg bg-n-50 px-2.5 py-2 text-xs leading-[1.5] whitespace-pre-wrap text-n-700">{campaign.sms}</p>
        </div>
      )}
    </div>
  );
}

function MessageActions({ text, onRegenerate, disabled }: { text: string; onRegenerate: () => void; disabled: boolean }) {
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [copied, setCopied] = useState(false);

  const action = (label: string, icon: string, onClick: () => void, active = false, hidden = false) =>
    hidden ? null : (
      <button
        type="button"
        aria-label={label}
        aria-pressed={active}
        onClick={(e) => {
          pressFx(e.currentTarget);
          onClick();
        }}
        className={`flex rounded transition-opacity hover:opacity-100 ${active ? "opacity-100" : "opacity-70"}`}
      >
        <Icon name={copied && icon === "chat-copy" ? "chat-check" : icon} size={14} />
      </button>
    );

  return (
    <div className="ai-reveal flex items-center gap-3">
      {action("Copy", "chat-copy", () => {
        navigator.clipboard?.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })}
      {action("Regenerate", "chat-refresh", onRegenerate, false, disabled)}
      {action("Good response", "chat-thumbs-up", () => setVote((v) => (v === "up" ? null : "up")), vote === "up")}
      {action("Bad response", "chat-thumbs-down", () => setVote((v) => (v === "down" ? null : "down")), vote === "down")}
    </div>
  );
}

function ReviewCard({ onReply, disabled }: { onReply: (reply: QuickReply) => void; disabled: boolean }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white p-3 shadow-card">
      <div className="flex items-center gap-1">
        <p className="truncate text-[13px] leading-[1.35] font-medium text-n-900">{campaign.name}</p>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-[rgba(53,200,80,0.08)] px-1.5 py-[3px] text-[11px] leading-3 font-medium text-[#24963a]">
          <Icon name="chat-status-dot" size={6} />
          Ready
        </span>
      </div>

      <div className="flex gap-2 rounded-lg bg-n-25 p-2.5 shadow-[0_0_0_1px_#efefef]">
        {campaign.metrics.map((metric) => (
          <div key={metric.label} className="flex min-w-0 flex-1 flex-col whitespace-nowrap">
            <span className="text-[10px] leading-[14px] font-medium text-n-400">{metric.label}</span>
            <span className="font-mono text-sm leading-[1.4] font-medium text-n-900">{metric.value}</span>
          </div>
        ))}
      </div>

      <ul className="flex flex-col gap-1.5">
        {campaign.checklist.map((item) => (
          <li key={item} className="flex items-center gap-1.5 text-xs leading-[1.5] text-n-700">
            <Icon name="chat-check" />
            {item}
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-1.5 text-xs leading-[1.5] font-medium">
        <Icon name="chat-calendar" size={14} />
        <span className="flex-1 text-n-900">{campaign.sendAt}</span>
        <button type="button" className="text-brand hover:underline">
          Change
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            pressFx(e.currentTarget);
            onReply({ label: "Schedule campaign", stage: "scheduled" });
          }}
          className={`${primaryButton} transition-opacity disabled:opacity-40`}
        >
          <span className="px-1 text-xs leading-4 font-medium text-white">Schedule campaign</span>
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            pressFx(e.currentTarget);
            onReply({ label: "Edit campaign", stage: "drafts" });
          }}
          className={`${secondaryButton} disabled:opacity-40`}
        >
          <span className="px-1 text-xs leading-4 font-medium text-n-900">Edit campaign</span>
        </button>
      </div>
    </div>
  );
}

function SuccessCard() {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white p-3 shadow-card">
      <div className="flex items-start gap-2.5">
        <span className="flex py-1">
          <span
            className="icon-tile flex rounded-md p-1"
            style={{ "--tile": "#35c850", "--tile-ring": "#2db145" } as React.CSSProperties}
          >
            <Icon name="chat-check-white" />
          </span>
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="text-[13px] leading-[1.35] font-medium text-n-900">Campaign scheduled</p>
          <p className="text-xs leading-[1.5] text-n-500">
            Sweet Weekend goes out {campaign.sendAt.replace(" · ", " at ")} to {campaign.metrics[0].value} contacts.
          </p>
        </div>
      </div>
      <button type="button" onClick={(e) => pressFx(e.currentTarget)} className={`${secondaryButton} group`}>
        <span className="px-1 text-xs leading-4 font-medium text-n-900">View campaign</span>
        <span className="flex p-0.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          <Icon name="chat-arrow-up-right" />
        </span>
      </button>
    </div>
  );
}
