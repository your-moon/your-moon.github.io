// Part 2: the real CPU and my VM do the same fetch–decode–execute job; one is silicon, the other
// is a Rust program pretending to be a CPU, running on top of the real one.
export const fit = true;
export const langs = ["en", "mn"];
export const title = { en: "The real CPU and my VM, side by side", mn: "Жинхэнэ CPU ба миний VM, зэрэгцүүлбэл" };
const ROWS_EN = [
  ["instructions", "machine code", "bytecode:\nPUSH, MUL, ADD"],
  ["the finger", "a register\ninside the chip", "a variable\nin my program"],
  ["the loop", "fetch → decode\n→ execute", "the same loop,\nwritten in Rust"],
  ["made of", "silicon", "a Rust program,\non the real CPU"],
];
const ROWS_MN = [
  ["заавар", "машины код", "байткод:\nPUSH, MUL, ADD"],
  ["хуруу", "чип доторх\nрегистр", "программ доторх\nхувьсагч"],
  ["давталт", "авах → тайлах\n→ гүйцэтгэх", "яг ижил давталт,\nRust дээр бичсэн"],
  ["материал", "цахиур", "Rust программ,\nжинхэнэ CPU дээр"],
];
const HEAD = { en: ["the real CPU", "my VM"], mn: ["жинхэнэ CPU", "миний VM"] };
const L = 0, A = 112, B = 318, CW = 196, RH = 66, TOP = 56;
export default (lang) => {
  const ROWS = lang === "mn" ? ROWS_MN : ROWS_EN;
  const els = [
    { type: "rect", x: A, y: 0, w: CW, h: 44, text: HEAD[lang][0], fill: "green", size: 19 },
    { type: "rect", x: B, y: 0, w: CW, h: 44, text: HEAD[lang][1], fill: "violet", size: 19 },
  ];
  ROWS.forEach(([k, cpu, vm], i) => {
    const y = TOP + i * RH;
    els.push(
      { type: "text", x: L, y: y + RH / 2 - 4, text: k, size: 16, align: "start", muted: true },
      { type: "rect", x: A, y, w: CW, h: RH - 10, text: cpu, size: 16 },
      { type: "rect", x: B, y, w: CW, h: RH - 10, text: vm, size: 16 },
    );
  });
  return els;
};
