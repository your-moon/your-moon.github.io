// Part 2: aim the test at the line it could break (axum's 123 vs ripgrep's NUL past 64 KiB).
export const title = "Where a test is aimed";
const R = 620;
export default () => [
  { type: "text", x: 240, y: 0, text: "axum: 128-bit test", size: 22, align: "middle" },
  { type: "text", x: R + 240, y: 0, text: "ripgrep: binary test", size: 22, align: "middle" },
  // left: a tiny input on a huge range
  { type: "rect", x: 0, y: 90, w: 480, h: 40, fill: "blue" },
  { type: "text", x: 170, y: 110, text: "i128 range", size: 20, align: "middle" },
  { type: "line", points: [[14, 80], [14, 140]] },
  { type: "text", x: 14, y: 58, text: "123", size: 18, mono: true, align: "middle" },
  { type: "line", points: [[0, 146], [0, 154], [30, 154], [30, 146]] },
  { type: "text", x: 0, y: 176, text: "fits in 8 bits", size: 16, align: "start", muted: true },
  { type: "rect", x: 300, y: 80, w: 180, h: 60, dashed: true },
  { type: "text", x: 390, y: 176, text: "where a 32-bit bug\nwould show", size: 16, align: "middle", muted: true },
  { type: "text", x: 240, y: 250, text: "123 never gets near it", size: 18, align: "middle" },
  // right: a NUL byte placed just past the buffer boundary
  { type: "rect", x: R, y: 90, w: 480, h: 40, fill: "gray" },
  { type: "text", x: R + 100, y: 110, text: "a file", size: 20, align: "middle" },
  { type: "line", points: [[R + 240, 66], [R + 240, 160]], dashed: true },
  { type: "text", x: R + 240, y: 46, text: "64 KiB buffer", size: 16, align: "middle", muted: true },
  { type: "rect", id: "nul", x: R + 258, y: 94, w: 52, h: 32, text: "NUL", fill: "red", size: 16, mono: true },
  { type: "text", x: R + 380, y: 190, text: "exactly where a\nbug would hide", size: 18, align: "middle" },
  { type: "arrow", from: [R + 350, 160], to: [R + 296, 134] },
  { type: "text", x: R + 240, y: 250, text: "the test is aimed at the boundary", size: 18, align: "middle" },
];
