// Part 4: the circuit breaker's three states.
export const title = "A circuit breaker has three states";
export default () => [
  { type: "rect", id: "closed", x: 0, y: 0, w: 230, h: 100, fill: "green", text: "closed\ncalls go through", size: 20 },
  { type: "rect", id: "open", x: 430, y: 0, w: 230, h: 100, fill: "red", text: "open\nfail fast", size: 20 },
  { type: "rect", id: "half", x: 215, y: 270, w: 230, h: 100, fill: "yellow", text: "half-open\none trial call", size: 20 },
  { type: "arrow", from: "closed", to: "open", label: "too many failures" },
  { type: "arrow", from: [610, 110], to: [440, 290] },
  { type: "text", x: 560, y: 205, text: "after a pause", size: 18, align: "start" },
  { type: "arrow", from: [225, 290], to: [90, 110] },
  { type: "text", x: 128, y: 205, text: "trial works", size: 18, align: "end" },
  { type: "arrow", from: [410, 270], to: [500, 110] },
  { type: "text", x: 425, y: 205, text: "trial fails", size: 18, align: "end" },
];
