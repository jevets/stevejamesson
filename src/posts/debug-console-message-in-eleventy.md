---
draft: true
title: Working with Debug Messages in EleventyJS
date: 2019-05-04
tags:
  - eleventy
excerpt: |
  Get to know Eleventy's debug console
---

[Eleventy]: https://www.11ty.io
[Eleventy debug]: https://www.11ty.io/docs/debugging/
[debug]: https://www.npmjs.com/package/debug

[Eleventy] uses the [debug] package under the hood to handle its console logging.

<small>

See [Eleventy's Debugging docs here][Eleventy debug].

</small>

## Log all debug messages

The docs will get you started with logging Eleventy's debug messages from all its modules.

```bash
DEBUG=Eleventy* npx eleventy --serve
```

Once enabled you'll see all sorts of output in the console every time Eleventy reloads (i.e. when running `npx eleventy --serve` or `npx eleventy`).

```markup
...
Eleventy:TemplatePassthroughManager TemplatePassthrough copy started. +44ms
Eleventy:TemplateData Using '.11tydata' to find data files. +39ms
Eleventy:Template getMappedDate: using file created time for './src/styles.11ty.js' of 2019-04-30T15:45:41.017Z (from 1556639141017.7332) +63ms
Eleventy:TemplateWriter ./src/styles.11ty.js added to map. +3ms
Eleventy:Template getMappedDate: using file created time for './src/now.njk' of 2019-05-01T19:19:01.811Z (from 1556738341811.4517) +3ms
Eleventy:TemplateWriter ./src/now.njk added to map. +3ms
Eleventy:TemplateMap Collection: collections.all size: 7 +1ms
Eleventy:Template Writing 'dist/styles.css' from './src/styles.11ty.js'. +1s
Eleventy:Template Writing 'dist/index.html' from './src/index.njk'. +0ms
...
```

Turns out that there are a lot of messages. Looks like about 100 lines for a very simple site I'm working on right now. They're delightfully colorized, but they're usually only helpful when you run into errors during build. Most of the time you end up scrolling a whole lot in your console.

## Limit debug output to only a few Eleventy modules

You'll often be better off enabling debug messages for only a select few of Eleventy's modules. I often run with just two: `Eleventy:TemplateContent` and `Eleventy:EleventyErrorHandler`.

```bash
DEBUG=Eleventy:TemplateContent,Eleventy:EleventyErrorHandler npx eleventy --serve
```

Now you'll only see debug messages that come from the `EleventyErrorHandler` and `TemplateContent` modules.

These are usually all that you'll need when working with templates. When you're stuck and the above clue you into any hints, just enable debug for all modules: `DEBUG=Eleventy*`.

## Understanding `debug`'s namespaces

The [debug] package is simple but powerful. You can colorize output lines and even define your own namespaces.

Each Eleventy module defines its own debug namespace. This shows up directly in the console output before each line/message. Take a few lines from the console output from above:

```bash
Eleventy:TemplatePassthroughManager TemplatePassthrough copy started. +44ms
Eleventy:TemplateWriter ./src/styles.11ty.js added to map. +3ms
Eleventy:Template Writing 'dist/styles.css' from './src/styles.11ty.js'. +1s
```

It's obvious which modules are responsible for each debug message:

- `Eleventy:TemplatePassthroughManager` started a task
- `Eleventy:TemplateWriter` added a file to its map, and it added 3ms to the build
- `Eleventy:Template` wrote a file that added another second to the build

## Use your own namespaces

It's often helpful to define your own debug namespaces. This is especially useful when fetching remote data into files in the `_data` folder, maybe some items from a remote API.

Take a look at this example `_data` file, which queries a remote API for `posts`, where `myAwesomeApi.js` is some instance of axios or another fetch wrapper.

```js
// src/_data/posts.js
const api = require('./myAwesomeApi')

module.exports = async () => ({
  posts: await api.fetchAndNormalizeAllPosts(),
})
```

Now add your own debug namespace and take advantage of the excellent [debug] package.

```js
// src/_data/posts.js
const debug = require('debug')('App:MyAwesomeAPI')
const api = require('./myAwesomeApi')

module.exports = async () => {
  const posts = await api.fetchAndNormalizeAllPosts(),
  debug('Fetched posts: %o', posts)

  return { posts }
}
```

Then set an environment variable to instruct the debugger to log messages for your `App` debug namespace.

```bash
DEBUG=App:MyAwesomeAPI npx eleventy --serve

# or show all messages from your App
DEBUG=App* npx eleventy --serve
```

Now you'll see a message in your console whenever posts are fetched:

```bash
App:MyAwesomeAPI Fetched posts [{...}, {...}, {...}, ...]
```

You can use [tokens to format output](https://www.npmjs.com/package/debug#formatters), like `printf`.

```js
...
debug(`Fetched a total of %d posts`, posts.length)
...
```

## Add as scripts in your package.json

Of course you'd usually include commands like these directly in your `package.json` as npm scripts.

An example probably explains everything you need here:

```js
// package.json
...
  "scripts": {
    "dev": "DEBUG=App*,Eleventy:TemplateContent,Eleventy:EleventyErrorHandler npx eleventy --serve",
  },
...
```
