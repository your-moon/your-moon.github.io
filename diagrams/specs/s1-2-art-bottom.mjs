// Part 1.2 story beat: a machine inside my machine, and still no idea what's at the very bottom.
import { person, thought, laptop, cpu } from "../art.mjs";
export const fit = true;
export const langs = ["en", "mn"];
export const title = { en: "A machine inside my machine", mn: "Миний машин доторх машин" };
const Q = { en: "what's at the very\nbottom?", mn: "хамгийн доор\nюу байгаа вэ?" };
export default (lang) => [
  ...person(0, 50, { mood: "puzzled", arms: "head" }),
  ...thought(100, 0, 250, 84, Q[lang], [66, 100]),
  ...laptop(390, 70, [], { w: 180, h: 120 }),
  ...cpu(444, 106, { w: 72, h: 48, mood: "puzzled", label: "" }),
];
