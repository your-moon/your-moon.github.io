# What the Chip Actually Eats

*Building my own programming language — Season 2: To the Metal · Part 3: Assembly & the CPU*

My compiler had been writing a language I couldn't read.

It emitted lines like `mov eax, 2` and `add eax, 3`, and I understood their *shape* — put a number somewhere, add another number to it — but I couldn't have told you what `eax` really was, or how the processor marches through these lines, or why the ARM chip in my phone speaks a completely different dialect than the Intel chip in my laptop. My program spoke fluent assembly. I didn't.

![](diagrams/s2-3-art-fluent.svg)

So I finally sat down and learned to read what the chip eats. It's smaller than you'd think. A processor's entire vocabulary is: hold a few numbers, do arithmetic on them, and jump around. That's most of it. Let me show you.

## Registers: the whole desk is this small

Start with the thing I kept hand-waving: a **register**.

A register is a tiny slot that holds one number, and it lives *physically on the CPU* — not in memory, but on the silicon itself, right where the work happens. That's what makes it fast: the processor doesn't have to reach out to memory to use it. It's already holding it.

And now the part that surprised me. A CPU has almost none of them. An x86-64 processor gives you about **16** general-purpose registers with names like `rax`, `rbx`, `rcx`, `rsp`. Sixteen little slots. That's the desk the processor works on. Everything else — every variable, every array, the whole gigabytes of your program's memory — is in a filing cabinet across the room, and the CPU can only *think* about what's on the desk. Its entire life is shuffling numbers between the tiny fast desk and the huge slow cabinet.

![Registers are the small, fast desk on the CPU; memory is the huge, slow filing cabinet, and the CPU shuffles numbers between them.](diagrams/s2-3-desk-and-cabinet.svg)

Remember LLVM's IR from last post, with its `%1`, `%2`, `%3`, an infinite supply of imaginary registers? *This* is what LLVM's backend was quietly doing all along: cramming that infinite imaginary desk down onto a real one with only sixteen slots, deciding what to keep on the desk and what to shove back into the cabinet. That job even has a name — **register allocation** — and it's one of the hardest things a backend does. I'd been getting it for free and never knew.

## An instruction does almost nothing

Now the instructions themselves. The humbling truth: each one does *almost nothing*, and that's the point.

Take the three instructions my compiler wrote for `2 + 3`:

```asm
    mov   eax, 2      ; put the number 2 into register eax
    add   eax, 3      ; add 3 to eax        -> eax now holds 5
    mov   [x], eax    ; copy eax out to the memory slot named x
```

![The three instructions traced step by step: eax takes 2, then 5, then 5 is copied out to the memory slot x.](diagrams/s2-3-add-trace.svg)

Read them literally, because literal is all they are. `mov` copies a number into a slot. `add` adds a number to a slot. The `[x]` with brackets means "not the value x, but the *place* in the cabinet where x lives." No loops, no cleverness, no understanding. Move a number. Add a number. Store a number.

A whole program — your browser, a game, my guessing game with its Mongolian keywords — is *millions* of steps this small, run so fast it looks like thought. That was the moment the machine stopped being mystical for me. It isn't smart. It's just very, very fast at doing almost nothing.

![](diagrams/s2-3-art-dumb.svg)

## How does it ever make a decision?

If all it can do is move and add, how does `хэрэв таамаглал < зорилтотТоо` — "if the guess is less than the target" — actually work? Programs make decisions constantly. Where's the "if" instruction?

There isn't one. Instead there are two dumber instructions that, together, do the job:

```asm
    cmp   eax, ebx        ; compare the two numbers
    jl    too_low         ; "jump if less" — jump to too_low, but only if eax < ebx
```

`cmp` compares two numbers and leaves a little note to itself about the result (was it less? equal? greater?). Then `jl` — "jump if less" — reads that note and *maybe* jumps to a different place in the instruction list, or maybe doesn't. That's an `if`. Compare, then conditionally jump.

And a loop? The exact same trick, pointed backward: do some work, compare, and jump *up* to an earlier instruction if you're not done. My `давтах` loop, every `while` you've ever written, every `if` — all of it compiles down to `cmp` and a jump. The processor can't reason. It can only compare two numbers and decide which instruction to read next. Everything else is built from that.

## The great schism: two families of chip

Now the mystery I opened with — why my laptop and my phone speak different dialects.

Every processor you'll meet belongs to one of two families, and they represent a genuine, decades-old disagreement about how a CPU *should* be designed:

- **CISC** — *Complex Instruction Set Computer.* The philosophy: give the chip a big, rich vocabulary, including some fancy instructions that do a lot in one step. This is **x86-64**, the world of **Intel and AMD**, and it's almost certainly what's in your laptop or desktop.
- **RISC** — *Reduced Instruction Set Computer.* The opposite bet: keep the vocabulary *small* and every instruction dead simple and uniform, then run a ton of them, very fast, very efficiently. This is **ARM** — specifically **ARMv8** (also called AArch64) — and it's in your phone, and increasingly your laptop too (Apple's M-series chips are ARM).

Why doesn't everyone just agree on one? For the same reason there isn't one vehicle. A hatchback, a cargo truck and an excavator are all built from engines and parts, but for different jobs — and chips, like languages, are built on different bets. Watch the same `2 + 3` in ARMv8 assembly:

```asm
    mov   w0, #2      ; put 2 into register w0
    add   w0, w0, #3  ; w0 = w0 + 3   -> w0 holds 5
```

Look closely and you can *feel* the different philosophy. Different register names (`w0`, not `eax`). A `#` in front of literal numbers. And notice `add w0, w0, #3` names its destination and *both* sources explicitly, every time — that rigid, uniform shape is exactly the RISC bet: make every instruction simple and regular. The x86 `add eax, 3` is looser and more compact — the CISC bet. Same arithmetic, two worldviews.

This is also why there's no single "assembly language": there's x86 assembly and ARM assembly and RISC-V assembly and more, because there are genuinely different machines underneath, built on different bets. My compiler only speaks one of them — it emits **x86-64** and nothing else. Which leads to a genuinely funny situation on my own laptop.

**My Mac has an ARM chip. My compiler emits x86-64.** So when I compile and run one of my own programs on my own machine, the x86-64 instructions my compiler wrote can't run natively at all — my Mac's ARM core doesn't speak them. macOS quietly runs them through **Rosetta**, Apple's on-the-fly translator that turns x86-64 into ARM as the program executes. My compiler generates instructions for a chip I don't even own, and a *second* translator underneath rewrites them for the chip I do. Layers translating layers, all the way down. (This is exactly the N×M problem from last post, and the honest reason I only built one backend: doing ARM too would've meant a whole second code generator. The pros dodge this by emitting LLVM IR and letting LLVM's backends target every chip — the payoff of the shared middle I *didn't* build.)

![My compiler emits x86-64, Rosetta translates it to ARM while the program runs, and only then does the Mac's ARM core execute it.](diagrams/s2-3-rosetta.svg)

## But how does it *do* anything?

I could now read what my compiler wrote. `mov`, `add`, `cmp`, `jl` — the CPU holds numbers in a handful of registers, does tiny arithmetic, and jumps around based on comparisons. Millions of times a second. That's the machine.

Except... reread my guessing game. It prints `"бага байна"` to the screen. It reads a number from the keyboard. And I just told you the CPU's entire vocabulary is moving numbers between registers and memory. **There is no `mov` that puts letters on a screen.** There's no register that is the keyboard. So how does a program — which can *only* shuffle numbers — ever touch the outside world at all?

It can't. Not by itself. And the answer to how it cheats is one of the most important ideas in how computers actually work.

## One floor down

A program on its own is sealed in a box — it can compute, but it can't *do* anything you can see. To print a character, read a key, open a file, or send a byte over the network, it has to ask something more powerful for help. It has to call the operating system.

**How does a program that can only move numbers ever put a letter on the screen?**
