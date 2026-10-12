// Part 1: the AST of `x = 2 + 3 * 4` (replaces the ASCII tree).
export const langs = ["en", "mn"];
export const title = { en: "Syntax tree for x = 2 + 3 * 4", mn: "x = 2 + 3 * 4-ийн синтакс мод" };
const T = {
  en: { first: "evaluated first:\n3 * 4 = 12", then: "then 2 + 12 = 14" },
  mn: { first: "эхлээд бодогдоно:\n3 * 4 = 12", then: "дараа нь 2 + 12 = 14" },
};
export default (lang) => {
  const n = (id, x, y, text, fill = "gray") => ({ type: "ellipse", id, x, y, w: 64, h: 52, text, fill, size: 24, mono: true });
  return [
    n("eq", 200, 0, "=", "blue"),
    n("x", 90, 100, "x"),
    n("plus", 310, 100, "+", "violet"),
    n("two", 200, 200, "2"),
    n("mul", 420, 200, "*", "yellow"),
    n("three", 310, 300, "3"),
    n("four", 530, 300, "4"),
    ...[["eq","x"],["eq","plus"],["plus","two"],["plus","mul"],["mul","three"],["mul","four"]]
      .map(([a,b]) => ({ type: "line", from: a, to: b })),
    { type: "text", x: 520, y: 200, text: T[lang].first, size: 17, align: "start", muted: true },
    { type: "text", x: 400, y: 100, text: T[lang].then, size: 17, align: "start", muted: true },
  ];
};
