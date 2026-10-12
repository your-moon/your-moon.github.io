// Part 2.1: same frontend, two different backends.
export const title = "Same front half, different back half";
export default () => [
  { type: "text", x: 325, y: -20, text: "source text", size: 16, muted: true },
  { type: "arrow", from: [325, -8], to: "lex" },
  { type: "rect", id: "lex", x: 225, y: 10, w: 200, h: 50, text: "Lexer", fill: "blue", size: 19 },
  { type: "rect", id: "par", x: 225, y: 100, w: 200, h: 50, text: "Parser", fill: "violet", size: 19 },
  { type: "rect", id: "ast", x: 225, y: 190, w: 200, h: 50, text: "tree (AST)", fill: "gray", size: 19 },
  { type: "arrow", from: "lex", to: "par", label: "tokens", labelAt: [380, 80] },
  { type: "arrow", from: "par", to: "ast" },
  { type: "text", x: 0, y: 40, text: "frontend:\nunderstands\nyour language", size: 17, align: "start", muted: true },
  { type: "line", points: [[-10, 262], [660, 262]], dashed: true },
  { type: "text", x: 0, y: 306, text: "backend:\nunderstands\nthe machine", size: 17, align: "start", muted: true },
  { type: "rect", id: "int", x: 140, y: 290, w: 220, h: 80, text: "Interpreter\nwalks the tree\nand does it", fill: "green", size: 18 },
  { type: "rect", id: "cmp", x: 410, y: 290, w: 250, h: 80, text: "Compiler\nwrites down the CPU's\ninstructions, then leaves", fill: "orange", size: 18 },
  { type: "arrow", from: "ast", to: "int" },
  { type: "arrow", from: "ast", to: "cmp" },
  { type: "text", x: 250, y: 420, text: "runs now,\ninside my VM", size: 16, muted: true },
  { type: "text", x: 535, y: 420, text: "file of real instructions,\nrun later by the bare CPU", size: 16, muted: true },
  { type: "arrow", from: "int", to: [250, 396] },
  { type: "arrow", from: "cmp", to: [535, 396] },
];
