// Craft 3, Step 3: Feathers' feature sketch -- methods point at the fields they use; clusters are hidden classes.
export const title = "A feature sketch of one big class";
const fields = { f1: [20, "f1"], f2: [140, "f2"], f3: [260, "f3"], f4: [630, "f4"], f5: [750, "f5"] };
const methods = { m1: [0, "m1()"], m2: [130, "m2()"], m3: [260, "m3()"], m4: [610, "m4()"], m5: [730, "m5()"], m6: [850, "m6()"] };
const uses = [["m1", "f1"], ["m1", "f2"], ["m2", "f2"], ["m2", "f3"], ["m3", "f3"], ["m4", "f4"], ["m5", "f4"], ["m5", "f5"], ["m6", "f5"]];
const centre = (id) => (fields[id] ? [fields[id][0] + 45, 45] : [methods[id][0] + 55, 252]);
const [ax, ay] = centre("m3"), [bx, by] = centre("f4");
const len = Math.hypot(bx - ax, by - ay), nx = (-(by - ay) / len) * 8, ny = ((bx - ax) / len) * 8;
export default () => [
  // highlight band under the crossing arrow
  { type: "path", d: `M ${ax + nx} ${ay + ny} L ${bx + nx} ${by + ny} L ${bx - nx} ${by - ny} L ${ax - nx} ${ay - ny} Z`, fill: "red" },
  { type: "rect", x: -25, y: -20, w: 415, h: 320, dashed: true },
  { type: "rect", x: 590, y: -20, w: 395, h: 320, dashed: true },
  { type: "text", x: 180, y: 330, text: "hidden class A", size: 20, align: "middle" },
  { type: "text", x: 790, y: 330, text: "hidden class B", size: 20, align: "middle" },
  ...Object.entries(fields).map(([id, [x, t]]) => ({ type: "ellipse", id, x, y: 20, w: 90, h: 50, fill: "violet", text: t, size: 18 })),
  ...Object.entries(methods).map(([id, [x, t]]) => ({ type: "rect", id, x, y: 230, w: 110, h: 44, fill: "blue", text: t, size: 17, mono: true })),
  ...uses.map(([from, to]) => ({ type: "arrow", from, to })),
  { type: "arrow", from: "m3", to: "f4" },
  { type: "rect", id: "note", x: 395, y: 20, w: 150, h: 54, fill: "yellow", text: "becomes\nits interface", size: 17 },
  { type: "arrow", from: "note", to: [ (ax + bx) / 2, (ay + by) / 2 - 12 ] },
];
