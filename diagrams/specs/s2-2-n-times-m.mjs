// Part 2.2: every language to every chip (9 translators) vs one shared IR in the middle (6).
export const title = "Direct translators versus a shared middle";
export default () => {
  const els = [];
  const langs = ["C", "Rust", "Swift"], chips = ["x86-64", "ARM", "RISC-V"];
  const box = (id, x, y, text, fill, w = 90) => ({ type: "rect", id, x, y, w, h: 42, text, fill, size: 18 });
  // left: direct
  els.push({ type: "text", x: 150, y: 0, text: "Direct: 3 × 3 = 9", size: 21, align: "middle" });
  langs.forEach((_, i) => chips.forEach((_, j) =>
    els.push({ type: "line", points: [[i * 105 + 45, 102], [j * 105 + 45, 258]] })));
  langs.forEach((l, i) => els.push(box("dl" + i, i * 105, 60, l, "blue")));
  chips.forEach((c, j) => els.push(box("dc" + j, j * 105, 258, c, "green")));
  // right: via IR
  const X = 390;
  els.push({ type: "text", x: X + 150, y: 0, text: "Shared IR: 3 + 3 = 6", size: 21, align: "middle" });
  langs.forEach((l, i) => els.push(box("rl" + i, X + i * 105, 60, l, "blue")));
  els.push({ type: "rect", id: "ir", x: X, y: 160, w: 300, h: 46, text: "IR", fill: "yellow", size: 20 });
  chips.forEach((c, j) => els.push(box("rc" + j, X + j * 105, 258, c, "green")));
  langs.forEach((_, i) => els.push({ type: "arrow", from: [X + i * 105 + 45, 102], to: [X + i * 105 + 45, 158] }));
  chips.forEach((_, j) => els.push({ type: "arrow", from: [X + j * 105 + 45, 208], to: [X + j * 105 + 45, 256] }));
  els.push({ type: "line", points: [[345, -10], [345, 320]], dashed: true });
  els.push({ type: "text", x: 150, y: 330, text: "9 translators to build", size: 16, align: "middle", muted: true });
  els.push({ type: "text", x: X + 150, y: 330, text: "3 frontends + 3 backends", size: 16, align: "middle", muted: true });
  return els;
};
