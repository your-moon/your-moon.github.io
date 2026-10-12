// Reusable hand-drawn characters and props for the blog's story illustrations, so every picture
// shares one cast and one style. Each helper returns an array of render.mjs elements; spread
// them into a spec: `export default () => [...person(0, 20, { mood: "grin" }), ...laptop(120, 0)]`.
// Coordinates are the top-left of the thing being drawn.

const dot = (x, y, r = 3) => ({ type: "ellipse", x: x - r, y: y - r, w: 2 * r, h: 2 * r, fill: "gray" });

const MOUTHS = {
  smile: (x, y) => ({ type: "path", d: `M ${x - 8} ${y} Q ${x} ${y + 5} ${x + 8} ${y}` }),
  grin: (x, y) => ({ type: "path", d: `M ${x - 10} ${y - 2} Q ${x} ${y + 10} ${x + 10} ${y - 2} Z`, fill: "paper" }),
  flat: (x, y) => ({ type: "line", points: [[x - 7, y + 1], [x + 7, y + 1]] }),
  puzzled: (x, y) => ({ type: "path", d: `M ${x - 8} ${y + 3} Q ${x - 3} ${y - 2} ${x} ${y + 1} T ${x + 8} ${y}` }),
  sad: (x, y) => ({ type: "path", d: `M ${x - 8} ${y + 4} Q ${x} ${y - 2} ${x + 8} ${y + 4}` }),
  wow: (x, y) => ({ type: "ellipse", x: x - 5, y: y - 4, w: 10, h: 11, fill: "paper" }),
};

// Eyes: open dots, or tired/sleepy dashes.
function eyes(cx, ey, mood) {
  if (mood === "tired" || mood === "sleep")
    return [{ type: "line", points: [[cx - 12, ey], [cx - 5, ey]] }, { type: "line", points: [[cx + 5, ey], [cx + 12, ey]] }];
  return [dot(cx - 8, ey), dot(cx + 8, ey)];
}

const MOOD_MOUTH = { smile: "smile", grin: "grin", puzzled: "puzzled", tired: "flat", sad: "sad", wow: "wow", sleep: "flat", flat: "flat" };

// A face on any shape: centre (cx, cy).
export function face(cx, cy, mood = "smile") {
  return [...eyes(cx, cy - 4, mood), MOUTHS[MOOD_MOUTH[mood] || "smile"](cx, cy + 10)];
}

// The narrator: a stick figure. Box ≈ 72 × 186. arms: "down" | "up" (one arm raised) |
// "hold" (right arm forward, hand at about (x + 92, y + 84)) | "cheer" (both up) | "head" (scratching head).
export function person(x, y, { mood = "smile", arms = "down" } = {}) {
  const cx = x + 36, top = y + 30;
  const neck = top + 44, hip = top + 110, shoulder = top + 62;
  const els = [
    { type: "ellipse", x: cx - 22, y: top, w: 44, h: 44, fill: "paper" },
    ...face(cx, top + 20, mood),
    { type: "line", points: [[cx, neck], [cx, hip]] },
    { type: "line", points: [[cx, hip], [cx - 20, hip + 46]] },
    { type: "line", points: [[cx, hip], [cx + 20, hip + 46]] },
  ];
  const left = { down: [cx - 22, shoulder + 30], up: [cx - 22, shoulder + 30], hold: [cx - 22, shoulder + 30], cheer: [cx - 30, shoulder - 40], head: [cx - 22, shoulder + 30] }[arms];
  const right = { down: [cx + 22, shoulder + 30], up: [cx + 30, shoulder - 40], hold: [cx + 56, shoulder - 8], cheer: [cx + 30, shoulder - 40], head: [cx + 26, top + 6] }[arms];
  els.push({ type: "line", points: [[cx, shoulder], left] });
  // Scratching the head: the arm bends out at the elbow and the hand rests on the side of the head.
  if (arms === "head") els.push({ type: "line", points: [[cx, shoulder], [cx + 40, shoulder - 14], [cx + 24, top + 14]] });
  else els.push({ type: "line", points: [[cx, shoulder], right] });
  return els;
}

// A CPU chip with pins and a face. Box w × h (pins stick out 12px each side).
export function cpu(x, y, { w = 100, h = 90, mood = "smile", label = "CPU" } = {}) {
  const els = [{ type: "rect", x, y, w, h, fill: "green" }];
  for (let k = 0; k < 4; k++) {
    const px = x + 16 + k * ((w - 32) / 3), py = y + 15 + k * ((h - 30) / 3);
    els.push(
      { type: "line", points: [[px, y], [px, y - 12]] },
      { type: "line", points: [[px, y + h], [px, y + h + 12]] },
      { type: "line", points: [[x, py], [x - 12, py]] },
      { type: "line", points: [[x + w, py], [x + w + 12, py]] },
    );
  }
  els.push(...face(x + w / 2, y + h / 2 - 4, mood));
  if (label) els.push({ type: "text", x: x + w / 2, y: y + h + 34, text: label, size: 20, align: "middle" });
  return els;
}

// A laptop showing lines of monospace text. Box w × (h + 28).
export function laptop(x, y, lines = [], { w = 260, h = 160, size = 16 } = {}) {
  const els = [
    { type: "rect", x, y, w, h, fill: "gray" },
    { type: "rect", x: x + 12, y: y + 12, w: w - 24, h: h - 24, fill: "blue" },
    { type: "path", d: `M ${x - 24} ${y + h + 6} L ${x + w + 24} ${y + h + 6} L ${x + w + 46} ${y + h + 28} L ${x - 46} ${y + h + 28} Z`, fill: "gray" },
  ];
  lines.forEach((l, i) => els.push({ type: "text", x: x + 26, y: y + 34 + i * (size + 8), text: l, size, mono: true, align: "start" }));
  return els;
}

// A sheet of paper with a folded corner and lines of monospace text.
export function paper(x, y, lines = [], { w = 260, h = 120, size = 16 } = {}) {
  const els = [
    { type: "path", d: `M ${x} ${y} L ${x + w - 26} ${y} L ${x + w} ${y + 26} L ${x + w} ${y + h} L ${x} ${y + h} Z`, fill: "paper" },
    { type: "line", points: [[x + w - 26, y], [x + w - 26, y + 26], [x + w, y + 26]] },
  ];
  const y0 = y + h / 2 - ((lines.length - 1) * (size + 8)) / 2;
  lines.forEach((l, i) => els.push({ type: "text", x: x + 16, y: y0 + i * (size + 8), text: l, size, mono: true, align: "start" }));
  return els;
}

// A closed book standing at a slight angle, title on the cover. Box ≈ w × h.
export function book(x, y, title = "", { w = 110, h = 150, fill = "orange" } = {}) {
  return [
    { type: "path", d: `M ${x + 10} ${y} L ${x + w} ${y + 6} L ${x + w - 6} ${y + h} L ${x} ${y + h - 6} Z`, fill },
    { type: "line", points: [[x + 22, y + 2], [x + 13, y + h - 5]] },
    { type: "text", x: x + w / 2 + 8, y: y + h / 2, text: title, size: 16, align: "middle" },
  ];
}

// A speech bubble with its tail pointing at (tx, ty).
export function speech(x, y, w, h, text, [tx, ty], { size = 18 } = {}) {
  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  // The tail leaves from whichever edge faces the speaker.
  let tail;
  if (tx < x || tx > x + w) {
    const ex = tx < x ? x : x + w, ey = clamp(ty, y + 12, y + h - 34);
    tail = `M ${ex} ${ey} L ${tx} ${ty} L ${ex} ${ey + 22} Z`;
  } else {
    const ex = clamp(tx, x + 20, x + w - 40), ey = ty > y + h ? y + h : y;
    tail = `M ${ex} ${ey} L ${tx} ${ty} L ${ex + 22} ${ey} Z`;
  }
  return [
    { type: "rect", x, y, w, h, fill: "paper" },
    { type: "path", d: tail, fill: "paper" },
    { type: "text", x: x + w / 2, y: y + h / 2, text, size, align: "middle" },
  ];
}

// A thought cloud with little bubbles trailing down to (tx, ty).
export function thought(x, y, w, h, text, [tx, ty], { size = 18 } = {}) {
  const cx = x + w / 2, by = y + h;
  return [
    { type: "ellipse", x, y, w, h, fill: "paper" },
    { type: "ellipse", x: cx + (tx - cx) * 0.45 - 10, y: by + (ty - by) * 0.35 - 8, w: 20, h: 16, fill: "paper" },
    { type: "ellipse", x: cx + (tx - cx) * 0.8 - 6, y: by + (ty - by) * 0.75 - 5, w: 12, h: 10, fill: "paper" },
    { type: "text", x: cx, y: y + h / 2, text, size, align: "middle" },
  ];
}

// A wall clock reading hh:mm (hands drawn at that time).
export function clock(x, y, hh, mm, { r = 34 } = {}) {
  const cx = x + r, cy = y + r;
  const a = (deg) => ((deg - 90) * Math.PI) / 180;
  const hand = (deg, len) => ({ type: "line", points: [[cx, cy], [cx + len * Math.cos(a(deg)), cy + len * Math.sin(a(deg))]] });
  return [{ type: "ellipse", x, y, w: 2 * r, h: 2 * r, fill: "paper" }, hand((hh % 12) * 30 + mm / 2, r * 0.5), hand(mm * 6, r * 0.8)];
}

// A crescent moon (night).
export function moon(x, y, { r = 22 } = {}) {
  return [{ type: "path", d: `M ${x + r} ${y} Q ${x - r * 0.7} ${y + r} ${x + r} ${y + 2 * r} Q ${x + r * 0.25} ${y + r} ${x + r} ${y} Z`, fill: "yellow" }];
}

// Little sparkle marks around a point (joy, success).
export function sparkles(cx, cy, { r = 46 } = {}) {
  const els = [];
  [[-1, -0.7], [1, -0.8], [-1.1, 0.4], [1.1, 0.3]].forEach(([dx, dy]) => {
    const x = cx + dx * r, y = cy + dy * r;
    els.push({ type: "line", points: [[x - 7, y], [x + 7, y]] }, { type: "line", points: [[x, y - 7], [x, y + 7]] });
  });
  return els;
}

// A big hand-written mark such as "?" or "!".
export const mark = (x, y, text = "?", size = 44) => ({ type: "text", x, y, text, size, align: "middle", muted: true });
