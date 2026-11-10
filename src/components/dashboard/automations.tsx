import { automations } from "@/lib/dashboard-data";
import { Icon } from "./icon";
import { ViewButton } from "./view-button";

const restShadow = "0 0 0 1px #ebebeb, 0 1px 2px 0 rgba(40,40,40,0.12)";
const hoverShadow = "0 0 0 1px #e6e6e6, 0 4px 12px -4px rgba(40,40,40,0.1)";

export function Automations() {
  return (
    <section data-anim="section" className="flex w-full flex-col gap-4 rounded-xl bg-white p-4 shadow-card">
      <div className="flex items-end justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="text-sm leading-[1.4] font-medium text-n-900">Active automations</h2>
          <p className="text-xs leading-[1.5] text-n-500">Marketing workflows currently running.</p>
        </div>
        <ViewButton>View Automations</ViewButton>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {automations.map((item) => (
          <article
            key={item.name}
            style={{ "--rest-shadow": restShadow, "--hover-shadow": hoverShadow } as React.CSSProperties}
            className="flex flex-col gap-3 rounded-[10px] bg-white p-4 shadow-(--rest-shadow) transition-shadow duration-300 hover:shadow-(--hover-shadow)"
          >
            <div className="flex items-center justify-between">
              <span
                className="icon-tile flex rounded-md p-1"
                style={{ "--tile": item.color, "--tile-ring": item.ring } as React.CSSProperties}
              >
                <Icon name={item.icon} size={16} />
              </span>
              <button
                type="button"
                aria-label={`${item.name} options`}
                className="flex items-center justify-center rounded-md bg-white p-1 shadow-control"
              >
                <span className="flex p-0.5">
                  <Icon name="dots-three-vertical" />
                </span>
              </button>
            </div>
            <div className="flex flex-col gap-px">
              <h3 className="text-[13px] leading-[1.35] font-medium text-n-900">{item.name}</h3>
              <p className="text-xs leading-[1.5] text-n-500">{item.channel}</p>
            </div>
            <div className="flex gap-3">
              <div className="flex flex-1 flex-col">
                <span className="font-mono text-sm leading-[1.4] font-medium tracking-[-0.56px] text-n-900">
                  {item.contacts}
                </span>
                <span className="text-xs leading-[1.5] text-n-500">Active contacts</span>
              </div>
              <div className="flex w-[83px] flex-col">
                <span className="font-mono text-sm leading-[1.4] font-medium tracking-[-0.56px] text-n-900">
                  {item.revenue}
                </span>
                <span className="text-xs leading-[1.5] text-n-500">Revenue</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
