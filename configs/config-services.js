const SERVICES_CONFIG = {
  pageTitle: "Services - kuroma.dev",
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
    centerText: "Kuroma.dev - Services"
  },
  header: {
    title: "Services",
    subtitle: "Public-facing services, self-hosted on my home server",
    avatar: "",
    backButtons: [
      { text: "← Back Home", href: "#/" }
    ]
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
      id: "services-intro",
      title: "",
      type: "markdown",
      w: 12,
      h: 1,
      pinned: false,
      href: "",
      image_url: "",
      content: {
        markdown: "**![SVG](star){fill:var(--primary), stroke:var(--primary)} [Self-hosted!]{color:primary}** Everything below runs on my home server as part of my **[digital empire]{rainbow}** journey. Many, like **SearXNG** and **privatebin**, are open for anybody's use!"
      },
      tags: ["Info"],
      footer: "@kkuroma"
    },
    {
      id: "service-nextcloud",
      title: "![SVG](cloud){stroke:var(--primary), 20, 20} Nextcloud",
      type: "markdown",
      w: 4,
      h: 2,
      pinned: false,
      href: "https://cloud.kuroma.dev",
      image_url: "",
      content: {
        markdown: "**A self-hosted [cloud storage]{color:primary}** that links with external tools (office suite, calendar, photos) across devices."
      },
      tags: ["Productivity"],
      footer: "cloud.kuroma.dev"
    },
    {
      id: "service-vaultwarden",
      title: "![SVG](lock){stroke:var(--primary), 20, 20} Vaultwarden",
      type: "markdown",
      w: 4,
      h: 2,
      pinned: false,
      href: "https://vault.kuroma.dev",
      image_url: "",
      content: {
        markdown: "A lightweight **[Bitwarden]{color:primary}**-compatible password manager. No need to remember specific passwords ever again!"
      },
      tags: ["Productivity"],
      footer: "vault.kuroma.dev"
    },
    {
      id: "service-forgejo",
      title: "![SVG](git){stroke:var(--primary), 20, 20} Forgejo",
      type: "markdown",
      w: 4,
      h: 2,
      pinned: false,
      href: "https://git.kuroma.dev",
      image_url: "",
      content: {
        markdown: "Personal **[git forge]{color:primary}** instance for projects, mirrors, and CI/CD pipelines. Essentially GitHub, but mine."
      },
      tags: ["Productivity", "Infrastructure"],
      footer: "git.kuroma.dev"
    },
    {
      id: "service-searxng",
      title: "![SVG](search){stroke:var(--primary), 20, 20} SearXNG",
      type: "markdown",
      w: 4,
      h: 2,
      pinned: false,
      href: "https://searx.kuroma.dev",
      image_url: "",
      content: {
        markdown: "A private **[metasearch engine]{color:primary}** that aggregates results from many sources with no tracking and no ads and no AI."
      },
      tags: ["Tools"],
      footer: "searx.kuroma.dev"
    },
    {
      id: "service-stirling-pdf",
      title: "![SVG](document){stroke:var(--primary), 20, 20} Stirling PDF",
      type: "markdown",
      w: 4,
      h: 2,
      pinned: false,
      href: "https://pdf.kuroma.dev",
      image_url: "",
      content: {
        markdown: "A swiss-army knife of **[PDF tools]{color:primary}** that does merging, splitting, compressing, converting, and digital signing, all locally."
      },
      tags: ["Tools"],
      footer: "pdf.kuroma.dev"
    },
    {
      id: "service-privatebin",
      title: "![SVG](clipboard){stroke:var(--primary), 20, 20} PrivateBin",
      type: "markdown",
      w: 4,
      h: 2,
      pinned: false,
      href: "https://pastebin.kuroma.dev",
      image_url: "",
      content: {
        markdown: "A minimal, **[encrypted pastebin]{color:primary}** to send encrypted data securely; completely blind to even the server"
      },
      tags: ["Tools"],
      footer: "pastebin.kuroma.dev"
    }
  ],
  footer: "© 2026 KK Thuwajit (kuroma.dev)"
};
