"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { stages, type ChatMessage, type QuickReply, type Stage } from "@/lib/chat-flow";
import { AiMessage, UserBubble } from "./chat-messages";
import { Icon } from "./icon";

type ChatPanelProps = {
  open: boolean;
  onClose: () => void;
};

const PANEL_WIDTH = 305;
const EXPANDED_WIDTH = 460;
const GAP = 12;
/** The composer grows with its text up to ~8 lines, then scrolls. */
const INPUT_MAX_HEIGHT = 144;

/** How long the AI "thinks" before a stage resolves, scaled to its step count. */
function runDuration(stage: Stage) {
  if (prefersReducedMotion()) return 600;
  return 1200 + stages[stage].steps.length * 450;
}

export function ChatPanel({ open, onClose }: ChatPanelProps) {
  const wrapper = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const nextId = useRef(0);
  const mounted = useRef(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");

  const { contextSafe } = useGSAP({ scope: wrapper });

  // Open / close / expand the panel.
  useGSAP(
    () => {
      const width = (expanded ? EXPANDED_WIDTH : PANEL_WIDTH) + GAP;
      if (!mounted.current) {
        gsap.set(wrapper.current, { width: open ? width : 0 });
        mounted.current = true;
        return;
      }
      gsap.to(wrapper.current, { width: open ? width : 0, duration: 0.5, ease: "power3.inOut" });
      gsap.to(".chat-inner", {
        width: width - GAP,
        autoAlpha: open ? 1 : 0,
        x: open ? 0 : 24,
        duration: open ? 0.45 : 0.3,
        delay: open ? 0.1 : 0,
        ease: "power3.out",
      });
    },
    { dependencies: [open, expanded], scope: wrapper },
  );

  // Fit the textarea to its content so the composer height follows the text.
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, INPUT_MAX_HEIGHT)}px`;
    el.style.overflowY = el.scrollHeight > INPUT_MAX_HEIGHT ? "auto" : "hidden";
  }, [draft, expanded]);

  const last = messages.at(-1);
  const running = last?.role === "ai" && last.status === "running";

  // Resolve the running AI message once its thinking steps have played out.
  useEffect(() => {
    if (!running || !last) return;
    const id = last.id;
    const timer = setTimeout(() => {
      setMessages((prev) => prev.map((m) => (m.id === id && m.role === "ai" ? { ...m, status: "done" } : m)));
    }, runDuration(last.stage));
    return () => clearTimeout(timer);
  }, [running, last]);

  // Keep the newest content in view and pop in fresh user bubbles.
  useGSAP(
    () => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      if (last?.role !== "user" || prefersReducedMotion()) return;
      gsap.from(gsap.utils.toArray(".chat-bubble").at(-1) ?? [], {
        autoAlpha: 0,
        y: 10,
        scale: 0.97,
        transformOrigin: "100% 100%",
        duration: 0.4,
        ease: "back.out(2)",
      });
    },
    { dependencies: [messages], scope: wrapper },
  );

  const ask = useCallback((text: string, stage: Stage) => {
    const user: ChatMessage = { id: nextId.current++, role: "user", text };
    const ai: ChatMessage = { id: nextId.current++, role: "ai", stage, status: "running" };
    setMessages((prev) => [...prev, user, ai]);
  }, []);

  const reply = (r: QuickReply) => ask(r.label, r.stage);

  const regenerate = (stage: Stage) =>
    setMessages((prev) => [...prev, { id: nextId.current++, role: "ai", stage, status: "running" }]);

  const send = () => {
    const text = draft.trim();
    if (!text || running) return;
    // Free text starts the plan, or revises whatever Frank produced last.
    const lastAi = messages.findLast((m) => m.role === "ai");
    const stage = lastAi?.role === "ai" && lastAi.stage !== "scheduled" ? lastAi.stage : "plan";
    ask(text, stage);
    setDraft("");
  };

  const hoverIcon = contextSafe((el: HTMLElement, vars: gsap.TweenVars) => {
    gsap.to(el.querySelector("img"), { ...vars, duration: 0.35, ease: "back.out(2.5)" });
  });

  const press = contextSafe((el: HTMLElement) => {
    gsap.fromTo(el, { scale: 0.88 }, { scale: 1, duration: 0.45, ease: "back.out(3)" });
  });

  const headerButton = (label: string, icon: string, hover: gsap.TweenVars, onClick: () => void) => (
    <button
      type="button"
      aria-label={label}
      onMouseEnter={(e) => hoverIcon(e.currentTarget, hover)}
      onMouseLeave={(e) => hoverIcon(e.currentTarget, { rotation: 0, scale: 1 })}
      onClick={(e) => {
        press(e.currentTarget);
        onClick();
      }}
      className="flex rounded opacity-80 transition-opacity hover:opacity-100"
    >
      <Icon name={icon} size={14} />
    </button>
  );

  return (
    <aside
      ref={wrapper}
      aria-label="Frank AI assistant"
      aria-hidden={!open}
      className="hidden shrink-0 justify-end overflow-hidden xl:flex"
      style={{ width: PANEL_WIDTH + GAP }}
    >
      <div
        data-anim="chat"
        style={{ width: PANEL_WIDTH }}
        className="chat-inner flex h-full shrink-0 flex-col overflow-hidden rounded-2xl bg-white shadow-panel"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-1.5">
            <Icon name="chat-star-four" size={14} />
            <h2 className="max-w-[136px] truncate text-sm leading-[1.4] font-medium text-n-900">
              Getting started with Frank.ai
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[rgba(49,124,255,0.04)] p-1 text-xs leading-[10px] text-brand">Beta</span>
            <div className="flex items-center gap-1.5">
              {headerButton("New chat", "chat-plus-circle", { rotation: 90, scale: 1.1 }, () => {
                setMessages([]);
                setDraft("");
              })}
              {headerButton(expanded ? "Shrink panel" : "Expand panel", "chat-expand", { scale: 1.25 }, () =>
                setExpanded((v) => !v),
              )}
              {headerButton("Close assistant", "chat-close", { rotation: 90, scale: 1.1 }, onClose)}
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
          <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col gap-4 scrollbar-none overflow-y-auto overscroll-contain *:shrink-0">
            {messages.map((m) =>
              m.role === "user" ? (
                <UserBubble key={m.id} text={m.text} />
              ) : (
                <AiMessage
                  key={m.id}
                  stage={m.stage}
                  status={m.status}
                  latest={m === last}
                  onReply={reply}
                  onRegenerate={() => regenerate(m.stage)}
                />
              ),
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex flex-col gap-4 rounded-[10px] bg-n-25 p-2 shadow-panel transition-shadow focus-within:shadow-[0_1px_1px_0_rgba(40,40,40,0.08),0_0_0_1px_#317cff]"
          >
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder="Ask anything or create a campaign..."
              aria-label="Message Frank"
              className="block w-full resize-none scrollbar-none bg-transparent text-xs leading-[1.5] text-n-800 caret-brand outline-none placeholder:text-n-300"
            />
            <div className="flex items-center justify-between">
              <button
                type="button"
                aria-label="Add attachment"
                onMouseEnter={(e) => hoverIcon(e.currentTarget, { rotation: 90 })}
                onMouseLeave={(e) => hoverIcon(e.currentTarget, { rotation: 0 })}
                className="flex rounded-lg p-[5px] transition-colors hover:bg-n-50"
              >
                <span className="flex p-0.5">
                  <Icon name="plus" />
                </span>
              </button>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Voice input"
                  onMouseEnter={(e) => hoverIcon(e.currentTarget, { scale: 1.2 })}
                  onMouseLeave={(e) => hoverIcon(e.currentTarget, { scale: 1 })}
                  onClick={(e) => press(e.currentTarget)}
                  className="flex rounded-lg bg-n-50 p-[5px]"
                >
                  <span className="flex p-0.5">
                    <Icon name="microphone" />
                  </span>
                </button>
                <button
                  type="submit"
                  aria-label="Send message"
                  disabled={!draft.trim() || running}
                  onMouseEnter={(e) => hoverIcon(e.currentTarget, { y: -2 })}
                  onMouseLeave={(e) => hoverIcon(e.currentTarget, { y: 0 })}
                  onClick={(e) => press(e.currentTarget)}
                  className="flex rounded-lg bg-n-900 p-[5px] shadow-[0_1px_2px_0_rgba(40,40,40,0.08)] transition-opacity disabled:opacity-40"
                >
                  <span className="flex p-0.5">
                    <Icon name="arrow-up" />
                  </span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </aside>
  );
}
