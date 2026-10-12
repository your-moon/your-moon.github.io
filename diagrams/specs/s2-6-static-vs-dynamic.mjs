// Part 6: static linking copies printf into the file; dynamic linking leaves a note and shares one libc.so.
export const title = "Static vs dynamic linking";
export default [
  { type: "text", x: 0, y: 0, text: "Static", size: 24, align: "start" },
  { type: "text", x: 0, y: 30, text: "bring your own copy", size: 16, muted: true, align: "start" },
  { type: "line", points: [[320, -10], [320, 370]], dashed: true },
  { type: "rect", x: 0, y: 80, w: 280, h: 60, text: "my code", fill: "blue", size: 18 },
  { type: "rect", x: 0, y: 140, w: 280, h: 60, text: "printf (copied in)", fill: "green", size: 18 },
  { type: "text", x: 140, y: 236, text: "one file, self-contained", size: 16, muted: true, align: "middle" },
  { type: "text", x: 140, y: 336, text: "fat, but runs anywhere", size: 17, align: "middle" },

  { type: "text", x: 360, y: 0, text: "Dynamic", size: 24, align: "start" },
  { type: "text", x: 360, y: 30, text: "share one copy", size: 16, muted: true, align: "start" },
  { type: "rect", id: "g", x: 360, y: 80, w: 130, h: 60, text: "my\nprogram", fill: "blue", size: 17 },
  { type: "rect", id: "o", x: 520, y: 80, w: 130, h: 60, text: "other\nprogram", fill: "blue", size: 17 },
  { type: "rect", id: "so", x: 360, y: 220, w: 290, h: 60, text: "libc.so (one shared copy)", fill: "green", size: 18 },
  { type: "arrow", from: "g", to: "so" },
  { type: "arrow", from: "o", to: "so" },
  { type: "text", x: 505, y: 336, text: "thin, but needs libc on the machine", size: 17, align: "middle" },
];
