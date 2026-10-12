// Craft 3, Step 5: Feathers' five-step legacy code change algorithm.
export const title = "The legacy code change algorithm";
const steps = [
  ["change\npoints", "yellow"],
  ["test\npoints", "blue"],
  ["break\ndependencies", "orange"],
  ["characterization\ntests", "violet"],
  ["change &\nrefactor", "green"],
];
const W = 170, GAP = 44, H = 76, Y = 30;
const cx = (i) => i * (W + GAP) + W / 2;
export default () => [
  ...steps.flatMap(([t, fill], i) => [
    { type: "text", x: cx(i), y: 0, text: String(i + 1), size: 20, align: "middle", muted: true },
    { type: "rect", id: "s" + i, x: i * (W + GAP), y: Y, w: W, h: H, text: t, fill, size: 18 },
    ...(i ? [{ type: "arrow", from: "s" + (i - 1), to: "s" + i }] : []),
  ]),
  {
    type: "arrow", from: [cx(4), Y + H + 6], to: [cx(0), Y + H + 6], dashed: true,
    via: [[cx(4) - 40, Y + H + 70], [cx(2), Y + H + 100], [cx(0) + 40, Y + H + 70]],
    label: "next change", labelAt: [cx(2), Y + H + 130],
  },
];
