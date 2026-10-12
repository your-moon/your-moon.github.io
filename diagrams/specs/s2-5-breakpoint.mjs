// Part 5: how a breakpoint works, one trap byte.
export const title = "A breakpoint is a booby-trapped instruction";
export default () => {
  const steps = [
    ["Overwrite the first byte of the\ninstruction with int3 (original saved)", "blue", "gdb, via ptrace"],
    ["Program runs at full speed", "green", "program"],
    ["It executes int3: control jumps\nto the kernel, program frozen", "yellow", "kernel"],
    ["Kernel taps gdb:\n\"your trap fired\"", "yellow", "kernel"],
    ["Put the original byte back,\nshow you the frozen program", "blue", "gdb"],
    ["On continue: set the trap again,\nlet go", "blue", "gdb"],
  ];
  const els = [];
  steps.forEach(([t, fill, who], i) => {
    const y = i * 84;
    els.push({ type: "rect", id: "s" + i, x: 0, y, w: 380, h: 58, text: t, fill, size: 17 });
    els.push({ type: "text", x: 405, y: y + 29, text: who, size: 16, align: "start", muted: true });
    if (i) els.push({ type: "arrow", from: "s" + (i - 1), to: "s" + i });
  });
  return els;
};
