/** Scripted "Get started with AI" flow for the Frank assistant panel. */

export type Stage = "plan" | "drafts" | "review" | "scheduled";

export type ChatMessage =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "ai"; stage: Stage; status: "running" | "done" };

export type QuickReply = { label: string; stage: Stage };

type Step = { label: string; icon: string };

export const stages: Record<
  Stage,
  { steps: Step[]; summary?: string; intro?: string; followUp?: string; replies: QuickReply[] }
> = {
  plan: {
    steps: [
      { label: "Fetching brand context", icon: "step-plus-circle" },
      { label: "Loaded 1 skill", icon: "step-codepen" },
      { label: "Loading brand visuals", icon: "step-note-pencil" },
      { label: "Reviewing brand email history", icon: "step-clock" },
      { label: "Generating Audience", icon: "step-users-three" },
    ],
    summary: "Completed 5 steps in 32s",
    intro: "Here's a campaign plan for Azzihara. I focused on the weekend, since that's when cake and drink orders usually peak.",
    followUp: "Want me to write the email and SMS now?",
    replies: [
      { label: "Yes, write them", stage: "drafts" },
      { label: "Change the offer", stage: "plan" },
      { label: "Edit audience", stage: "plan" },
    ],
  },
  drafts: {
    steps: [
      { label: "Loaded copywriting skill", icon: "step-codepen" },
      { label: "Writing email and SMS", icon: "step-note-pencil" },
      { label: "Matching Azzihara's tone", icon: "step-clock" },
    ],
    summary: "Completed 3 steps in 18s",
    intro: "Done! Here are your drafts, written in Azzihara's warm and friendly tone.",
    replies: [
      { label: "Looks good, schedule it", stage: "review" },
      { label: "Make it shorter", stage: "drafts" },
      { label: "More playful", stage: "drafts" },
    ],
  },
  review: {
    steps: [
      { label: "Checking links and opt-out text", icon: "step-codepen" },
      { label: "Picking the best send time", icon: "step-clock" },
    ],
    summary: "Checked your campaign in 6s",
    intro: "Everything looks good. Here's a final check before Sweet Weekend goes out.",
    replies: [],
  },
  scheduled: { steps: [], replies: [] },
};

export const stageOrder: Stage[] = ["plan", "drafts", "review", "scheduled"];

export const campaign = {
  name: "Sweet Weekend at Azzihara",
  details: [
    { label: "Goal", value: "Grow weekend orders by 20%" },
    { label: "Offer", value: "Buy any cake, get a drink free" },
    { label: "Audience", value: "1,248 contacts · Cake lovers & repeat buyers" },
  ],
  channels: ["Email", "SMS"],
  sendAt: "Fri, 14 Nov · 10:00 AM",
  subject: "Your weekend just got sweeter",
  preheader: "Buy any cake, get a drink on us. Fri–Sun only.",
  email: {
    headline: "Buy 1 cake, get a drink on us",
    body: "Treat yourself this weekend. Pick any cake at Azzihara and we'll add a free drink of your choice.",
    cta: "Order now",
  },
  sms: "Azzihara: Sweet weekend! Buy any cake, get a FREE drink. Fri–Sun only. Order: azzi.co/sweet  Reply STOP to opt out",
  metrics: [
    { label: "AUDIENCE", value: "1,248" },
    { label: "REVENUE", value: "$1.6K" },
    { label: "OPEN RATE", value: "~42%" },
  ],
  checklist: [
    "Subject line under 50 characters",
    "SMS includes opt-out text",
    "All links are tracked",
    "Sends in each contact's time zone",
  ],
};
