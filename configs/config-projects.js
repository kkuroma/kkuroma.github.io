const PROJECTS_CONFIG = {
  pageTitle: "Projects - kuroma.dev",
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
    centerText: "Kuroma.dev - Projects"
  },
  header: {
    title: "My works",
    subtitle: "A collection of my publicly available research, projects, and ideas",
    avatar: "./assets/profile.jpg",
    backButton: {
      text: "← Back Home",
      href: "#/"
    }
  },
  selectionArea: {
    enabled: true,
    sortby: [
      {
        name: "Latest",
        key: ["footer"],
        ascending: false
      },
      {
        name: "Oldest",
        key: ["footer"],
        ascending: true
      },
      {
        name: "Title A-Z",
        key: ["title"],
        ascending: true
      },
      {
        name: "Title Z-A",
        key: ["title"],
        ascending: false
      },
    ]
  },
  boxes: [
    {
      id: "homepage",
      title: "All-new kuroma.dev [↗]",
      type: "markdown",
      w: 6,
      h: 3,
      image_url: "./previews/kuromadotdev.png",
      content: {
        markdown: `## Homepage

My current personal website featuring a minimal tiling box design.

**Features:** lightweight and modular dynamically generated web elements via markdown-like declarative configs using a pure html/css/js engine, **[no heavy frameworks]{color:blue}** required.`
      },
      tags: ["web-development", "frontend"],
      footer: "2026",
      href: "https://github.com/kkuroma/kkuroma.github.io"
    },
    {
      id: "dotfiles",
      title: "Kuroma's Dotfiles [↗]",
      type: "markdown",
      w: 6,
      h: 3,
      image_url: "./previews/dotfiles.png",
      content: {
        markdown: `## My Dotfiles

An installer script for my developer desktop experience on Arch and Hyprland

**Features:** a working **[desktop shell]{color:blue}** and suite of applications, themed dynamically with **[material-you]{color:blue}** colors generated from wallpapers. Features both  **[tiling]{color:blue}** and **[scrolling]{color:blue}** window management`
      },
      tags: ["linux", "frontend"],
      footer: "2026",
      href: "https://github.com/kkuroma/dotfiles"
    },
    {
      id: "mpnrage-denoising",
      title: "MPnRAGE MRI Denoising",
      type: "markdown",
      w: 6,
      h: 3,
      image_url: "./previews/output.png",
      content: {
        markdown: `
## ISMRM 2024 Poster

**Findings:** we reduced MRI scan time from 9 to 2 minutes while sacrificing minimal quality by using resulting qT1 values to regularize the denoising of the image space. Both the denoiser and regularization use learnable U-Net models.`
      },
      tags: ["research", "biomedical", "computer-vision"],
      footer: "2024",
      href: ""
    },
    {
      id: "textual-exclusion",
      title: "Textual Exclusion [PDF]",
      type: "markdown",
      w: 6,
      h: 3,
      image_url: "./previews/textualexclusion.png",
      content: {
        markdown: `
## In-class research, CS839 @UW-Madison

**Findings:** training a diffusion model in two stages, textual inversion to learn a style vector, and using that vector to fine tune with LoRA, allows a dataset style and quality to be disentangled and provides a stronger style vector than Dreambooth.`
      },
      tags: ["in-class", "research", "computer-vision"],
      footer: "2023",
      href: "https://storage.kuroma.dev/pdf/CS839_Textual_Exclusion_Paper_Compressed.pdf"
    },
    {
      id: "eegwavenet",
      title: "EEGWaveNet [↗]",
      type: "markdown",
      w: 6,
      h: 3,
      image_url: "./previews/eegwavenet.png",
      content: {
        markdown: `
## IEEE Internet of Things Journal

**Findings:** we proposed a fast and accurate multi-scale CNN algorithm to detect seizure onsets from EEG brain signals. The architecture dynamically learns the wave filter to extract seizure features at each frequency range.`
      },
      tags: ["research", "biomedical", "signals"],
      footer: "2022",
      href: "https://github.com/IoBT-VISTEC/EEGWaveNet"
    },
    {
      id: "ganime",
      title: "GANime [↗]",
      type: "markdown",
      w: 6,
      h: 3,
      image_url: "./previews/ganime.png",
      content: {
        markdown: `
## GAN tutorial on anime faces

A quick personal project where I experimented with various types of GANs to generate anime faces at \"high\" (at the time) resolutions`
      },
      tags: ["computer-vision"],
      footer: "2021",
      href: "https://github.com/kkuroma/GANime"
    },
  ],
  footer: "© 2026 KK Thuwajit (kuroma.dev)"
};
