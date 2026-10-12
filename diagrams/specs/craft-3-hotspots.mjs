// Craft 3, Step 1: a hotspot is where churn, bugs and complexity overlap.
export const title = "Hotspots: where three kinds of trouble overlap";
export default () => [
  { type: "ellipse", x: 10, y: 0, w: 220, h: 220 },
  { type: "ellipse", x: 150, y: 0, w: 220, h: 220 },
  { type: "ellipse", x: 80, y: 120, w: 220, h: 220 },
  { type: "ellipse", x: 130, y: 125, w: 120, h: 80, fill: "yellow" },
  { type: "text", x: 190, y: 165, text: "hotspot:\n5–10 files", size: 17, align: "middle" },
  { type: "text", x: 75, y: 70, text: "changes\noften", size: 20, align: "middle" },
  { type: "text", x: 305, y: 70, text: "breaks\noften", size: 20, align: "middle" },
  { type: "text", x: 190, y: 280, text: "hard to\nfollow", size: 20, align: "middle" },
  { type: "text", x: 190, y: 375, text: "start here, not everywhere", size: 18, align: "middle", muted: true },
];
