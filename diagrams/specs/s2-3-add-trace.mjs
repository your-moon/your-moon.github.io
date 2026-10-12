// Part 2.3: mov eax,2 / add eax,3 / mov [x],eax traced step by step.
export const title = "Tracing 2 + 3 through eax and memory";
export default () => {
  const rows = [
    ["(before)", "?", "?", null],
    ["mov eax, 2", "2", "?", "eax"],
    ["add eax, 3", "5", "?", "eax"],
    ["mov [x], eax", "5", "5", "x"],
  ];
  const els = [
    { type: "text", x: 0, y: 0, text: "instruction", size: 17, muted: true },
    { type: "text", x: 345, y: 0, text: "eax", size: 17, muted: true, align: "middle" },
    { type: "text", x: 525, y: 0, text: "[x] in memory", size: 17, muted: true, align: "middle" },
  ];
  rows.forEach(([ins, a, m, ch], i) => {
    const y = 30 + i * 66;
    els.push({ type: "rect", x: 0, y, w: 240, h: 46, text: ins, fill: i ? "gray" : undefined, size: 19, mono: true });
    els.push({ type: "rect", x: 300, y, w: 90, h: 46, text: a, fill: ch === "eax" ? "green" : undefined, size: 20, mono: true, dashed: ch !== "eax" });
    els.push({ type: "rect", x: 480, y, w: 90, h: 46, text: m, fill: ch === "x" ? "yellow" : undefined, size: 20, mono: true, dashed: ch !== "x" });
  });
  return els;
};
