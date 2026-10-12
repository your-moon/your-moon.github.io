// Part 2: one addition (2 + 3) through both machines. In the VM, fetch/decode/execute are Rust code
// (read_u8, match, op_binary_add) running on the real CPU; in the CPU, they are circuits.
export const langs = ["en", "mn"];
export const fit = true;
export const title = { en: "One addition, two machines", mn: "Нэг нэмэх үйлдэл, хоёр машин" };
const T = {
  en: {
    vm: "my VM: ADD", cpu: "real CPU: add eax, 3",
    v: ["fetch: read_u8()\nreads the ADD byte", "decode: match\n→ op::ADD", "execute: pop 3, pop 2,\npush 5"],
    c: ["fetch: bytes 83 C0 03\nat rip", "decode:\n“add 3 to eax”", "execute: the ALU adds\neax: 2 → 5"],
    vn: "each step is Rust code —\nmany real CPU instructions", cn: "each step is circuitry —\nno program underneath",
  },
  mn: {
    vm: "миний VM: ADD", cpu: "жинхэнэ CPU: add eax, 3",
    v: ["авах: read_u8()\nADD байтыг уншина", "тайлах: match\n→ op::ADD", "гүйцэтгэх: 3-ыг авч, 2-ыг авч,\n5-ыг хийнэ"],
    c: ["авах: rip дээрх\n83 C0 03 байтууд", "тайлах:\n«eax-д 3-ыг нэм»", "гүйцэтгэх: ALU нэмнэ\neax: 2 → 5"],
    vn: "алхам бүр нь Rust код —\nжинхэнэ CPU-ийн олон заавар", cn: "алхам бүр нь хэлхээ —\nдоор нь программ байхгүй",
  },
};
const W = 260, GAP = 40, BH = 62, STEP = 92, TOP = 60;
export default (lang) => {
  const t = T[lang];
  const els = [];
  [[0, t.vm, "violet", t.v, t.vn, "v"], [W + GAP, t.cpu, "green", t.c, t.cn, "c"]].forEach(([x, head, fill, steps, note, id]) => {
    els.push({ type: "rect", x, y: 0, w: W, h: 42, text: head, fill, size: 18 });
    steps.forEach((s, i) => {
      els.push({ type: "rect", id: id + i, x, y: TOP + i * STEP, w: W, h: BH, text: s, size: 16, mono: false });
      if (i) els.push({ type: "arrow", from: id + (i - 1), to: id + i });
    });
    els.push({ type: "text", x: x + W / 2, y: TOP + 3 * STEP + 18, text: note, size: 15, align: "middle", muted: true });
  });
  return els;
};
