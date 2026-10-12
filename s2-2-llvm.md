# Why I Didn't Use LLVM

*Building my own programming language — Season 2: To the Metal · Part 2: LLVM, and the middle I built instead*

Every time I mentioned I was writing a compiler, someone said the same thing: *"just use LLVM."*

They weren't wrong, exactly. LLVM is what real compilers are built on. It would have handed me fast, optimized machine code for practically every chip on Earth, for free. And I looked at it, understood what it does, and deliberately chose *not* to use it — and to hand-write my own path down to the metal instead. This post is about what LLVM actually is, why it's the obvious professional choice, and why I said no to it anyway. That last part turned out to be the most important decision in the whole project.

![](diagrams/s2-2-art-just-use-llvm.svg)

## What LLVM is, and the problem it solves

To see why people push LLVM so hard, look at the problem it solves. Picture the naive way to build compilers: every language compiles straight to every chip.

I write my language → x86-64. Fine. Now I want it on the ARM chip in a Raspberry Pi — a completely different instruction set where `mov eax, 2` means nothing. So I write a *second* backend from scratch. Want RISC-V too? A third. Now scale up: imagine building clang (C), rustc (Rust), and swiftc (Swift), each targeting x86, ARM, and RISC-V. That's 3 languages × 3 chips = **nine** separate translators. Every new language multiplies against every new chip. It explodes.

The fix is to stop connecting languages directly to chips, and put one shared language in the middle:

> Every **frontend** compiles *down* to the middle. Every **backend** compiles the middle *down* to one chip. Nobody talks directly to anybody else.

Now three frontends reach the middle, and the middle reaches three chips: three plus three is **six**, not nine — and the gap widens fast. Every new language becomes *one* frontend that instantly runs on every chip. That middle language is called an **intermediate representation** — **IR**.

![Without an IR every language needs its own translator for every chip; with a shared IR each language and each chip is written once.](diagrams/s2-2-n-times-m.svg)

**LLVM is that idea at industrial scale.** One well-specified IR, plus mature backends for x86-64, ARM, RISC-V, WebAssembly and more, plus hundreds of battle-hardened optimization passes living in the middle. Emit LLVM IR from your frontend and you inherit *all* of it — every backend, every optimization — for free. It's why clang, rustc, and swiftc can each reach every chip without any of them writing a backend. They all emit LLVM IR and share the same middle.

So when people said "just use LLVM," this is what they meant: don't reinvent the hardest, most valuable machinery in compilers. They had a point.

## Why I said no

And I still chose not to. Here's the honest reasoning.

**1. Using LLVM would skip the exact thing I was trying to learn.** My whole goal was to understand how a program becomes machine instructions — registers, the stack, calling conventions, how `2 + 3` turns into something a CPU runs. LLVM does precisely that part *for* you. You hand it clean IR and fast x86-64 falls out the other end, and you learn nothing about how. Using LLVM would have been bolting a sealed engine onto the one door I came to open.

**2. LLVM is enormous.** It's a massive C++ dependency with a sprawling API, a steep learning curve, and long build times. For a learning project, "learn LLVM's API" is arguably a *bigger* mountain than "learn how a CPU works" — and it's the wrong mountain. I'd be studying a framework instead of the machine.

**3. I only had one language and one chip.** LLVM's giant payoff is the N×M explosion — many languages times many chips. I had exactly one of each: my language, targeting x86-64. The benefit that justifies LLVM's complexity didn't apply to me. I'd pay the full cost and collect almost none of the reward.

**4. The book I was following teaches the hard way on purpose.** Nora Sandler's *Writing a C Compiler* doesn't reach for LLVM. It has you build a small IR of your own and generate x86-64 by hand, specifically so you learn the whole path. That pedagogy was the entire reason I picked it.

So I built my own middle, by hand, targeting x86-64 directly. In the book it's called **Tacky**, and it became my favorite stage.

## The middle I built: Tacky

Tacky is my own IR — deliberately dumber than my source language and simpler than assembly. Its rule: **every instruction does exactly one operation**, and anything complex is broken into steps with temporary variables holding the in-between results.

Take a line from my language:

```
зарла x: тоо = 2 + 3 * 4;   // let x: int = 2 + 3 * 4
```

My frontend parses that into a tree (Season 1). Then, instead of leaping to registers, it lowers the tree into Tacky:

```
tmp.0 = 3 * 4
tmp.1 = 2 + tmp.0
x = tmp.1
```

![The nested tree for x = 2 + 3 * 4 flattened into Tacky: the multiplication, the addition and the assignment each become one line.](diagrams/s2-2-tree-to-tacky.svg)

The nested tree became a flat, ordered list, each line doing one thing: one multiply, one add, one assignment. The `tmp.0`, `tmp.1` are temporaries — scratch variables Tacky invents, and it pretends it has *unlimited* of them. That's the same trick LLVM IR uses (it writes `%1`, `%2` instead of `tmp.0`, `tmp.1`); my hand-rolled Tacky is a tiny, single-target cousin of the big one. Building the small version myself is exactly what made LLVM *legible* to me afterward — I finally knew what an IR was *for*, because I'd needed one.

## The middle is where you optimize

Here's what turned Tacky from "extra busywork" into the most interesting stage. Because it's so flat and simple, it's the perfect place to make the program faster *before* any assembly exists. Look at that first line:

```
tmp.0 = 3 * 4
```

Both operands are constants — the answer is always `12`, so there's no reason to make the CPU compute it every run. A pass called **constant folding** collapses it at compile time:

```
; before:  tmp.0 = 3 * 4   ;  tmp.1 = 2 + tmp.0
; after:   x = 14
```

The computation is *gone*; the program just stores `14`. That's one optimization; real compilers stack hundreds — dead-code elimination, hoisting work out of loops, inlining — and nearly all of them happen here on the IR, because that's where the program is simple enough to safely rewrite. This is exactly the machinery LLVM would have given me for free, and here I understood every line of it, because I wrote it.

## The trade I actually made

Let me be honest about what this cost, because "I didn't use the industry-standard tool" deserves a real accounting.

**What I gave up:** portability (Tacky targets x86-64 and nothing else — no ARM, no RISC-V without writing whole new backends), and a mountain of free, world-class optimization that would make LLVM output far faster than mine.

**What I got:** I actually understand my compiler, top to bottom. There's no stage where I shrug and say "and then LLVM does something." When it breaks, I can read every line of IR and every instruction of assembly, because they're mine. For a project whose entire purpose was *understanding*, that's not a consolation prize — it's the whole point.

If I were shipping a real language for people to use, I'd emit LLVM IR tomorrow and never look back. But I wasn't shipping a language. I was trying to make the machine stop being magic. You can't do that by hiding the machine behind LLVM.

## But Tacky still isn't the bottom

Reread that Tacky:

```
tmp.0 = 3 * 4
tmp.1 = 2 + tmp.0
```

Those temporaries are a comfortable fiction. A real CPU has no unlimited `tmp`s — it has a small, fixed set of physical registers with names Intel chose, and when you run out, values spill to slow memory. My backend has to do the hard, unglamorous work of cramming Tacky's infinite temporaries onto that cramped real machine. Which means Tacky was never the floor either. It's a clean *idea* of a machine, and underneath it sits an actual one, made of silicon, running real instructions one line at a time.

![Tacky's temporaries are unlimited; the real CPU has a few registers, and whatever does not fit spills to memory.](diagrams/s2-2-temps-to-registers.svg)

I'd built a middle and optimized on a machine that doesn't exist. I still hadn't looked the real one in the eye.

## One floor down

Time to stop routing around the machine and meet it. Registers you can count on one hand. Instructions the silicon runs directly. And the ancient rift that splits every processor into two families — the x86-64 my compiler targets, and the ARM inside the very Mac I compile on.

**So what does the chip actually eat?**
