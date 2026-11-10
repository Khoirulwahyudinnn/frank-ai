export type NavItem = {
  label: string;
  icon?: string;
  children?: NavItem[];
};

export const primaryNav: NavItem[] = [
  { label: "Home", icon: "nav-home" },
  { label: "Chat", icon: "nav-chat" },
  { label: "Campaign", icon: "nav-campaign" },
  { label: "Flows", icon: "nav-flows" },
];

export const workspaceNav: NavItem[] = [
  { label: "Website", icon: "nav-website" },
  { label: "Socials", icon: "nav-socials" },
  {
    label: "Services",
    icon: "nav-services",
    children: [
      { label: "Overview" },
      { label: "Customer Hub" },
      { label: "Customer Agent" },
      { label: "Helpdesk" },
    ],
  },
  { label: "Audience", icon: "nav-audience" },
  { label: "Content", icon: "nav-content" },
  { label: "Analytics", icon: "nav-analytics" },
];

export const growNav: NavItem[] = [
  { label: "WhatsApp setup guide", icon: "nav-whatsapp" },
  { label: "Grow strategies", icon: "nav-grow" },
  { label: "Integrations", icon: "nav-integrations" },
];

export type KpiFormat = "currency" | "multiplier";

export const kpis: {
  label: string;
  value: number;
  format: KpiFormat;
  delta: string;
  color: string;
}[] = [
  { label: "TOTAL REVENUE", value: 1492.4, format: "currency", delta: "24,4%", color: "#35c850" },
  { label: "ATTRIBUTED REVENUE", value: 1492.4, format: "currency", delta: "12,6%", color: "#317cff" },
  { label: "MARKETING ROI", value: 4.8, format: "multiplier", delta: "0.6x", color: "#fc712c" },
];

export function formatKpi(value: number, format: KpiFormat) {
  return format === "currency"
    ? `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `${value.toFixed(1)}x`;
}

const revenueSeries = [
  690, 720, 610, 590, 660, 740, 800, 832, 760, 800, 900, 1010, 1080, 1040, 1060,
  1120, 1180, 1150, 1240, 1360, 1420, 1380, 1500, 1640, 1720, 1800, 1950, 2150, 2350, 2520,
];

export const chartData = revenueSeries.map((revenue, i) => ({
  day: i + 1,
  revenue,
  conversions: Math.round(revenue / 10 + (((i * 7) % 5) - 2) * 3),
  orders: Math.round(revenue / 27 + (((i * 3) % 4) - 1.5) * 1.5),
}));

export type MetricKey = "revenue" | "conversions" | "orders";

const compactCurrency = (v: number) => (v >= 1000 ? `$${+(v / 1000).toFixed(2)}K` : `$${v}`);

export const chartMetrics: Record<
  MetricKey,
  {
    label: string;
    total: number;
    delta: string;
    max: number;
    formatTotal: (v: number) => string;
    formatTick: (v: number) => string;
    formatValue: (v: number) => string;
  }
> = {
  revenue: {
    label: "Revenue",
    total: 1492.4,
    delta: "18.4%",
    max: 2600,
    formatTotal: (v) => formatKpi(v, "currency"),
    formatTick: compactCurrency,
    formatValue: (v) => `$${v.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
  },
  conversions: {
    label: "Conversions",
    total: 3284,
    delta: "9.2%",
    max: 260,
    formatTotal: (v) => Math.round(v).toLocaleString("en-US"),
    formatTick: (v) => `${v}`,
    formatValue: (v) => v.toLocaleString("en-US"),
  },
  orders: {
    label: "Orders",
    total: 1126,
    delta: "6.1%",
    max: 100,
    formatTotal: (v) => Math.round(v).toLocaleString("en-US"),
    formatTick: (v) => `${v}`,
    formatValue: (v) => v.toLocaleString("en-US"),
  },
};

export const automations = [
  { name: "Welcome Series", channel: "Email + SMS", icon: "envelope", color: "#317cff", ring: "#337bf8", contacts: "2.482", revenue: "$5,280" },
  { name: "Abandoned Cart", channel: "Email + SMS", icon: "shopping-cart", color: "#fc712c", ring: "#e46323", contacts: "2.482", revenue: "$5,280" },
  { name: "Post-Purchase Follow-up", channel: "SMS", icon: "files", color: "#35c850", ring: "#2db145", contacts: "2.482", revenue: "$5,280" },
];
