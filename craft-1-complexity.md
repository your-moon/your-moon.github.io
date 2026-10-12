# The Only Enemy Is Complexity

*Craft · Part 1 of 4: Design*

There's a file in tailscale's codebase called `local.go` that is 9,287 lines long and holds a single type with 409 methods. Tailscale is one of the most carefully written Go projects I know of, and their own contributor docs call this file a problem. They are migrating code *out* of it, one feature at a time.

![](diagrams/craft-1-art-hub.svg)

That file stuck with me because it answers a question I'd never been able to answer: what is "bad code", actually? `local.go` isn't wrong: it works, and it ships to millions of machines. Yet everyone who touches it pays a tax.

So I went looking for the answer. I read three books on software design cover to cover: John Ousterhout's *A Philosophy of Software Design*, Steve McConnell's *Code Complete*, and *The Pragmatic Programmer*. Then I opened seven codebases that people point to as good engineering (ripgrep, axum, rust-analyzer, tailscale, redis, SQLite, excalidraw) and looked at how they do it. This post keeps what the books agree on and what the code confirmed.

There is one enemy. Every good habit below is a way of fighting it.

## What is complexity, exactly?

> "Managing complexity is the most important technical topic in software development."
>
> — Steve McConnell, *Code Complete*

Ousterhout defines it in one sentence: complexity is *anything about the structure of a software system that makes it hard to understand and modify*. Read what it leaves out. It doesn't say "lots of code" or "clever algorithms". It says hard to understand and modify, judged by whoever has to do it next.

McConnell, writing years earlier, calls managing it **Software's Primary Technical Imperative**. Two very different books land on the same word.

How do you know it's there? It shows up in three ways:

![The three symptoms of complexity: change amplification, cognitive load, and unknown unknowns, which is the worst.](diagrams/craft-1-symptoms.svg)

**Change amplification.** A simple change needs edits in many places. You change a colour and touch twelve files.

**Cognitive load.** How much you must hold in your head to make a change safely.

**Unknown unknowns.** You can't even tell what you need to know. You make the change, it compiles, the tests pass, and something unrelated breaks in production. This is the worst of the three, because nothing warns you.

It has two causes: **dependencies** (code that can't be understood or changed in isolation) and **obscurity** (important information that isn't obvious).

Complexity is also incremental. No single shortcut creates it. It's a thousand small decisions, each reasonable on its own: one more method on the big type, one more flag, one more special case. That is how you get a 9,287-line file that nobody chose to write.

## Why should a module be deep?

> "The best modules are those whose interfaces are much simpler than their implementations."
>
> — John Ousterhout, *A Philosophy of Software Design*

If I could keep only one idea from the books, it would be this: **modules should be deep.**

A module (a function, a class, a package, a service) has an *interface*, which is everything a caller must know to use it, and an *implementation*, which is everything it hides. A deep module gives you a lot of function through a small interface. A shallow module makes you learn almost as much as it saves you.

![A deep module is a narrow interface over a large implementation; a shallow module is a wide interface over a thin one.](diagrams/craft-1-deep-vs-shallow.svg)

Ousterhout's favourite example is the Unix file API. Five calls (`open`, `read`, `write`, `lseek`, `close`) hide disk blocks, caching, permissions, devices, and file systems you'll never think about.

ripgrep has the same shape. Its `Searcher` has a handful of entry points: search a path, a file, a reader, a slice. Behind them it decides on its own whether to memory-map the file, read it whole, or stream it through a rolling buffer. The caller never chooses (ripgrep only logs which strategy it picked), and because the strategy is hidden, ripgrep can change it without touching a single caller.

The opposite is something I used to think was *good* style: splitting everything into tiny functions and tiny classes. Ousterhout calls it "classitis". Each tiny piece has its own interface to learn, and the pieces only make sense together. You haven't removed complexity. You've spread it across more doors.

Is a long function always a bad one? No. **Length is never, by itself, a reason to split.** Split when the result is *deeper*.

## What should I hide?

> "We propose instead that one begins with a list of difficult design decisions or design decisions which are likely to change. Each module is then designed to hide such a decision from the others."
>
> — David Parnas, *On the Criteria To Be Used in Decomposing Systems into Modules* (1972)

McConnell asks the best question in either book: **"What should I hide?"** He says asking it settles a surprising number of hard design decisions.

Every module should own a few design decisions (a file format, a protocol, an ID scheme, a business rule) and keep them out of its interface. The failure is **information leakage**: the same decision showing up in two places.

The common version doesn't look like a mistake. You write a `Reader` class and a `Parser` class, because reading and parsing feel like two steps. But both know the file format. Change the format and you edit both. Ousterhout calls this **temporal decomposition**: structuring code around the *order* things happen in, instead of around what each part knows. The fix is to put everything that knows the format in one place.

The codebases go further and use the *type system* to hide things. In tailscale, a node's private key is its own type with a hidden field, and it's deliberately impossible to compare with `==`. The comment says why:

```go
type NodePrivate struct {
	_ structs.Incomparable // because == isn't constant-time
	k [32]byte
}
```

You can't compare two keys with a timing leak, because the compiler won't let you. The rule isn't in a style guide that someone has to remember. It's *in the type*. Almost every codebase I read did this somewhere: the best rules turn a bug into a compile error.[^1]

## Who should pay for the hard part?

> "The complexity of software is an essential property, not an accidental one."
>
> — Fred Brooks, *No Silver Bullet* (1986)

Brooks says the complexity can't be removed. So the question is who carries it. The rule feels backwards at first: **a simple interface matters more than a simple implementation.**

Why? Because a module is written once and called from many places, so if something is hard, the module should absorb it. If it pushes the hard part onto its callers, by throwing an exception or adding a configuration option, every caller pays, forever.

redis shows this well. Its hash table sometimes has to grow, which means moving every entry to a bigger table. Doing that all at once would freeze the whole server, so redis does it *incrementally*, and each time you look something up or add something the table quietly moves a few more entries as a side effect, rather than stopping the world to do it in one go. Callers just call `dictFind` and `dictAdd`. They never learn that rehashing exists.

![redis hides incremental rehashing behind dictFind and dictAdd: each call moves a few buckets as a side effect.](diagrams/craft-1-pull-down.svg)

Configuration knobs follow the same logic. Every option you add is a decision you push onto someone else. Before adding one, try to compute the value yourself: a timeout from measured latency, a buffer size from available memory. If you must add a knob, give it a sensible default.

## Can you make the error impossible?

This idea surprised me most.

We're taught to detect and report every error. Ousterhout argues that this produces a flood of exceptions that every caller must handle. Error-handling code is also the code most likely to be wrong, because it rarely runs. He quotes a study that found more than 90% of catastrophic failures in distributed data-intensive systems were caused by incorrect error handling.[^2]

His fix: before you throw an error, ask whether you can **define the operation so the error can't happen**.

![Define errors out of existence: instead of "delete x" failing when x doesn't exist, define delete as "make sure x doesn't exist".](diagrams/craft-1-define-away.svg)

Take "delete this variable". It fails if the variable is missing. Define it instead as "make sure this variable doesn't exist", and if it's already gone, the job is done. Ousterhout calls failing here one of his biggest mistakes in designing Tcl.

Take a substring function that throws when the indexes are out of range. Return the characters that overlap the range instead. Python's slices work this way, and nobody misses the exception.

Take deleting a file that another program has open. Unix lets you: the name disappears at once, and the data stays until the last user closes it. Windows refuses, which is probably why you've had to hunt down "the process using this file".

redis does this in small ways everywhere. `sdsfree(NULL)` simply does nothing, so no caller ever writes `if (s != NULL)` before cleaning up.

Does this mean hiding real failures? No. A dropped network connection is something the caller genuinely needs to know about. The target is error cases you *invented* by how you happened to define the operation.

## Have you sketched it twice?

> "Simplicity does not precede complexity, but follows it."
>
> — Alan Perlis, *Epigrams on Programming* (1982)

This is arguably the cheapest technique in either book, and the one I skipped most often before: **for anything non-trivial, sketch at least two radically different designs before choosing one.**

Not two variations. Two different approaches, just their interfaces, compared on one question: which is simpler for the *caller*? Ousterhout says it takes an hour or two for a class. That is nothing next to the time you'll spend living with the result.

Why do smart people skip it? Ousterhout's answer stuck with me: they're used to their first idea being good enough. In big systems it rarely is.

## Can you write the comment first?

Both books reach this practice from different directions.

McConnell's version: write the routine in plain-language pseudocode, check it, turn each line into a comment, and fill in the code underneath. Ousterhout's version: write the interface comment (what the module does, what it hides, what each method promises) *before* writing any bodies.

The comment is a design test. **If the comment is hard to write, the design is wrong.** If describing a function takes a long paragraph, or you can't explain it without describing how it works inside, the interface is too complicated. You learn that in five minutes of writing instead of five days of coding.

Good comments say what the code can't: units, ranges, what `null` means, who owns a resource, *why* something odd is the way it is. SQLite is the best case I saw. Its pager file opens with thirteen numbered guarantees, followed by a state diagram that names which function performs each transition, so a reader can check any change against the list before touching the code. When a comment just repeats the code (`// Close closes the router`), delete it. I found that exact comment in tailscale. Even good codebases have them.

## Is good design just design that's easy to change?

> "There are two ways of constructing a software design: One way is to make it so simple that there are obviously no deficiencies and the other way is to make it so complicated that there are no obvious deficiencies."
>
> — C.A.R. Hoare, *The Emperor's Old Clothes* (1980 Turing Award lecture)

*The Pragmatic Programmer* squeezes all of this into one line: **good design is easier to change than bad design.** The authors call it ETC and argue that every other principle is a special case. DRY, for example, isn't about avoiding identical *text*. It's about every piece of *knowledge* having one home. Two functions with identical code that encode different business rules should stay separate.

Which brings me back to `local.go`. Tailscale's fix isn't a rewrite. Their docs say the preferred home for new functionality is a separate feature package. They admit the codebase is "half-migrated", and tell contributors not to feel obliged to finish the migration in one change. Every new feature goes *outward*. The hub shrinks slowly, and nobody stops shipping.

I can't tell from outside whether the hub will ever reach zero, and the docs don't promise it. That is what managing complexity looks like in practice: a direction kept every day, not a finished design.

## One floor down

Everything here is about *writing* code well. It says nothing about proving the code works, and I kept running into that gap in those seven codebases: even with good design, bugs still get in. When I looked at the tests meant to catch them, I found tests in respected projects that couldn't fail at all. A test named "supports 128-bit numbers" only ever tests the number 123.

How can a test pass while proving nothing, and how do you write ones that actually catch bugs?

[^1]: "Almost every" is my impression from seven codebases, not a count. I didn't tally how often each one does it.
[^2]: I'm repeating the figure as Ousterhout gives it. I haven't checked the study myself, and it covers one class of systems (distributed data-intensive ones).
