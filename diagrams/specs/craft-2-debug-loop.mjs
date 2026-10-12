// Part 2: debugging as the scientific method.
export const title = "Debugging as a loop";
const W = 260, H = 84;
const box = (id, x, y, text, fill) => ({ type: "rect", id, x, y, w: W, h: H, text, fill, size: 18 });
export default () => [
  box("a", 0, 80, "stabilize:\nmake it repeatable", "blue"),
  box("b", 340, 80, "hypothesis that\nexplains all the data", "violet"),
  box("c", 680, 80, "experiment that\ncould prove it wrong", "violet"),
  box("d", 680, 270, "fix the cause,\nnot the symptom", "green"),
  box("e", 340, 270, "keep a test that\nfails without the fix", "green"),
  box("f", 0, 270, "search for the same\nbug elsewhere", "orange"),
  { type: "arrow", from: "a", to: "b" },
  { type: "arrow", from: "b", to: "c" },
  { type: "arrow", from: "c", to: "b", via: [[640, 22]], label: "refine", labelAt: [640, 0] },
  { type: "arrow", from: "c", to: "d", label: "survives", labelAt: [868, 215] },
  { type: "arrow", from: "d", to: "e" },
  { type: "arrow", from: "e", to: "f" },
];
