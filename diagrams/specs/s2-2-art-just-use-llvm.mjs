// Part 2.2 story beat: everyone says "just use LLVM"; the narrator says no.
import { person, speech, face } from "../art.mjs";
export const fit = true;
export const title = "Just use LLVM";
const head = (cx, cy, mood) => [{ type: "ellipse", x: cx - 22, y: cy - 22, w: 44, h: 44, fill: "paper" }, ...face(cx, cy, mood)];
export default () => [
  ...speech(0, 30, 200, 46, "just use LLVM", [50, 112]),
  ...head(50, 134, "smile"),
  ...speech(230, 70, 200, 46, "just use LLVM", [300, 152]),
  ...head(300, 174, "smile"),
  ...speech(470, 20, 100, 46, "no.", [510, 100]),
  ...person(480, 70, { mood: "smile", arms: "down" }),
];
