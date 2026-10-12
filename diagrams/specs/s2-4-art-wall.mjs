// Part 2 story beat: the program can't touch the screen itself — a wall (the kernel) stands in between.
import { face } from "../art.mjs";
export const fit = true;
export const title = "The kernel wall";
export default () => [
  // the program: a little box with a face and legs, reaching for the door
  { type: "rect", x: 40, y: 180, w: 80, h: 70, fill: "green" },
  ...face(80, 211, "puzzled"),
  { type: "line", points: [[62, 250], [62, 280]] },
  { type: "line", points: [[98, 250], [98, 280]] },
  { type: "line", points: [[120, 222], [160, 214], [222, 204]] },
  // the wall
  { type: "rect", x: 220, y: 0, w: 100, h: 280, fill: "gray" },
  { type: "text", x: 270, y: 40, text: "kernel", size: 22, align: "middle" },
  { type: "rect", x: 245, y: 150, w: 50, h: 70, fill: "yellow" },
  { type: "ellipse", x: 281, y: 182, w: 7, h: 7, fill: "paper" },
  { type: "text", x: 270, y: 245, text: "syscall", size: 18, align: "middle" },
  // the screen on the far side
  { type: "rect", x: 380, y: 90, w: 190, h: 120, fill: "blue" },
  { type: "text", x: 475, y: 150, text: "бага байна", size: 22, align: "middle" },
  { type: "line", points: [[475, 210], [475, 278]] },
  { type: "line", points: [[440, 278], [510, 278]] },
  { type: "line", points: [[0, 280], [220, 280]] },
];
