"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import { growNav, primaryNav, workspaceNav, type NavItem } from "@/lib/dashboard-data";
import { Icon } from "./icon";

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

const EXPANDED_WIDTH = 246;

// Slides the shared highlight pill behind the active nav item.
function syncHighlight(nav: HTMLElement | null, highlight: HTMLElement | null, active: string, duration: number) {
  const target = nav?.querySelector<HTMLElement>(`[data-nav="${active}"]`);
  if (!target || !highlight) return;
  const vars = { y: target.offsetTop, height: target.offsetHeight, autoAlpha: 1 };
  if (duration) gsap.to(highlight, { ...vars, duration, ease: "power3.out" });
  else gsap.set(highlight, vars);
}
const COLLAPSED_WIDTH = 60;

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const root = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);
  const [active, setActive] = useState("Home");
  const [servicesOpen, setServicesOpen] = useState(true);
  const submenuVisible = servicesOpen && !collapsed;

  const { contextSafe } = useGSAP({ scope: root });

  useGSAP(() => syncHighlight(navRef.current, highlightRef.current, active, mounted.current ? 0.35 : 0), {
    dependencies: [active],
    scope: root,
  });

  useGSAP(
    () => {
      if (!submenuRef.current) return;
      if (!mounted.current) {
        gsap.set(submenuRef.current, { height: submenuVisible ? "auto" : 0 });
        return;
      }
      gsap.to(submenuRef.current, {
        height: submenuVisible ? "auto" : 0,
        autoAlpha: submenuVisible ? 1 : 0,
        duration: 0.35,
        ease: "power2.inOut",
        onUpdate: () => syncHighlight(navRef.current, highlightRef.current, active, 0),
      });
    },
    { dependencies: [submenuVisible], scope: root },
  );

  useGSAP(
    () => {
      if (!mounted.current) {
        mounted.current = true;
        return;
      }
      const tl = gsap.timeline({ defaults: { ease: "power3.inOut" } });
      if (collapsed) {
        tl.to(".sidebar-fade", { autoAlpha: 0, duration: 0.15 })
          .to(root.current, { width: COLLAPSED_WIDTH, duration: 0.4 }, 0.05)
          .to(".profile-card", { padding: 3, duration: 0.3 }, 0.1);
      } else {
        tl.to(root.current, { width: EXPANDED_WIDTH, duration: 0.4 })
          .to(".profile-card", { padding: 8, duration: 0.3 }, 0)
          .to(".sidebar-fade", { autoAlpha: 1, duration: 0.25, stagger: 0.01 }, 0.25);
      }
      tl.add(() => syncHighlight(navRef.current, highlightRef.current, active, 0));
    },
    { dependencies: [collapsed], scope: root },
  );

  const hoverItem = contextSafe((el: HTMLElement, enter: boolean) => {
    const icon = el.querySelector(".nav-icon");
    if (icon) {
      gsap.to(icon, {
        scale: enter ? 1.2 : 1,
        rotation: enter ? -10 : 0,
        duration: 0.3,
        ease: enter ? "back.out(3)" : "power2.out",
      });
    }
    gsap.to(el.querySelector(".nav-label"), { x: enter ? 2 : 0, duration: 0.25, ease: "power2.out" });
  });

  const hoverProgress = contextSafe((enter: boolean) => {
    gsap.to(".progress-icon", { rotation: enter ? 180 : 0, duration: 0.6, ease: "power3.out" });
  });

  const hoverProfile = contextSafe((enter: boolean) => {
    gsap.to(".profile-caret", { y: enter ? 2 : 0, duration: 0.25, ease: "power2.out" });
    gsap.to(".profile-avatar", { scale: enter ? 1.06 : 1, duration: 0.3, ease: "back.out(2)" });
  });

  const select = (item: NavItem) => {
    if (item.children) {
      if (collapsed) onToggle();
      setServicesOpen((open) => (collapsed ? true : !open));
    }
    setActive(item.label);
  };

  const renderItem = (item: NavItem, indent = false) => {
    const isActive = active === item.label;
    return (
      <button
        key={item.label}
        type="button"
        data-nav={item.label}
        data-anim="nav-item"
        title={collapsed ? item.label : undefined}
        aria-current={isActive ? "page" : undefined}
        aria-expanded={item.children ? submenuVisible : undefined}
        onClick={() => select(item)}
        onMouseEnter={(e) => hoverItem(e.currentTarget, true)}
        onMouseLeave={(e) => hoverItem(e.currentTarget, false)}
        className={`relative z-10 flex w-full items-center gap-0.5 rounded-lg py-1.5 pr-2 text-left text-xs font-medium leading-4 whitespace-nowrap transition-colors ${
          indent ? "pl-[22px]" : "pl-2"
        } ${isActive ? "text-n-900" : "text-n-700 hover:bg-[rgba(25,25,25,0.025)]"}`}
      >
        {item.icon && (
          <span className="flex py-0.5">
            <Icon name={item.icon} className="nav-icon" />
          </span>
        )}
        <span className="nav-label sidebar-fade px-1">{item.label}</span>
      </button>
    );
  };

  return (
    <aside
      ref={root}
      data-anim="sidebar"
      style={{ width: EXPANDED_WIDTH }}
      className="sticky top-0 hidden h-dvh shrink-0 flex-col overflow-hidden lg:flex"
    >
      <div className="flex items-center justify-between gap-1 p-3">
        <div className="min-w-0 flex-1 overflow-hidden">
          <Image src="/icons/logo-frank.svg" alt="Frank" width={155} height={16} unoptimized priority />
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="rounded p-0.5 opacity-80 transition-opacity hover:opacity-100"
        >
          <Icon name="sidebar-toggle" />
        </button>
      </div>

      <div className="px-3 py-2.5">
        <button
          type="button"
          data-anim="nav-item"
          onMouseEnter={() => hoverProgress(true)}
          onMouseLeave={() => hoverProgress(false)}
          className="flex w-full items-center gap-0.5 overflow-hidden rounded-[10px] bg-white p-2 shadow-control whitespace-nowrap"
        >
          <span className="flex py-0.5">
            <Icon name="get-started-progress" className="progress-icon" />
          </span>
          <span className="sidebar-fade flex-1 px-1 text-left text-xs font-medium leading-4 text-n-900">
            Get started
          </span>
          <span className="sidebar-fade flex items-center gap-0.5 rounded-full bg-[rgba(33,93,198,0.04)] px-1.5 py-[3px] leading-[10px]">
            <span className="text-xs font-medium text-brand-deep">1</span>
            <span className="text-[10px] text-n-300">/</span>
            <span className="text-[10px] text-n-300">3</span>
          </span>
        </button>
      </div>

      <nav ref={navRef} className="scrollbar-none relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
        <div
          ref={highlightRef}
          aria-hidden
          className="invisible absolute top-0 right-3 left-3 z-0 rounded-lg bg-[rgba(25,25,25,0.04)]"
        />

        <div className="flex flex-col gap-0.5 px-3 py-2">{primaryNav.map((item) => renderItem(item))}</div>

        <div className="flex flex-col gap-0.5 px-3 py-2">
          {workspaceNav.map((item) =>
            item.children ? (
              <div key={item.label} className="flex flex-col gap-0.5">
                {renderItem(item)}
                <div ref={submenuRef} className="flex flex-col gap-0.5 overflow-hidden">
                  {item.children.map((child) => renderItem(child, true))}
                </div>
              </div>
            ) : (
              renderItem(item)
            ),
          )}
        </div>

        <div className="flex flex-col px-3 py-2">
          <p className="sidebar-fade px-2 py-1 text-[11px] font-medium leading-4 whitespace-nowrap text-n-400">
            Grow with Frank
          </p>
          {growNav.map((item) => renderItem(item))}
        </div>
      </nav>

      <div className="flex flex-col gap-1.5 p-3">
        {renderItem({ label: "Help", icon: "nav-help" })}
        <button
          type="button"
          data-anim="nav-item"
          onMouseEnter={() => hoverProfile(true)}
          onMouseLeave={() => hoverProfile(false)}
          className="profile-card flex w-full items-center gap-3 overflow-hidden rounded-[10px] bg-white p-2 text-left shadow-control"
        >
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <span className="profile-avatar relative size-[30px] shrink-0 overflow-hidden rounded-[6.9px] border-[0.667px] border-white bg-white shadow-[0_1.667px_3.333px_0_rgba(0,0,0,0.06)]">
              <span className="absolute top-[-14px] left-[calc(50%-0.97px)] h-[77px] w-[51.4px] -translate-x-1/2">
                <Image src="/images/avatar.jpg" alt="Muhammad Khoirul" fill sizes="52px" className="object-cover" />
              </span>
            </span>
            <span className="sidebar-fade flex flex-col items-start gap-0.5 whitespace-nowrap">
              <span className="text-xs font-medium leading-[14px] text-n-800">Muhammad Khoirul</span>
              <span className="rounded-full bg-[rgba(49,124,255,0.04)] px-1 py-0.5 text-[11px] leading-[10px] text-brand">
                Pro Plan
              </span>
            </span>
          </span>
          <span className="sidebar-fade flex p-0.5">
            <Icon name="caret-down" size={10} className="profile-caret" />
          </span>
        </button>
      </div>
    </aside>
  );
}
