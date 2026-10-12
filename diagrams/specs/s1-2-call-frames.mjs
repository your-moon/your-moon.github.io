// Part 1.2: call frames piling up on the stack, and a stack overflow.
export const langs = ["en", "mn"];
export const title = { en: "Call frames and stack overflow", mn: "Дуудлагын фреймүүд ба stack overflow" };
const T = {
  en: { ceil: "ceiling: the room you gave the stack", top: "top-level script", ret: "return address\n+ room for locals", call: "call: push a frame\nreturn: pop it, jump back", rec: "f() calls itself and\nnever returns" },
  mn: { ceil: "тааз: стект өгсөн зай", top: "үндсэн скрипт", ret: "буцах хаяг\n+ локал хувьсагчийн зай", call: "дуудах: фрейм нэмнэ\nбуцах: фреймээ авч, буцаж үсэрнэ", rec: "f() өөрийгөө дуудаад\nхэзээ ч буцахгүй" },
};
export default (lang) => {
  const t = T[lang];
  const els = [];
  const H = 44, W = 190, BASE = 300;
  const fr = (id, x, i, text, fill) => ({ type: "rect", id, x, y: BASE - (i + 1) * H, w: W, h: H, text, fill, size: 18, mono: true });
  els.push({ type: "line", points: [[-10, 30], [660, 30]], dashed: true });
  els.push({ type: "text", x: 650, y: 12, text: t.ceil, size: 15, align: "end", muted: true });
  els.push(fr("m", 0, 0, t.top, "gray"), fr("g", 0, 1, "guessGame()", "blue"));
  els.push({ type: "text", x: 205, y: BASE - 2 * H + 22, text: t.ret, size: 15, align: "start", muted: true });
  for (let i = 0; i < 6; i++) els.push(fr("f" + i, 420, i, "f()", i === 5 ? "red" : "gray"));
  els.push({ type: "text", x: 640, y: 54, text: "stack\noverflow", size: 17, align: "start" });
  els.push({ type: "arrow", from: [636, 54], to: [618, 54] });
  els.push({ type: "line", points: [[-10, BASE + 4], [660, BASE + 4]] });
  els.push({ type: "text", x: 0, y: 338, text: t.call, size: 16, align: "start", muted: true });
  els.push({ type: "text", x: 420, y: 338, text: t.rec, size: 16, align: "start", muted: true });
  return els;
};
