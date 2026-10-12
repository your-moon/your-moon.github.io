// Part 7: ./guess -> kernel -> dynamic linker (ld.so) -> main.
export const title = "From Enter to main";
export default [
  { type: "rect", id: "run", x: 0, y: 0, w: 220, h: 50, text: "./guess  + Enter", fill: "gray", size: 18, mono: true },
  { type: "rect", id: "k", x: 0, y: 100, w: 220, h: 60, text: "Kernel", fill: "blue", size: 20 },
  { type: "text", x: 250, y: 118, text: "carves out memory, copies the", size: 16, muted: true, align: "start" },
  { type: "text", x: 250, y: 142, text: "instructions in, sets up the stack", size: 16, muted: true, align: "start" },
  { type: "rect", id: "ld", x: 0, y: 220, w: 220, h: 130, text: "Dynamic linker\nld.so", fill: "yellow", size: 20 },
  { type: "text", x: 250, y: 242, text: "1. which shared libraries are needed?", size: 16, align: "start" },
  { type: "text", x: 250, y: 276, text: "2. find each one, load it into memory", size: 16, align: "start" },
  { type: "text", x: 250, y: 310, text: "3. patch every call printf", size: 16, align: "start" },
  { type: "text", x: 250, y: 336, text: "    with its real address", size: 16, align: "start" },
  { type: "rect", id: "m", x: 0, y: 410, w: 220, h: 60, text: "main", fill: "green", size: 20, mono: true },
  { type: "text", x: 250, y: 440, text: "every promise kept, printf has an address", size: 16, muted: true, align: "start" },
  { type: "arrow", from: "run", to: "k" },
  { type: "arrow", from: "k", to: "ld" },
  { type: "arrow", from: "ld", to: "m" },
];
