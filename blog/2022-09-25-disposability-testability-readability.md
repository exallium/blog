---
slug: disposability-testability-readability
title: Disposability, testability, readability
authors: [alex]
---

It was brought to my attention recently on Twitter that a lot of us senior engineering folk like to bang on about different concepts but rarely take the time to sit down and explain what they mean by them. So, today I'm going to put my money where my mouth is. This was all written in a single sitting while my two year old is taking a nap, and other folks have written much more in depth about these topics than I have. Suffice to say that this is an opinion piece, and the opinion of one dude on the internet, so please take that with a grain of salt. I do not support comments on this site, but please feel free to reach out to me on Mastodon if you have any questions!

Today I want to do a bit of a brain dump on what I consider three of the most important concepts that any Junior should wrap their head around. These are disposability, testability, and readability.

<!-- truncate -->

## Disposability

> In the face of ambiguity, refuse the temptation to guess. (Zen of Python)

One axiom of writing code that any software engineer can attest to is that requirements change. Changes can come in different forms, from behavioural to design. We as software engineers need to be able to take those changes and incorporate them into our code base. Code disposability aligns itself with this axiom, in that it allows for changes in requirement to occur without trying to predict those changes.

Disposability of code means that we should be ready and willing to use the delete key. We should not try to set out to solve every single use-case we might come up against. Instead, we should write simple code that works and fulfills the requirements set out by the company. If the requirements change, we should be able to simply delete our code and begin anew, rather than trying to shoehorn our old code to fit these new requirements.

### Don't be afraid to duplicate

One of the first things that people try to drill into new software engineer's heads is the concept of DRY or "Don't repeat yourself." The idea here is, at face value, a good one. We should write our code once, test it once, and be done with it. Anyone else who needs that functionality can simply call into that bit of logic and we know they should get the right result.

Going deeper can run into some problems. There is such thing as being too "DRY". This is generally where over-generalization (trying to solve every problem at once with one piece of code) comes into play. The problems often surface in code that becomes hard to read and hard to use. This is normally either due to trying to solve for different scenarios that are not present under all circumstances, or by presenting the caller with extra boilerplate they would not otherwise need if the code in question had just been duplicated and customized.

As a general rule of thumb, you should only consider deduplicating code when it is used in more than two places. Some people will state even more, but two is easy to count to and something I have seen on Twitter, so there must be some merit to it.

### Changing requirements

Let us assume we have a situation where we need to perform algorithm X in two different places (A and B). The two different places aren't necessarily related to each other. We spend a bunch of effort making X work in those two different places, utilizing generics, and finally get it working and unit test it. The next day, we realize that B needs to use algorithm Y now, which is a very slight variant of X. What are we to do?

Disposability of code would state that we should scope our algorithm X to place A, and remove the generalizations (for readability, see below). Then, we should reimplement it in place B, with the slight behavioural modification. Each should then have their own set of tests.

## Testability

When writing software, it is important to ensure that it can be properly tested. The two types of testing that will be gone over are unit testing and integration testing. The key difference between the two is how we operate at boundaries.

### Boundaries

A boundary can be thought of as the edge between two different units. For example, we could say that there is a boundary between our presentation logic and our database. Or we could say that there is a boundary between our network code and the internet. Or we could say there is a boundary between our view layer and our presentation logic. Boundaries let us think of our code as a collection of units that serve a whole.

### Unit testing

When writing unit tests, one generally thinks of a single unit. The term unit is a bit overloaded, but in the case of testing it can be thought of as a small, indivisible component of logic. In object oriented programming, this is normally a single method. Regardless of the exact unit, we have a collection of information that can be used to design and implement a set of unit tests.

For any given test, we need to decide our givens and our expectations. We set up an instance of the class the method is defined on, pass it our inputs, and run assertions against the outputs. Writing testable code means that we can do this in a way that is sensible, low effort, and deterministic. It also means that we can satisfy all of our happy and sad states.

When writing testable code, it is important that any boundary we have can be faked. Let us for a moment assume that we are unit testing a method on an object. The goal of the method is to take some input, validate it against information in a database, and return an output specifying whether the information was successfully validated.

```kotlin
enum Output {
  IS_TOO_SHORT,
  IS_TOO_LONG,
  ALREADY_EXISTS,
  IS_VALID,
}

class Validator(inputDatabase: MyInputDatabase) {
  fun validateInput(input: String): Output {
    return when {
      input.size < MINIMUM -> Output.IS_TOO_SHORT
      input.size > MAXIMUM -> Output.IS_TOO_LONG
      inputDatabase.exists(input) -> Output.ALREADY_EXISTS
      else -> Output.IS_VALID
    }
  }
}
```

There is one boundary here that we should be aware of, and that is our
`inputDatabase`. Having the class rely directly on the input database means
that we now have to either mock it or fake it in order to run our unit test.
Relying directly on the database causes the unit test to be reliant on disk IO,
which can cause the test to become brittle and non-deterministic. This is an
example of strong coupling. Our `Validator` is now directly dependent of
`MyInputDatabase`. It also means that `Validator` has access to all of the
methods on `MyInputDatabase`. This is a violation of the
[Interface Segregation Principle (ISP)](https://en.wikipedia.org/wiki/Interface_segregation_principle).
Instead of depending directly on `MyInputDatabase` we can instead create a
boundary interface.

```kotlin
interface ValidatorDatabase {
  /**
   * Checks whether or not the given input already exists in the database.
   */
  fun exists(input: String): Boolean
}
```

Our test can now pass in a faked `ValidatorDatabase` and we no longer have to wait on or depend on disk IO.

### Integration testing

Integration testing are tests that cross boundaries. These are generally run
directly on end user hardware. In the case of Android, this means these tests
are generally run on a client device. What does this mean for testability and
boundaries? In general, it simply means that you should be able to limit your
units under test to the code in your app. Things like local database fetches
and whatnot are fine here, because they help test your queries. What you want
to avoid is anything to do with the network. So, in your integration test suite,
there should be a practical way to "fake" your network layer. One such approach
is by using [MockWebServer](https://github.com/square/okhttp/tree/master/mockwebserver)
from the fantastic folk at square.

### An artform

Writing tests is a bit of an art in and of itself, but it is a crucial skill for
any developer of any skill level. Writing lots and lots of tests is only going to
make you better at it. The key take-away here is that when you are writing code,
treat your tests as first class citizens . Android has this great annotation
`@VisibleForTesting` that can be used to add test-specific hooks into client code,
and these hooks can get compiled out of production artifacts since there should be
no usages in your non-test code.

## Readability

> Readability counts. (Zen of Python)

Software engineers are first and foremost code readers. We read because we need to
understand the implications of the code we write. We read so that we can safe-guard
the code from other people's changes. And we read because `onLayout` is being
called but `isLaidOut` is still `false` (thanks Android). When writing readable
code, there are a few steadfast rules we can keep in mind.

### Don't be clever

When writing code, remember that others need to read it, including you! We should
write our code in a clear, easy to parse manner. This is especially true in growing
teams, and teams with less experienced folk. Just because a terse bit of code is
easy for you to grok, it could take someone else way more time than necessary to
figure out what is going on.

```kotlin
val a: List<DataModel> = // ... list of things

// DONT
val myThing = if (a.filter { a.b == 0 }.map { a.c }.any { c.d }) { doA() } else { doB() }

// DO
val myCondition = a
  .filter { a.b == 0 }
  .map { a.c }
  .any { c.d }

val myThing = if (myCondition) {
  doA()
} else {
  doB()
}
```

Both of these accomplish the same thing, but one is much more readable. We avoid
mixing expressions (mixing the map/filter with the if statement) and end up with
something that can easily be parsed, line by line.

### Be descriptive and prescriptive

When writing method names, we should use as many characters as we need but avoid
the word "and." The use of the word "and" means that you have written a method
that should actually be two methods. If these two methods are always called
together, then perhaps that original singular method is misnamed. The name should
be a clear description of what the method is doing, and should follow the
principles set out by Martin Fowler in [TellDontAsk](https://martinfowler.com/bliki/TellDontAsk.html).
I recommend reading the article in full, as it can help both with naming and how
you should approach separating out your methods.

## Conclusion

Hopefully some of that made sense, and please do read the articles I've linked,
as they're better suited at explaining this stuff than I am. You can always reach
out to me on Mastodon, which I've linked in my page footer.

If you found this useful, have corrections, or would like clarification, please
let me know! I'd love to correct things, clarify things, and be told I'm useful.
