// Part 1.2: mark-and-sweep garbage collection.
export const langs = ["en", "mn"];
export const title = { en: "Mark and sweep", mn: "Тэмдэглэх ба цэвэрлэх" };
const T = {
  en: { mark: "1. Mark: follow every reference from what is alive", root: "stack +\ncall frames", rs: 18, obj: "object", arr: "array", str: "string", reach: "reachable: painted", sweep: "2. Sweep: free everything that was not painted", nopath: "no path from\nthe stack", freed: "unreachable:\nfreed" },
  mn: { mark: "1. Тэмдэглэх: амьд зүйлсээс бүх холбоосыг дага", root: "стек +\nдуудлагын\nфреймүүд", rs: 15, obj: "объект", arr: "массив", str: "тэмдэгт\nмөр", reach: "хүрч болно: будагдсан", sweep: "2. Цэвэрлэх: будаагүй бүхнийг чөлөөл", nopath: "стекээс\nхүрэх замгүй", freed: "хүрэх замгүй:\nчөлөөлөгдөнө" },
};
export default (lang) => { const t = T[lang]; return [
  { type: "text", x: 0, y: 0, text: t.mark, size: 19, align: "start" },
  { type: "rect", id: "root", x: 0, y: 40, w: 150, h: 70, text: t.root, fill: "yellow", size: t.rs },
  { type: "rect", id: "obj", x: 220, y: 40, w: 120, h: 70, text: t.obj, fill: "green", size: 18 },
  { type: "rect", id: "arr", x: 400, y: 40, w: 110, h: 70, text: t.arr, fill: "green", size: 18 },
  { type: "rect", id: "str", x: 570, y: 40, w: 100, h: 70, text: t.str, fill: "green", size: 18 },
  { type: "arrow", from: "root", to: "obj" },
  { type: "arrow", from: "obj", to: "arr" },
  { type: "arrow", from: "arr", to: "str" },
  { type: "text", x: 420, y: 134, text: t.reach, size: 15, muted: true },
  { type: "line", points: [[-10, 170], [680, 170]], dashed: true },
  { type: "text", x: 0, y: 200, text: t.sweep, size: 19, align: "start" },
  { type: "rect", id: "a", x: 220, y: 240, w: 120, h: 70, text: t.obj, fill: "red", size: 18, dashed: true },
  { type: "rect", id: "b", x: 400, y: 240, w: 110, h: 70, text: t.obj, fill: "red", size: 18, dashed: true },
  { type: "arrow", from: "a", to: "b", both: true },
  { type: "text", x: 0, y: 275, text: t.nopath, size: 16, align: "start", muted: true },
  { type: "text", x: 530, y: 275, text: t.freed, size: 16, align: "start", muted: true },
]; };
