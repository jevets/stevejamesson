---
title: Using TailwindCSS with EleventyJS
date: 2019-05-01
excerpt: |
  Use TailwindCSS in Eleventy with file-watching and automatic browser reload, PostCSS plugins, and PurgeCSS and Minify.
---

The idea is simple: Use an `.11ty.js` template file to do the work of processing TailwindCSS and PostCSS, then keep your CSS files in Eleventy's `_includes` directory to take advantage of auto-reload/rebuild.

## Install Dependencies

<small>

  [precss], [postcss], [postcss-import], [tailwindcss]*, [autoprefixer], [clean-css], [purgecss]

</small>

```bash
yarn add -D tailwindcss autoprefixer postcss postcss-import precss clean-css purgecss
```

\* `v1.0.0-beta.8` at the time of writing

[tailwindcss]: https://github.com/tailwindcss/tailwindcss
[postcss]: https://github.com/postcss/postcss
[precss]: https://github.com/jonathantneal/precss
[autoprefixer]: https://github.com/postcss/autoprefixer
[postcss-import]: https://github.com/postcss/postcss-import
[clean-css]: https://github.com/jakubpawlowicz/clean-css
[purgecss]: https://github.com/FullHuman/purgecss

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

I use `postcss-import`, so that's why you'll see `@import 'tailwind/components'` instead of `@tailwind components`. [Tailwind's docs on this](https://tailwindcss.com/docs/installation)

Here's a quick example (my structure follows [ITCSS convention](https://itcss.io/)).

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

I'll use the [`.11ty.js` template engine](https://www.11ty.io/docs/languages/javascript/) so I can handle all the processing with plain old JavaScript.

```js
// src/styles.11ty.js

const fs = require('fs')
const path = require('path')
const postcss = require('postcss')

module.exports = class {
  async data () {
    // path is relative to styles.11ty.js
    const rawFilepath = path.join(__dirname, '_includes/css/main.css')

    return {
      permalink: 'styles.css',
      rawFilepath,
      rawCss: await fs.readFileSync(rawFilepath),
    }
  }

  async render ({ rawCss, rawFilepath }) {
    return await postcss([
      // order matters
      require('postcss-import'),
      require('precss'),
      require('tailwindcss'),
      require('autoprefixer'),

      // handle purge and minification elsewhere
    ])
      .process(rawCss, { from: rawFilepath })
      .then(result => result.css)
  }
}
```

**Note** the permalink setting in the `data()` method. This will tell Eleventy to write the stylesheet to `dist/styles.css`, which we'll reference in our base layout:

```markup
<link href="/styles.css" rel="stylesheet">
```

The template itself is pretty self-explanatory. But a few quick notes:

- Order matters in your PostCSS plugins chain. Import first, then PreCSS, then Tailwind, and finally autoprefix the resulting CSS.
- I'm sure you could use a `postcss.config.js` file instead, but I like having it all right here in the `.11ty.js` template file.
- We'll handle PurgeCSS and Minification tasks later in the build chain so that we can purge against Eleventy's final compiled HTML.

## Purge and Minify CSS with an Eleventy Transform

You could handle the purge and minification directly in `styles.11ty.js` via PostCSS plugins, but I prefer to use an [Eleventy Transform](https://www.11ty.io/docs/config/#transforms) instead, for a couple reasons:

**Future proof**

If I ever change from PostCSS/Tailwind to something else in the future, my CSS files will still be purged and minified when the site's built, regardless of my CSS pre-processing stack.

**Generated markup**

I'm using an [Eleventy plugin for code syntax highlighting](https://github.com/11ty/eleventy-plugin-syntaxhighlight), and it generates a bunch of markup during Eleventy's build step. This compiled HTML isn't necessarily available while Eleventy is processing `styles.11ty.js`.

I need PurgeCSS to see the resulting HTML output (`./dist/**/*.html`) after Eleventy has compiled its files — not the template source markup. If you were to instruct PurgeCSS to only look in the source templates (`src/**/*.njk`), PurgeCSS would remove the CSS classes that the syntax highlighting plugin generates.

Using a Transform for purging (and then minification) is the perfect solution, since Transforms happen later on in Eleventy's build chain. *I assume this is true; it seems to be true so far.*

```js
// .eleventy.js

const PurgeCSS = require('purgecss')
const CleanCSS = require('clean-css')

module.exports => config => {
  // Purge and minify CSS files
  config.addTransform('cleancss', async (content, outputPath) => {
    if (outputPath.endsWith('.css')) {
      const purgeCss = await new PurgeCSS({
        content: ['./dist/**/*.html'],
        css: [{ raw: content }],
      }).purge()

      content = purgeCss[0].css || content

      content = new CleanCSS({}).minify(content).styles
    }

    return content
  })
}
```

*Minification piece grabbed from [this 11ty.io quicktip on Inline Minified CSS](https://www.11ty.io/docs/quicktips/inline-css/).*

## Conclusion

Purging and minification sure go a long way.

In my case (at the time of writing), my compiled CSS file weighs **493KB** before purging and minifying, yet it's only **5KB** after.

I'm also purging and minifying CSS during development, instead of running these tasks only in production.

- I don't need source maps
- I don't need readable CSS
- I'd rather keep it as simple as possible until I need to add complexity

If and when I do need to run these only in production, I'd simply use some environment variables and check for those in or around the `cleancss` Transform.
