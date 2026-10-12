# Surviving Production

*Craft · Part 4 of 4: Code that survives the real world*

An airline's check-in kiosks and phone check-in stopped working at 11:30 p.m. They stayed down until 2:30 a.m., three hours with no way to check in.

The airline wasn't careless. The system had redundant servers and failover, everything you're supposed to have. The cause, which Michael Nygard tells in *Release It!*, was one ordinary line of Java. Code that returned a database connection to its pool called `close()` on a statement, and that `close()` threw an exception nobody expected. The exception skipped the line that would have returned the connection, so each time it happened, one more connection leaked. Eventually the pool was empty, and every request that needed the database waited for a connection that would never come.

Why didn't anyone see it? Because the monitoring said everything was fine. The status page the health check hit didn't need the database, so it kept answering while every real request hung.

![](diagrams/craft-4-art-kiosks.svg)

I'm retelling this and the other stories below from the book. I didn't see any of them happen.

You will never remove every bug. So the question isn't how to have no bugs. It's **how to stop one bug from taking everything else down with it.**

> "Bugs will happen. They cannot be eliminated, so they must be survived instead."
>
> — Michael Nygard, *Release It!*

## Why are most failures hangs, not crashes?

> "Integration points are the number-one killer of systems."
>
> — Michael Nygard, *Release It!*

Because a crash is loud and a hang is quiet. (By hang I mean a call that neither succeeds nor fails.) The first thing *Release It!* changed for me was my picture of failure. I pictured a crash, a red error. In production the dangerous failure is something that gets *slow*, or stops answering, while everything waiting on it slowly stops too.

Nygard lists what an **integration point** can do. An integration point is any call over a network: a payment provider, a database, a message broker. There are six ways it can fail:

![Six ways a dependency can fail: refuse the connection, accept but never answer, answer slowly, dribble bytes, return garbage, drop mid-call.](diagrams/craft-4-six-failures.svg)

1. Refuse the connection outright.
2. Accept the connection, then never answer.
3. Answer, but slowly.
4. Dribble the response out a few bytes at a time.
5. Answer with garbage, or something that breaks the protocol.
6. Drop the connection halfway through.

Only the first is fast and obvious. A slow response is *worse* than a refusal, Nygard points out, because a refusal frees you at once while a slow response holds your resources the whole time.

His best story here is a system that hung every morning at 5 a.m. A firewall sat between the application and its database, and it quietly forgot any connection that had been idle for an hour without telling either side. After a quiet night, the application tried to use pooled connections the firewall had already forgotten, and every request hung. Nothing in the code was "wrong". The fix was periodic traffic on each connection, so none sat idle long enough to be dropped.

## Does every wait need a limit?

> "Hope is not a design method."
>
> — Michael Nygard, *Release It!*

Yes. If one thing in this post sticks, let it be this: **every call that waits must have a timeout.** That means every HTTP call, database query, message publish and lock, and every time you take a connection from a pool. Nygard puts the pool version plainly: "Safe resource pools always limit the time a thread can wait to check out a resource."

Won't the language do it for you? Mostly not. In Go, the default `http.Client` has *no* timeout, so a request to a provider that never answers waits forever. A plain `fetch` in TypeScript waits forever too. You have to ask for a limit every time.

What happens without one? His Black Friday story answers: a retailer ran a promotion, and the extra traffic flowed through the website into the order system, and from there into a small scheduling system that could handle about twenty-five requests at once. Far more than twenty-five arrived. The website's connection pool to that system had no timeout, so its 3,000 threads waited, one by one, until none were left. The whole store went down because of the smallest system in the chain.

## What should happen once a dependency keeps failing?

Stop calling it. Even with bounded calls, a dependency that keeps failing still costs you: every request tries it, waits for the whole timeout, and fails, so you've made every request slow. Why keep paying for an answer you already know?

The fix is the **circuit breaker**, named after the electrical one.

![A circuit breaker: closed lets calls through; too many failures open it so calls fail fast; after a pause it goes half-open and lets one trial call through.](diagrams/craft-4-breaker.svg)

- **Closed**: calls go through normally, and failures are counted.
- **Open**: after too many failures, calls fail *immediately*, without even trying. The broken dependency gets room to recover, and your callers get a fast answer instead of a slow one.
- **Half-open**: after a pause, one trial call is let through. If it works, the breaker closes again. If not, it opens again.

Two details from the book are easy to miss. First, decide *with the business* what happens when the breaker is open. Do you refuse the payment, or accept the order and process it later? That's a business decision, not a coding one. Second, give operators a way to trip and reset the breaker by hand.

And **don't retry immediately** inside the request. Nygard calls hammering a struggling service with retries "Hammer Time", because it turns a short hiccup into a full outage. Return an answer (failed, or "accepted, we'll process it") and retry later from a queue, with growing delays. For payments, every retry must be **idempotent**: sending the same request twice must never charge twice.

## How do you keep one failure in its compartment?

> "A distributed system is one in which the failure of a computer you didn't even know existed can render your own computer unusable."
>
> — Leslie Lamport, in an email (1987)

Ships have watertight compartments called **bulkheads**, so one hole doesn't sink the whole ship. Nygard applies the same idea: give each dependency its own separate pool of connections or workers. If the slow scheduling system uses up its own pool, the rest of the store keeps working. In the Black Friday story, a separate pool would have meant "scheduling is unavailable" instead of "the store is down".

![Bulkheads: each dependency gets its own pool, so one slow dependency can only use up its own compartment.](diagrams/craft-4-bulkheads.svg)

Three habits go with it:

- **Fail fast.** Check that you *can* do the work before you start the expensive part: the pool has a connection, the breaker is closed, the input is valid.
- **Separate your errors.** Report "our system is overloaded" differently from "your request was invalid", so a user's bad input never trips someone else's breaker.
- **Say when you're busy.** An overloaded service should say "busy, try later" rather than queueing work forever.

## What fails slowly, over weeks?

Anything that grows, and probably something in your system already does: a log file that slowly fills the disk, a table of events that grows until its queries time out, a cache that keeps every item it ever saw.

Nygard calls the fix **steady state**: every mechanism that accumulates something must ship, in the *same* release, with the mechanism that removes it. Logs rotate. The application itself purges old rows. Every cache has a size limit and an expiry. Every query has a `LIMIT`, even the ones that "only ever return one row", because one day the data won't match your assumption.

## Why did a three-month load test miss the crash?

It tested the wrong users. A retailer replaced its whole online store in a project that ended up more than a year late, then spent three months load testing it. The new site went live at 9 a.m. By 9:30 it held 250,000 sessions, and then it crashed.

The load tests had simulated polite shoppers who log in, browse and buy. Real traffic included search engine crawlers, scrapers and bots that don't keep cookies. So *every single request* created a brand-new session, each one using memory. No test had ever done that.

Test with **hostile** traffic, then, not just the happy path: requests without cookies, the same URL hammered over and over, every device reconnecting at once after a network blip. And build the safety controls before launch: a way to limit new sessions, a way to block an abusive address, a polite "come back later" page.

## How do you see a hang?

You export the numbers that reveal it. You can only fix what you can see, and Nygard's advice on **transparency** comes down to three habits:

- **Count what is in flight.** Export how many requests are running right now, how many timed out, and how many callers are waiting on each pool. An average response time hides a hang, because the requests that never finish are never counted.
- **Make health checks do real work.** The airline's status page said "fine" while every real request hung. A check should go through the same path as a real request, and an external probe should run a real transaction from outside.
- **Treat logs as a user interface.** One line per event, the same format every time, an ID that ties a request's lines together. ERROR means "a human must act now", and nothing else. Write each message so a stranger at 3 a.m. knows what failed and what to do.

*The Pragmatic Programmer* adds two tips that fit here. **Tip 38: Crash Early.** When the program is in a state that should be impossible, stopping cleanly does less damage than limping on. And **Tip 95: Don't Use Manual Procedures.** If fixing an outage means someone remembering twelve steps, script them now. In the Black Friday story, the store recovered in under five minutes *only* because Nygard had already written scripts to switch off the scheduling connection without restarting everything.

> "A dead program normally does a lot less damage than a crippled one."
>
> — Dave Thomas & Andy Hunt, *The Pragmatic Programmer*

## What keeps software healthy after launch day?

Production isn't one launch day. It's every day after. In the codebases I studied, three habits kept them healthy over years:

- **Release in small, safe steps.** Nygard's pattern for database changes is to **expand, then roll out, then clean up**. Add the new column first, release code that uses it, and remove the old one only once nothing uses it any more. Every release keeps working with the previous one.
- **Let tools hold the rules, not people.** tailscale has small repository tests that fail if a package has no documentation. rust-analyzer's build fails if anyone adds a kind of test its style guide bans. Rules that live only in people's heads get forgotten. Rules a computer checks don't.
- **Improve what you touch, and put a fence around what you don't.** That's the strangler fig from the last post, every single day.

Is that everything the book says? No. This post stays on one narrow slice of the book: what happens to a service when something it calls goes wrong. Deployment pipelines and capacity planning get no more than a mention here.[^1] Since the evidence here is one book's stories, plus what I saw in a few codebases, read the rules as strong advice rather than measured fact.

## Floor zero

Across these four posts, the books and the codebases kept saying the same thing in different words. Here are the floors, from the top down:

1. **The enemy is complexity** ([Part 1](/craft-1-complexity/)). Fight it with deep modules, hidden decisions, errors defined away, and designs considered twice before they're built.
2. **A test is only worth something if it can fail** ([Part 2](/craft-2-tests/)). Aim its inputs at the bug, and break the code on purpose to prove it.
3. **Respect old code** ([Part 3](/craft-3-existing-code/)). Measure where it hurts, name the problem precisely, propose a better design with evidence, and change it under tests, piece by piece.
4. **Assume the world will break you** (this post). Bound every wait, fail fast, keep failures in their compartment, and make the system tell you the truth about itself.

![](diagrams/craft-4-art-floors.svg)

None of these is clever, and that's the point. What separates good software from bad isn't cleverness. It's the habit of asking, on every change: *does this make the system easier to understand and change, and does it fail safely?* The good codebases are made of years of small changes where someone said yes.

So what's the next change you'll make, and what would your answer be?

[^1]: Both are in *Release It!* and worth reading in full. I left them out because this post is about the calls a service makes, not about how it ships or how big it needs to be.
