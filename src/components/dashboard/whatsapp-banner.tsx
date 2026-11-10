"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DitheredImage } from "./dithered-image";
import { Icon } from "./icon";

export function WhatsAppBanner() {
  const root = useRef<HTMLElement>(null);
  const { contextSafe } = useGSAP({ scope: root });

  const hover = contextSafe((enter: boolean) => {
    gsap.to(".banner-image", { scale: enter ? 1.08 : 1, duration: 0.8, ease: "power3.out" });
    gsap.to(".banner-badge", {
      scale: enter ? 1.12 : 1,
      backgroundColor: enter ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)",
      duration: 0.4,
      ease: enter ? "back.out(2.5)" : "power2.out",
    });
  });

  const pressCta = contextSafe((el: HTMLElement) => {
    gsap
      .timeline()
      .to(el, { scale: 0.95, duration: 0.08 })
      .to(el, { scale: 1, duration: 0.45, ease: "elastic.out(1, 0.5)" });
  });

  return (
    <section
      ref={root}
      data-anim="section"
      onMouseEnter={() => hover(true)}
      onMouseLeave={() => hover(false)}
      className="flex w-full overflow-hidden rounded-xl bg-[#f9fbfc] shadow-card"
    >
      <div className="relative w-[100px] shrink-0 self-stretch overflow-hidden">
        <div className="banner-image absolute top-1/2 left-1/2 -mt-[177px] -ml-[129px] h-[352px] w-[258px]">
          <DitheredImage src="/images/whatsapp-banner.png" width={258} height={352} />
        </div>
        <div className="banner-badge absolute top-1/2 left-1/2 -mt-[18px] -ml-[18px] flex items-center rounded-[10px] bg-[rgba(255,255,255,0.08)] p-2.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] backdrop-blur-[6px]">
          <Icon name="banner-whatsapp" size={16} />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4 bg-n-25 py-4 pr-4 pl-6 sm:flex-row sm:items-end sm:gap-[60px]">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <h2 className="text-sm leading-[1.4] font-medium text-n-900">Reach Your WhatsApp Audience</h2>
          <p className="max-w-[454px] text-xs leading-[1.5] text-n-500">
            Engage your customers on WhatsApp with personalized messages, timely campaigns, and AI-powered
            targeting.
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => pressCta(e.currentTarget)}
          className="flex shrink-0 items-center justify-center self-start rounded-lg border border-[#3a3a3a] bg-linear-to-b from-[#191919] from-[9.6%] to-[#3b3b3b] to-[123%] p-[5px] shadow-[0_1px_2px_0_rgba(40,40,40,0.08)] sm:self-auto"
        >
          <span className="px-1 text-xs leading-4 font-medium text-white">Add a WhatsApp</span>
        </button>
      </div>
    </section>
  );
}
