// Part 1 story beat: the first time the guessing game ran and printed "too low" — sitting there grinning.
import { person, laptop, sparkles } from "../art.mjs";
export const langs = ["en", "mn"];
export const fit = true;
export const title = { en: "The first time it ran", mn: "Анх удаа ажилласан мөч" };
const T = {
  en: ["Enter your guess:", "50", "too low"],
  mn: ["Enter your guess:", "50", "too low"],
};
export default (lang) => [
  ...laptop(150, 10, T[lang], { w: 290, h: 150, size: 17 }),
  ...person(0, 30, { mood: "grin", arms: "cheer" }),
  ...sparkles(36, 80, { r: 52 }),
];
