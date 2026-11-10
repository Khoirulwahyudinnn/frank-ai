import { Icon } from "./icon";

export function DeltaBadge({ value, className = "bg-[#fbfbfb]" }: { value: string; className?: string }) {
  return (
    <span
      className={`flex items-center gap-px overflow-hidden rounded-[4px] border-[0.6px] border-line-soft py-0.5 pr-1 pl-0.5 shadow-[0_1px_2px_0_rgba(40,40,40,0.06)] ${className}`}
    >
      <Icon name="trend-up" size={11} />
      <span className="font-mono text-[11px] leading-3 text-success">{value}</span>
    </span>
  );
}
