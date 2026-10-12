// Part 2.1: one line becomes three real CPU instructions.
export const title = "One line becomes three instructions";
export default () => {
  const rows = [
    { ins: "mov   eax, 2", st: "eax = 2", note: "put 2 into the register", fill: "blue" },
    { ins: "add   eax, 3", st: "eax = 5", note: "add 3 to it", fill: "blue" },
    { ins: "mov   [x], eax", st: "[x] = 5", note: "store eax in x's memory slot", fill: "violet" },
  ];
  const els = [
    { type: "text", x: 0, y: 0, text: "зарла x: тоо = 2 + 3;", size: 20, mono: true, align: "start" },
    { type: "arrow", from: [120, 16], to: [120, 62], label: "backend", labelAt: [185, 40] },
    { type: "text", x: 125, y: 80, text: "instruction", size: 15, muted: true },
    { type: "text", x: 345, y: 80, text: "the CPU after it runs", size: 15, muted: true },
  ];
  rows.forEach((r, i) => {
    const y = 105 + i * 80;
    els.push({ type: "rect", id: "i" + i, x: 0, y, w: 250, h: 50, text: r.ins, fill: "orange", size: 20, mono: true });
    els.push({ type: "rect", id: "s" + i, x: 300, y, w: 130, h: 50, text: r.st, fill: r.fill, size: 20, mono: true });
    els.push({ type: "arrow", from: "i" + i, to: "s" + i });
    els.push({ type: "text", x: 460, y: y + 25, text: r.note, size: 16, align: "start", muted: true });
  });
  return els;
};
