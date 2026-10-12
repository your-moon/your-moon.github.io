// Part 4: the full fall from my language to the screen hardware.
export const title = "From мөр_хэвлэх to the screen";
export default () => {
  const W = 330, H = 50, y = (i) => 20 + i * 90;
  const box = (id, i, text, fill) => ({ type: "rect", id, x: 0, y: y(i), w: W, h: H, text, fill, size: 18 });
  return [
    box("a", 0, "мөр_хэвлэх(\"бага байна\")", "blue"),
    box("b", 1, "assembly: address + registers", "blue"),
    box("c", 2, "a write syscall is set up", "blue"),
    box("d", 3, "kernel, entered by syscall", "green"),
    box("e", 4, "screen hardware", "gray"),
    { type: "arrow", from: "a", to: "b" },
    { type: "arrow", from: "b", to: "c" },
    { type: "arrow", from: "c", to: "d" },
    { type: "arrow", from: "d", to: "e" },
    { type: "line", points: [[-20, 270], [520, 270]], dashed: true },
    { type: "text", x: 370, y: 250, text: "user mode", size: 16, align: "start", muted: true },
    { type: "text", x: 370, y: 292, text: "kernel mode", size: 16, align: "start", muted: true },
    { type: "text", x: 370, y: y(0) + 25, text: "my language", size: 16, align: "start", muted: true },
  ];
};
