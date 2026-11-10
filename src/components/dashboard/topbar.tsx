"use client";

import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { Icon } from "./icon";

type TopbarProps = {
  chatOpen: boolean;
  onToggleChat: () => void;
};

export function Topbar({ chatOpen, onToggleChat }: TopbarProps) {
  const root = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const { contextSafe } = useGSAP({ scope: root });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const focusSearch = contextSafe((focused: boolean) => {
    gsap.to(".search-box", {
      width: focused ? 380 : 315,
      boxShadow: focused
        ? "0 1px 2px 0 rgba(40,40,40,0.08), 0 0 0 1px #317cff, 0 0 0 4px rgba(49,124,255,0.12)"
        : "0 1px 2px 0 rgba(40,40,40,0.08), 0 0 0 1px #efefef",
      duration: 0.35,
      ease: "power3.out",
    });
    gsap.to(".search-kbd", { autoAlpha: focused ? 0 : 1, duration: 0.2 });
  });

  const ringBell = contextSafe(() => {
    gsap.fromTo(
      ".bell-icon",
      { rotation: 0 },
      { keyframes: { rotation: [0, 16, -14, 10, -6, 0] }, duration: 0.7, ease: "none", transformOrigin: "50% 10%" },
    );
  });

  const hoverAskAi = contextSafe((enter: boolean) => {
    gsap.to(".ask-sparkle", {
      rotation: enter ? 90 : 0,
      scale: enter ? 1.2 : 1,
      duration: 0.45,
      ease: enter ? "back.out(2.5)" : "power2.out",
    });
  });

  const press = contextSafe((el: HTMLElement) => {
    gsap.fromTo(el, { scale: 0.95 }, { scale: 1, duration: 0.4, ease: "back.out(3)" });
  });

  return (
    <header ref={root} data-anim="topbar" className="flex h-7 items-center justify-between gap-3">
      <nav aria-label="Breadcrumb">
        <div className="flex items-center gap-1 rounded-lg bg-white px-2 py-1.5 shadow-control">
          <Icon name="breadcrumb-home" />
          <Icon name="breadcrumb-caret" />
          <span className="text-xs font-medium leading-4 text-n-900">Home</span>
        </div>
      </nav>

      <label className="search-box hidden w-[315px] cursor-text items-center gap-0.5 rounded-lg bg-white p-1.5 shadow-control md:flex">
        <span className="flex py-0.5">
          <Icon name="search" />
        </span>
        <input
          ref={searchRef}
          type="search"
          placeholder="Search anything.."
          onFocus={() => focusSearch(true)}
          onBlur={() => focusSearch(false)}
          className="min-w-0 flex-1 bg-transparent px-1 text-xs leading-4 text-n-900 outline-none placeholder:text-n-300"
        />
        <span className="search-kbd flex items-center gap-px rounded" aria-hidden>
          <Icon name="command" size={14} />
          <span className="w-3 text-center text-xs text-n-300">K</span>
        </span>
      </label>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Notifications"
          onMouseEnter={ringBell}
          onClick={(e) => press(e.currentTarget)}
          className="flex items-center justify-center rounded-lg bg-white p-1.5 shadow-control"
        >
          <span className="flex p-0.5">
            <Icon name="bell" className="bell-icon" />
          </span>
        </button>
        <button
          type="button"
          aria-pressed={chatOpen}
          onMouseEnter={() => hoverAskAi(true)}
          onMouseLeave={() => hoverAskAi(false)}
          onClick={(e) => {
            press(e.currentTarget);
            onToggleChat();
          }}
          className="flex items-center justify-center rounded-lg bg-white p-1.5 shadow-control"
        >
          <span className="flex p-0.5">
            <Icon name="ask-ai-sparkle" className="ask-sparkle" />
          </span>
          <span className="text-gradient-ai px-1 text-xs font-medium leading-4">Ask AI</span>
        </button>
      </div>
    </header>
  );
}
