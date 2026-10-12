// Part 5 story beat: the first compiler bug caught in gdb.
import { person, laptop, sparkles } from "../art.mjs";
export const fit = true;
export const title = "Caught a bug";
export default () => [
  ...laptop(150, 20, ["Breakpoint 1, guessGame ()"], { w: 320, h: 140, size: 15 }),
  ...person(0, 20, { mood: "grin", arms: "cheer" }),
  ...sparkles(36, 80, { r: 52 }),
];
