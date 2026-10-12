// Part 1: define the error away: "delete x" fails when x is missing; "make sure x is gone" cannot.
export const title = "Define the error away";
export default () => [
  { type: "text", x: 350, y: -10, text: "define the error away", size: 24, align: "middle" },
  // left
  { type: "text", x: 130, y: 50, text: "delete x", size: 20, align: "middle" },
  { type: "diamond", id: "q", x: 50, y: 80, w: 160, h: 100, text: "x exists?", size: 17 },
  { type: "text", x: 235, y: 118, text: "no", size: 16, align: "start", muted: true },
  { type: "rect", id: "e", x: 270, y: 108, w: 110, h: 44, text: "ERROR", fill: "red", size: 18 },
  { type: "rect", id: "k0", x: 0, y: 300, w: 150, h: 40, text: "caller: try/catch", size: 15 },
  { type: "rect", id: "k1", x: 160, y: 300, w: 150, h: 40, text: "caller: try/catch", size: 15 },
  { type: "rect", id: "k2", x: 320, y: 300, w: 150, h: 40, text: "caller: try/catch", size: 15 },
  { type: "arrow", from: "q", to: "e" },
  { type: "arrow", from: "e", to: "k0" },
  { type: "arrow", from: "e", to: "k1" },
  { type: "arrow", from: "e", to: "k2" },
  // divider
  { type: "line", points: [[500, 40], [500, 340]], dashed: true },
  // right
  { type: "text", x: 700, y: 50, text: "make sure x is gone", size: 20, align: "middle" },
  { type: "rect", id: "m", x: 640, y: 100, w: 120, h: 50, text: "make sure\nx is gone", size: 16 },
  { type: "rect", id: "g", x: 640, y: 230, w: 120, h: 50, text: "done", fill: "green", size: 20 },
  { type: "arrow", from: "m", to: "g" },
];
