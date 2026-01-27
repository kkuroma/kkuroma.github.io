# All new kuroma.dev

My current website, featuring a minimal tiling design! Visit [my website](https://kuroma.dev) to see it in action!! Design and functionality inspired by [HarutoHiroki's website](https://harutohiroki.com).

## TODO list:

- Origami collection: I lost a lot of my origami pictures on my old phone. I could recover from the still-working storage, but I've decided to fold all of these models again.
- Services: a router for my self-hosted services. Right now only `searx.kuroma.dev` has a free-for-all public access

## How to create websites using my template

Pages are created declaratively to `./configs/*.js`. Blogs are declared in `./blogs/BLOG_*.js` and read using `./blog-loader.js`. Route your website in `index.html`. Finally, you can define you own themes (color palette) in `./themes.js` and add assets/icons in `./assets` and `./svg-library.js`.

## Imported Libraries/Frameworks

I'm using **NO JAVASCRIPT FRAMEWORKS** for this site, and it should load faster than my old one. Only one library, prism.js (syntax highlighting), is imported for now
