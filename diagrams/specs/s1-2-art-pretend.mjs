// Part 2 story beat: my VM wearing a "CPU" name tag, standing on the real CPU that is actually running it.
import { cpu, face, speech } from "../art.mjs";
export const fit = true;
export const langs = ["en", "mn"];
export const title = { en: "My VM pretending to be a CPU", mn: "CPU-ийн дүрд тоглож буй миний VM" };
const T = {
  en: { who: "my VM\n(a Rust program)", claim: "I'm a CPU!", reply: "…sure.", real: "the real CPU" },
  mn: { who: "миний VM\n(Rust программ)", claim: "Би CPU!", reply: "…за за.", real: "жинхэнэ CPU" },
};
const VX = 200, VY = 20, VW = 150, VH = 120;
export default (lang) => { const t = T[lang]; return [
  // The VM: a box with a face and a stick-on name tag.
  { type: "rect", x: VX, y: VY, w: VW, h: VH, fill: "violet" },
  ...face(VX + VW / 2, VY + 40, "grin"),
  { type: "rect", x: VX + 42, y: VY + 74, w: 66, h: 30, fill: "paper", text: "CPU", size: 17 },
  { type: "text", x: VX - 20, y: VY + 60, text: t.who, size: 16, align: "end", muted: true },
  ...speech(VX + VW + 50, VY - 14, 150, 50, t.claim, [VX + VW - 10, VY + 34]),
  // The real CPU underneath, holding it up.
  ...cpu(VX + 20, VY + VH + 30, { w: 110, h: 84, mood: "puzzled", label: t.real }),
  ...speech(VX + VW + 50, VY + VH + 50, 110, 46, t.reply, [VX + 144, VY + VH + 70]),
]; };
