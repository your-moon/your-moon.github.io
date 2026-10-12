// Part 1: one line of code flowing through lexer -> parser -> bytecode gen -> VM, top to bottom.
export const langs = ["en", "mn"];
export const title = { en: "From text to result: the four translations", mn: "Текстээс үр дүн хүртэл: дөрвөн хөрвүүлэлт" };
const T = {
  en: { src: "source text", lex: "Lexer", tok: "tokens", par: "Parser", ast: "tree (AST)", gen: "Bytecode generator", bc: "bytecode", vm: "Virtual machine", res: "result", next: "(next post)",
        s0: "let x: int = 2 + 3 * 4;", s1: "[let] [x] [:] [int] [=] [2] [+] …", s3: "PUSH 3  PUSH 4  MUL  PUSH 2  ADD  STORE x" },
  mn: { src: "эх текст", lex: "Лексер", tok: "токенууд", par: "Парсер", ast: "мод (AST)", gen: "Байткод үүсгэгч", bc: "байткод", vm: "Виртуал машин", res: "үр дүн", next: "(дараагийн нийтлэл)",
        s0: "let x: int = 2 + 3 * 4;", s1: "[let] [x] [:] [int] [=] [2] [+] …", s3: "PUSH 3  PUSH 4  MUL  PUSH 2  ADD  STORE x" },
};
export default (lang) => {
  const t = T[lang];
  const X = 0, W = 210, H = 54, G = 104;
  const y = (i) => 70 + i * G;
  const stage = (id, i, text, fill, extra = {}) => ({ type: "rect", id, x: X, y: y(i), w: W, h: H, text, fill, ...extra });
  const art = (i, label, sample) => [
    { type: "text", x: W / 2 + 14, y: y(i) + H + G / 2 - H / 2 - 2, text: label, size: 16, align: "start", muted: true },
    sample && { type: "text", x: W + 40, y: y(i) + H + G / 2 - H / 2 - 2, text: sample, size: 17, mono: true, align: "start" },
  ].filter(Boolean);
  return [
    { type: "text", x: W / 2 + 14, y: 20, text: t.src, size: 16, align: "start", muted: true },
    { type: "text", x: W + 40, y: 20, text: t.s0, size: 17, mono: true, align: "start" },
    { type: "arrow", from: [W / 2, 4], to: "lex" },
    stage("lex", 0, t.lex, "blue"),
    ...art(0, t.tok, t.s1),
    stage("par", 1, t.par, "violet"),
    ...art(1, t.ast, "x = 2 + (3 * 4)"),
    stage("gen", 2, t.gen, "yellow"),
    ...art(2, t.bc, t.s3),
    stage("vm", 3, t.vm, "green", { dashed: true }),
    ...(t.next ? [{ type: "text", x: W + 20, y: y(3) + H / 2, text: t.next, size: 16, align: "start", muted: true }] : []),
    { type: "arrow", from: "lex", to: "par" },
    { type: "arrow", from: "par", to: "gen" },
    { type: "arrow", from: "gen", to: "vm" },
    { type: "arrow", from: "vm", to: [W / 2, y(3) + H + 50] },
    { type: "text", x: W / 2 + 14, y: y(3) + H + 34, text: t.res, size: 16, align: "start", muted: true },
    { type: "text", x: W + 40, y: y(3) + H + 34, text: "x = 14", size: 17, mono: true, align: "start" },
  ];
};
