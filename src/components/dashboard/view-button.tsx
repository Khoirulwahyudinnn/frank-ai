"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { Icon } from "./icon";

/** Secondary "View …" button with a caret that nudges on hover. */
export function ViewButton({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLButtonElement>(null);
  const { contextSafe } = useGSAP({ scope: root });

  const hover = contextSafe((enter: boolean) => {
    gsap.to(".view-caret", { x: enter ? 3 : 0, duration: 0.3, ease: enter ? "back.out(3)" : "power2.out" });
  });

  const press = contextSafe((el: HTMLElement) => {
    gsap.fromTo(el, { scale: 0.96 }, { scale: 1, duration: 0.4, ease: "back.out(3)" });
  });

  return (
    <button
      ref={root}
      type="button"
      onMouseEnter={() => hover(true)}
      onMouseLeave={() => hover(false)}
      onClick={(e) => press(e.currentTarget)}
      className="flex shrink-0 items-center justify-center rounded-lg bg-white p-[5px] shadow-control"
    >
      <span className="px-1 text-xs font-medium leading-4 text-n-900">{children}</span>
      <span className="flex p-0.5">
        <Icon name="caret-right" className="view-caret" />
      </span>
    </button>
  );
}
