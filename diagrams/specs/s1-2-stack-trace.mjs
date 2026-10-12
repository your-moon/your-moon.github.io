// Part 1.2: the stack after each instruction of 2 + 3 * 4 (top of stack is up).
export const langs = ["en", "mn"];
export const title = { en: "The stack after each instruction", mn: "Заавар бүрийн дараах стек" };
const T = {
  en: { mul: "pop 4, pop 3\npush 12", add: "pop 2, pop 12\npush 14", store: "pop 14 into x\n(x = 14)", empty: "empty", foot: "each column: the stack after that instruction runs, top of the stack is up" },
  mn: { mul: "4, 3-ыг авч\n12-ыг хийнэ", add: "2, 12-ыг авч\n14-ийг хийнэ", store: "14 → x\n(x = 14)", empty: "хоосон", foot: "багана бүр: тухайн заавар ажилласны дараах стек, дээд тал нь дээшээ" },
};
export default (lang) => {
  const t = T[lang];
  const els = [];
  const cols = [
    { ins: "PUSH 3", st: [["3", "blue"]] },
    { ins: "PUSH 4", st: [["3", "blue"], ["4", "blue"]] },
    { ins: "MUL", st: [["12", "green"]], note: t.mul },
    { ins: "PUSH 2", st: [["12", "green"], ["2", "blue"]] },
    { ins: "ADD", st: [["14", "green"]], note: t.add },
    { ins: "STORE x", st: [], note: t.store },
  ];
  const STEP = 110, W = 90, H = 40;
  cols.forEach((c, i) => {
    const x = i * STEP;
    els.push({ type: "text", x: x + W / 2, y: 0, text: c.ins, size: 20, mono: true, align: "middle" });
    c.st.forEach(([t, fill], k) => els.push({ type: "rect", x, y: 110 - k * 46, w: W, h: H, text: t, fill, size: 20, mono: true }));
    if (!c.st.length) els.push({ type: "text", x: x + W / 2, y: 130, text: t.empty, size: 16, muted: true, align: "middle" });
    els.push({ type: "line", points: [[x - 6, 158], [x + W + 6, 158]] });
    if (c.note) els.push({ type: "text", x: x + W / 2, y: 192, text: c.note, size: 15, muted: true, align: "middle" });
  });
  els.push({ type: "text", x: 0, y: 232, text: t.foot, size: 16, muted: true, align: "start" });
  return els;
};
