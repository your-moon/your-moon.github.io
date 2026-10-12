# The Last Mile: From a File on Disk to a Living Process

*Building my own programming language — Season 2: To the Metal · Part 7 (Finale)*

I typed `./guess`, pressed Enter, and my program printed a line — and a question I'd been dodging finally had nowhere to hide.

Because if my program is dynamically linked, then `printf` is *not inside it*. My compiled file just carries a note — "find `printf` in the shared libc, later." But a file on disk is inert. It doesn't do anything. So in the sliver of time between that Enter key and the first instruction actually running, someone has to read those notes, track down the shared libc, load it into memory, and fill in every address my linker left blank.

This post is about that someone, and that *when*. It's the final floor of the whole descent — the instant a dead file becomes a live process. And once we hit the bottom, we're going to climb all the way back up, and I'll show you the entire fall in one piece.

## A program on disk is not running yet

Start with the thing I'd always blurred together: a **program** and a **process** are not the same thing.

A program is a file — bytes on your disk, patient and dead. A process is that program *alive* in memory, with a slice of the CPU, actually executing. Running a program means turning the first into the second, and that transformation is a real, active job that something has to perform. It doesn't just happen.

When you run `./guess`, you're really asking the operating system: *take this dead file and bring it to life.* The kernel obliges. It carves out memory for the new process, copies the program's instructions in, sets up the stack — and then, for a dynamically-linked program, it does *not* jump straight into your code. It jumps somewhere else first.

## The dynamic linker: a program whose job is to finish your program

Here's the surprise that tied the whole series together for me. Before your first line runs, the kernel hands control to a small, special program called the **dynamic linker** (on Linux, `ld.so`). Its entire purpose is to finish the job the regular linker deliberately left half-done.

Remember the trade from Part 6: dynamic linking kept your binary thin by *not* copying `printf` in, leaving a promise to resolve "later." The dynamic linker is *later*, arriving. It runs *inside* your process, at startup, before `main`, and it sprints through a checklist:

1. Read the notes: which shared libraries does this program need? (libc, and maybe others.)
2. Find each one on the system and load it into the process's memory.
3. Walk every unresolved promise — every `call printf` my compiler left blank — and patch in the real address, now that libc is loaded and it knows where `printf` actually sits.

Only when every promise is kept does the dynamic linker step aside and let *your* code run. By the time `main` starts, the holes are filled. `printf` has a real address. The program is whole.

![After Enter, the kernel sets up the process, then the dynamic linker loads libc and patches every call printf before main runs.](diagrams/s2-7-exec-path.svg)

## You can watch it decide

And you can see the whole guest list before the program even starts. The `ldd` command shows you exactly which shared libraries a program will demand at load time:

```
$ ldd ./guess
    linux-vdso.so.1
    libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6
    /lib64/ld-linux-x86-64.so.2
```

Read it straight: my little guessing game depends on `libc.so.6` (there's the source of `printf`), and on `ld-linux-x86-64.so.2` — *the dynamic linker itself*, listed as a dependency because it's the thing that will load everything else. Running `ldd` on my own compiled program and seeing it name libc as a runtime dependency was the last click. My program truly did not contain `printf`. It contained a *promise* to go find it, and `ld.so` is who keeps that promise, at the last possible second, every time you run it.

## The whole fall, in one piece

We've reached the bottom. So let me do the thing I've wanted to do since Season 1: trace `мөр_хэвлэх("Өдрийн мэнд")` — one line, one greeting — all the way down, with no black boxes left.

1. **The language.** `мөр_хэвлэх("Өдрийн мэнд")` — my own keywords, in my own alphabet.
2. **Lexer → parser.** The text becomes tokens, then an AST — a tree that knows what it means. *([S1·1](/s1-1-interpreter/))*
3. **The compiler.** Instead of running the tree, my compiler writes it down as instructions for a real CPU. *([S2·1](/s2-1-compiler/))*
4. **Tacky, my own IR.** The tree first becomes a flat middle language I built by hand — where an optimizer folds constants and trims waste — before it's lowered toward real hardware. (No LLVM; I chose to do this part myself.) *([S2·2](/s2-2-llvm/))*
5. **Assembly.** They become `mov`, `add`, `cmp` — the CPU's tiny real vocabulary, shuffling numbers between sixteen registers. *([S2·3](/s2-3-assembly/))*
6. **The syscall.** Printing isn't something the program can do, so it fills in registers and makes a `write` syscall, ringing the kernel's doorbell. *([S2·4](/s2-4-syscalls/))*
7. **libc + the linker.** That `write` lives in code I never wrote — libc — stitched into my program by the linker's kept promises. *([S2·5](/s2-5-gdb/), [S2·6](/s2-6-linking/))*
8. **The dynamic linker.** At the instant I run it, `ld.so` loads libc and fills in the last blank addresses, turning my dead file into a living process. *(this post)*
9. **The kernel → the screen.** The kernel takes the `write`, uses powers my program isn't allowed, and pushes the bytes to actual hardware.
10. **`Өдрийн мэнд`** appears on the screen.

Ten steps. That's the whole distance from a greeting in my language to letters made of light. When I started, every one of those arrows was a mystery I'd have waved away with "and then, somehow, it runs." Now there's no *somehow* left in the chain. That was the entire point.

## What three years actually bought

Go back to the six lines at the very top of Part 1:

```
extern функц мөр_хэвлэх(м мөр) -> хоосон {}

функц үндсэн() -> тоо {
    мөр_хэвлэх("Өдрийн мэнд");
    буц 0;
}
```

Six lines. One greeting. When I first wrote something like it, I could make it print but I couldn't tell you a single true thing about *how*. Now I can follow it from my own keywords, through two languages I built, down through a compiler, an optimizer, a CPU's bare instructions, the kernel boundary, other people's code stitched into mine, and a linker that finishes the job as the program draws its first breath.

That's what the three years bought. Not a job-interview trophy, though I got that too. It bought the disappearance of the word *somehow*. The machine I use every day became a stack of understandable floors, each one a program doing an almost embarrassingly simple job, very fast, handing off to the next.

## Thank you for coming down here with me

I have to tell you: I loved every part of this.

I started as a second-year student who just wanted something to put on a résumé, and somewhere along the way that stopped being the point. Every floor I opened was more fun than the last. The night the bytecode stack first printed itself. The first `mov` my own compiler wrote. Watching my program ring the kernel's doorbell under `strace`. Booby-trapping an instruction with gdb and catching a bug I'd chased for days. Reading `ldd` and finally understanding where `printf` had been hiding the whole time. Three years, two languages — Cecile and Mon — and a machine that used to be magic and now feels like an old friend I've taken apart and put back together.

And neither language is finished, which is the best part. There's a real type checker to sharpen, better error messages to write, more of the standard library to build. Maybe someday an LLVM backend — not because I have to, but because now I actually understand what I'd be trading away, and that's a choice I'm finally qualified to make.

But mostly I want to say this to *you*. If you read this far — through interpreters and stacks and IR and registers and syscalls and linkers — thank you. Genuinely. Writing this was me getting to relive the whole descent, and it was so much better having someone along for it.

So here's the only thing I really want you to take with you: **the magic isn't real. It's just floors.** Every layer of the machine you use every day is a program doing a small, honest job, and every single one is something you're allowed to open up and read. Pick one that scares you a little. Open it. I promise there's just another understandable floor underneath — and it's a wonderful way to spend three years.

See you at the bottom of your own rabbit hole. 🙏

![](diagrams/s2-7-art-just-floors.svg)
