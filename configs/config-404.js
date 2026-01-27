const NOT_FOUND_CONFIG = {
  pageTitle: "404 - Page Not Found",
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
    centerText: "Kuroma.dev - Page Not Found"
  },
  header: {
    title: "⚠ Under Construction ⚠",
    subtitle: "\"Be subtle, to the point of formlessness\" - Sun Tzu",
    avatar: "https://imgs.search.brave.com/9wS89X8HI8hllr2LRbLSVH0DzqJWOp9deDx8qfDtwAI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS50ZW5vci5jb20v/ZEJLb19IcnFZTkFB/QUFBTS91emF3YS1y/ZWlzYS1ibHVlLWFy/Y2hpdmUuZ2lm.gif",
    backButton: {
      text: "← Back Home",
      href: "#/"
    }
  },
  selectionArea: {
    enabled: false
  },
  boxes: [
    {
      id: "404-content",
      title: "Lost in Space?",
      type: "markdown",
      w: 4,
      h: 2,
      content: {
        markdown: `
The page you're looking for might have been moved, deleted, or never existed. 


**Check the URL** to make sure address is spelled correctly, or **use the navigation** to check out other parts of my site!`
      }
    },
    {
      id: "404-home",
      title: "",
      type: "markdown",
      href: "#/",
      image_url: "svg:home:var(--blue)",
      w: 2,
      h: 2,
      content: {
        markdown: ``
      },
      footer: "Go back home"
    },
    {
      id: "404-projects",
      title: "",
      type: "markdown",
      href: "#/projects",
      image_url: "svg:document:var(--blue)",
      w: 2,
      h: 2,
      content: {
        markdown: ``
      },
      footer: "Check out my projects"
    },
    {
      id: "404-blogs",
      title: "",
      type: "markdown",
      href: "#/blog",
      image_url: "svg:blog:var(--blue)",
      w: 2,
      h: 2,
      content: {
        markdown: ``
      },
      footer: "Read my blogs"
    },
    {
      id: "404-email",
      title: "",
      type: "markdown",
      href: "mailto:contact@kuroma.dev",
      image_url: "svg:email:var(--blue)",
      w: 2,
      h: 2,
      content: {
        markdown: ``
      },
      footer: "Email me the error"
    }
  ],
  footer: "© 2026 - You may be lost, but you'll not be forgotten"
};
