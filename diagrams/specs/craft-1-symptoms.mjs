// Part 1: the three symptoms of complexity, side by side.
export const title = "The three symptoms of complexity";
export default () => {
  const els = [];
  const PW = 250, G = 40;
  const px = (i) => i * (PW + G);
  ["change amplification", "cognitive load", "unknown unknowns"].forEach((t, i) =>
    els.push({ type: "text", x: px(i) + PW / 2, y: 0, text: t, size: 20, align: "middle" }));

  // 1: one change fans out to six boxes
  els.push({ type: "rect", id: "c0", x: px(0) + 70, y: 40, w: 110, h: 44, text: "one change", fill: "yellow", size: 17 });
  for (let k = 0; k < 6; k++) {
    const x = px(0) + k * 42, y = 200;
    els.push({ type: "rect", id: "f" + k, x, y, w: 36, h: 40, fill: "red" });
    els.push({ type: "arrow", from: "c0", to: "f" + k });
  }

  // 2: a head with a tall stack of items above
  const hx = px(1) + PW / 2;
  els.push({ type: "ellipse", x: hx - 48, y: 250, w: 96, h: 90, fill: "paper" });
  for (let k = 0; k < 5; k++)
    els.push({ type: "rect", x: hx - 56 + (k % 2) * 8, y: 54 + k * 38, w: 112, h: 32, fill: ["blue", "violet", "green", "orange", "yellow"][k], text: ["x", "y", "flag", "state", "cache"][k], size: 16 });
  els.push(
    { type: "ellipse", x: hx - 22, y: 288, w: 7, h: 7, fill: "gray" },
    { type: "ellipse", x: hx + 15, y: 288, w: 7, h: 7, fill: "gray" },
    { type: "path", d: `M ${hx - 12} ${322} Q ${hx} ${310} ${hx + 12} ${322}` },
  );

  // 3: a dashed box with a ? hidden behind a wall
  const ux = px(2);
  els.push(
    { type: "rect", x: ux + 20, y: 60, w: 210, h: 220, dashed: true },
    { type: "text", x: ux + 140, y: 130, text: "?", size: 100, align: "middle", muted: true },
    { type: "rect", x: ux + 20, y: 150, w: 130, h: 130, fill: "gray" },
    { type: "text", x: ux + 125, y: 305, text: "the worst", size: 18, align: "middle", muted: true },
  );

  els.push({ type: "text", x: px(1) + PW / 2, y: 400, text: "causes: dependencies · obscurity", size: 18, align: "middle", muted: true });
  return els;
};
