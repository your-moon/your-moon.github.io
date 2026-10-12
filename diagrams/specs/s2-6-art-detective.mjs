// Part 2 story beat: "Who put printf inside my program?" — the narrator as a detective.
import { person, paper, thought } from "../art.mjs";
export const fit = true;
export const title = "Who put printf here?";
export default () => [
  ...thought(20, 0, 270, 84, "who put this here?", [62, 128]),
  ...person(20, 100, { mood: "puzzled", arms: "hold" }),
  // magnifying glass: handle from the hand to the lens
  { type: "line", points: [[112, 184], [232, 170]] },
  ...paper(310, 120, ["call printf", "..."], { w: 200, h: 120 }),
  { type: "ellipse", x: 230, y: 132, w: 68, h: 68 },
  { type: "line", points: [[0, 286], [520, 286]] },
];
