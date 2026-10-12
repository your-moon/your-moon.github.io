// Part 2 story beat: every test is green, and a bug tiptoes past behind the laptop.
import { person, face, sparkles } from "../art.mjs";
export const fit = true;
export const title = "Green tests, and a bug walking by";
const LX = 130, LY = 20, LW = 300, LH = 140;
const bug = (x, y) => {
  const els = [
    { type: "line", points: [[x + 40, y + 6], [x + 30, y - 16]] },
    { type: "line", points: [[x + 60, y + 6], [x + 70, y - 16]] },
  ];
  [20, 45, 70].forEach((dx) => {
    els.push({ type: "line", points: [[x + dx, y + 52], [x + dx - 6, y + 72]] });
  });
  els.push({ type: "ellipse", x, y, w: 100, h: 60, fill: "red" }, ...face(x + 50, y + 28, "smile"));
  return els;
};
export default () => [
  ...bug(490, 112),
  { type: "rect", x: LX, y: LY, w: LW, h: LH, fill: "gray" },
  { type: "rect", x: LX + 12, y: LY + 12, w: LW - 24, h: LH - 24, fill: "green" },
  { type: "path", d: `M ${LX - 24} ${LY + LH + 6} L ${LX + LW + 24} ${LY + LH + 6} L ${LX + LW + 46} ${LY + LH + 28} L ${LX - 46} ${LY + LH + 28} Z`, fill: "gray" },
  { type: "text", x: LX + LW / 2, y: LY + LH / 2, text: "✓ all tests passed", size: 20, mono: true, align: "middle" },
  ...person(0, 10, { mood: "grin", arms: "cheer" }),
  ...sparkles(36, 90, { r: 56 }),
  { type: "text", x: 600, y: 90, text: "shh", size: 16, align: "start", muted: true },
  { type: "line", points: [[-20, 198], [660, 198]] },
];
