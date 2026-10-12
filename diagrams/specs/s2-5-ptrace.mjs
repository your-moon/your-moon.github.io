// Part 5: gdb cannot touch the program, the kernel does it on gdb's behalf via ptrace.
export const title = "gdb asks, the kernel reaches in";
export default () => [
  { type: "rect", id: "g", x: 0, y: 40, w: 200, h: 60, text: "gdb", fill: "blue", size: 20 },
  { type: "rect", id: "p", x: 400, y: 40, w: 200, h: 60, text: "your program", fill: "violet", size: 20 },
  { type: "arrow", from: "g", to: "p", dashed: true },
  { type: "text", x: 300, y: 20, text: "can't reach in directly", size: 16, muted: true },
  { type: "rect", id: "k", x: 0, y: 230, w: 600, h: 70, text: "kernel: allowed to touch everything", fill: "yellow", size: 19 },
  { type: "arrow", from: [100, 100], to: [100, 230] },
  { type: "text", x: 120, y: 135, text: "ptrace: pause it, step it,", size: 15, align: "start", muted: true },
  { type: "text", x: 120, y: 158, text: "read registers and memory,", size: 15, align: "start", muted: true },
  { type: "text", x: 120, y: 181, text: "change memory", size: 15, align: "start", muted: true },
  { type: "arrow", from: [500, 230], to: [500, 100] },
  { type: "text", x: 485, y: 150, text: "the kernel does it", size: 15, align: "end", muted: true },
  { type: "text", x: 485, y: 173, text: "on gdb's behalf", size: 15, align: "end", muted: true },
];
