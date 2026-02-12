(function() {
const BLOG_CONFIG = {
  title: "Markdown Editor Tutorial",
  date_created: "2026-01-27",
  date_updated: null,
  read_time: "15 min",
  tags: ["tutorial"],
  preview_img: null,
  pinned: true,
  content: `The **[blog editor](./editor/index.html)** allows you (and me) to easily edit markdowns and publish to a blog or just render markdowns for personal use. This page serves as a comprehensive guide to all markdown+ features available on this site

- [TODO] Stress test various markdown combinations to find one that break the renderer
- [TODO] Add LaTeX support via [latex.js](https://latex.js.org/)
- [TODO] Add [itty.bitty](https://itty.bitty)-like url-embedded content for easy sharing

#TOC

---

# Table of contents

Paragraphs whose content is \`#TOC\` indicate where to a table of content should be placed (yes, multiple can exist if you choose so). As you can easily try right above, clicking on each entry will redirect you that entry's position in page. Headers of all sizes will be registered to the ToC.

---

# Headers

Headers are the easiest way to section your markdown into chapters. Paragraphs starting with \`#\`, \`##\`, and \`###\` will be treated as headers and therefore recognized by the table of contents.

---

# Text Formatting

My markdown-like parses supports the following formatting syntax:

- \`**BOLD**\` --> enables **BOLD** text
- \`*italicize*\` --> enables *italicize* text
- \`__underline__\` --> enables __underline__ text
- \`~~strikethrough~~\` --> enables ~~strikethrough~~ text
- colors: using the following formats
  - \`[text]{color:your_color}\` --> renders \`text\` in \`your_color\`, supports [red]{color:red}, [maroon]{color:maroon}, [peach]{color:peach}, [yellow]{color:yellow}, [green]{color:green}, [teal]{color:teal}, [sky]{color:sky}, [sapphire]{color:sapphire}, [blue]{color:blue}, [lavender]{color:lavender}, [mauve]{color:mauve}, [pink]{color:pink}, [flamingo]{color:flamingo}, [rosewater]{color:rosewater}
  - \`[text]{hex:your_hex_color}\` --> renders \`text\` in \`your_hex_color\` (i.e. [#ffffff]{hex:#ffffff})
  - \`[rainbow_text]{rаinbow}\` --> renders [rainbow_text]{rainbow}!!!

---

# Lists

Use \`-\` for unordered lists and number \`1.\` \`2.\` \`3.\` for ordered (numbered) lists, for example:
\`\`\`
- Unordered list item
- Another unordered list item
  - Indented unordered list item
  - Another indented unordered list item

1. list item 1
2. list item 2
3. list item 3
\`\`\`
renders to

- Unordered list item
- Another unordered list item
  - Indented unordered list item
  - Another indented unordered list item

1. list item 1
2. list item 2
3. list item 3

---

# Code

Surround the backtick symbol (\`) for an in-line code block, or three backtick symbol followed by a programming language name to render a syntax highlighted code block in that language. I used [prism.js](https://prismjs.com/) for syntax highlighting.

\`\`\`python
# This is a python code
def fibonacci(n):
  if n==0 or n==1:
    return 1
  return fibonacci(n-1) + fibonacci(n-2)
\`\`\`

\`\`\`js
// This is a javascript code
function fibonacci(n) {
  if (n === 0 || n === 1) { return 1; }
  return fibonacci(n - 1) + fibonacci(n - 2);
}
\`\`\`

---

# Hyperlinks

\`[object](https://example.com)\` creates an [object](https://example.com) that links to \`https://example.com\`. The object isn't limited to text; even SVG icons or images, which I'll show later on, can contain a hyperlink.

---

# Blockquotes

> This is a block quote. You can create one by beginning a paragraph with a >. Block quotes can span multiple lines and support \`other\` **types** __of__ ~~styling~~ inside of it.

---

# Sectioning

You may have noticed that sections are separated nicely via horizontal rules. Use \`---\` on an empty paragraph to create a horizontal rule

---

# Tables

My site uses a markdown-like syntax to render tables, that is, pipes (|) dictates the number of column a table should have. Here's an example

\`\`\`md
|ColumnA|ColumnB|ColumnC|
|-------|-------|-------| // this row doesn't really matter, I coded it to skip the second row
|1      |2      |3      |
|4      |5      |6      |
|7      |8      |9      |
\`\`\`

renders to

|ColumnA|ColumnB|ColumnC|
|-------|-------|-------|
|1      |2      |3      |
|4      |5      |6      |
|7      |8      |9      |

---

# Icons

SVG icons can be rendered in-line with the following syntax \`![SVG](icon_name){parameters (optional), width (optional), height (optional)}\`. Supported parameters are \`fill:var(--color)\` and \`stroke:var(--color)\`, using the same available colors as texts.

My site currently supports the following icons

| **[Name]{color:blue}** | **[Icon]{color:blue}** | **[Category]{color:blue}** |
|------------------------|------------------------|---------------------------|
| [alert]{color:red}    | ![SVG](alert){fill:var(--red), stroke:var(--red), 24, 24} | Alert |
| [arrow]{color:maroon} | ![SVG](arrow){fill:var(--maroon), stroke:var(--maroon), 24, 24} | Navigation |
| [blog]{color:peach}   | ![SVG](blog){fill:var(--peach), stroke:var(--peach), 24, 24} | Navigation |
| [check]{color:yellow} | ![SVG](check){fill:var(--yellow), stroke:var(--yellow), 24, 24} | Basic |
| [document]{color:green} | ![SVG](document){fill:var(--green), stroke:var(--green), 24, 24} | Basic |
| [download]{color:teal} | ![SVG](download){fill:var(--teal), stroke:var(--teal), 24, 24} | Basic |
| [email]{color:sky}    | ![SVG](email){fill:var(--sky), stroke:var(--sky), 24, 24} | Social |
| [external]{color:sapphire} | ![SVG](external){fill:var(--sapphire), stroke:var(--sapphire), 24, 24} | Navigation |
| [github]{color:blue}  | ![SVG](github){fill:var(--blue), stroke:var(--blue), 24, 24} | Social |
| [home]{color:lavender} | ![SVG](home){fill:var(--lavender), stroke:var(--lavender), 24, 24} | Navigation |
| [linkedin]{color:mauve} | ![SVG](linkedin){fill:var(--mauve), stroke:var(--mauve), 24, 24} | Social |
| [link]{color:pink}    | ![SVG](link){fill:var(--pink), stroke:var(--pink), 24, 24} | Navigation |
| [resume]{color:flamingo} | ![SVG](resume){fill:var(--flamingo), stroke:var(--flamingo), 24, 24} | Basic |
| [star]{color:rosewater} | ![SVG](star){fill:var(--rosewater), stroke:var(--rosewater), 24, 24} | Basic |
| [twitter]{color:peach} | ![SVG](twitter){fill:var(--peach), stroke:var(--peach), 24, 24} | Social |
| [warning]{color:yellow} | ![SVG](warning){fill:var(--yellow), stroke:var(--yellow), 24, 24} | Alert |
| [website]{color:green} | ![SVG](website){fill:var(--green), stroke:var(--green), 24, 24} | Navigation |

---

# Images

Use this syntax \`![Image](url){caption (optional), width (optional), height (optional)}\` for images:

![Image](https://picsum.photos/400/300){A random placeholder image, 400, 300}

And use pipe (|) separator for multiple images:

![Image](https://picsum.photos/350/300){Left Image, 350, 300} | ![Image](https://picsum.photos/350/300){Right Image, 350, 300}

![Image](https://picsum.photos/300/200){Left Image, 300, 200} | ![Image](https://picsum.photos/300/200){Center Image, 300, 200} | ![Image](https://picsum.photos/300/200){Right Image, 300, 200}

---

# Iframes

Iframes (interactive frame) uses identical syntaxes to that of images \`![Iframe](url){caption (optional), width (optional), height (optional)}\`:

![Iframe](https://kuroma.dev){My website within itself?! Inception!!, 800, 600}

---

That's everything I have to offer with this site! White I made this markdown editor for myself to more easily write blogs, feel free to use it as your online markdown renderer. Happy writing! ![SVG](blog){stroke:var(--blue), 20, 20}`
};
window.BLOG_CONFIG = BLOG_CONFIG;
})();
