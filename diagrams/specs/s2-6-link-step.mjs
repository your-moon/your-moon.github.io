// Part 6: the linker keeps the promises the compiler left (call printf), or fails with "undefined reference".
export const title = "What the linker does";
export default [
  { type: "rect", id: "obj", x: 0, y: 0, w: 230, h: 84, text: "my compiled code\ncall printf → ?", fill: "blue", size: 18 },
  { type: "rect", id: "libc", x: 300, y: 0, w: 230, h: 84, text: "libc\nthe real printf", fill: "green", size: 18 },
  { type: "rect", id: "ld", x: 100, y: 170, w: 230, h: 56, text: "Linker", fill: "yellow", size: 20 },
  { type: "arrow", from: "obj", to: "ld" },
  { type: "arrow", from: "libc", to: "ld" },
  { type: "rect", id: "exe", x: 100, y: 310, w: 230, h: 84, text: "my program\ncall printf → real address", fill: "green", size: 17 },
  { type: "arrow", from: "ld", to: "exe", label: "promise kept", labelAt: [290, 270] },
  { type: "rect", id: "err", x: 430, y: 160, w: 230, h: 76, text: "undefined reference\nto `printf'", fill: "red", size: 17, mono: true },
  { type: "arrow", from: "ld", to: "err", dashed: true },
  { type: "text", x: 545, y: 262, text: "no library had printf", size: 16, muted: true, align: "middle" },
];
