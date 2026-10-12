// Part 4 story beat: watching my own write calls scroll by under strace.
import { person, laptop } from "../art.mjs";
export const fit = true;
export const title = "Watching the write calls";
export default () => [
  ...laptop(150, 20, ["$ strace ./guess", 'read(0, "42\\n", 1024) = 3'], { w: 330, h: 140, size: 15 }),
  ...person(566, 10, { mood: "wow", arms: "up" }),
];
