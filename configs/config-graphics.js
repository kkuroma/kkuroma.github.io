const GRAPHICS_CONFIG = {
  pageTitle: "Computer Graphics - kuroma.dev",
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
      { text: "Services", href: "#/services" },
    ],
    centerText: "Kuroma.dev - Computer Graphics",
  },
  header: {
    title: "Computer Graphics",
    subtitle:
      "Interactive canvas and WebGL demos from CS559 @UW-Madison, Fall 2024. Click a placeholder to load the demo in place, or click a box to open it standalone.",
    avatar: "",
    backButtons: [
      { text: "← Back Home", href: "#/" },
      { text: "← Back to Projects", href: "#/projects" },
    ],
  },
  selectionArea: {
    enabled: true,
    sortby: [
      {
        name: "Project Order",
        key: ["title"],
        ascending: true,
      },
      {
        name: "Reverse Order",
        key: ["title"],
        ascending: false,
      },
    ],
  },
  boxes: [
    {
      id: "graphics-p1",
      title: "Project #1: Spinny Icosahedron",
      type: "markdown",
      w: 6,
      h: 7,
      pinned: false,
      href: "./public/graphics/p1.html",
      image_url: "",
      content: {
        markdown:
          "![Iframe](./public/graphics/p1.html){Spinny Icosahedron demo, 520, spoiler}",
      },
      tags: ["p1", "2D Canvas"],
      footer: "3-Dimensional Icosahedron in Perspective View from Triangles",
    },
    {
      id: "graphics-p2",
      title: "Project #2: #TEAMTREES",
      type: "markdown",
      w: 6,
      h: 7,
      pinned: false,
      href: "./public/graphics/p2.html",
      image_url: "",
      content: {
        markdown:
          "![Iframe](./public/graphics/p2.html){L-system trees demo, 540, spoiler}",
      },
      tags: ["p2", "2D Canvas", "Procedural"],
      footer: "Recursive L-System Trees Drawn on a 2D Canvas",
    },
    {
      id: "graphics-p3",
      title: "Project #3: #TEAMTREES, in 3D",
      type: "markdown",
      w: 6,
      h: 7,
      pinned: false,
      href: "./public/graphics/p3.html",
      image_url: "",
      content: {
        markdown:
          "![Iframe](./public/graphics/p3.html){3D L-system trees demo, 660, spoiler}",
      },
      tags: ["p3", "2D Canvas", "Procedural"],
      footer: "L-System Trees Grown in 3D Space with a Controllable Camera",
    },
    {
      id: "graphics-p4",
      title: "Project #4: Bad Apple!!",
      type: "markdown",
      w: 6,
      h: 7,
      pinned: false,
      href: "./public/graphics/p4.html",
      image_url: "",
      content: {
        markdown:
          "![Iframe](./public/graphics/p4.html){Bad Apple!! curve animation demo, 600, spoiler}",
      },
      tags: ["p4", "2D Canvas", "Animation"],
      footer: "Bad Apple!! with hermite curves. Tap Canvas to Play/Pause)",
    },
    {
      id: "graphics-p5",
      title: 'Project #5: The "Infinite" Maze Game',
      type: "markdown",
      w: 12,
      h: 8,
      pinned: false,
      href: "./public/graphics/p5.html",
      image_url: "",
      content: {
        markdown:
          "![Iframe](./public/graphics/p5.html){Infinite maze game demo, 760, spoiler}",
      },
      tags: ["p5", "Procedural", "Game"],
      footer:
        "Randomly Generated 3D Mazes Played in First Person (WASD + Mouse)",
    },
    {
      id: "graphics-p7",
      title: "Project #7: Lore Accurate N-body Problem",
      type: "markdown",
      w: 12,
      h: 10,
      pinned: false,
      href: "./public/graphics/p7.html",
      image_url: "",
      content: {
        markdown:
          "![Iframe](./public/graphics/p7.html){N-body problem demo, 1000, spoiler}",
      },
      tags: ["p7", "WebGL", "Perlin Noise"],
      footer:
        "Newtonian N-Body Simulation Around a Perlin-Noise Lava Sun in Raw WebGL",
    },
    {
      id: "graphics-p8",
      title: "Project #8: 🗿 Moyai",
      type: "markdown",
      w: 12,
      h: 8,
      pinned: false,
      href: "./public/graphics/p8.html",
      image_url: "",
      content: {
        markdown:
          "![Iframe](./public/graphics/p8.html){Moyai WebGL scene demo, 700, spoiler}",
      },
      tags: ["p8", "WebGL", "Perlin Noise", "Game"],
      footer:
        "First-Person WebGL Scene with Bump Mapping and Perlin Terrain (Click Canvas for Pointer Lock, WASD + Space/Shift)",
    },
  ],
  footer: "© 2026 KK Thuwajit (kuroma.dev)",
};
