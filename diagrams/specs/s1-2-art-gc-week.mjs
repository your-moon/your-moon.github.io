// Part 1 story beat: the hardest, buggiest week of the project — writing the garbage collector.
import { person, laptop, moon } from "../art.mjs";
export const fit = true;
export const langs = ["en", "mn"];
export const title = { en: "The garbage collector week", mn: "Хог цуглуулагчийн долоо хоног" };
const SCREEN = { en: ["freed too early?", "freed too late?"], mn: ["хэт эрт чөлөөлсөн үү?", "хэт оройтож чөлөөлсөн үү?"] };
const balls = [[520, 252, 14], [548, 258, 11], [534, 238, 12], [506, 262, 9]].map(([cx, cy, r]) => ({ type: "ellipse", x: cx - r, y: cy - r, w: 2 * r, h: 2 * r, fill: "paper" }));
export default (lang) => [
  ...moon(4, 6),
  ...person(30, 90, { mood: "tired", arms: "down" }),
  ...laptop(190, 118, SCREEN[lang], { w: 250, h: 130 }),
  { type: "line", points: [[0, 276], [580, 276]] },
  ...balls,
];
