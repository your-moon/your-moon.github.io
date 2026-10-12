// Part 4 finale: the four lessons as floors, the narrator on top.
import { person, sparkles } from "../art.mjs";
export const fit = true;
export const title = "Four floors";
const W = 400, H = 56, TOP = 140;
const labels = ["4  assume the world breaks", "3  respect old code", "2  tests that can fail", "1  the enemy is complexity"];
const fills = ["orange", "yellow", "green", "blue"];
const PX = W / 2 - 36, PY = TOP - 186;
export default () => [
  ...labels.flatMap((t, k) => [{ type: "rect", x: 0, y: TOP + k * H, w: W, h: H, fill: fills[k], text: t, size: 20 }]),
  { type: "line", points: [[-40, TOP + 4 * H], [W + 40, TOP + 4 * H]] },
  ...person(PX, PY, { mood: "grin", arms: "cheer" }),
  ...sparkles(PX + 36, PY + 80, { r: 70 }),
];
