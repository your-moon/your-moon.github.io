# Tests That Can Fail

*Craft · Part 2 of 4: Tests and debugging*

axum, the web framework a big chunk of the Rust world runs on, has a test called `supports_128_bit_numbers` that sends the number 123. If axum quietly broke 128-bit support tomorrow, the test would stay green.

Here is the whole test. It checks that a URL like `/u/{key}` can be read as a 128-bit integer:

```rust
let res = client.get("/i/123").await;
assert_eq!(res.text().await, "123");

let res = client.get("/u/123").await;
assert_eq!(res.text().await, "123");
```

`123` fits in eight bits, so even if axum parsed paths as 32-bit integers this test would still pass: its name makes a promise that its input never checks.

![](diagrams/craft-2-art-green.svg)

I'm not picking on axum. It's an excellent codebase, and that is the point. I went through the test suites of seven respected projects and found tests like this in almost all of them.[^1] So what does a green run actually tell you?

Less than you hope, and probably less than you assume. **The test was written by the same person who wrote the bug.**

## How does a test pass while checking nothing?

> "Trying to improve software quality by increasing the amount of testing is like trying to lose weight by weighing yourself more often."
>
> — Steve McConnell, *Code Complete*

I found five ways. Every one below is real, from a project people learn from.

**The table where every answer is the same.** tailscale has a test for a function that decides whether an error is worth retrying. Every row in its table expects `false`. A broken function that *always* returns `false` passes it perfectly.

**The coincidence.** excalidraw tests rotating a point and then rotating it back. The final check compares the result against `[x1, x2]`. It meant `[x1, y1]`. The test passes only because the fixture happens to set `y1 = 20` and `x2 = 20`.

**The assertion that never runs.** Another excalidraw test expects undo to throw an error, so the `expect` sits inside a `catch` block. If undo ever stops throwing, the `catch` never runs, no assertion fires, and the test passes.

**The one-character typo.** A redis test meant to send a 1 KB payload writes `puts -nonewline $s payload`. It is missing a `$`, so it sends the literal word "payload", seven bytes. SQLite has the mirror image: a guard written `string match *journal filename` compares against the literal word "filename", so it is always false.

**The test with no assertion at all.** A tailscale test that only logs. A ripgrep test that only prints.

![Five ways a test can pass while checking nothing: every answer the same, a coincidence, an assertion that never runs, a typo, no assertion.](diagrams/craft-2-gallery.svg)

Were these careless teams? I doubt it. The cause is the order of work: you write the test after you already believe the code works, so you pick inputs that confirm what you believe, and of course they do.

## Which line of the code does this input break?

> "Program testing can be used to show the presence of bugs, but never to show their absence!"
>
> — Edsger W. Dijkstra, *Notes on Structured Programming* (1970)

That is the one question that fixes most of the gallery. Ask it of every test before you keep it.

Compare ripgrep. It has a test for detecting binary files, and the test data has a NUL byte placed on purpose. The comment explains that the NUL byte goes *after* the first 65,536 bytes, which is the initial size of ripgrep's read buffer. Why there? Because that is where a bug would hide: the first chunk looks clean, and the binary data arrives in a later read. Someone thought about where the code could be wrong and aimed the test at it.

The axum test never did that. Its input could not reach a 128-bit bug.

![The axum test sends 123, which can't reach a 128-bit bug; the ripgrep test puts its NUL byte just past the 64 KiB buffer, exactly where a bug would hide.](diagrams/craft-2-aim.svg)

The habit is to take boundaries from the code's own constants (buffer sizes, limits, maximum lengths) and test just below, at, and just above each one. Put a negative case next to every positive one. Assert the *exact* error, not just "some error happened".

## Can you make a test fail on purpose?

> "Test your software, or your users will."
>
> — Dave Thomas & Andy Hunt, *The Pragmatic Programmer*

Yes, and it is the fastest way to learn whether the test can fail at all.

*The Pragmatic Programmer* calls this **Tip 92: Use Saboteurs to Test Your Testing**. Flip a sign, swap two arguments, delete a branch, then run the tests. If they still pass, they weren't testing that line.

What would it do to the gallery? Every test there would stay green under the right small break: make the retry function always return `false`, or let undo stop throwing, and nothing goes red. That silence is the finding, and it takes about thirty seconds per test to get it. I worked these out by reading the code, not by running the mutations, so treat them as predictions.

Don't do it everywhere. Do it where a silent bug costs real money or trust: payment math, state transitions (an order going from *paid* to *refunded*), and wire formats (bytes another system reads).

## What do the good test suites do differently?

Across the codebases, the strong suites share a few traits. Several surprised me, and none of them is a rule I can prove from seven projects.

**Almost no mocks.** None of the Rust or Go projects I studied used a mock framework. tailscale's 363,000 lines of Go have zero gomock. Instead they use small hand-written fakes and *real* things: a real HTTP server on a random port, a real in-process test server, a fake clock you can move forward by hand. excalidraw mocks only the true edges (network, fonts) and keeps its store and domain logic real. A mock of your own internals tests that your code calls what you said it calls, which is not the same as testing that it works.

**Short tests, made of data.** The median test across the Rust projects was 13 to 16 lines. rust-analyzer has over 8,000 tests served by about 270 small `check(input, expected)` helpers. Each test is a literal input and a literal expected output, and the helper holds all the machinery. A bloated suite usually doesn't have too many tests; it has setup code copied into every one of them.

![A test is data: a literal input and a literal expected output, fed through one check() helper that holds all the machinery.](diagrams/craft-2-check-helper.svg)

**Tests that prove they ran.** rust-analyzer marks the branch a test is supposed to hit and fails the test if that branch never ran. ripgrep's search tester panics if a configuration ended up testing nothing. redis runs list tests against *both* of its internal encodings and asserts which one was actually used. Without that, two test cases can silently exercise the same path.

**Failure injected on purpose.** SQLite's test suite has a helper that makes the Nth memory allocation fail, then runs the same script again with N = 1, 2, 3, and so on, until a run completes without hitting the injected fault. After every failure it checks that the answer is either right or a proper error, and that the database is still consistent. tailscale does the same for retries: a fake transport that fails on cue, followed by a check that the record was stored zero times and sent exactly once.

**Time and randomness as inputs.** Never `sleep` in a test. Use a fake clock you control, and seed your random data. When randomized tests find a bug, copy the failing case into a fixed test so it stays found.

**One test per bug.** When a bug is found, the fix starts with a test that fails because of it (Pragmatic Programmer **Tip 31: Failing Test Before Fixing Code**). ripgrep names those tests after the issue number.

## Why are snapshots a way to look busy?

Because they pass by construction. excalidraw's history tests produce a snapshot file of 23,011 lines with 471 entries. When something changes you regenerate the file, and since nobody reads 23,000 lines, "update all snapshots" accepts whatever the code now does.

Snapshots are good for small, stable formats you would actually review. They are not a substitute for knowing what the right answer is.

## When a bug gets through anyway, what is the method?

> "Everyone knows that debugging is twice as hard as writing a program in the first place. So if you're as clever as you can be when you write it, how will you ever debug it?"
>
> — Brian Kernighan & P. J. Plauger, *The Elements of Programming Style* (1978)

How do you debug without guessing? Treat it as science. McConnell cites studies showing the difference between good and poor debuggers is at least 10 to 1.[^2] The difference isn't intelligence. It is method.

![Debugging is the scientific method: stabilize, hypothesize, design an experiment that could disprove it, then fix the cause and look for the same bug elsewhere.](diagrams/craft-2-debug-loop.svg)

1. **Make it repeatable.** Shrink the input until changing anything changes the behaviour. If it's intermittent, suspect uninitialized state, timing, or something shared.
2. **Form a hypothesis that explains *all* the data**, then design an experiment that could prove it *wrong*. Run that before touching the code.
3. **Fix the cause, never the symptom.** Never add `if (input == the failing value)`. If you can't explain why that input fails, you don't understand the bug yet.
4. **Make one change at a time.** No "try +1, then -1".
5. **After the fix**, run the test that failed, then everything, keep a test that fails without your fix, and **search for the same mistake elsewhere**. If you can't say how you'd search for it, you haven't understood it.

Two Pragmatic Programmer tips belong on every debugger's wall. **Tip 33: "select" Isn't Broken**: assume the bug is in your code before blaming the compiler, the database, or the library. And **Tip 34: Don't Assume It—Prove It**.

## What do I do with a green run now?

I used to treat it as the finish line. Now I treat it as a question: *would this have gone red if the code were wrong?*

Most of the time the answer is easy to find, and the check takes less time than writing the test did.

## One floor down

All of this assumes you're writing new code, with tests from the start. But most of the code anyone works on was written by someone else, years ago, with tests that look like the gallery above, or no tests at all.

How do you even *see* what's wrong with a design you didn't write, and how do you propose something better without breaking everything that depends on it?

[^1]: axum, tailscale, excalidraw, redis, SQLite, ripgrep and rust-analyzer. "Almost all" is my count from reading, not a measured rate, and I did not count how many tests per suite were affected.
[^2]: This is McConnell's summary of studies he cites. I haven't read those studies myself, so treat "at least 10 to 1" as his number, not mine.
