// Part 1 story beat: the narrator looks up at tailscale's local.go, one huge file with 409 methods.
import { person, thought } from "../art.mjs";
export const fit = true;
export const title = "The narrator and local.go";
export default () => {
  const els = [
    ...person(10, 90, { mood: "puzzled", arms: "head" }),
    ...thought(-30, -70, 230, 90, "what IS bad code?", [46, 112], { size: 20 }),
    { type: "line", points: [[-20, 322], [680, 322]] },
    { type: "rect", x: 300, y: -90, w: 300, h: 412, fill: "gray" },
    { type: "text", x: 450, y: 110, text: "local.go", size: 30, mono: true, align: "middle" },
    { type: "text", x: 450, y: 160, text: "9,287 lines · 409 methods", size: 18, align: "middle" },
  ];
  // method stubs sticking out of both sides
  [-60, -20, 30, 210, 250, 290].forEach((y, i) => {
    const l = 24 + (i % 3) * 10, r = 24 + ((i + 1) % 3) * 10;
    els.push(
      { type: "line", points: [[300, y], [300 - l, y]] },
      { type: "rect", x: 300 - l - 12, y: y - 6, w: 12, h: 12, fill: "blue" },
      { type: "line", points: [[600, y + 18], [600 + r, y + 18]] },
      { type: "rect", x: 600 + r, y: y + 12, w: 12, h: 12, fill: "blue" },
    );
  });
  return els;
};
