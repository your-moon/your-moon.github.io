// Part 2.1 story beat: staring at assembly my own compiler wrote and couldn't fully read.
import { person, paper, mark } from "../art.mjs";
export const fit = true;
export const title = "Assembly I couldn't read";
export default () => [
  ...person(0, 20, { mood: "puzzled", arms: "hold" }),
  ...paper(120, 70, ["mov   eax, 2", "add   eax, 3", "mov   [x], eax"], { w: 250, h: 112, size: 17 }),
  mark(430, 70, "?", 56),
  mark(490, 120, "?", 40),
];
