# All new kuroma.dev

My current personal website, featuring a minimal tiling design! Visit [my website](https://kuroma.dev) to see it in action!! Design and functionality inspired by [HarutoHiroki's website](https://harutohiroki.com).

## TODO list:

- Origami collection: I just lost a lot of my origami pictures on my old phone. While I could recover from the still-working storage, I've decided to fold all of these models again cuz why not :^).
- Services: a router for my self-hosted services. Right now only `searx.kuroma.dev` is a free-for-all public access, so I'd rather wait until I can populate the site with a bit more content
- Mobile support: man I wish all phones rendered sites like desktop PCs :(

## How to create websites using my template

Pages are created declaratively to `./configs/*.js`. Blogs are declared in `./blogs/BLOG_*.js` and read using `./blog-loader.js`. Route your website in `index.html`. Finally, you can define you own themes (color palette) in `./themes.js` and add assets/icons in `./assets` and `./svg-library.js`.

## Imported Libraries/Frameworks

I used **NO JAVASCRIPT FRAMEWORKS** for this site so it should load faster than my old one. Only one library, prism.js (syntax highlighting), was imported for now.
