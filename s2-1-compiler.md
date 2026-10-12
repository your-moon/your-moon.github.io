# This Time, There's No Interpreter to Hide Behind

*Building my own programming language — Season 2: To the Metal · Part 1: The Compiler*

Remember the six lines at the very top of Part 1 — the program I said took me three years to understand? This is the year it was born. And this is the first thing my new compiler ever wrote that I couldn't fully read:

```asm
    mov   eax, 2
    add   eax, 3
    mov   [x], eax
```

My compiler wrote that file, saved it to disk, and walked away. No virtual machine ran it. No runtime of mine stood behind it. It was just *instructions*, sitting there, waiting for a bare CPU to pick them up — and I'd generated them without truly understanding what a single one meant.

![](diagrams/s2-1-art-unreadable.svg)

That's the whole difference between Season 1 and Season 2. Cecile *ran* your code; I stayed safe inside a VM I controlled. This second language **compiles** your code — translates it down to the real instructions a chip eats, then leaves, and the bare processor takes it from there. And I decided its keywords would be in Mongolian. That's **Mon**, and its "hello world" is the program from the top of Part 1:

```
extern функц мөр_хэвлэх(м мөр) -> хоосон {}   // extern fn print_line(m: string) -> void

функц үндсэн() -> тоо {                         // fn main() -> int
    мөр_хэвлэх("Өдрийн мэнд");                  // print_line("Good day")
    буц 0;                                       // return 0
}
```

```
Өдрийн мэнд
```

Same greeting as Season 1. Completely different journey underneath. This post is about that difference — what a compiler actually *is*, and why building one drops you straight through the floor toward the metal.

## Wait, didn't Cecile already "compile"?

Fair catch. In Season 1 I said Cecile compiles your code to bytecode. So what's new?

The difference is **where the translation stops, and who runs the result.**

Cecile compiled your code to bytecode and then *immediately ran it itself*, on a VM I wrote. The bytecode never left my software. It's the live-translator deal from Season 1: convenient, instant, but forever one step above the hardware.

A real compiler makes a different bargain. It translates your program into the **actual instructions of a real CPU**, writes them into a file, and then *walks away*. No VM. No runtime of mine standing between the program and the processor. When you run the result, the bare chip is executing your logic directly.

That's the whole reason I switched languages to learn this. An interpreter lets you *avoid* understanding the machine. A compiler forces you to meet it.

## The new book: *Writing a C Compiler*

For Cecile I had Crafting Interpreters. For this, after digging through half of Reddit, I got a physical copy of **Nora Sandler's *Writing a C Compiler*** — a book that had barely just come out.

It's the perfect companion to the interpreter book, because it refuses to let you stay in the comfort zone. You don't build a VM that runs your code. You build a program that reads C and emits **real x86-64 assembly** — text a real processor runs directly. The output isn't "a result." The output is *instructions*.

I pointed it at my own Mongolian-keyword language — I call it **Mon** — instead of plain C, wrote the whole compiler in Go, and got to work. When it's done producing assembly, it shells out to the system assembler and linker (`as` and `cc`) to turn that into a real executable. (One funny wrinkle: my Mac has an ARM chip, but Mon emits x86-64, so on my own machine the result runs under Rosetta translation. More on that two posts from now.)

![Mon's path from source to a running program: the compiler writes assembly, the system tools turn it into an executable, and the bare CPU runs it.](diagrams/s2-1-toolchain.svg)

## So what *is* a compiler, really?

Here's the mental model that organized everything for me. A compiler has two halves, and they're named after where they sit:

> The **frontend** understands your language. The **backend** understands the machine. In the middle, they hand off a shared, simplified description of your program.

The beautiful part: the frontend from Season 1 *already exists*. Lexer, parser, AST — understanding the text — that work is identical whether you're building an interpreter or a compiler. Text becomes tokens becomes a tree, exactly as before.

The fork happens *after* the tree. An interpreter walks the tree (or its bytecode) and **does** what it says. A compiler walks the tree and **writes down**, in the machine's own language, the instructions that would do what it says — then saves them and leaves.

Same front half. Totally different back half. That back half is the entire subject of Season 2.

![Both paths share the frontend; they differ in what they do with the tree.](diagrams/s2-1-frontend-backend.svg)

## Watch one line become assembly

Let me make it concrete with a line from my language. Say a program computes:

```
зарла x: тоо = 2 + 3;   // let x: int = 2 + 3
```

In Cecile, this became bytecode that my VM ran. In the compiler, the backend turns that same tree into instructions for a real CPU — something close to this x86-64 assembly:

```asm
    mov   eax, 2      ; put 2 into a register called eax
    add   eax, 3      ; add 3 to it        -> eax now holds 5
    mov   [x], eax    ; store eax into the memory slot for x
```

Look at what changed from Season 1. There's no `PUSH`/`POP` onto a stack I invented. There's `eax` — a **register**, a tiny storage slot *physically on the CPU*. There's `mov` and `add` — instructions the silicon itself knows how to perform. My compiler didn't run this. It *wrote* it into a file and stopped. When you execute that file, the processor reads `mov`, `add`, `mov` and does them with its own hands.

![The three instructions, with what the CPU holds after each one runs.](diagrams/s2-1-line-to-asm.svg)

That's the moment the abstraction ended for me. In Season 1 the bottom of the stack was *my* code. Here, the bottom of the stack is a register with a name that Intel chose.

## The whole language, compiling

After grammar, lexer, parser, and a backend that emits assembly, here's a full program in my Mongolian-keyword language — the same guessing game from before, but this one compiles to a real executable:

```
extern функц мөр_хэвлэх(м мөр) -> хоосон {}        // extern fn print_line(m: string)
extern функц унш() -> тоо64 {}                      // extern fn read() -> int64
extern функц санамсаргүйТоо(н тоо64) -> тоо64 {}    // extern fn randomInt(n) -> int64

функц таахТоглоом() -> хоосон {                     // fn guessGame() -> void
    мөр_хэвлэх("Та таамгаа оруулна уу:");           // print_line("Enter your guess:")

    зарла зорилтотТоо: тоо64 = санамсаргүйТоо(100);  // let target = randomInt(100)
    зарла оролдлого: тоо64 = 0;                      // let tries = 0
    зарла хамгийнИхОролдлого: тоо64 = 10;            // let maxTries = 10

    давтах оролдлого < хамгийнИхОролдлого бол {      // while tries < maxTries {
        зарла таамаглал: тоо64 = унш();              // let guess = read()
        оролдлого = оролдлого + 1;

        хэрэв таамаглал == зорилтотТоо бол {         // if guess == target {
            мөр_хэвлэх("баяр хүргэе, та зөв таалаа 🎉");
            буц;                                      // return
        }

        хэрэв таамаглал < зорилтотТоо бол { мөр_хэвлэх("бага байна"); }  // "too low"
        хэрэв таамаглал > зорилтотТоо бол { мөр_хэвлэх("их байна"); }    // "too high"
    }
}

функц үндсэн() -> тоо {
    таахТоглоом();
    буц 0;
}
```

Loops, conditionals, typed variables, function calls, an emoji in a string — with keywords in Mongolian — and at the end of the pipeline, out fell a file of raw assembly instructions. Not a result my program printed. *Instructions*, sitting in a file, waiting for a CPU. I could open that file and read the `mov`s and `add`s my own compiler had written — a language I'd taught a machine to emit before I could fluently read it myself.

## But now I had a new floor I couldn't read

And here's the trap I walked straight into.

My compiler produced assembly. Great. Except I could barely read it. I had this file full of `mov eax, 2` and `add eax, 3`, and I understood the *shape* of it — but I didn't truly know what a register was, or how the CPU marches through these lines, or what happens the instant `мөр_хэвлэх` needs to actually put letters on a screen. My compiler had confidently written a language I didn't speak.

In Season 1, "how does code run?" bottomed out at *my* VM. Now it bottomed out one floor lower, at **assembly and the CPU** — and this floor I didn't build. Intel and ARM did.

I had gone from *avoiding* the machine to *generating code for* the machine. The next step was obvious and unavoidable: I had to actually understand the machine.

But there's one more surprise before we get there. My compiler was emitting assembly by hand, one instruction pattern at a time — and it turns out almost no serious compiler does it that way anymore. They all funnel through a shared middle layer first, and understanding *why* is the key to how clang, rustc, and Swift all share the same backend.

## One floor down

But my compiler doesn't actually leap straight from the tree to those `mov`s. It stops at a middle stage first — a flat, simplified version of the program that's neither my language nor assembly. And building that middle by hand was a real choice: everyone told me to just use LLVM and skip it. I said no, on purpose.

**Why would anyone build that middle by hand when LLVM exists?**
