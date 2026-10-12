// Part 1 intro illustration: me holding the greeting on a sheet of paper, a question mark, and the
// CPU that somehow runs it — the question the whole series answers.
export const langs = ["en", "mn"];
export const fit = true;
export const title = { en: "Six lines of Mon handed to the CPU — but how does it run them?", mn: "Mon хэлний зургаан мөрийг CPU-д өгөхөд яг юу болдог вэ?" };
const T = {
  en: { code: ["функц үндсэн() -> тоо {", '    мөр_хэвлэх("Өдрийн мэнд");', "}"] },
  mn: { code: ["функц үндсэн() -> тоо {", '    мөр_хэвлэх("Өдрийн мэнд");', "}"] },
};

const dot = (x, y) => ({ type: "ellipse", x: x - 3, y: y - 3, w: 6, h: 6, fill: "gray" });

export default (lang) => {
  const t = T[lang];
  const els = [];

  // A stick figure (me), one hand holding up the sheet.
  els.push(
    { type: "ellipse", x: 14, y: 30, w: 44, h: 44, fill: "paper" },
    dot(28, 48), dot(44, 48),
    { type: "path", d: "M 28 62 Q 36 66 44 62" },
    { type: "line", points: [[36, 74], [36, 140]] },
    { type: "line", points: [[36, 140], [16, 186]] },
    { type: "line", points: [[36, 140], [56, 186]] },
    { type: "line", points: [[36, 92], [14, 122]] },
    { type: "line", points: [[36, 92], [92, 84]] },
  );

  // The sheet of paper with a folded corner, the code written on it.
  const PX = 92, PY = 20, PW = 290, PH = 130;
  els.push(
    { type: "path", d: `M ${PX} ${PY} L ${PX + PW - 30} ${PY} L ${PX + PW} ${PY + 30} L ${PX + PW} ${PY + PH} L ${PX} ${PY + PH} Z`, fill: "paper" },
    { type: "line", points: [[PX + PW - 30, PY], [PX + PW - 30, PY + 30], [PX + PW, PY + 30]] },
  );
  const y0 = PY + PH / 2 - ((t.code.length - 1) * 24) / 2;
  t.code.forEach((l, i) => els.push({ type: "text", x: PX + 16, y: y0 + i * 24, text: l, size: 17, mono: true, align: "start" }));

  // The unknown in between.
  const mid = PY + PH / 2;
  els.push(
    { type: "arrow", from: [PX + PW + 14, mid], to: [PX + PW + 110, mid], dashed: true },
    { type: "text", x: PX + PW + 62, y: mid - 34, text: "?", size: 44, align: "middle", muted: true },
  );

  // The CPU, with pins and a small puzzled-but-friendly face.
  const cx = PX + PW + 132, cy = mid - 45, cw = 100, ch = 90;
  els.push({ type: "rect", x: cx, y: cy, w: cw, h: ch, fill: "green" });
  for (let k = 0; k < 4; k++) {
    const px = cx + 16 + k * 23, py = cy + 15 + k * 20;
    els.push(
      { type: "line", points: [[px, cy], [px, cy - 12]] },
      { type: "line", points: [[px, cy + ch], [px, cy + ch + 12]] },
      { type: "line", points: [[cx, py], [cx - 12, py]] },
      { type: "line", points: [[cx + cw, py], [cx + cw + 12, py]] },
    );
  }
  els.push(
    dot(cx + 34, cy + 36), dot(cx + 66, cy + 36),
    { type: "path", d: `M ${cx + 38} ${cy + 60} Q ${cx + 50} ${cy + 68} ${cx + 62} ${cy + 60}` },
    { type: "text", x: cx + cw / 2, y: cy + ch + 34, text: "CPU", size: 20, align: "middle" },
  );
  return els;
};
