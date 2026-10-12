// Part 1 story beat: the 1am thought that started it all — how do I get a job, what sets me apart?
import { person, thought, clock, moon } from "../art.mjs";
export const langs = ["en", "mn"];
export const fit = true;
export const title = { en: "The 1am thought", mn: "Шөнийн нэг цагийн бодол" };
const T = {
  en: { think: "how do I get a job?\nwhat sets me apart?" },
  mn: { think: "ажилд яаж орох вэ?\nнадад ялгарах юу байна?" },
};
export default (lang) => [
  ...moon(4, 6),
  ...person(30, 96, { mood: "tired", arms: "head" }),
  ...thought(150, 0, 300, 116, T[lang].think, [100, 132]),
  ...clock(486, 60, 1, 0),
  { type: "text", x: 520, y: 152, text: "01:00", size: 18, align: "middle", muted: true },
];
