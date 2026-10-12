# The Machine Inside Your Machine

*Building my own programming language — Season 1: Cecile · Part 2: The Bytecode VM*

These six instructions compute `2 + 3 * 4`. On their own, they do absolutely nothing.

```
PUSH 3
PUSH 4
MUL          ; 3 * 4  -> 12
PUSH 2
ADD          ; 2 + 12 -> 14
STORE x      ; x = 14
```

They're the bytecode Cecile produced last post — a handful of bytes sitting in memory. Something has to pick them up, one at a time, and *act*. And I'd quietly skipped the most important question in the whole project: **who runs this?**

That something is a **virtual machine**, and it turns out to be shockingly small: a loop, a stack, and a pointer. Let me build one with you, and by the end you'll see exactly how `2 + 3 * 4` becomes `14` inside a machine that is itself just a program.

## Why not just walk the tree?

Quick honesty, because I glossed over this last time.

My first version of Cecile didn't have a VM at all. It had an AST — that lovely tree — and it just *walked* it: to run `+`, visit the left child, visit the right child, add them. Simple. It worked. So why did I throw it away and build a whole bytecode machine instead?

Speed, and it's worth seeing *why*, concretely. Walking a tree means that for every single operation, the program chases pointers all over memory — down to a child node, back up, down to another, back up. Memory is scattered; the CPU spends its life waiting for the next node to arrive. A flat list of bytecode is the opposite: the instructions sit **next to each other** in memory, and the machine reads them in a tight, predictable line. Same result, but one design fights the hardware and the other flows with it.

That's the whole reason real languages — V8, Python, the JVM — compile to bytecode instead of walking trees. So I did too.

## The smallest possible machine: a loop and a stack

The entire idea is this small.

A bytecode VM has two pieces:

1. **An instruction pointer** — a finger pointing at the current instruction. It starts at the top and marches down.
2. **A stack** — a pile of values you can only touch from the top. `PUSH` puts a value on top; `MUL` takes the top two off, multiplies them, and puts the result back.

That's it. The VM is a loop: *read the instruction my finger points at, do it, move the finger down, repeat.* People call this the **fetch–decode–execute** loop, and if that phrase sounds familiar, it should — it's exactly what a real CPU does. A bytecode VM is a tiny software CPU.

## A program pretending to be a CPU

Let me slow down on that last sentence, because it's the whole trick.

A real CPU is a chip. Inside it, a register points at the next instruction. The chip fetches that instruction, works out what it means, does it, and moves the pointer on — billions of times a second. And it only understands its own instructions: machine code, built into the silicon.

My VM does exactly the same dance — but it isn't a chip. It's a Rust program. Its instruction pointer is just a variable. Its instructions are bytecode — `PUSH`, `MUL`, `ADD` — a tiny instruction set I made up myself. No chip in the world understands `PUSH 3`. My VM does, because I wrote the loop that pretends to.

![The same job, two very different machines.](diagrams/s1-2-cpu-vs-vm.svg)

That's what *virtual* means here. The VM is a machine that doesn't physically exist: a program playing the role of a CPU. And underneath it, the real CPU is running that program, one real instruction at a time.

![](diagrams/s1-2-art-pretend.svg)

So there are two machines stacked on top of each other — the pretend one I built, and the real one it runs on. Hold on to that picture. The rest of this series is about what that real one is actually doing.

### One addition, two machines

To make that concrete, follow a single addition — `2 + 3` — through both.

**In my VM**, the bytecode has already pushed `2` and `3`, and the next instruction is `ADD`. Here's the part of Cecile's VM that runs it, lightly trimmed:

```rust
loop {
    match self.read_u8() {        // fetch: read the next byte, move ip forward
        op::ADD => self.op_binary_add(),
        op::MUL => self.mul(),
        // ...one arm for every instruction
    }
}

fn op_binary_add(&mut self) {
    let b = self.pop();           // 3
    let a = self.pop();           // 2
    self.push((a.as_number() + b.as_number()).into());   // 5
}
```

Fetch is `read_u8`. Decode is the `match`. Execute is `op_binary_add`: pop two values, add them, push the result. That's one bytecode instruction — and every line of it is ordinary Rust, which means it all becomes *real* machine instructions that the real CPU runs. Reading the byte, jumping to the right arm, two pops, a push: one `ADD` in my VM costs the real CPU a whole handful of instructions. And in the middle of it, that `a + b` is itself compiled to the CPU's own add instruction (a floating-point one, because Cecile's numbers are 64-bit floats).

**In the real CPU**, the same addition is one instruction. Say `2` is already in a register called `eax`, and the next instruction is `add eax, 3`. In memory that's just three bytes: `83 C0 03`. The CPU's instruction pointer — on x86-64, a register called `rip` — points at them. The chip fetches the bytes, its decoder recognises "add 3 to `eax`", a circuit called the ALU does the addition, `eax` now holds `5`, and `rip` moves on to the next instruction. No loop, no `match`, no program running it. The fetch–decode–execute cycle is wired into the silicon.

![The same addition, through both machines.](diagrams/s1-2-add-two-ways.svg)

Same addition, same answer. But in my VM, a single `ADD` is a little program running on the real CPU. In the real CPU, `add` is the bottom: there's nothing underneath it but circuits.

Let me prove the whole thing works by tracing our six instructions by hand.

## Watch the stack compute 2 + 3 * 4

We run the bytecode top to bottom. I'll draw the stack after each step, top on the right.

```
start          stack: [ ]

PUSH 3         stack: [ 3 ]
PUSH 4         stack: [ 3, 4 ]
MUL            → pop 4, pop 3, push 3*4      stack: [ 12 ]
PUSH 2         stack: [ 12, 2 ]
ADD            → pop 2, pop 12, push 12+2    stack: [ 14 ]
STORE x        → pop 14 into variable x      stack: [ ]   (x = 14)
```

![The same trace as a picture: the stack after each instruction, with the top of the stack up.](diagrams/s1-2-stack-trace.svg)

Look at what just happened. Nowhere did the machine "know" about precedence, or trees, or the fact that multiplication comes first. **The order was already baked into the instruction list** — the compiler put `MUL` before `ADD` back when it walked the tree. The VM understands nothing. It just pushes and pops in the order it's told, and the right answer falls out the bottom.

The first time I watched my own stack do this — printing itself after every instruction — was the moment the whole thing stopped feeling like magic. It's just a pile of numbers and a loop.

## Functions: the stack grows up

Guessing games need functions, and functions are where the stack earns its keep.

When Cecile calls `guessGame()`, the VM can't just jump into it and forget where it came from — it has to come *back* afterward. So it pushes a little bookkeeping bundle onto the stack first: where to return to, and room for the function's local variables. That bundle is called a **call frame**. Call a function, push a frame. Return, pop the frame — and the finger jumps right back to where it left off.

Nest calls and the frames stack up on top of each other. And now the scariest phrase in programming stops being scary: a **stack overflow** is *literally* this stack growing taller than the room you gave it — usually because a function keeps calling itself and never returns, piling up frames forever. It's not a mysterious error. You can see it. It's this exact pile, hitting the ceiling.

![Each call pushes a frame; a function that never returns keeps piling frames up until they hit the ceiling.](diagrams/s1-2-call-frames.svg)

## The part nobody warns you about: cleaning up

Here's where the tutorial stopped being comfortable.

In Cecile, you can write `let name: string = "Bataa"` and never think about where those letters live. But *somewhere*, the VM had to find a free patch of memory, put the string there, and remember it. And when that string is no longer used by anyone — the function returned, the variable's gone — that memory has to be handed back, or the program slowly eats all the memory on the machine and dies.

Here's the trap I didn't see coming. I was writing Cecile's VM in Rust, and I assumed Rust's famous memory safety would just handle this for me. It doesn't — not for *this*. Rust cleans up its own values automatically, but the objects a *Cecile* program creates at runtime — strings, arrays, objects that can point at each other and form cycles — live in a heap the VM manages by hand. As far as Rust is concerned, that's just one big blob of memory I'm responsible for. Which Cecile object is still alive is a question only Cecile can answer. So I had two options:

- **Make the Cecile programmer do it** (like C: you allocate, you free, you get it wrong, everything crashes).
- **Do it automatically** — which means writing a **garbage collector** for the guest language's objects.

I wanted Cecile to feel like JavaScript, where you never think about this. So: garbage collector it was.

### How a garbage collector actually thinks

The idea is simpler than its reputation. A garbage collector answers one question, over and over: **"Is this piece of memory still reachable?"**

The trick is called **mark-and-sweep**, and it's exactly what it sounds like:

1. **Mark.** Start from the things you *know* are alive right now — the variables on the stack, the current call frames — and follow every reference outward. That string, the array it's in, the object that array belongs to. Paint everything you can reach.
2. **Sweep.** Walk through *all* the memory you ever handed out. Anything you didn't paint is unreachable — no living variable can ever touch it again — so it's garbage. Free it.

That's the whole algorithm. Reachable means alive; unreachable means dead; you can prove which is which by just... following the arrows from the stack.

![Mark follows references from the stack and paints what it reaches; sweep frees whatever stayed unpainted.](diagrams/s1-2-mark-sweep.svg)

I'll be honest: getting this right was the hardest, buggiest week of the whole project. Free something too early and your program reads garbage and crashes in a way that makes no sense. Free it too late and you leak. But when it finally worked — when Cecile could churn through thousands of strings in a loop and hold steady instead of ballooning — that felt like more of an achievement than getting the language to run in the first place.

![](diagrams/s1-2-art-gc-week.svg)

## Step back: what did we just build?

A whole language runtime, and it fits in your head:

- A **compiler** that turns your code into a flat list of bytecode (last post).
- A **stack** that holds values while it computes.
- A **loop** that fetches each instruction and acts on it — a tiny software CPU.
- **Call frames** that let functions call each other and come back.
- A **garbage collector** that quietly reclaims what you stop using.

That's not a toy version of how JavaScript or Python works. Structurally, it *is* how they work. The real ones add a thousand optimizations on top — the biggest being **JIT compilation**, where the VM notices the hot parts of your program while it runs and compiles *those* down to real machine code on the fly — but the beating heart is the loop and the stack you just watched.

## And yet — I still hadn't touched the metal

Cecile now had everything: it lexed, parsed, compiled, ran, and cleaned up after itself. By every reasonable measure, it was done. A real language.

But go back and reread that last section. "A tiny software CPU." "Compiles down to real machine code." I kept writing sentences like that and gliding right past them. My VM is a software CPU — running on top of a *real* CPU. My JIT would compile to machine code — but what *is* machine code? Every explanation I gave myself ran out at the same place, one floor further down than I could see.

I had built a machine inside my machine. And I still couldn't tell you what the machine at the very bottom actually does with a few letters.

![](diagrams/s1-2-art-bottom.svg)

So I stopped adding to Cecile. Cecile was a language that *runs* — but always in software, always inside a VM I controlled, never touching the silicon. If I wanted the real answer, I needed a different kind of language. One that doesn't run on a cozy VM at all, but compiles all the way down to the instructions the bare chip eats.

I needed to build a language that *compiles*. And I wanted its keywords to be in my own language. That language became **Mon** — the six lines at the very top of Part 1.

## One floor down

That's where this stops being about Cecile, and starts being about the metal.

New language, new book, and this time the code compiles all the way to the bare chip. We're going down — through a real compiler, past LLVM (and why I skipped it), into assembly and the CPU itself, all the way to the syscalls and linkers where a program finally meets the operating system.

**What does a language look like when there's no VM left to hide behind?**
