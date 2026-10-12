# Where Does `printf` Actually Come From?

*Building my own programming language — Season 2: To the Metal · Part 6: Linking*

Stepping through my own compiled program in gdb, I hit something I couldn't explain.

My guessing game calls `мөр_хэвлэх`, which deep down calls `printf` — the standard C printing function. And gdb happily walked me straight into `printf`'s code. Real, working code. Code I had never written, never copied in, never mentioned anywhere in my project. So where did it come from? Who put `printf` inside my program?

![](diagrams/s2-6-art-detective.svg)

The answer is a step in building software that I'd been benefiting from for years without noticing: **linking**. It's the stage that takes your code — full of references to functions you never wrote — and stitches in the actual code those references point to. Understanding it finally explained a pile of things I'd always found mysterious, including the single most common category of build error every programmer eventually hits.

## Your code is full of promises

Here's the thing I never appreciated. When my compiler translates `printf("hi")`, it does *not* produce the code for `printf`. It has no idea how `printf` works. Instead it emits something more like an IOU:

```asm
    call  printf      ; "call the function named printf" — wherever it is
```

That `call printf` is a **promise**, not an answer. My program is saying: "at this point, jump to a function called `printf`. I don't have it. Somebody find it and fill in the address later." My compiler produces a file full of these IOUs — its own code, plus a list of unresolved names it's counting on someone else to provide.

That "somebody" is the **linker**. Its whole job is to collect all the pieces of code — mine, plus libraries — and **resolve every promise**: find the real `printf`, figure out where it lives, and patch every `call printf` to point at it. Compiling turns your source into a piece with holes in it. Linking fills the holes.

![The compiler leaves a hole where printf goes; the linker finds the real printf in libc and fills it, or fails with undefined reference.](diagrams/s2-6-link-step.svg)

## Where the real code lives: my stdlib, and libc underneath

My language actually makes this promise *explicit*, in the source, with a keyword. To use the print function, a Mon program declares it up front:

```
extern функц мөр_хэвлэх(м мөр) -> хоосон {}   // extern fn print_line(m: string) -> void
```

That `extern` — "external" — is me writing the IOU by hand. It tells the compiler: *this function exists somewhere else; I promise to provide it at link time; just emit a `call` to it.* The real body of `мөр_хэвлэх` lives in my own little **standard library** (a `stdlib/` folder that ships with the compiler), and underneath *that*, when it actually needs to push bytes to the screen, it leans on the **C standard library** — **libc** — the collection of pre-compiled functions on every system that includes the code making the real `write` syscall from Part 4.

And the neat part: my compiler doesn't do the stitching itself. After it emits assembly, the final `gen` step *shells out to the system's C compiler* (`cc`) to assemble and link the program — which means my little language gets to borrow the exact same battle-tested linker and libc that C programs use. I wrote `extern функц мөр_хэвлэх`; `cc` found the real code and wired it in. Decades of working code, for free, in exchange for one honest promise.

And *how* the linker fulfills that promise turns out to be a real fork in the road, with consequences you can measure.

## Two ways to stitch: static vs dynamic

There are two ways the linker can fulfill your program's promises, and the difference matters enough that every programmer should be able to explain it.

**Static linking — bring your own copy.** The linker takes the actual `printf` code out of libc and *copies it into your program's file*. Your binary now physically contains `printf`, and every other library function it uses. The upside: your program is self-contained. Hand that one file to any compatible machine and it just runs — nothing else needed. The downside: it's fat. If `printf` is 50 KB and a hundred programs each statically link it, that's a hundred copies of the same 50 KB sitting on your disk and, worse, a hundred copies loaded into memory when they all run.

**Dynamic linking — share one copy.** The linker does *not* copy `printf` in. Instead it leaves a note: "at runtime, go find `printf` in the shared system copy of libc." That shared copy — one `libc.so` file — lives on the machine, and *every* dynamically-linked program borrows the same one. The upside: your program is small, and the whole system shares a single `printf` in memory instead of a thousand copies. The downside: your program is no longer self-contained. It *depends* on that shared libc being present and compatible on whatever machine it runs on.

![Static linking copies printf into the program file; dynamic linking leaves a note and every program shares one libc.so.](diagrams/s2-6-static-vs-dynamic.svg)

The trade-off in one line: **static is a fat, portable program; dynamic is a thin program that depends on its surroundings.** Most software on your machine is dynamically linked, because sharing one libc across everything is a huge memory and disk win. But when you want a binary that runs *anywhere* with zero dependencies, you reach for static.

## The error this finally explained

This is the payoff that made linking click for me forever. Every programmer, sooner or later, hits an error like this:

```
undefined reference to `printf'
```

For years I found that message baffling. Now it's completely transparent: **it's the linker telling you it couldn't keep one of your promises.** Your code has a `call printf` IOU, and the linker looked through every library you gave it and *never found the real `printf`* to fill in. An "undefined reference" is a promise with nobody to fulfill it — you forgot to link the library that contains it.

The moment you understand that compiling makes promises and linking keeps them, that entire class of error stops being mysterious and starts being obvious: *you asked for a function and didn't tell the linker where to find it.*

## But dynamic linking left a loose thread

Static linking I fully understood — the code is right there in my file, end of story. But go back and reread dynamic linking, because something doesn't add up.

If my program is dynamically linked, then `printf` is **not in my binary**. My file just contains a note that says "find `printf` in the shared libc, later." But *later when?* My program is just a file on disk full of these notes. At some point, between me double-clicking it and it actually running, *someone* has to read those notes, hunt down the shared libc, load it into memory, and finally fill in all those addresses my linker left blank.

Who does that? And when, exactly? That last handoff — from a file full of unfilled promises to a living, running process with every address resolved — is the very last step of the whole descent. It's where a program is finally, truly *born*.

## One last floor

We've come all the way down: language → compiler → IR → assembly → syscalls → the code that gets stitched in. One step remains, the one that happens at the last possible moment — the instant a file on disk becomes a running process, with the dynamic linker sprinting to fill in every borrowed address before your first instruction runs.

**What happens between pressing Enter and my program's first instruction?**
