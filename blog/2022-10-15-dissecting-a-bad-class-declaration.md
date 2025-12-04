---
slug: dissecting-a-bad-class-declaration
title: Dissecting a bad class declaration
authors: [alex]
---

About a year ago, there was a class declaration that I came across on Twitter that was so bad I said I could write an entire article on it. Well, folks who told me to just do it, I'm doing it. The class declaration in question was as follows:

```kotlin
abstract class TaskFragment : BaseFragment(), Runnable
```

Essentially, this was an abstract fragment that extended some base fragment and implemented a runnable. From the name, it sounds like this is a fragment that a developer can implement in order to do some background work and return a result. There are some red flags here.

<!-- truncate -->

## BaseFragment

Let us start with what I think is actually a bit of a red herring. Some folks tend to shy away from introducing the concept of a base fragment but it can be quite useful. One such example is in the case of a single-activity application where each fragment has some reporting it needs to perform. This could be whenever the user opens the app or moves to a new screen. Having a consistent way to do this that is as simple as implementing a method that describes what you are reporting can help to reduce the mental overhead of creating new screens.

That does not necessarily mean that the pattern is the best one or even necessarily a good one. You could implement all of your reporting delegation in a LifecycleObserver , and have each fragment that needs reporting register that. All this to say that for this article, I don't consider BaseFragment to be a huge problem and would be unsurprised to see it littered through legacy codebases.

## TaskFragment is a yellow flag, Runnable is a red flag

Being an abstract class, this `TaskFragment` is meant to be extended. With only the class signature at our disposal we would need to assume that the `TaskFragment` is meant to add some UI around a long-running task. This work would be executed in the `run()` method provided by the `Runnable` interface.

Android system components (`Activity , Fragment , Service , Receiver`) and long-running tasks have a long, bad history filled with memory leaks and other erroneous behaviour. They do not operate well together. As a general rule of thumb, anything that you do within the confines of one of these classes should be done on your main-thread. Anything that you want to do in the background should be safely dispatched to a background thread.

There are several acceptable approaches to operating on a background thread within Android. These include via Kotlin coroutines, RxJava, Jetpack WorkManager, and plain old Java ExecutorServices. Each option has their strengths and pitfalls and it is left as an exercise to the reader to give their documentation a read-through and decide what is best for you. My own recommendation on brand new applications that are completely in Kotlin is to use coroutines and WorkManager. Each of these have their different use-cases.

Coroutines are great for local contextual operations, such as loading data from a database to display immediately in the UI. Utilizing the right scopes, we can bind these operations to the lifeycle of the respective components and ensure they don't outlive their welcome. For example, when we load the data from the database to display on a given page in our UI, we bind the load to the lifecycle of the ViewModel managing our state. When the ViewModel is cleared we can also be assured that the scheduled work is cancelled as well.

`WorkManager` workers are great for background operations that we do not want to tie into component lifecycle. This includes downloading an image in a chat application or synchronizing account state with a server.

The key here is that we are not performing background work within the `Fragment` itself. We are separating ourselves from the `Fragment` and its lifecycle. In doing so we are shielding ourselves from potential issues about not only leaking the fragment but trying to operate on it once the system has destroyed it.

## Implementing Runnable

The biggest problem with the class declaration as presented is that it implements `Runnable`. Whenever you inherit a type, you are exposing yourself to everything that can be done with that type. `Runnable` does not only expose a `run()` method, it also allows objects that implement it to be handed off to an `ExecutorService`.

At this point, we do not only have a `Fragment` that is tied into doing some long-running work. We have a `Fragment` that can be handed off to an `ExecutorService`, which can then add it to a queue. There's no guarantee around when the `Fragment` will be executed and as long as it is in that queue, it is kept in memory.

This isn't only bad from a memory standpoint. It is bad architecture. Inheriting `Runnable` increases the public surface of your `Fragment`. `Fragments` are complex enough already, and really do not need the extra overhead of also being able to be passed around to `Executors`.

Implementing `Runnable` is a violation of the [Single Responsibility Principle](https://en.wikipedia.org/wiki/Single-responsibility_principle) and of the [Interface Segregation Principle](https://en.wikipedia.org/wiki/Interface_segregation_principle).

## How do we fix this?

Without knowing the exact kinds of tasks that the original author intended to perform, it is hard to come to a concise solution. However, we can make some assumptions around the authors intent in order to come up with something a bit more reasonable.

Let us assume that the author meant to create a `TaskFragment` abstraction that would perform a given task, and that task was bound to the lifecycle of the `Fragment`. Here is an example implementation that could stand in place of the original declaration. (Note, this is untested and a bit off the top of my head.)

```kotlin
/**
 * Represents a single unit of work
 */
interface LifecycleBoundTask {
  suspend fun doWork()
}

/**
 * Identifies a specific LifecycleBoundTaskFactory instance, passable to a Fragment.
 */
@Parcelize
data class LifecycleBoundTaskKey(val rawKey: String): Parcelable

/**
 * Creation mechanism for LifecycleBoundTasks
 */
interface LifecycleBoundTaskFactory {
  fun create(): Task
}

/**
 * Holds a mapping of LifecycleBoundTaskKey -> LifecycleBoundTaskFactory
 */
object LifecycleBoundTaskRegistry {
  private val registry: MutableMap<LifecycleBoundTaskKey, LifecycleBoundTaskFactory> = HashMap()

  fun register(taskKey: LifecycleBoundTaskKey, taskFactory: LifecycleBoundTaskFactory) {
    registry[taskKey] = taskFactory
  }

  fun clear(taskKey: LifecycleBoundTaskKey) {
    registry.remove(taskKey)
  }

  fun getFactory(taskKey: LifecycleBoundTaskKey): LifecycleBoundTaskFactory = registry[taskKey]!!
}

class LifecycleBoundTaskFragment : BaseFragment {

  init {
    lifecycleScope.launch {
      whenCreated {
        val key: TaskKey = requireArguments().getParcelable(TASK_KEY)!!
        withContext(Dispatchers.IO) {
          LifecycleBoundTaskRegistry
            .getFactory(key)
            .create()
            .doWork()
        }
      }
    }
  }

  companion object {
    private val TASK_KEY = "args"

    fun create(taskKey: LifecycleBoundTaskKey): LifecycleBoundTaskFragment {
      return LifecycleBoundTaskFragment().apply {
        arguments = bundleOf(TASK_KEY to taskKey)
      }
    }
  }
}
```

Usage is as follows:

```kotlin
// Create a task describing the work we want to do
class MyTask : LifecycleBoundTask {
 override suspend fun doWork() {
   // Perform database operations
 }
}

// Create a task factory that knows how to create an instance of task
class MyTaskFactory : LifecycleBoundTaskFactory {
  companion object {
    val KEY = LifecycleBoundTaskKey("MyTaskFactory")
  }

  override fun create(): LifecycleBoundTask = MyTask()
}

// Register it so that we can refer to it by key
 LifecycleBoundTaskRegistry.register(MyTaskFactory.KEY, MyTaskFactory())

// Create a fragment that will execute the task when it is created
LifecycleBoundTaskFragment.create(MyTaskFactory.KEY)
```

If you squint, this looks like the same pattern as `ViewModel`. The architecture here is one in which the work being done is decoupled from the `Fragment` performing the work. `LifecycleBoundTask` does not know what a `Fragment` is, it just knows that there is work to be done. Likewise, `LifecycleBoundTaskFragment` doesn't know what specific task it is performing, it just knows the key of the task.

We started with a task system where the `Fragment` instance could long outlive its lifecycle. We now have a small bounded-task system where:

- The `Fragment` does not extend `Runnable`
- The `Fragment` cannot accidentally get passed to an `ExecutorService`
- The `Fragment` lifecycle drives whether or not the task is operating.
- The `Fragment` is decoupled from the work it is performing.

## Conclusion

The solution presented here is imperfect. It does not account for things like the Registry methods being called from different threads, and it assumes that the tasks should be cancelled and started at the whim of the `Fragment`'s lifecycle. I am not an expert when it comes to coroutines, so I would leave it on the reader to also double-check which fragment lifecycle is utilized (that of the `Fragment` itself or that of the `Fragment`'s `View`). In the case where we do not want a task bound in this manner, it is best to just use `WorkManager`. The `Fragment` would simply observe the `WorkManager`'s current progress, and the long-running task would in no way be linked to the `Fragment` itself.

The key takeaway here is that we have built out a solution which respects separation of concerns and the single responsibility principle. In doing so, we have prevented memory leaks and other lifecycle bugs that could have occurred quite easily in the initial implementation.

Each component has its own role. The task itself knows how to perform the work. The task factory knows how to instantiate a task. The registry knows how to take a key and map it to a factory. The fragment is able to receive a key in its arguments and run the task via its lifecycle. Each component also only exposes the minimal amount of information needed to perform its role. It seems like a lot of boilerplate at first glance but when each piece is able to retain its simplicity, dividends are paid.

If you take nothing else, I hope the original signature now makes you grimace.
