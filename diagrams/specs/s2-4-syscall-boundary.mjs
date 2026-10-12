// Part 4: the syscall hand-off, registers filled in user mode, kernel does the write.
export const title = "A syscall crosses from user mode into the kernel";
export default () => {
  const rows = [
    ["rax = 1", "which favor: write"],
    ["rdi = 1", "where: stdout, the screen"],
    ["rsi = msg", "the address of the bytes"],
    ["rdx = 12", "how many bytes"],
  ];
  const els = [];
  rows.forEach(([r, note], i) => {
    const y = 30 + i * 40;
    els.push({ type: "rect", id: "r" + i, x: 0, y, w: 170, h: 34, text: r, fill: "blue", size: 16, mono: true });
    els.push({ type: "text", x: 185, y: y + 17, text: note, size: 16, align: "start", muted: true });
  });
  els.push(
    { type: "line", points: [[-20, 250], [470, 250]], dashed: true },
    { type: "text", x: 470, y: 232, text: "user mode", size: 16, align: "end", muted: true },
    { type: "text", x: 470, y: 270, text: "kernel mode", size: 16, align: "end", muted: true },
    { type: "arrow", from: [60, 184], to: [60, 310] },
    { type: "text", x: 78, y: 205, text: "syscall", size: 17, mono: true, align: "start" },
    { type: "arrow", from: [250, 310], to: [250, 184], dashed: true },
    { type: "text", x: 268, y: 205, text: "result comes back", size: 16, align: "start", muted: true },
    { type: "rect", id: "k", x: 0, y: 310, w: 300, h: 64, text: "kernel does the write", fill: "green", size: 18 },
    { type: "rect", id: "s", x: 0, y: 440, w: 300, h: 56, text: "screen", fill: "gray", size: 18 },
    { type: "arrow", from: "k", to: "s" },
  );
  return els;
};
