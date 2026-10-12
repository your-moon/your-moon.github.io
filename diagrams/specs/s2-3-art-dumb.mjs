// Part 3 story beat: the machine isn't smart, just very fast at doing almost nothing.
import { person, cpu, speech } from "../art.mjs";
export const fit = true;
export const title = "Not smart, just fast";
export default () => [
  ...person(10, 40, { mood: "wow", arms: "down" }),
  ...speech(110, 0, 170, 50, "that's all?", [72, 92]),
  ...cpu(340, 50, { mood: "smile", label: "not smart. just fast." }),
];
