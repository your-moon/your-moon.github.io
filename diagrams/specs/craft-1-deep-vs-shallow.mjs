// Part 1: a deep module (small interface, big implementation) vs a shallow one (wide interface, thin implementation).
export const title = "Deep module vs shallow module";
export default () => [
  // deep
  { type: "rect", x: 85, y: 0, w: 90, h: 36, text: "interface", fill: "yellow", size: 17 },
  { type: "rect", x: 0, y: 36, w: 260, h: 280, text: "implementation", fill: "blue", size: 20 },
  { type: "text", x: 130, y: 350, text: "deep: Unix files:", size: 18, align: "middle" },
  { type: "text", x: 130, y: 376, text: "open read write lseek close", size: 15, mono: true, align: "middle" },
  // shallow
  { type: "rect", x: 360, y: 0, w: 300, h: 40, text: "interface", fill: "yellow", size: 17 },
  { type: "rect", x: 360, y: 40, w: 300, h: 56, text: "implementation", fill: "blue", size: 20 },
  { type: "text", x: 510, y: 350, text: "shallow: many tiny classes", size: 18, align: "middle" },
];
