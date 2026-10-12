# I Spent Three Years to Understand This Tiny Program

*Building my own programming language — Season 1: Cecile · Part 1: The Interpreter*

Two words on a screen — «Өдрийн мэнд», "Good day" — took me three years to understand.

Here it is. It's written in **Mon** — a language I built, with keywords in Mongolian — and it compiles straight down to a file the CPU runs:

```
extern функц мөр_хэвлэх(м мөр) -> хоосон {}

функц үндсэн() -> тоо {
    мөр_хэвлэх("Өдрийн мэнд");
    буц 0;
}
```

```
Өдрийн мэнд
```

(`функц` is *function*, `мөр_хэвлэх` is *print a line*, `буц` is *return*. The output means "Good day.")

Every programmer has written a hello world. I'd written dozens. What I couldn't tell you was what actually happens between typing these six lines and seeing «Өдрийн мэнд» on the screen — not the hand-wavy "the computer runs it", but every step, all the way down to the CPU. **Answering that took three years.**

![](diagrams/s1-1-question.svg)


Mon is where that question ended up. It started much smaller. In my first year I built a little interpreted language called **Cecile**, and in doing so I discovered that the most boring program you know — "hello world" — is quietly hiding almost everything interesting about computers. This series follows the whole road: Cecile first, then Mon, then all the way down to the CPU.

## So — why do this at all?

I was a second-year student who hadn't figured anything out yet.

I kept running into the same 1am thought: *how am I going to get a job, and what do I actually have that sets me apart from the next student?* I had zero work experience. So I decided, in the slightly desperate way students decide things, that I needed one real thing I could point at and say: **I built that.**

![](diagrams/s1-1-1am.svg)


So I went looking for a project.

The first goal was honestly that shallow — find something impressive enough to help me get hired. I was scrolling through the [build-your-own-x](https://github.com/codecrafters-io/build-your-own-x) repo (a big list of "build your own git / database / regex engine / …" guides) when one line stopped me cold: **build your own compiler / interpreter.**

I didn't fully know what those words meant. That was the point. It just looked interesting.

### "Just because it looked interesting?"

Yes. And because it smelled like the kind of project where you accidentally learn ten other things on the way to the one thing.

Here's the belief that pulled me in, and I still hold it: **the way code runs is the most mysterious, most fundamental piece of software there is.** It grew up right alongside the computer itself. Strip it away and the word "software" stops meaning anything — there's nothing left to *write* software in. Every app, every website, every game you've ever touched sits on top of some program whose only job is to take human-ish text and turn it into something a chip will do. I had used that machinery every day for years and had no idea how it worked.

At some point, I figured, you have to look inside.

I also knew, without being able to explain why yet, that this was going to hurt. Compilers sit on top of half of computer science at once — grammars, parsing, data structures, memory, a little of how the CPU itself thinks. Which was exactly the appeal. Hard thing, huge surface area, lots to learn.

For something that hard, I didn't want to flail — I wanted structure. So I did the un-glamorous thing and bought a book.

## The book: *Crafting Interpreters*

[*Crafting Interpreters*](https://craftinginterpreters.com) by Robert Nystrom (finished in 2020) deserves every bit of praise it gets. It's beginner-friendly without being shallow, it's full of hand-drawn diagrams, and — rare for a technical book — it's genuinely *fun* to read. If you want to learn this topic, start here. I mean it.

The format is simple: you don't read *about* interpreters, you build one, chapter by chapter. Each chapter hands you code, an explanation, and pictures, and by the end you have a real, working language. The book comes in two halves, and the jump between them is the whole education.

**Part 1 — A Tree-Walk Interpreter (10 chapters).** You build a small language called Lox in Java. It's called a *tree-walk* interpreter because it literally builds a tree out of your program and then walks that tree, node by node, doing what each node says. It's the most direct way to make a language work. *Most beginners end up here* — and that's completely fine. I did.

**Part 2 — A Bytecode Virtual Machine (17 chapters).** This is the heart of the book. You throw away the Java version and rebuild the language from scratch in C, this time compiling it to **bytecode** and running that on a little virtual machine you write yourself. It's a huge step up, and it's where Cecile really took shape — enough that it gets its own post next. For now, just know that this is the model real languages actually use: JavaScript's V8, Python, and Java all run on some version of this bytecode-VM idea.

By the end of the book, I didn't just have a working tutorial language. I had opinions.

## Designing a language of my own: Cecile

So I decided I didn't want to build *Lox*. I wanted mine. I called it **Cecile**.

At the time I was learning Rust, and I'd fallen for it hard — a genuinely wonderful language (the borrow checker and I have our differences, but that's a story for another day). So I asked myself one deceptively small question:

> What if it *read* like Rust, *behaved* like JavaScript, and *had types* like TypeScript?

That became Cecile's whole personality. Rust's clean, explicit syntax — `fn`, `let`, arrows for return types. JavaScript's easygoing runtime feel. TypeScript's "types are there when you want them." I wrote it in **Rust**, taking early inspiration from [loxcraft](https://github.com/ajeetdsouza/loxcraft), a Rust implementation of Lox. A program in Cecile looks like this:

```
fn add(a: int, b: int) -> int {
    return a + b;
}

let total: int = add(2, 3);
println total;        // 5
```

But taste doesn't run on a computer. To actually *build* a language, you start by writing down its **grammar** — the exact rules for what counts as a valid program. Grammar is the contract. Once you have it, everything downstream is a series of translations, each one turning your program into a form that's a little closer to something a machine can execute. Let me show you those stages by pushing one line of Cecile through all of them.

## Watch one line become something a machine can run

Say a Cecile program contains this:

```
let x: int = 2 + 3 * 4;
```

Watch where it goes.

### Stage 1 — the Lexer: text → tokens

A computer doesn't see words. It sees a river of characters: `l`, `e`, `t`, space, `x`, `:`, and so on. The **lexer** (or *scanner*) is the first translator. Its only job is to chop that river into meaningful chunks called **tokens**, and label each one.

So `let x: int = 2 + 3 * 4;` comes out the other side as:

```
[let → keyword]  [x → identifier]  [: → colon]  [int → type]  [= → equals]
[2 → number]  [+ → plus]  [3 → number]  [* → star]  [4 → number]  [; → semicolon]
```

That's it. Text in, labeled tokens out. The lexer doesn't understand *math* or *meaning* yet — it doesn't know that `*` binds tighter than `+`. It just knows "this blob is a number, that blob is a keyword, this symbol is a star." Dumb, fast, and absolutely necessary.

### Stage 2 — the Parser: tokens → tree

This is the hard part. Honestly, one of the hardest steps in the whole project.

The **parser** takes that flat line of tokens and discovers the *structure* hiding in it — the shape my grammar says it must have. There's a whole zoo of parsing algorithms, and I went with **Pratt parsing** on top of **recursive descent**. The reason I reached for Pratt is exactly the thing the lexer couldn't handle: **precedence.** `2 + 3 * 4` is not `(2 + 3) * 4 = 20`. It's `2 + (3 * 4) = 14`, because multiplication binds tighter than addition — and the parser is where that rule finally gets enforced.

The output isn't a line anymore. It's a tree:

![The syntax tree for x = 2 + 3 * 4](diagrams/s1-1-ast.svg)

Read it and the shape carries the meaning: to compute `+`, you first have to compute `*`, because `*` lives *below* it in the tree. The tree's shape solves the ordering problem. This tree has a proper name — an **Abstract Syntax Tree**, or AST — and it's the most satisfying artifact in the whole pipeline, because it's the moment raw text turns into something that actually *knows what it means*. (If the tokens *don't* fit the grammar — say you wrote `let x = = 2` — this is exactly where the parser stops and hands you a syntax error.)

### Stage 3 — Bytecode generation: tree → instructions

A tree is lovely to reason about but awkward to execute fast. So the last translator walks the AST and flattens it into **bytecode**: a straight, ordered list of tiny instructions the machine can run one after another.

Conceptually, our little tree compiles down to something like:

```
PUSH 3
PUSH 4
MUL          ; 3 * 4  -> 12
PUSH 2
ADD          ; 2 + 12 -> 14
STORE x      ; x = 14
```

Notice how the tree's nesting became a *sequence*: multiply first, then add, then store. That's the tree's meaning, unrolled into steps a machine can follow one at a time without ever chasing a pointer through a tree again.

Text → tokens → tree → instructions. Four translations, and Cecile has a runnable program. (*What actually runs that bytecode is a little machine of its own — that's the next post.*)

![The pipeline: lexer, parser, bytecode generator, then the VM (next post)](diagrams/s1-1-pipeline.svg)


## Wait — interpreter or compiler? What's the difference?

Good moment to stop, because you might be quietly wondering what I was wondering the whole first month: *what even is an interpreter, and how is it different from a compiler?*

Here's the analogy that finally made it click for me, and I've never found a better one:

> An **interpreter** is a live translator. A **compiler** is a document translator.

![Interpreter vs compiler](diagrams/s1-1-interp-vs-compiler.svg)


A live translator works line by line, sentence by sentence, translating on the spot as you speak. Immediate, flexible, no waiting — but they only ever see one sentence at a time. A document translator does the opposite: they take the *whole* text first, read all of it, analyze it, understand how the end connects to the beginning, and *only then* produce the translation.

Put that way, the difference is huge — and so is the trade-off. The document translator (the **compiler**) can produce faster, more optimized output, precisely because it sees everything before committing. The live translator (the **interpreter**) gives that up in exchange for starting *right now*, with no wait and more flexibility. Neither is "correct"; they're different deals. Cecile is an interpreter — it compiles your code to bytecode and then immediately runs it, no separate build step.

That's the key point for today: **even a plain interpreter gives us exactly the result we want, and it's more than enough to finally see how running code works.** Which is why Cecile's whole first year lived here, in software, one comfortable step above the metal.

> *If you find that you're spending almost all your time on theory, start turning some attention to practical things; it will improve your theories. If you find that you're spending almost all your time on practice, start turning some attention to theoretical things; it will improve your practice.*
> — Donald Knuth

## Does it actually run? Here's Cecile, working

Enough theory. After all of it — grammar, lexer, parser, bytecode — here's a real, complete Cecile program. A number-guessing game:

```
fn guessGame() {
    println "Enter your guess:";

    let target: int = randomInt(100);
    let tries: int = 0;
    let maxTries: int = 10;

    while tries < maxTries {
        let guess: int = readInt();
        tries = tries + 1;

        if guess == target {
            println "congrats, you got it 🎉";
            println "Your tries:";
            println tries;
            return;
        }

        if guess < target { println "too low"; }
        if guess > target { println "too high"; }
    }

    println "Out of tries! It was:";
    println target;
}

// Cecile picks a random number; the player tries to guess it.
guessGame();
```

Look at everything in there: typed variables, a `while` loop, `if` conditions, function calls, a random-number call, reading input from the keyboard, an emoji in a string. Every one of those features had to be lexed into tokens, parsed into a tree, lowered to bytecode, and executed — by an interpreter I wrote. The first time this ran and printed `too low` at me, I just sat there grinning. It still feels a little unreal to paste it out.

![](diagrams/s1-1-grin.svg)


## But something was still missing

And yet.

The moment Cecile worked, I realized I *still* couldn't answer the question I started with. Yes — a handful of letters go in, and my machine produces exactly the output I asked for. But my interpreter is itself a program written in another language, running on top of *another* system, and somewhere underneath all of that a physical CPU is flipping actual electrical signals. *How do a few letters become that?* That floor was still a black box, and I'd only built one floor above it.

Cecile runs — but it never once touches the metal. And I couldn't stop thinking about the metal.

## One floor down

Before we go down, we go *in*. Cecile turns your code into bytecode — a list of instructions that, on its own, does nothing at all.

**So what actually runs the bytecode?**
