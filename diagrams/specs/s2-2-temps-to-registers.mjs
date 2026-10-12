// Part 2.2: Tacky's unlimited temporaries versus the real machine's few registers.
export const title = "Unlimited temporaries versus real registers";
export default () => {
  const els = [
    { type: "text", x: 0, y: 0, text: "Tacky: unlimited temporaries", size: 20 },
    { type: "text", x: 430, y: 0, text: "Real CPU", size: 20 },
  ];
  ["tmp.0", "tmp.1", "tmp.2", "tmp.3", "tmp.4 …"].forEach((t, i) =>
    els.push({ type: "rect", id: "t" + i, x: 0, y: 40 + i * 56, w: 150, h: 42, text: t, fill: "blue", size: 18, mono: true }));
  els.push(
    { type: "rect", id: "regs", x: 430, y: 40, w: 250, h: 100, text: "a small, fixed set of\nregisters (about 16)", fill: "green", size: 18 },
    { type: "rect", id: "mem", x: 430, y: 220, w: 250, h: 100, text: "memory\nbig, but slow", fill: "gray", size: 18 },
    // Brackets group the temporaries: the first few get registers, the rest spill.
    { type: "line", points: [[160, 44], [174, 44], [174, 190], [160, 190]] },
    { type: "line", points: [[160, 212], [174, 212], [174, 302], [160, 302]], dashed: true },
    { type: "arrow", from: [178, 117], to: [428, 90], label: "these fit", labelAt: [300, 78] },
    { type: "arrow", from: [178, 257], to: [428, 270], dashed: true, label: "no room: spill", labelAt: [300, 286] },
    { type: "text", x: 0, y: 340, text: "the backend has to cram the left onto the right", size: 16, muted: true },
  );
  return els;
};
