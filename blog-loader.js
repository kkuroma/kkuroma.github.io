class BlogLoader {
  /**
   * Creates a blog loader seeded with the generated manifest.
   *
   * Filenames come from blogs/manifest.js (window.BLOG_MANIFEST), produced by
   * scripts/generate-blog-manifest.js, so there is no hand-maintained list here.
   */
  constructor() {
    this.blogs = [];
    this.blogFiles =
      typeof window !== "undefined" && Array.isArray(window.BLOG_MANIFEST)
        ? window.BLOG_MANIFEST.slice()
        : [];
  }

  /**
   * Loads every blog in the manifest by injecting a <script> per file.
   *
   * Each blog script sets window.BLOG_CONFIG, which is copied, tagged with a
   * slug derived from the filename, then cleared. Failures are logged and
   * yield an empty list rather than throwing.
   *
   * @returns {Promise<object[]>} the loaded blog objects (empty on error)
   */
  async loadAllBlogs() {
    const loadPromises = this.blogFiles.map((filename) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `./blogs/${filename}.js`;
        script.onload = () => {
          if (window.BLOG_CONFIG) {
            const blog = { ...window.BLOG_CONFIG };
            blog.slug = filename.replace("BLOG_", "");
            delete window.BLOG_CONFIG;
            resolve(blog);
          } else {
            reject(new Error(`BLOG_CONFIG not found in ${filename}`));
          }
        };
        script.onerror = () => reject(new Error(`Failed to load ${filename}`));
        document.head.appendChild(script);
      });
    });
    try {
      const results = await Promise.all(loadPromises);
      this.blogs = results.filter((blog) => blog !== null);
      return this.blogs;
    } catch (error) {
      console.error("Error loading blogs:", error);
      return [];
    }
  }

  /**
   * The navbar config shared by the blog listing and post pages.
   *
   * @returns {object} navbar config with navigation links and center text
   */
  baseNavbar() {
    return {
      navigation: [
        { text: "Home", href: "#/" },
        { text: "Projects", href: "#/projects" },
        { text: "Blog", href: "#/blog" },
        { text: "Origami", href: "#/origami" },
        { text: "Services", href: "#/services" },
      ],
      centerText: "Kuroma.dev - Blogs",
    };
  }

  /**
   * Builds the full page config for the /blog listing.
   *
   * Turns each loaded blog into a preview box (first paragraph plus read time)
   * and wraps them with the shared navbar, header, and sort controls.
   *
   * @returns {object} page config for the blog index
   */
  buildListConfig() {
    const boxes = this.blogs.map((blog) => ({
      id: `blog-${blog.slug}`,
      title: blog.title,
      type: "markdown",
      w: 6,
      h: 3,
      image_url: blog.preview_img,
      image_size: blog.preview_img_size || null,
      date: blog.date_created,
      pinned: blog.pinned || false,
      content: {
        markdown: this.generatePreviewMarkdown(blog),
      },
      tags: blog.tags,
      footer: this.generateFooter(blog),
      href: `#/blog/${blog.slug}`,
    }));

    return {
      pageTitle: "Blogs - Kuroma.dev",
      maxItemsPerPage: 6,
      favicon: "",
      theme: "Natsumikan",
      variant: "dark",
      fontSize: "medium",
      navbar: this.baseNavbar(),
      header: {
        title: "My Blogs",
        subtitle: "Welcome to my corner of the internet",
        avatar: "./assets/profile.webp",
        backButtons: [
          {
            text: "← Back Home",
            href: "#/",
          },
          {
            text: "Go to Editor",
            href: "./editor/index.html",
          },
        ],
      },
      selectionArea: {
        enabled: true,
        sortby: [
          {
            name: "Newest First",
            key: ["date"],
            ascending: false,
          },
          {
            name: "Oldest First",
            key: ["date"],
            ascending: true,
          },
          {
            name: "Title A-Z",
            key: ["title"],
            ascending: true,
          },
        ],
      },
      boxes: boxes,
      footer: "© 2026 KK Thuwajit (kuroma.dev)",
    };
  }

  /**
   * Estimates reading time from a markdown string at 250 words per minute.
   *
   * @param {string} markdownContent  - the raw markdown to measure
   * @returns {string} human-readable duration, e.g. "5 min"
   */
  calculateReadingTime(markdownContent) {
    const words = markdownContent
      .split(/\s+/)
      .filter((word) => word.trim().length > 0);
    const wordCount = words.length;
    const WPM = 250;
    const readTime = Math.ceil(wordCount / WPM);
    return `${readTime} min`;
  }

  /**
   * Formats a date string for the en-US locale.
   *
   * @param {string} dateStr  - an ISO-ish date parseable by Date
   * @param {object} options  - Intl.DateTimeFormat options
   * @returns {string} the localized date
   */
  formatDate(dateStr, options) {
    return new Date(dateStr).toLocaleDateString("en-US", options);
  }

  /**
   * Composes a blog's display date, optional "Updated" note, and read time.
   *
   * @param {object} blog          - blog object with date_created/date_updated/content
   * @param {boolean} longFormat   - long month names and "·" separators when true
   * @param {boolean} includeTime  - append the reading-time clause when true
   * @returns {string} the assembled date/meta line
   */
  getDateString(blog, longFormat = true, includeTime = true) {
    const dateOpts = longFormat
      ? { year: "numeric", month: "long", day: "numeric" }
      : { year: "numeric", month: "short", day: "numeric" };

    const date = this.formatDate(blog.date_created, dateOpts);
    const updated = blog.date_updated
      ? ` ${longFormat ? "·" : "("}Updated ${this.formatDate(blog.date_updated, { year: "numeric", month: "short", day: "numeric" })}${longFormat ? "" : ")"}`
      : "";
    const readTime = includeTime
      ? ` · ${this.calculateReadingTime(blog.content)} read`
      : "";

    return `${date}${updated}${readTime}`;
  }

  /**
   * Builds the listing preview markdown: first paragraph plus read time.
   *
   * @param {object} blog  - blog object whose content is split for the preview
   * @returns {string} preview markdown for a listing box
   */
  generatePreviewMarkdown(blog) {
    const preview = blog.content.split("\n\n").slice(0, 1).join("\n\n");
    return `${preview}\n\n**Read time:** ${this.calculateReadingTime(blog.content)}`;
  }

  /**
   * The short-format footer line for a blog box (date and read time).
   *
   * @param {object} blog  - blog object to describe
   * @returns {string} footer text
   */
  generateFooter(blog) {
    return this.getDateString(blog, false, true);
  }

  /**
   * The long-format subtitle line for a blog post header.
   *
   * @param {object} blog  - blog object to describe
   * @returns {string} subtitle text
   */
  generateSubtitle(blog) {
    return this.getDateString(blog, true, true);
  }

  /**
   * Finds a loaded blog by its slug.
   *
   * @param {string} slug  - the slug derived from the blog filename
   * @returns {object|undefined} the matching blog, or undefined if none
   */
  getBySlug(slug) {
    return this.blogs.find((blog) => blog.slug === slug);
  }

  /**
   * Builds the full page config for a single blog post.
   *
   * @param {string} slug  - the slug of the post to render
   * @returns {object|null} the post page config, or null if the slug is unknown
   */
  buildPostConfig(slug) {
    const blog = this.getBySlug(slug);
    if (!blog) return null;

    return {
      pageTitle: `${blog.title} - Kuroma.dev`,
      favicon: "./assets/icon.webp",
      theme: "Natsumikan",
      variant: "dark",
      fontSize: "medium",
      navbar: this.baseNavbar(),
      header: {
        title: blog.title,
        subtitle: this.generateSubtitle(blog),
        backButtons: [
          { text: "← Back to Blog", href: "#/blog" },
          { text: "← Back Home", href: "#/" },
        ],
      },
      selectionArea: { enabled: false },
      boxes: [
        {
          id: "blog-content",
          title: "",
          type: "markdown",
          w: 12,
          h: 1,
          isBlogPost: true,
          content: { markdown: blog.content },
          tags: blog.tags,
          footer: this.generateFooter(blog),
        },
      ],
      footer: "© 2026 KK Thuwajit (kuroma.dev)",
    };
  }
}

if (typeof window !== "undefined") {
  window.blogLoader = new BlogLoader();
}
