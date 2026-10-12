// Part 2: rust-analyzer style tests: literal data in, one check() helper holds the machinery.
export const title = "A test is data, the helper holds the machinery";
const rows = ["2 + 2 → 4", '"" → error', "[3,1,2] → [1,2,3]", "-1 → Err(Negative)", "0 → 0"];
export default () => {
  const els = [
    { type: "text", x: 115, y: 0, text: "the tests (data)", size: 17, align: "middle", muted: true },
    { type: "text", x: 510, y: 0, text: "the helper", size: 17, align: "middle", muted: true },
  ];
  rows.forEach((r, i) => els.push({ type: "rect", id: "r" + i, x: 0, y: 30 + i * 46, w: 230, h: 34, text: r, fill: "blue", size: 16, mono: true }));
  els.push(
    { type: "rect", id: "check", x: 400, y: 30, w: 220, h: 220, fill: "green" },
    { type: "text", x: 510, y: 74, text: "check()", size: 20, mono: true, align: "middle" },
    { type: "text", x: 510, y: 124, text: "setup", size: 17, align: "middle" },
    { type: "text", x: 510, y: 154, text: "run", size: 17, align: "middle" },
    { type: "text", x: 510, y: 184, text: "compare", size: 17, align: "middle" },
    { type: "rect", id: "out", x: 720, y: 112, w: 100, h: 56, text: "✓ / ✗", fill: "yellow", size: 22 },
    { type: "arrow", from: "check", to: "out" },
    { type: "text", x: 410, y: 300, text: "the test is data; the helper holds the machinery", size: 19, align: "middle" },
  );
  rows.forEach((_, i) => els.push({ type: "arrow", from: "r" + i, to: "check" }));
  return els;
};
