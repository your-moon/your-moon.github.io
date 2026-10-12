// Craft 3, Step 4: the shape of a design proposal.
import { paper } from "../art.mjs";
export const title = "A design proposal has five parts";
const rows = [
  "1  evidence: 9 and 11 files\n    per provider",
  "2  the story (2 sentences)",
  "3  design A vs design B,\n    compared on the caller",
  "4  migration path",
  "5  how we'll know",
];
export default () => [
  ...paper(0, 0, [], { w: 440, h: 600 }),
  { type: "text", x: 220, y: 48, text: "proposal", size: 24, align: "middle", muted: true },
  ...rows.flatMap((t, i) => {
    const y = 130 + i * 100;
    return [
      { type: "text", x: 40, y, text: t, size: 20, align: "start" },
      ...(i < rows.length - 1 ? [{ type: "line", points: [[40, y + 48], [400, y + 48]], dashed: true }] : []),
    ];
  }),
];
