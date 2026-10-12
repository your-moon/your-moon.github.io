// Part 2: five real tests that pass while checking nothing.
export const title = "Tests that can't fail";
const cards = [
  "every row:\nfalse",
  "[x1, x2] meant [x1, y1]\n(y1 = x2 = 20)",
  "expect()\ninside catch",
  "payload  vs  $payload",
  "no assertion",
];
export default () => {
  const W = 270, H = 120, G = 24;
  const els = [{ type: "text", x: 429, y: 0, text: "tests that can't fail", size: 26, align: "middle" }];
  cards.forEach((label, i) => {
    const row = i < 3 ? 0 : 1;
    const col = i < 3 ? i : i - 3;
    const x = (row ? 147 : 0) + col * (W + G), y = 40 + row * (H + G);
    els.push(
      { type: "rect", x, y, w: W, h: H, fill: "yellow" },
      { type: "text", x: x + W / 2, y: y + 40, text: label, size: 16, mono: true, align: "middle" },
      { type: "rect", x: x + W / 2 - 50, y: y + H - 38, w: 100, h: 26, text: "✓ passes", fill: "green", size: 16 },
    );
  });
  return els;
};
