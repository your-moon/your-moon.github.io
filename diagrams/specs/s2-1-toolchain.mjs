// Part 2.1: from Mon source to a running executable, no VM anywhere.
export const title = "From Mon source to the bare CPU";
export default () => {
  const st = (id, i, text, fill) => ({ type: "rect", id, x: 0, y: i * 90, w: 240, h: 54, text, fill, size: 18 });
  return [
    st("src", 0, "Mon source", "gray"),
    st("cmp", 1, "Mon compiler (in Go)", "blue"),
    st("asm", 2, "x86-64 assembly (text)", "orange"),
    st("lnk", 3, "as + cc", "yellow"),
    st("exe", 4, "executable", "green"),
    { type: "arrow", from: "src", to: "cmp" },
    { type: "arrow", from: "cmp", to: "asm" },
    { type: "arrow", from: "asm", to: "lnk" },
    { type: "arrow", from: "lnk", to: "exe" },
    { type: "arrow", from: "exe", to: [120, 4 * 90 + 54 + 40] },
    { type: "text", x: 120, y: 4 * 90 + 54 + 58, text: "bare CPU runs it, no VM in between", size: 16, muted: true },
    { type: "text", x: 290, y: 90 + 27, text: "frontend + backend", size: 15, align: "start", muted: true },
    { type: "text", x: 290, y: 2 * 90 + 27, text: "mov   eax, 2\nadd   eax, 3\nmov   [x], eax", size: 17, mono: true, align: "start" },
    { type: "text", x: 290, y: 3 * 90 + 27, text: "shells out to the system\nassembler and linker", size: 15, align: "start", muted: true },
  ];
};
