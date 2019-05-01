---
title: Using TailwindCSS with EleventyJS
date: 2019-05-01
---

I've settled on a pretty and easy smooth way of using TailwindCSS in Eleventy, with PostCSS and watch and automatic browsersync reloads, without the need for any external libraries like webpack, gulp, etc.

The idea is simple: Use an `.11ty.js` template file to do the work of processing TailwindCSS and PostCSS, then keep your CSS files in Eleventy's `_includes` directory to take advantage of auto-reload/rebuild.

### TOC

1. [Install Dependencies](#section-1)
2. [Create the CSS Files](#section-2)
3. [Setup the file to process CSS](#section-3)
4. [Minify with an Eleventy Transformer](#section-4)

## Install Dependencies

```bash
yarn add -D tailwindcss autoprefixer postcss postcss-import precss
```

*Note: at the time of writing, I'm installing `tailwindcss@next` (currently v1.0.0-beta.8).*

## Create the CSS files

I keep these in my Eleventy's `_includes` folder, so that any changes to them will trigger a rebuild and reload during development (when running `eleventy --serve`).

```bash
src/
  _includes/
    css/
      main.css # the entry point
      base/
        links.css
      components/
        posts-list.css
```

The CSS files in the `base` and `components` directories are my specific CSS for the site. I tend to use TailwindCSS's `@apply` directive instead of stuffing my HTML with classes.

Having so many classes in HTML is probably one of the biggest intial turnoffs for people new to TailwindCSS.

I use `postcss-import`, so I use `@import 'path/to/file.css'` instead of `@tailwind`.

Here's a quick example:

```css
/* _includes/css/main.css */
@import "tailwindcss/base";
@import "tailwindcss/components";

@import "base/links";
@import "components/posts-list";

@import "tailwindcss/utilities";
```

And an example of one of the imported CSS files:

```css
/* _includes/css/base/links.css */
a, a:visited {
  @apply text-red-700;
  @apply underline;
}
a:hover, a:focus, a:active {
  @apply text-red-600;
  @apply no-underline;
}
```

## Set up a master styles file

This file will become the output file that we'll reference from the base layout.

I'll use the `.11ty.js` template engine for all the processing.

```js
const fs = require('fs')
const path = require('path')
const postcss = require('postcss')

module.exports = class {
  async data () {
    const rawFilepath = path.join(__dirname, '_includes/css/main.css')

    return {
      permalink: 'styles.css',
      rawFilepath,
      rawCss: await fs.readFileSync(rawFilepath),
    }
  }

  async render ({ rawCss, rawFilepath }) {
    return await postcss([
      require('postcss-import'),
      require('precss'),
      require('tailwindcss'),
      require('autoprefixer'),
    ])
      .process(rawCss, { from: rawFilepath })
      .then(result => result.css)
  }
}
```

**Note** the permalink setting in the `data()` method. This will tell Eleventy to write the stylesheet to `dist/styles.css`, which we'll reference in our base layout:

```html
<head>
  <link href="/styles.css" rel="stylesheet">
</head>
```

The template itself is pretty self-explanatory.
