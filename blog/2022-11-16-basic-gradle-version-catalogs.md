---
slug: basic-gradle-version-catalogs
title: Getting started with Gradle Version Catalogs
authors: [alex]
unlisted: true
---

Version catalogs are an effective way to help manage your dependencies across multiple modules throughout Gradle based software projects. They allow you to declare all of your dependencies in a single place. You can then reference these dependencies in any `dependencies` block of any `build.gradle` file in your project. This helps ensure that all of your modules are using the same versions. It also ensures that when a version for a dependency changes there is only one place in your code that needs to be updated.

Historically, this would have been solved via use of the project-level `ext` object. We can see this pattern throughout samples given out by Google and other library providers. In the past I've used this approach effectively in large-scale software projects, where we built out something that looks fairly similar to what I am about to discuss today.

<!-- truncate -->

```gradle
ext {
  compose_version = "1.2.1"
  navigation_version = "2.5.2"
  // etc.
}
```

## Separation of concerns

When starting a new project in Android Studio these days, there are some additional things in `settings.gradle` that may be unfamiliar to folks working on older projects. This includes a `dependencyResolutionManagement` configuration block.

```gradle
dependencyResolutionManagement {
  versionCatalogs {
  }
}
```
This is your entry point for dependency version catalogs. Since this is declared in your top-level `settings.gradle` file, it is accessible from any subproject in your application. Within the `versionCatalogs` block, we can define our dependencies.

I have two immediate recommendations here. Number one is to pull this block out into a separate file, `dependencies.gradle`, and then replacing the block in `settings.gradle` with a simple apply-from statement:

```gradle
apply from: 'dependencies.gradle'
```

This will give you a separate file in which to devote to your dependencies, and will help keep your `settings.gradle` file clean and tidy. We let `settings.gradle` remain a top-level configuration file for your project, but give the responsibility of defining our dependencies to `dependencies.gradle`, better adhering to the [Single Responsibility Principle](https://en.wikipedia.org/wiki/Single-responsibility_principle).

Within this new `dependencies.gradle` file, we can start adding our actual dependencies.

## Namespacing

Careful readers will note that our `dependencyResolutionManagement` has an object called `versionCatalogs`. It is plural, meaning we can define as many as we wish. This is where proper namespacing can come into play. Namespacing in this context is the grouping of common units under a single name. For example, we could think of Java or Kotlin packages as an example of namespacing. With version catalogs we can simply define new object declarations with the name we wish to use.

My recommendation is to think about how your application utilizes dependency namespacing already, and consider using that as a guideline to how you create namespaces in this file. For example in your `dependencies` block today, you likely have several namespaces to work with. The common ones are your "base" namespace and "test". These are `implementation` and `testImplementation`, respectively. We can add objects to `versionCatalogs` for each of these.

```gradle
dependencyResolutionManagement {
  versionCatalogs {
    libs {}
    testLibs {}
  }
}
```

If we had another configuration, we could add that here too. For example, `androidTestLibs` could be its own catalog. The most important thing here is that however we build out our catalogs, we should ensure that any given dependency is listed exactly once. If subproject A replies on dependency a for `stagingImplementation` but subproject relies on it for `implementation` or some other custom variation, then we should store the dependency a under `libs`.

## Adding dependencies

Now that we have our structure created, how do we add dependencies? We add `library` entries.

```gradle
dependencyResolutionManagement {
  versionCatalogs {
    libs {
      library('androidx-recyclerview', 'androidx.recyclerview:recyclerview:2.1')
    }
    testLibs {
      library('junit', 'junit.junit:4.13.2')
    }
  }
}
```

In our `build.gradle` file, we can now reference back to these:

- `implementation libs.androidx.recyclerview`
- `testImplementation testLibs.junit`

We can also utilize `version()` to share versions between multiple components. Doing so allows us to keep different dependencies in lock-step with each other.

```gradle
dependencyResolutionManagement {
  versionCatalogs {
    libs {
      version('mylibrary', '2.1.1')
      library('mylibrary-artifact-a', 'org.mylibrary', 'artifact-a').versionRef('mylibrary')
      library('mylibrary-artifact-b', 'org.mylibrary', 'artifact-b').versionRef('mylibrary')
      library('mylibrary-artifact-c', 'org.mylibrary', 'artifact-c').versionRef('mylibrary')
    }
  }
}
```

## A note on naming

In general, try to use sensible naming according to the group and artifact of a given object, and try not to be repetitive. For example, if we have `androidx.recyclerview:recyclerview` then it is fine to simply use `androidx-recyclerview` .

Some libraries with multiple artifacts will have names that look like this:

- `core`
- `core-ktx`

In these cases, it is impossible to utilize the artifact names by themselves when forming library entries, since `core` cannot both be a dependency *and* an accessor to a set of dependencies. In these cases, I find that it's best to repeat the name at the end. For example:

- `core-core`
- `core-ktx`

This allows you to keep a sensible name, while also allowing you to mostly stick with using some sort of group / artifact naming scheme.

## Conclusion

I hope that was an informative and direct explanation of version catalogs, their benefits, and some basic usage tips. There are a lot more you can do with these when configuring specific libraries, so I invite you to take a look at the [official documentation](https://docs.gradle.org/current/userguide/platforms.html) if that interests you.

If you have any questions, corrections, or clarifications, you can reach out to me on [Mastodon](https://androiddev.social/web/@exallium).
