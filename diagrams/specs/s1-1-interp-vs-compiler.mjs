// Part 1: interpreter = live interpreter (хэлмэрч), compiler = document translator (орчуулагч).
export const langs = ["en", "mn"];
export const title = { en: "Interpreter vs compiler", mn: "Интерпретатор ба компайлер" };
const T = {
  en: { it: "Interpreter", itSub: "a live translator", co: "Compiler", coSub: "a document translator",
        l: ["line 1", "line 2", "line 3"], run: "run", read: "read the\nwhole text", out: "finished\ntranslation",
        itNote: "starts now, one line at a time", coNote: "waits, sees everything, optimizes" },
  mn: { it: "Интерпретатор", itSub: "хэлмэрч", co: "Компайлер", coSub: "орчуулагч",
        l: ["1-р мөр", "2-р мөр", "3-р мөр"], run: "ажиллуулна", read: "бүх текстийг\nуншина", out: "орчуулсан\nтекст",
        itNote: "шууд эхэлнэ, мөр мөрөөр", coNote: "хүлээнэ, бүгдийг харж шалгана, сайжруулна" },
};
export default (lang) => {
  const t = T[lang];
  const els = [
    { type: "text", x: 0, y: 0, text: t.it, size: 24 },
    { type: "text", x: 0, y: 30, text: t.itSub, size: 16, muted: true },
    { type: "text", x: 480, y: 0, text: t.co, size: 24 },
    { type: "text", x: 480, y: 30, text: t.coSub, size: 16, muted: true },
    { type: "line", points: [[440, -10], [440, 290]], dashed: true },
  ];
  t.l.forEach((l, i) => {
    const y = 70 + i * 66;
    els.push({ type: "rect", id: "l" + i, x: 0, y, w: 110, h: 46, text: l, fill: "gray", size: 17 });
    els.push({ type: "rect", id: "r" + i, x: 210, y, w: 150, h: 46, text: t.run, fill: "green", size: 17 });
    els.push({ type: "arrow", from: "l" + i, to: "r" + i });
  });
  els.push(
    { type: "text", x: 0, y: 290, text: t.itNote, size: 16, muted: true },
    { type: "rect", id: "doc", x: 480, y: 70, w: 120, h: 178, text: t.l.join("\n"), fill: "gray", size: 17 },
    { type: "rect", id: "read", x: 660, y: 70, w: 150, h: 70, text: t.read, fill: "yellow", size: 17 },
    { type: "rect", id: "out", x: 660, y: 178, w: 150, h: 70, text: t.out, fill: "green", size: 17 },
    { type: "arrow", from: "doc", to: "read" },
    { type: "arrow", from: "read", to: "out" },
    { type: "text", x: 480, y: 290, text: t.coNote, size: 16, muted: true },
  );
  return els;
};
