// Part 7 finale: the narrator cheering on top of the stack of floors they dug through —
// the magic isn't real, it's just floors.
import { person, speech, sparkles } from "../art.mjs";
export const fit = true;
export const title = "It's just floors";
const FLOOR_W = 200, FLOOR_H = 40, TOP = 130;
const floors = ["blue", "green", "yellow", "orange"].map((fill, k) => ({ type: "rect", x: 40, y: TOP + k * FLOOR_H, w: FLOOR_W, h: FLOOR_H, fill }));
// The person's feet land 186px below their y, so stand them on the top floor.
const PX = 40 + FLOOR_W / 2 - 36, PY = TOP - 186;
export default () => [
  ...floors,
  { type: "line", points: [[0, TOP + 4 * FLOOR_H], [540, TOP + 4 * FLOOR_H]] },
  ...person(PX, PY, { mood: "grin", arms: "cheer" }),
  ...sparkles(PX + 36, PY + 80, { r: 58 }),
  ...speech(270, PY - 10, 250, 84, "the magic isn't real.\nit's just floors.", [PX + 64, PY + 44]),
];
