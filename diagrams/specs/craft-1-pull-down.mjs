// Part 1: redis hides incremental rehashing behind dictFind / dictAdd.
export const title = "redis hides rehashing behind dictFind and dictAdd";
export default () => {
  const els = [];
  [0, 1, 2].forEach((i) => els.push({ type: "rect", id: "c" + i, x: i * 150, y: 0, w: 120, h: 44, text: "caller", fill: "blue", size: 18 }));
  els.push(
    { type: "rect", id: "d", x: -20, y: 170, w: 500, h: 220, fill: "paper" },
    { type: "text", x: 40, y: 192, text: "dict (redis)", size: 18, align: "start", muted: true },
    { type: "text", x: 226, y: 118, text: "dictFind /\ndictAdd", size: 17, mono: true, align: "start" },
  );
  [0, 1, 2].forEach((i) => els.push({ type: "arrow", from: [i * 150 + 60, 48], to: [i * 150 + 60, 168] }));
  // tables
  els.push(
    { type: "text", x: 80, y: 224, text: "old", size: 18, align: "middle" },
    { type: "text", x: 340, y: 224, text: "new", size: 18, align: "middle" },
  );
  for (let k = 0; k < 4; k++) els.push({ type: "rect", x: 20 + k * 40, y: 244, w: 40, h: 40, fill: k < 2 ? "gray" : "orange" });
  for (let k = 0; k < 8; k++) els.push({ type: "rect", x: 230 + (k % 4) * 40, y: 244 + Math.floor(k / 4) * 40, w: 40, h: 40, fill: k < 2 ? "green" : "gray" });
  els.push(
    { type: "arrow", from: [140, 255], to: [226, 255], curve: 40, label: "moves a few buckets per call", labelAt: [185, 358], labelSize: 16 },
    { type: "text", x: 540, y: 22, text: "callers never\nsee rehashing", size: 17, align: "start", muted: true },
  );
  return els;
};
