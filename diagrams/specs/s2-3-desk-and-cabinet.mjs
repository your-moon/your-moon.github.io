// Part 2.3: registers (the desk, on the CPU) versus memory (the filing cabinet).
export const title = "Registers and memory";
export default () => {
  const reg = (id, x, y, t) => ({ type: "rect", id, x, y, w: 100, h: 44, text: t, fill: "green", size: 19, mono: true });
  return [
    { type: "text", x: 0, y: 0, text: "The desk: on the CPU", size: 20 },
    { type: "text", x: 0, y: 28, text: "about 16 registers, very fast", size: 16, muted: true },
    { type: "rect", x: 0, y: 60, w: 260, h: 220 },
    reg("rax", 20, 85, "rax"), reg("rbx", 140, 85, "rbx"),
    reg("rcx", 20, 150, "rcx"), reg("rsp", 140, 150, "rsp"),
    { type: "text", x: 130, y: 232, text: "… and a dozen more", size: 17, muted: true, align: "middle" },
    { type: "text", x: 420, y: 0, text: "The cabinet: memory", size: 20 },
    { type: "text", x: 420, y: 28, text: "gigabytes, far away, slow", size: 16, muted: true },
    { type: "rect", id: "mem", x: 420, y: 60, w: 260, h: 220, fill: "gray", text: "every variable,\nevery array,\nthe whole program", size: 18 },
    { type: "arrow", from: [264, 170], to: [416, 170], both: true, label: "mov", labelAt: [340, 148] },
    { type: "text", x: 340, y: 195, text: "shuffle numbers", size: 16, muted: true, align: "middle" },
  ];
};
