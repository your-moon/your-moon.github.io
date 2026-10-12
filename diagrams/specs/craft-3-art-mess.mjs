// Craft 3: "this is a mess, let's rewrite it" -- the old code is a tangle, but it remembers ten years of fixes.
import { person, speech } from "../art.mjs";
export const fit = true;
export const title = "The old code looks like a mess";
export default () => [
  ...person(0, 20, { mood: "puzzled", arms: "head" }),
  ...speech(90, -30, 200, 50, "let's rewrite it!", [50, 50]),
  { type: "rect", x: 300, y: 60, w: 300, h: 240, fill: "gray" },
  // spaghetti
  { type: "path", d: "M 330 100 C 400 60 440 160 380 190 S 330 260 420 270 S 560 200 520 140 S 440 90 480 110", dashed: false },
  { type: "path", d: "M 320 250 C 380 130 460 80 560 120 S 560 270 470 230 S 360 150 410 110", dashed: false },
  { type: "path", d: "M 350 150 C 420 240 500 280 570 220 S 500 90 430 150 S 330 200 350 280", dashed: false },
  { type: "path", d: "M 560 80 C 500 160 420 100 390 150 S 440 280 540 270", dashed: false },
  { type: "text", x: 450, y: 330, text: "the old code", size: 22, align: "middle" },
  ...speech(640, 60, 300, 60, "I hold 10 years of bug fixes", [600, 150], { size: 17 }),
];
