# Reading Code You Didn't Write

*Craft · Part 3 of 4: Seeing bad design, and proposing a better one*

Netscape threw away its code to start over, and then went almost three years without a major release while its market share plummeted. Every engineer who opens a codebase that's a few years old feels the same pull that led there: *this is a mess, we should rewrite it.*

Joel Spolsky wrote the classic warning about that feeling in 2000. He calls rewriting from scratch "the single worst strategic mistake that any software company can make", and gives a reason that stung when I read it: you think the old code is a mess because of "a cardinal, fundamental law of programming: It's harder to read code than to write it."

![](diagrams/craft-3-art-mess.svg)

So how do you tell a real design problem from "I didn't write this"? That is the first skill, and it comes before fixing anything. The second is proposing something better without breaking everything that depends on the old version. This post covers both. It doesn't cover the cases where a rewrite is the right call.[^1]

## Step 1: Where does it actually hurt?

Start with the history, not the code. Reading is slow and feels like progress; the log is quick and tells you where the pain is.

Complexity shows up as **change amplification**: one small change that needs edits in many places. You can count it: take the last few ordinary changes from `git log` (a bug fix, a small feature) and count the files each one touched. Is nine files too many? That depends on the change, because a one-line behaviour change that touched nine files is a symptom, and a big feature that touched nine isn't.

Which files deserve your reading time? *Code Complete* says to aim refactoring at two kinds of module. The first is **error-prone modules**: the code your team is afraid of. The second is **high-complexity modules**. McConnell cites one study, Henry and Kafura in 1984, where program quality improved when maintenance programmers focused on the most complex modules.[^2]

![A hotspot is where churn, bug history and complexity overlap: usually a handful of files, not the whole codebase.](diagrams/craft-3-hotspots.svg)

The place where all three overlap (changes often, breaks often, hard to follow) is where to look.

Read only those files. In my experience that is five or ten files, not the whole codebase. How about the rest? It may look ugly, but if nobody changes it and it doesn't break, it costs you nothing.

## Step 2: What does bad design look like, specifically?

It looks like a short list of named patterns, and you read the hotspots with that list in hand instead of a vague feeling.

> "Any fool can write code that a computer can understand. Good programmers write code that humans can understand."
>
> — Martin Fowler, *Refactoring* (1999)

Ousterhout ends his book with fourteen **red flags**. I find them easiest to use in three groups.[^3]

![Ousterhout's fourteen red flags, grouped by where they show up: in interfaces, in knowledge, and in words.](diagrams/craft-3-red-flags.svg)

**In the interfaces:**
- **Shallow module**: the interface is nearly as complicated as what it does.
- **Pass-through method**: a method that just forwards to another with the same arguments.
- **Overexposure**: to use the common feature you have to learn the rare ones.

**In where knowledge lives:**
- **Information leakage**: one design decision shows up in several modules.
- **Temporal decomposition**: code split by the *order* things happen in (read, then parse, then save) instead of by what each part knows.
- **Special-general mixture**: one-off special cases baked into general-purpose code.
- **Repetition**: the same non-trivial code in many places.
- **Conjoined methods**: you can't understand one without reading the other.

**In the words:**
- **Vague name**, or a name that's **hard to pick**, which usually means the thing does several jobs.
- **Hard to describe**: the honest description is long.
- **Comment repeats code**, or the **interface comment describes the implementation**.
- **Nonobvious code**: you can't tell what it does by reading it.

*Code Complete* adds a list of refactoring smells that catches different things. Three I now look for every time:
- **Parallel modifications**: every time you add a payment method, you edit the same three `switch` statements.
- **Tramp data**: a parameter passed through five functions that don't use it, just to reach the sixth.
- **Setup and teardown around a call**: callers always do the same thing before and after calling a function, which means the function's interface is wrong.

One more lens from McConnell: for each module, try to name **what it hides**. If you can't name a secret, the module is probably shallow. This is Parnas's information hiding from Part 1, used as a test.

## Step 3: How do you understand a design nobody explained to you?

You draw it. Michael Feathers' *Working Effectively with Legacy Code* has the best tools I've found for this, and they are all deliberately low-tech.

**The feature sketch.** For a big class, draw every field and every method, and an arrow from each method to the fields it uses. Clusters appear: groups of methods that only touch their own few fields. Each cluster is a class hiding inside the big one, and the arrows that cross between clusters become its interface. Feathers also notes that a class with many private methods usually has a hidden class inside, and that wanting to test a private method is a sign it belongs somewhere else.

![A feature sketch: methods point to the fields they use; separate clusters are classes hiding inside the big one.](diagrams/craft-3-feature-sketch.svg)

**Tell the story of the system.** Explain the system in two or three sentences, as if to a new colleague. Then look at the design, or at your proposed change, and ask whether it makes that story *more true or less true*. The design that keeps the story true is usually the better one.

**Scratch refactoring.** Make a throwaway branch and refactor freely, without tests, purely to understand the code. Learn from it, then delete the branch. Feathers is firm about this: never merge it, and don't trust its result. Its only job was to teach you.

**Mark up a listing.** Print the hard function, or open it in an editor you can annotate. Mark each responsibility, then mark everything a change you're planning would affect. That set of marks is exactly the list of things your tests need to cover.

## Step 4: What goes in a proposal besides "this is bad"?

Two things: evidence and a path. A proposal that says "this is bad, let's redo it" is the Netscape plan in smaller type.

> "for each desired change, make the change easy (warning: this may be hard), then make the easy change"
>
> — Kent Beck, on Twitter (2012)

Here is the shape I'd use. It has five parts.

**The problem, with evidence.** "Adding the last two payment providers touched 9 and 11 files. Three of those changes were in `switch` statements in the order, refund and report modules (parallel modifications). Each provider's field names leak into the `Order` type (information leakage)." Numbers and red-flag names, not adjectives.

**The story.** The two-sentence description of what this part of the system *should* be.

**Two designs, really different.** This is Ousterhout's **design it twice**. For a provider integration, for example:
- *Design A*: one `PaymentProvider` interface (authorize, capture, refund, parse webhook), one implementation per provider, and the provider's vocabulary never leaves its own package.
- *Design B*: a table of providers, each row holding endpoints, field mappings and a few hook functions, run by one generic engine.

Which one wins? Compare them on one question first: **which is simpler for the code that calls it?** Then on what each hides, and on how easy the *next* provider will be.

**The migration path.** How to get there without stopping work. Most proposals forget this part, and it is what the rest of this post is about.

**How you'll know it worked.** "The next provider touches only its own package plus one registration line."

![A design proposal: evidence of the problem, the system's story, two genuinely different designs compared on caller simplicity, a migration path, and a way to verify.](diagrams/craft-3-proposal.svg)

## Step 5: How do you change code that has no tests?

You make it testable first, in small mechanical steps. Feathers' definition of legacy code is the one that reframed everything for me:

> "Code without tests is bad code. It doesn't matter how well written it is…"
>
> — Michael Feathers, *Working Effectively with Legacy Code*

**"Legacy code is simply code without tests."** Not old code, not ugly code. Code you can't change safely, because nothing will tell you if you broke it.

That is the whole problem in one sentence, and it is why Step 5 starts with tests and not with the change.

He names the two ways people change code. **Edit and Pray**: plan carefully, edit, then poke around hoping nothing broke. He calls it pretty much the industry standard. And **Cover and Modify**: first cover the code with tests, then change it with a safety net.

The catch is obvious: to add tests you often have to change the code first, which is exactly what you were afraid to do without tests. His way out is a five-step algorithm:

![The legacy code change algorithm: find the change points, find where to test, break dependencies, write tests, then change and refactor.](diagrams/craft-3-change-algorithm.svg)

1. **Find the change points**, where your edit will land.
2. **Find where you can test**, the places where the effects of that change can be seen.
3. **Break dependencies**, just enough to get the code into a test. Do it carefully and mechanically, because there are no tests yet.
4. **Write characterization tests.**
5. **Make the change and refactor**, with the tests running after every small step.

> "Programming is the art of doing one thing at a time."
>
> — Michael Feathers, *Working Effectively with Legacy Code*

**Characterization tests** are the clever part. You don't test what the code *should* do. You test what it *actually* does today. Write an assertion you know is wrong, run it, read the real value from the failure message, and paste it in. Repeat for each input that matters. If the real behaviour surprises you, keep the test and flag it. Don't silently "fix" it, because something might depend on it.

How do you get code into a test at all? You need a **seam**: in Feathers' words, "a place where you can alter behavior in your program without editing in that place." A constructor parameter is a seam. An interface is a seam. A function you call directly with `new` inside a method is *not*. You can't swap it without editing that line, so the first move is often to turn that hidden choice into a parameter while keeping the old call working.

What if there is truly no time to get the old code under test? Feathers offers two escape hatches:
- **Sprout**: write the new behaviour as a new, fully tested function or class, and add a single line to the old code that calls it.
- **Wrap**: rename the old method and put a new one with the old name in front of it, which runs your new code and then the old.

Both get new code in with tests. But that one line calling it isn't tested, so review it by eye.

## Why not rewrite it anyway?

Because a rewrite stops the world, and there is a way to replace a system that doesn't. What does a big redesign look like in practice? Martin Fowler named the pattern after a tree, the **strangler fig**: a vine that grows around a host tree until it can stand on its own.

> "Remember, code is your house, and you have to live in it."
>
> — Michael Feathers, *Working Effectively with Legacy Code*

You build new pieces beside the old system, move behaviour across a piece at a time, and the old system shrinks. Fowler says the "simple replacement" plan, by contrast, goes "down in flames most of the time".

![The strangler fig: new code grows beside the old system and takes over its behaviour piece by piece, while the system keeps running.](diagrams/craft-3-strangler.svg)

The codebases I studied all do some version of this:
- Tailscale's contributor docs say new functionality belongs in a separate feature package, and admit openly that the codebase is "half-migrated".
- excalidraw is gradually moving logic out of its 12,032-line `App.tsx` into separate per-capability files.
- ripgrep labels one of its own test files as grouped "in a haphazard manner. Try not to add more."

Did any of them stop to rewrite? None. They put a fence around the mess and pointed all new work away from it.

*Code Complete* states the rule underneath all of it, the **Cardinal Rule of Software Evolution**: every change should improve the program's internal quality. Ousterhout puts it more bluntly: "If you're not making the design better, you are probably making it worse."

## One floor down

You can design well, test honestly, and improve old code safely, and the system can still go down at 5 a.m. Not because of a bug in the logic, but because a firewall quietly dropped an idle connection, or a marketing email sent everyone to the same page at once.

That's the last floor: code that doesn't just work, but survives the real world.

[^1]: Spolsky's essay is an argument from one famous failure, not a measurement across many rewrites. Treat "never rewrite" as his opinion, a well-argued one, and not a law.
[^2]: I know Henry and Kafura's 1984 study only through McConnell's summary, so how strong the result is rests on his reading.
[^3]: The fourteen flags are Ousterhout's. The three groups are mine, and the diagram uses them.
