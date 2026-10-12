// Part 2.3: my x86-64 compiler on an ARM Mac: Rosetta translates at run time.
export const title = "x86-64 code running on an ARM Mac";
export default () => {
  const b = (id, i, text, fill, extra = {}) => ({ type: "rect", id, x: 0, y: i * 90, w: 250, h: 50, text, fill, size: 18, ...extra });
  const note = (i, t) => ({ type: "text", x: 290, y: i * 90 + 25, text: t, size: 16, muted: true });
  return [
    b("c", 0, "my compiler", "blue"), note(0, "emits x86-64 only"),
    b("x", 1, "x86-64 instructions", "yellow", { mono: false }), note(1, "mov eax, 2 / add eax, 3 …"),
    b("r", 2, "Rosetta", "violet"), note(2, "translates on the fly, as the program runs"),
    b("a", 3, "ARM instructions", "yellow"), note(3, "e.g. mov w0, #2 / add w0, w0, #3 …"),
    b("m", 4, "the Mac's ARM core", "green"), note(4, "can only run ARM"),
    ...["c", "x", "r", "a"].map((f, i) => ({ type: "arrow", from: f, to: ["x", "r", "a", "m"][i] })),
  ];
};
