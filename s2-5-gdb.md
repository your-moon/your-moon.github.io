# How Does gdb Work?

*Building my own programming language — Season 2: To the Metal · Part 5: The Debugger*

My compiler kept producing programs that crashed for no reason I could see.

`strace` from last post showed me the *doors* my program opened — every syscall it made — but not what was happening inside: the registers, the variables, the exact instruction where everything fell apart. I'd stare at a page of assembly my own compiler had written and have no idea which line was lying to me.

So I learned to use a debugger, **gdb**, and it changed everything about how I work. But the thing that really got me — the thing I want to show you — is a question I couldn't stop asking once I started relying on it: *how does gdb do this at all?* How can one program reach inside another program that's already running, freeze it, and read its private registers? That sounds like it should be impossible. It turns out the answer is one of the best tricks in the whole system.

## First, what it feels like to use

Let me show you the magic before the mechanism, because the magic is the point.

You run your program under gdb, and suddenly you're in control of time. You set a **breakpoint** — "stop when you reach this line" — and the program runs full speed until that exact spot, then *freezes*, mid-flight, waiting for you.

```
$ gdb ./guess
(gdb) break guessGame
(gdb) run
Breakpoint 1, guessGame () at guess.mylang:4
(gdb) print target
$1 = 42
```

There it is. My program stopped dead inside `guessGame`, and I asked it: what's `target` right now? `42`. The secret number, plucked straight out of the frozen program's memory. I can step forward one line at a time, watch variables change, read the CPU's actual registers, and find the precise instruction where my compiler's output goes wrong.

The first time I caught a compiler bug this way — froze the program, saw a register holding a number that made no sense, traced it back to one wrong line of assembly I'd emitted — I understood why every serious programmer lives in a debugger. You stop *guessing* what your program does. You *watch* it.

![](diagrams/s2-5-art-caught.svg)

But how? How does gdb reach into a program that's already running and stop it?

## The surprising answer: the kernel hands it a leash

I assumed gdb must be doing something wildly low-level — reading the other program's memory directly, some deep hardware sorcery. The real answer is both simpler and stranger: **gdb asks the kernel to do it.**

Remember the last post — a program can't touch another program's memory. That's a hard rule. So gdb can't just reach in. Instead, it uses a special syscall, and its name tells you the whole story: **`ptrace`** — "process trace."

`ptrace` is the kernel saying: *"If you have permission, I'll let you puppeteer another process. I'll be the muscle; you give the orders."* With it, gdb asks the kernel to attach a leash to your program. Through that leash gdb can tell the kernel: pause it, let it run one instruction, read its registers, read its memory, change its memory. gdb never touches your program directly. It asks the kernel, every time, and the kernel — which *is* allowed to touch everything — does it on gdb's behalf.

So the impossible thing isn't gdb reaching into your program. It's the **kernel** reaching in, because the kernel can reach into anything, and *lending* that power to gdb through one carefully guarded syscall.

![gdb cannot reach into your program directly; it asks the kernel through ptrace, and the kernel does the reaching.](diagrams/s2-5-ptrace.svg)

## But how does a breakpoint actually stop the program?

This is the detail that delighted me most, because it's such an audacious hack.

A breakpoint means "freeze when execution reaches this line." But the program runs at billions of instructions per second — gdb can't sit there checking "are we there yet?" before every one. That'd be hopeless. So how does it stop at *exactly* the right instruction, instantly, without slowing the program down?

gdb **rewrites your program while it's running.**

When you set a breakpoint at some instruction, gdb (through `ptrace`) reaches into the running program's code and *overwrites the first byte of that instruction* with a special one-byte instruction called a **trap** (`int3` on x86). It saves the original byte first. Now the program runs full speed — and the instant it hits that spot, it executes the trap instead, which immediately kicks control to the kernel, which freezes the program and taps gdb on the shoulder: *"your trap fired."*

Then gdb quietly puts the original byte back, shows you your frozen program, and when you say "continue," it sets the trap again and lets go. You never see any of this. You just see your program stop exactly where you asked.

![The life of a breakpoint: gdb plants an int3 byte, the program walks into it, the kernel freezes it and notifies gdb, then gdb restores the byte.](diagrams/s2-5-breakpoint.svg)

I find that genuinely wonderful. A breakpoint isn't gdb watching your program. It's gdb *booby-trapping* one instruction and letting the program walk into it.

## Why I'm telling you this in a series about building a language

Because this is where all the previous layers suddenly became *tools*, not just concepts.

- Debugging my crashing compiler output meant reading **assembly** (Part 3) — I had to know what `mov` and `cmp` were to make sense of a frozen program.
- gdb works by making a **syscall**, `ptrace` (Part 4) — the exact user/kernel boundary I'd just learned.
- And it reads the CPU's **registers** directly — the tiny slots from Part 3, now something I could literally print and inspect.

Every abstraction I'd peeled back became something I could now *see* in a live program. The debugger is where the whole descent stops being a story I was told and becomes a machine I can operate.

## One last mystery, hiding in plain sight

While I was stepping through my compiled program in gdb, I kept noticing something odd. My guessing game calls `мөр_хэвлэх`, which deep down calls the system's `write`. But when I stepped into the printing code, gdb walked me through a function called `printf` — from the C standard library — that I had *never written* and never included in my project. It was just... there. In my program. Doing real work.

Where did it come from? I wrote a compiler, not a `printf`. And yet my finished program was full of code I didn't write, code that was somehow bundled in without my ever asking. Something, at some stage, had reached out and *stitched other people's code into mine*.

That stitching has a name, and it's the next floor down.

## One floor down

My program was full of code I never wrote — `printf` and friends, pulled in from somewhere. Someone had to find that code and wire it into my binary. That someone is the linker — and it's also behind the single most common build error every programmer eventually hits.

**So who put `printf` in my program?**
