// Part 2.2: the nested tree for x = 2 + 3 * 4 flattened into Tacky, one operation per line.
export const title = "Tree flattened into Tacky";
export default () => {
  const n = (id, x, y, text, fill = "gray") => ({ type: "ellipse", id, x, y, w: 56, h: 48, text, fill, size: 22, mono: true });
  const row = (id, y, text, fill) => ({ type: "rect", id, x: 470, y, w: 210, h: 46, text, fill, size: 19, mono: true });
  return [
    n("eq", 100, 0, "=", "blue"),
    n("x", 20, 90, "x"),
    n("plus", 180, 90, "+", "violet"),
    n("two", 100, 180, "2"),
    n("mul", 260, 180, "*", "yellow"),
    n("three", 200, 270, "3"),
    n("four", 320, 270, "4"),
    ...[["eq","x"],["eq","plus"],["plus","two"],["plus","mul"],["mul","three"],["mul","four"]]
      .map(([a,b]) => ({ type: "line", from: a, to: b })),
    { type: "arrow", from: [400, 150], to: [462, 150], label: "flatten", labelAt: [431, 122] },
    { type: "text", x: 470, y: 50, text: "one operation per line", size: 16, muted: true },
    row("t0", 90, "tmp.0 = 3 * 4", "yellow"),
    row("t1", 150, "tmp.1 = 2 + tmp.0", "violet"),
    row("t2", 210, "x = tmp.1", "blue"),
    { type: "text", x: 470, y: 280, text: "top to bottom = order of execution", size: 16, muted: true },
  ];
};
