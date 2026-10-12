// Part 4: the six ways an integration point can fail; only the first is fast and obvious.
export const title = "Six ways a dependency can fail";
export default () => {
  const rows = [
    ["1  refuses  ✗", false],
    ["2  accepts… silence", true],
    ["3  answers slowly", true],
    ["4  dribbles bytes . . .", true],
    ["5  returns garbage #@!", false],
    ["6  drops mid-call", true],
  ];
  const els = [
    { type: "rect", id: "c", x: 0, y: 40, w: 130, h: 330, fill: "blue", text: "client", size: 22 },
    { type: "rect", id: "d", x: 570, y: 40, w: 150, h: 330, fill: "orange", text: "dependency", size: 22 },
  ];
  rows.forEach(([label, dashed], i) => {
    const y = 76 + i * 52;
    els.push({ type: "arrow", from: [140, y], to: [560, y], dashed });
    els.push({ type: "text", x: 350, y: y - 16, text: label, size: 18, align: "middle" });
  });
  els.push({ type: "text", x: 360, y: 420, text: "only #1 is fast and obvious", size: 18, align: "middle", muted: true });
  return els;
};
