// Part 4 opener: the kiosks are dead, the status board says everything is fine.
import { person, face, clock } from "../art.mjs";
export const fit = true;
export const title = "Monitoring says OK, nothing works";
export default () => [
  // the kiosk: a tall box with a screen and a card slot
  { type: "rect", x: 0, y: 20, w: 160, h: 240, fill: "gray" },
  { type: "rect", x: 14, y: 36, w: 132, h: 100, fill: "red", text: "check-in\nunavailable", size: 17 },
  { type: "rect", x: 40, y: 160, w: 80, h: 14, fill: "paper" },
  { type: "rect", x: 40, y: 190, w: 80, h: 40, fill: "paper" },
  { type: "line", points: [[-20, 260], [680, 260]] },
  // the traveller and the suitcase
  ...person(214, 74, { mood: "sad", arms: "down" }),
  { type: "path", d: "M 300 208 L 300 198 L 320 198 L 320 208" },
  { type: "rect", x: 286, y: 208, w: 64, h: 52, fill: "orange" },
  ...clock(210, 6, 11, 30, { r: 24 }),
  { type: "text", x: 258, y: 72, text: "11:30", size: 16, align: "middle", muted: true },
  // the status board: all green, smiling
  { type: "rect", x: 430, y: 20, w: 250, h: 170, fill: "green" },
  ...face(555, 74, "grin"),
  { type: "text", x: 555, y: 140, text: "STATUS: OK", size: 24, align: "middle" },
  { type: "line", points: [[555, 190], [555, 260]] },
];
