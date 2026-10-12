# How a Program Talks to the Outside World

*Building my own programming language — Season 2: To the Metal · Part 4: Syscalls*

My guessing game prints `бага байна` on the screen. I had just spent a whole post proving that should be impossible.

![](diagrams/s2-4-art-wall.svg)

Because here's what I'd learned: the CPU's entire vocabulary is holding numbers in a few registers, doing arithmetic, comparing, and jumping. That's it. There is no instruction that puts a letter on a screen. No register is wired to the keyboard. A program, by itself, can *only* move numbers around inside its own box — and yet my program clearly reaches out and touches the world.

So how does it ever escape the box? The answer is that it doesn't — it **asks something that can**. That something is the operating system, and the way you ask is a **syscall**. This is the exact seam where "a program" meets "a computer," and once you see it, a dozen mysterious things click into place at once.

## Your program lives in a padded cell

Here's the setup nobody told me, stated plainly: **your program is not allowed to touch the hardware.**

Not the screen, not the disk, not the network card, not another program's memory. The CPU literally runs in two modes — a locked-down **user mode** for normal programs, and a privileged **kernel mode** for the operating system — and your code runs in user mode, where the dangerous instructions simply aren't available to it.

This sounds like a restriction. It's actually the only reason computers are usable. Because your program can't touch the hardware directly, a crashing app can't take down the whole machine, and one program can't secretly read another's memory. The operating system is the one adult in the room with the keys, and everybody else has to ask.

So printing to the screen isn't something your program *does*. It's a favor it *requests*.

## A syscall is asking the kernel for a favor

A **syscall** (system call) is how a user-mode program asks the kernel to do something it's not allowed to do itself. "Please write these bytes to the screen." "Please read a key from the keyboard." "Please open this file." The program hands over the request; the kernel, with its privileges, carries it out and hands back the result.

The mechanism is beautifully blunt. To ask Linux to write to the screen, you put some numbers in specific registers and run one special instruction:

```asm
    mov   rax, 1        ; syscall #1 = "write"
    mov   rdi, 1        ; arg 1: where to write — 1 means "the screen" (stdout)
    mov   rsi, msg      ; arg 2: the address of the bytes to write
    mov   rdx, 12       ; arg 3: how many bytes
    syscall             ; hand control to the kernel — "do it"
```

Read it like a form you're filling out. `rax` says *which* favor (number 1 is "write"). The other registers are the arguments: write *what*, to *where*, *how many* bytes. Then the `syscall` instruction is the doorbell — it hands control across the boundary into kernel mode. The kernel reads your form, actually pushes the bytes to the screen using powers your program doesn't have, and returns.

![The program fills in registers in user mode, the syscall instruction crosses into kernel mode, and the kernel does the write and hands the result back.](diagrams/s2-4-syscall-boundary.svg)

That's it. That's how `мөр_хэвлэх("Өдрийн мэнд")` ultimately reaches your eyes. Somewhere at the bottom, after all the layers, it becomes exactly this: fill in some registers, ring the bell, let the kernel do the thing you're not allowed to.

## This is the *real* bottom of "hello world"

Let me connect the whole descent, because this is the floor I'd been chasing since Season 1.

When my guessing game prints a line, here's the full fall:

1. `мөр_хэвлэх("бага байна")` — my language.
2. → compiles to assembly: load the address of the bytes, set up registers.
3. → which sets up a **`write` syscall**.
4. → the `syscall` instruction crosses into the **kernel**.
5. → the kernel talks to the actual screen hardware.

![The full fall from my language down to the screen: three steps in user mode, then the syscall instruction crosses into the kernel.](diagrams/s2-4-descent.svg)

Every `print` in every language you've ever used bottoms out here. Python's `print`, JavaScript's `console.log`, C's `printf` — follow any of them down far enough and you hit a `write` syscall crossing from user mode into the kernel. There is no other way out of the box. This one narrow doorway is how *all* software touches the world.

That realization was the quiet climax of the whole project for me. "How does a few letters become something real?" The honest answer: the letters become numbers, the numbers become instructions, the instructions fill in a form, and a syscall rings the kernel's doorbell.

## How do I actually *see* this happening?

At this point I didn't want to take the book's word for it. I wanted to *watch* my program make these calls. And Linux has a wonderful tool for exactly that: **`strace`**, which prints every syscall a program makes, live.

Run any program under it and the box goes transparent:

```
$ strace ./guess
...
read(0, "42\n", 1024)              = 3
write(1, "\321\201\320\260...", 20) = 20
...
```

There it is, in the open: my program called `read` to get the guess from the keyboard (`0` is stdin), and `write` to print the result (`1` is stdout). Every door my program opens to the outside world, `strace` shows you, one line each. The first time I ran my own compiled program under `strace` and watched the `write` calls scroll by — the exact calls I'd set up in assembly — the abstraction was completely gone. I could *see* my language talking to the kernel.

![](diagrams/s2-4-art-see.svg)

If you learn one tool from this whole series, make it `strace`. It turns "the program does something" into a literal, readable list of every favor it asks the system for.

## But when it breaks, `strace` isn't enough

`strace` shows you the *doors* a program opens. It doesn't show you what's happening *inside* — the registers, the values, the exact line where things go wrong. And plenty went wrong. My compiler would emit assembly that crashed with no explanation, or computed the wrong number, and `strace` just showed me a program calling `write` with garbage. It told me *that* something was wrong, never *where*.

To see inside a running program — to freeze it mid-instruction, peek at the registers, and step forward one line at a time — I needed a different, almost magical kind of tool. A debugger. And I had no idea how something could reach *inside* another running program and stop it in its tracks.

## One floor down

Next we pick up the single most useful skill I gained from this whole project: driving a debugger, and understanding the genuinely surprising trick that lets one program freeze, inspect, and puppeteer another.

**How can one program freeze another one mid-instruction?**
