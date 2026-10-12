// Craft 3: the strangler fig -- new pieces grow beside the old system and take over its behaviour.
export const title = "The strangler fig";
const grid = [[700, 0], [800, 0], [900, 0], [700, 120], [800, 120], [900, 120]];
export default () => [
  // (a)
  { type: "rect", id: "a", x: 0, y: 0, w: 200, h: 170, fill: "gray", text: "old system", size: 20 },
  { type: "arrow", from: [215, 85], to: [290, 85] },
  // (b)
  { type: "rect", id: "b", x: 300, y: 0, w: 150, h: 170, fill: "gray", text: "old\nsystem", size: 20 },
  { type: "rect", id: "n1", x: 520, y: 20, w: 90, h: 50, fill: "green", text: "new", size: 18 },
  { type: "rect", id: "n2", x: 520, y: 100, w: 90, h: 50, fill: "green", text: "new", size: 18 },
  { type: "arrow", from: "b", to: "n1" },
  { type: "arrow", from: "b", to: "n2" },
  { type: "text", x: 485, y: -26, text: "behaviour moves", size: 17, align: "middle", muted: true },
  { type: "arrow", from: [630, 85], to: [690, 85] },
  // (c)
  { type: "rect", x: 800, y: 60, w: 90, h: 50, fill: "gray", text: "old", size: 18 },
  ...grid.map(([x, y]) => ({ type: "rect", x, y: y + (y ? 0 : 0), w: 90, h: 50, fill: "green", text: "new", size: 18 })),
  // the whole time
  { type: "arrow", from: [0, 235], to: [990, 235], both: true },
  { type: "text", x: 495, y: 275, text: "keeps running the whole time", size: 20, align: "middle", muted: true },
];
