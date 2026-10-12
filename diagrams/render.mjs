// Renders diagrams/specs/*.mjs into hand-drawn (Excalidraw-style) SVGs in diagrams/out/.
//
//   node diagrams/render.mjs
//
// A spec exports `default` as either an element list, or a function (lang) => element list
// together with `export const langs = ["en", "mn"]` to get one SVG per language
// (<name>.svg for en, <name>.mn.svg for mn). `export const fit = true` makes a picture shrink to
// fit a phone screen instead of scrolling sideways (for illustrations rather than dense diagrams).
//
// Elements (coordinates in px, origin top-left; the viewBox is fitted automatically):
//   { type: "rect" | "ellipse" | "diamond", id, x, y, w, h, text, fill, size, mono, dashed, hachure }
//   { type: "text", x, y, text, size, mono, align: "start"|"middle"|"end", muted }
//   { type: "arrow", from, to, label, dashed, curve, both }  from/to: element id or [x, y]
//   { type: "line", points: [[x,y],...], dashed }
//   { type: "path", d: "M … Z", fill, hachure, dashed }   freehand shape (absolute M/L/Q/T/C coords only)
// fill: blue | green | yellow | red | violet | gray | orange | paper (page background). Colors come from CSS variables
// (--xd-ink, --xd-blue, …) so the same SVG follows the site's light/dark theme.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import rough from "roughjs";

const DIR = path.dirname(new URL(import.meta.url).pathname);
const gen = rough.generator();
const FONT = "'Excalifont MN', 'Comic Sans MS', cursive";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

// One decimal is invisible at screen size and roughly halves the size of every SVG.
const round = (d) => d.replace(/-?\d+\.\d+/g, (n) => String(Math.round(parseFloat(n) * 10) / 10));
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % 2 ** 31 || 1;

function opts(el, seed) {
  return {
    seed,
    roughness: 1,
    bowing: 1,
    strokeWidth: 1.6,
    stroke: "#000",
    fill: el.fill ? "#111" : undefined,
    fillStyle: el.hachure ? "hachure" : "solid",
    hachureGap: el.gap || 6,
    hachureAngle: el.angle ?? -41,
    fillWeight: 1,
    strokeLineDash: el.dashed ? [8, 6] : undefined,
    disableMultiStroke: !!el.dashed,
  };
}

function paths(drawable, el) {
  return gen
    .toPaths(drawable)
    .map((p) => {
      const isFill = p.fill && p.fill !== "none" && p.stroke === "none";
      const hachureLine = el.hachure && p.stroke !== "none" && p.strokeWidth !== 1.6;
      let style;
      if (isFill) style = `fill:var(--xd-${el.fill})`;
      else if (hachureLine) style = `fill:none;stroke:var(--xd-${el.fill}-ink);stroke-width:${p.strokeWidth}`;
      else style = `fill:none;stroke:var(--xd-ink);stroke-width:${p.strokeWidth}`;
      if (el.dashed && !isFill) style += ";stroke-dasharray:8 6";
      return `<path d="${round(p.d)}" style="${style}"/>`;
    })
    .join("");
}

function text(x, y, str, { size = 20, mono = false, align = "middle", muted = false, valign = "middle" } = {}) {
  const lines = String(str).split("\n");
  const lh = size * 1.25;
  const y0 = valign === "middle" ? y - ((lines.length - 1) * lh) / 2 : y;
  const fam = mono ? MONO : FONT;
  const color = muted ? "var(--xd-muted)" : "var(--xd-ink)";
  const ts = lines
    .map((l, i) => `<tspan x="${x}" y="${(y0 + i * lh).toFixed(1)}">${esc(l)}</tspan>`)
    .join("");
  return `<text text-anchor="${align}" dominant-baseline="central" xml:space="preserve" style="white-space:pre;font-variant-ligatures:none;font-family:${fam};font-size:${mono ? size * 0.82 : size}px;fill:${color}">${ts}</text>`;
}

function textWidth(str, size, mono) {
  return Math.max(...String(str).split("\n").map((l) => l.length)) * size * (mono ? 0.5 : 0.52);
}

// Point where the segment from the center of `b` toward (tx, ty) leaves the shape `b`.
function clip(b, tx, ty, pad = 6) {
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  const dx = tx - cx, dy = ty - cy;
  if (!dx && !dy) return [cx, cy];
  let t;
  if (b.type === "ellipse") t = 1 / Math.sqrt((dx / (b.w / 2)) ** 2 + (dy / (b.h / 2)) ** 2);
  else if (b.type === "diamond") t = 1 / (Math.abs(dx) / (b.w / 2) + Math.abs(dy) / (b.h / 2));
  else t = Math.min(dx ? b.w / 2 / Math.abs(dx) : Infinity, dy ? b.h / 2 / Math.abs(dy) : Infinity);
  const len = Math.hypot(dx, dy);
  const k = t + pad / len;
  return [cx + dx * k, cy + dy * k];
}

function render(elements, title, fit = false) {
  const byId = Object.fromEntries(elements.filter((e) => e.id).map((e) => [e.id, e]));
  const out = [];
  const bounds = [];
  const grow = (x, y) => bounds.push([x, y]);

  elements.forEach((el, i) => {
    const seed = hash(`${title}:${i}:${el.id || el.text || ""}`);
    const o = opts(el, seed);
    if (["rect", "ellipse", "diamond"].includes(el.type)) {
      const { x, y, w, h } = el;
      let d;
      if (el.type === "rect") {
        const r = Math.min(10, w / 6, h / 6);
        // Excalidraw-style rounded rectangle.
        const p = `M ${x + r} ${y} L ${x + w - r} ${y} Q ${x + w} ${y} ${x + w} ${y + r} L ${x + w} ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} L ${x + r} ${y + h} Q ${x} ${y + h} ${x} ${y + h - r} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y}`;
        d = gen.path(p, o);
      } else if (el.type === "ellipse") d = gen.ellipse(x + w / 2, y + h / 2, w, h, o);
      else d = gen.polygon([[x + w / 2, y], [x + w, y + h / 2], [x + w / 2, y + h], [x, y + h / 2]], o);
      out.push(paths(d, el));
      if (el.text != null) out.push(text(x + w / 2, y + h / 2, el.text, { size: el.size || 20, mono: el.mono }));
      grow(x, y); grow(x + w, y + h);
    } else if (el.type === "path") {
      out.push(paths(gen.path(el.d, o), el));
      const nums = el.d.match(/-?\d+(\.\d+)?/g).map(Number);
      for (let k = 0; k + 1 < nums.length; k += 2) grow(nums[k], nums[k + 1]);
    } else if (el.type === "text") {
      const size = el.size || 20;
      out.push(text(el.x, el.y, el.text, { size, mono: el.mono, align: el.align || "start", muted: el.muted }));
      const w = textWidth(el.text, size, el.mono);
      const n = String(el.text).split("\n").length;
      const x0 = el.align === "middle" ? el.x - w / 2 : el.align === "end" ? el.x - w : el.x;
      grow(x0, el.y - (n * size * 1.25) / 2); grow(x0 + w, el.y + (n * size * 1.25) / 2);
    } else if (el.type === "line" || el.type === "arrow") {
      let pts;
      if (el.type === "line" && el.points) pts = el.points;
      else {
        const A = typeof el.from === "string" ? byId[el.from] : null;
        const B = typeof el.to === "string" ? byId[el.to] : null;
        if ((typeof el.from === "string" && !A) || (typeof el.to === "string" && !B))
          throw new Error(`${title}: arrow references unknown id ${el.from} -> ${el.to}`);
        const center = (b) => [b.x + b.w / 2, b.y + b.h / 2];
        const via = el.via || [];
        const aTarget = via[0] || (B ? center(B) : el.to);
        const bTarget = via[via.length - 1] || (A ? center(A) : el.from);
        const p0 = A ? clip(A, ...aTarget) : el.from;
        const p1 = B ? clip(B, ...bTarget) : el.to;
        pts = [p0, ...via, p1];
      }
      const d = pts.length > 2 || el.curve
        ? gen.curve(el.curve && pts.length === 2 ? bend(pts[0], pts[1], el.curve) : pts, o)
        : gen.line(...pts[0], ...pts[1], o);
      out.push(paths(d, el));
      if (el.type === "arrow") {
        out.push(head(pts[pts.length - 2] && el.curve && pts.length === 2 ? bend(pts[0], pts[1], el.curve)[1] : pts[pts.length - 2], pts[pts.length - 1], o));
        if (el.both) out.push(head(pts[1], pts[0], o));
        if (el.label) {
          const m = el.curve && pts.length === 2 ? bend(pts[0], pts[1], el.curve)[1] : midpoint(pts);
          const [lx, ly] = el.labelAt || [m[0], m[1] - 14];
          out.push(text(lx, ly, el.label, { size: el.labelSize || 16, muted: true }));
          grow(lx - textWidth(el.label, 16) / 2, ly - 12); grow(lx + textWidth(el.label, 16) / 2, ly + 12);
        }
      }
      pts.forEach((p) => grow(...p));
    } else throw new Error(`${title}: unknown element type ${el.type}`);
  });

  const pad = 16;
  const xs = bounds.map((b) => b[0]), ys = bounds.map((b) => b[1]);
  const minX = Math.min(...xs) - pad, minY = Math.min(...ys) - pad;
  const W = Math.max(...xs) - minX + pad, H = Math.max(...ys) - minY + pad;
  return `<svg class="xd" xmlns="http://www.w3.org/2000/svg" viewBox="${minX.toFixed(0)} ${minY.toFixed(0)} ${W.toFixed(0)} ${H.toFixed(0)}" width="${W.toFixed(0)}" role="img" aria-label="${esc(title)}"${fit ? ' data-fit="1"' : ""} stroke-linecap="round" stroke-linejoin="round">${out.join("")}</svg>\n`;
}

function bend(a, b, k) {
  const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  return [a, [m[0] - (dy / len) * k, m[1] + (dx / len) * k], b];
}

function midpoint(pts) {
  if (pts.length % 2) return pts[(pts.length - 1) / 2];
  const a = pts[pts.length / 2 - 1], b = pts[pts.length / 2];
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

function head(from, to, o) {
  const ang = Math.atan2(to[1] - from[1], to[0] - from[0]);
  const L = 14, spread = 0.45;
  const p = (s) => [to[0] - L * Math.cos(ang + s), to[1] - L * Math.sin(ang + s)];
  const [a, b] = [p(spread), p(-spread)];
  const d = gen.linearPath([a, to, b], { ...o, strokeLineDash: undefined });
  return gen.toPaths(d).map((q) => `<path d="${round(q.d)}" style="fill:none;stroke:var(--xd-ink);stroke-width:${q.strokeWidth}"/>`).join("");
}

const specs = fs.readdirSync(path.join(DIR, "specs")).filter((f) => f.endsWith(".mjs"));
fs.mkdirSync(path.join(DIR, "out"), { recursive: true });
for (const f of specs) {
  const mod = await import(pathToFileURL(path.join(DIR, "specs", f)).href + `?t=${Date.now()}`);
  const name = f.replace(/\.mjs$/, "");
  for (const lang of mod.langs || ["en"]) {
    const els = typeof mod.default === "function" ? mod.default(lang) : mod.default;
    const file = lang === "en" ? `${name}.svg` : `${name}.${lang}.svg`;
    fs.writeFileSync(path.join(DIR, "out", file), render(els, mod.title?.[lang] || mod.title || name, !!mod.fit));
    console.log("wrote", file);
  }
}
