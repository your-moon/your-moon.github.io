// Craft 3, Step 2: Ousterhout's 14 red flags in three groups.
export const title = "14 red flags (Ousterhout)";
const cards = [
  { x: 0, w: 290, fill: "blue", title: "in interfaces", items: ["shallow module", "pass-through method", "overexposure"] },
  { x: 310, w: 290, fill: "green", title: "in knowledge", items: ["information leakage", "temporal decomposition", "special-general mixture", "repetition", "conjoined methods"] },
  { x: 620, w: 340, fill: "yellow", title: "in words", items: ["vague name", "hard to pick name", "hard to describe", "comment repeats code", "implementation in interface docs", "nonobvious code"] },
];
export default () => [
  { type: "text", x: 480, y: 0, text: "14 red flags (Ousterhout)", size: 26, align: "middle" },
  ...cards.flatMap((c) => [
    { type: "rect", x: c.x, y: 40, w: c.w, h: 300, fill: c.fill },
    { type: "text", x: c.x + c.w / 2, y: 75, text: c.title, size: 22, align: "middle" },
    { type: "line", points: [[c.x + 20, 100], [c.x + c.w - 20, 100]] },
    ...c.items.map((t, i) => ({ type: "text", x: c.x + 24, y: 135 + i * 36, text: t, size: 17, align: "start" })),
  ]),
];
