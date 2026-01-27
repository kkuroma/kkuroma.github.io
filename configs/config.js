const HOME_CONFIG = {
  pageTitle: "Home - kuroma.dev",
  favicon: "./assets/icon.webp",
  theme: "catppuccin",
  variant: "dark",
  fontSize: "medium",
  navbar: {
    navigation: [
      { text: "Home", href: "#/" },
      { text: "Projects", href: "#/projects" },
      { text: "Blog", href: "#/blog" },
      { text: "Origami", href: "#/origami" },
      { text: "Services", href: "#/services" } 
    ],
    centerText: "Kuroma.dev - Home"
  },
  header: {
    title: "Hi, I'm KK!",
    subtitle: "Data Scientist | Tech Enthusiast | Origami Artist",
    avatar: ""
  },
  selectionArea: {
    enabled: true,
    sortby: [
      {
        name: "Title A-Z",
        key: ["title"],
        ascending: true
      },
      {
        name: "Title Z-A",
        key: ["title"],
        ascending: false
      }
    ]
  },
  boxes: [
    {
      id: "introductions",
      title: "Introductions",
      type: "markdown",
      w: 6,
      h: 3,
      pinned: true,
      image_url: "./assets/profile.jpg",
      content: {
        markdown: `
My name is **[KK Thuwajit]{color:yellow}**, but you might know me online as **[KKuroma]{color:green}** as well.  

I recently graduated with a CS and math degree from **[UW Madison]{color:red}**, and my primary research interest lies in **[biomedical data sciences]{color:mauve}**.

I also like to tinker with my **[home server]{color:lavender}**, play the **[piano]{color:blue}**, and design **[origami]{color:cyan}** models.`

      },
      tags: ["Important"],
      footer: "Last updated: 2026/01/26"
    },
    {
      id: "about-this-site",
      title: "About this site",
      type: "markdown",
      w: 6,
      h: 3,
      pinned: true,
      image_url: "",
      content: {
        markdown: `
I made this website as a portfolio, blog, and a place to host my various web services. Heavily inspired by **[hyprland](https://hypr.land)** and **[haruto's website](https://harutohiroki.com)**, this website parses **[markdown-like]{color:blue}** texts into web elements. I hope my website showcases how this minimalist layout could be used to host project sites, blogs, or anything informative.

Learn more about my website **[here](https://github.com/kkuroma/homepage)**, and create your own blogs **[here](./editor/index.html)**.

Anyways, feel free to check around and make yourself at home!`
      },
      tags: ["Important"],
      footer: "Language: pure JavaScript, no frameworks"
    },
    {
      id: "more-about-me",
      title: "More about me [↗]",
      type: "markdown",
      w: 4,
      h: 3,
      pinned: false,
      href: "",
      image_url: "",
      content: {
        markdown: `
As of 2026, I am currently working on **[medical image registration]{color:blue}** research while awaiting my PhD decisions. Amidst the rampant subscriptions and data collection spree, I'm in the process of **[self-hosting]{color:blue}** as many services as I could, becoming more digitally independent while mastering linux, docker, and networking.
        `
      },
      tags: ["Important"],
      footer: "@kkuroma"
    },
    {
      id: "motd",
      title: "",
      type: "markdown",
      w: 8,
      h: 1,
      pinned: false,
      href: "",
      image_url: "",
      content: {
        markdown: "**![SVG](star){fill:var(--blue), stroke:var(--blue)} [News!]{color:blue}** this is where news or announcements typically go. Stay tuned for updates!"
      },
      tags: ["News"],
      footer: "@kkuroma"
    },
    {
      id: "contact-github",
      title: "",
      type: "markdown",
      w: 2,
      h: 2,
      pinned: false,
      href: "https://github.com/kkuroma",
      image_url: "svg:github:var(--blue)",
      content: {
        markdown: ""
      },
      tags: ["Social"],
      footer: "@kkuroma"
    },
    {
      id: "contact-email",
      title: "",
      type: "markdown",
      w: 2,
      h: 2,
      pinned: false,
      href: "mailto:contact@kuroma.dev",
      image_url: "svg:email:var(--blue)",
      content: {
        markdown: ""
      },
      tags: ["Social"],
      footer: "contact@kuroma.dev"
    },
    {
      id: "contact-linkedin",
      title: "",
      type: "markdown",
      w: 2,
      h: 2,
      pinned: false,
      href: "https://linkedin.com/in/kkuroma",
      image_url: "svg:linkedin:var(--blue)",
      content: {
        markdown: ""
      },
      tags: ["Social"],
      footer: "@/in/kkuroma"
    },
    {
      id: "contact-resume",
      title: "",
      type: "markdown",
      w: 2,
      h: 2,
      pinned: false,
      href: "public/resume.pdf",
      image_url: "svg:resume:var(--blue)",
      content: {
        markdown: ""
      },
      tags: ["Social"],
      footer: "2026/01/26"
    },
  ],
  footer: "© 2026 KK Thuwajit (kuroma.dev)"
};
