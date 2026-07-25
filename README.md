# All new kuroma.dev

My current personal website, featuring a minimal tiling design! Visit [my website](https://kuroma.dev) to see it in action!! Design and functionality inspired by [HarutoHiroki's website](https://harutohiroki.com).

## Creating your own site with my template

Every page is a plain config object rendered into a tiling grid of boxes. To create a new page, do the following.

### 1. Write the page config

Add a `configs/config-<name>.js` that exports a global config. A page is a header plus a list of boxes, where each box declares its grid size (`w` columns x `h` rows) and its markdown content. Example page layout:

```js
// configs/config-about.js
const ABOUT_CONFIG = {
  pageTitle: "About",
  theme: "Natsumikan",           // Haruhana | Natsumikan | Akiba | Fuyuyuki
  variant: "dark",               // dark | light | system
  navbar: { navigation: [{ text: "Home", href: "#/" }] },
  header: { title: "About me", subtitle: "who I am" },
  boxes: [],                     // your boxes go here
  footer: "© 2026",
};
```

Example box (one card in the grid):

```js
{
  id: "hello",
  title: "Hello",
  type: "markdown",
  w: 6,                          // width in grid columns (12 = full width)
  h: 3,                          // height in grid rows
  medium: { w: 4, h: 4 },        // optional per-breakpoint size override
  content: { markdown: "**Hi** there!" },
  tags: ["intro"],
}
```

### 2. Write the content

Box and blog content is written in a markdown-like syntax with a few custom extensions (theme colors, SVG icons, click-to-load iframes, and more). Rather than repeat the full syntax here, use my live editor and tutorial: [markdown editor tutorial](https://kuroma.dev/index.html#/blog/markdown-editor-tutorial).

### 3. Wire it up to a route

Load the config in `index.html` and register the route in `initApp()` inside `website.js`, then add a nav link to each config's `navbar.navigation`.

```html
<!-- index.html -->
<script src="configs/config-about.js"></script>
```

```js
// website.js -> initApp()
router.register('/about', ABOUT_CONFIG);   // now live at #/about
```

Blogs work the same way but live in `blogs/BLOG_<slug>.js`: after adding one, run `node scripts/generate-blog-manifest.js` to rebuild the manifest. Define your own color palettes in `themes.js`, and add icons in `svg-library.js`.

## Imported Libraries/Frameworks

I used **NO JAVASCRIPT FRAMEWORKS** for this site so it should load faster than my old one. Only two libraries, prism.js (syntax highlighting) and katex (mathematical expressions), were imported for now.
