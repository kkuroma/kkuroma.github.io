const HOME_CONFIG = {
  pageTitle: "Home - kuroma.dev",
  favicon: "./assets/icon.webp",
  theme: "Natsumikan",
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
    subtitle: "Data Scientist | Homelabber | Origami Artist",
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
      medium: { w: 4, h: 4 },
      pinned: true,
      image_url: "./assets/profile.webp",
      image_size: [360, 350],
      content: {
        markdown: `
My name is **[KK Thuwajit]{color:yellow}**, but you might know me online as **[KKuroma]{color:green}** as well.

I graduated with a CS and math degree from **[UW Madison]{color:red}**, and am pursuing a masters degree at **[UCLA]{color:mauve}**.

Other than that, I also play the **[piano]{color:primary}** and design **[origami]{color:teal}** models.`

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
      medium: { w: 4, h: 4 },
      pinned: true,
      image_url: "",
      content: {
        markdown: `
I made this website as a portfolio, blog, and an entry point for my homelab. Heavily inspired by tiling window managers like **[hyprland](https://hypr.land)** and **[haruto's website](https://harutohiroki.com)**, this website parses **[markdown-like]{color:primary}** texts into web elements. Each page on this site is created from the same markdown blocks, sculpted into a coherent site!

Learn more about my website **[at the repository](https://git.kuroma.dev/kkuroma/kuroma.dev)**, and create your own blogs **[with the online editor](./editor/index.html)**.

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
      medium: { h: 4 },
      pinned: false,
      href: "#/blog/welcome-to-kuroma-dev",
      image_url: "",
      content: {
        markdown: `
I have a professional background in **[AI/ML]{color:green}** and **[data science]{color:yellow}**. About a year ago, I've extended my interests into self-hosting the data science systems I've built. Coming from a belief that technology should be open and transparent, I am building my **[homelab]{color:lavender}** and deploying local **[AI agents]{color:blue}** to prove digital sovereignty isn't just a myth!
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
        markdown: "**![SVG](git){fill:var(--primary), stroke:var(--primary)} [Projects are self-hosted]{color:primary}** using forgejo at my own git instance **[here](https://git.kuroma.dev)**!"
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
      image_url: "svg:github:var(--primary)",
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
      image_url: "svg:email:var(--primary)",
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
      image_url: "svg:linkedin:var(--primary)",
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
      image_url: "svg:resume:var(--primary)",
      content: {
        markdown: ""
      },
      tags: ["Social"],
      footer: "2026/01/26"
    },
  ],
  footer: "© 2026 KK Thuwajit (kuroma.dev)"
};
