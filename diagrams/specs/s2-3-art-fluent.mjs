// Part 3 story beat: my program spoke fluent assembly, I didn't.
import { person, paper, mark } from "../art.mjs";
export const fit = true;
export const title = "Fluent assembly, not me";
export default () => [
  ...person(0, 10, { mood: "puzzled", arms: "head" }),
  ...paper(150, 50, ["mov eax, 2", "add eax, 3"], { w: 250, h: 110 }),
  mark(450, 70, "?"),
  mark(500, 140, "?"),
];
