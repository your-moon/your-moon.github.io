// Part 4: bulkheads — one pool per dependency, a slow dependency only fills its own compartment.
export const title = "Bulkheads: one pool per dependency";
export default () => {
  const names = ["payments\npool", "scheduling\npool", "search\npool", "orders\npool"];
  const W = 150, TOP = 40, H = 170, R = 4 * W, SEA = TOP + 110;
  const els = [
    // hull: open top, curved bottom
    { type: "path", d: `M 0 ${TOP} L 20 ${TOP + H} Q ${R / 2} ${TOP + H + 30} ${R - 20} ${TOP + H} L ${R} ${TOP} Z`, fill: "gray" },
    // the flooded compartment, drawn under the walls
    { type: "rect", x: W + 4, y: TOP + 70, w: W - 8, h: H - 74, fill: "blue", hachure: true, gap: 8 },
  ];
  for (let k = 1; k < 4; k++) els.push({ type: "line", points: [[k * W, TOP], [k * W, TOP + H + 8]] });
  names.forEach((n, k) => els.push({ type: "text", x: k * W + W / 2, y: TOP + 34, text: n, size: 18, align: "middle" }));
  // the sea: waves on both sides of the hull, the ship floats on it
  for (const [a, b] of [[-90, 8], [R - 8, R + 90]]) {
    els.push({ type: "path", d: `M ${a} ${SEA} Q ${a + (b - a) * 0.25} ${SEA - 10} ${a + (b - a) * 0.5} ${SEA} T ${b} ${SEA}` });
  }
  els.push({ type: "text", x: R + 100, y: SEA, text: "water line", size: 16, align: "start", muted: true });
  els.push({ type: "text", x: 1.5 * W, y: TOP + H + 76, text: "slow dependency: only its own pool fills", size: 18, align: "middle" });
  els.push({ type: "arrow", from: [1.5 * W, TOP + H + 60], to: [1.5 * W, TOP + H - 30] });
  return els;
};
