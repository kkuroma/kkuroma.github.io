class BlogLoader {
  constructor() {
    this.blogs = [];
    this.blogFiles = [
      'BLOG_welcome-to-kuroma-dev',
      'BLOG_markdown-editor-tutorial',
    ];
  }

  // load blogs from ./blogs by injecting <script>s
  async loadAllBlogs() {
    const loadPromises = this.blogFiles.map((filename) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `./blogs/${filename}.js`;
        script.onload = () => {
          if (window.BLOG_CONFIG) {
            const blog = {...window.BLOG_CONFIG};
            blog.slug = filename.replace('BLOG_', '');
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
      this.blogs = results.filter(blog => blog !== null);
      return this.blogs;
    } catch (error) {
      console.error('Error loading blogs:', error);
      return [];
    }
  }

  generateBlogListingConfig() {
    const boxes = this.blogs.map(blog => ({
      id: `blog-${blog.slug}`,
      title: blog.title,
      type: "markdown",
      w: 6,
      h: 2,
      image_url: blog.preview_img,
      date: blog.date_created,
      pinned: blog.pinned || false,
      content: {
        markdown: this.generatePreviewMarkdown(blog)
      },
      tags: blog.tags,
      footer: this.generateFooter(blog),
      href: `#/blog/${blog.slug}`
    }));

    return {
      pageTitle: "Blogs - Kuroma.dev",
      maxItemsPerPage: 6,
      favicon: "",
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
        centerText: "Kuroma.dev - Blogs"
      },
      header: {
        title: "My Blogs",
        subtitle: "Welcome to my corner of the internet",
        avatar: "./assets/profile.jpg",
        backButtons: [
          {
            text: "← Back Home",
            href: "#/"
          },
          {
            text: "Go to Editor",
            href: "./editor/index.html"
          }
        ]
      },
      selectionArea: {
        enabled: true,
        sortby: [
          {
            name: "Newest First",
            key: ["date"],
            ascending: false
          },
          {
            name: "Oldest First",
            key: ["date"],
            ascending: true
          },
          {
            name: "Title A-Z",
            key: ["title"],
            ascending: true
          }
        ]
      },
      boxes: boxes,
      footer: "© 2026 KK Thuwajit (kuroma.dev)"
    };
  }

  // Helper: format date with options
  formatDate(dateStr, options) {
    return new Date(dateStr).toLocaleDateString('en-US', options);
  }

  // Helper: generate date string with optional update
  getDateString(blog, longFormat = true, includeTime = true) {
    const dateOpts = longFormat
      ? { year: 'numeric', month: 'long', day: 'numeric' }
      : { year: 'numeric', month: 'short', day: 'numeric' };

    const date = this.formatDate(blog.date_created, dateOpts);
    const updated = blog.date_updated
      ? ` ${longFormat ? '·' : '('}Updated ${this.formatDate(blog.date_updated, { year: 'numeric', month: 'short', day: 'numeric' })}${longFormat ? '' : ')'}`
      : '';
    const readTime = includeTime ? ` · ${blog.read_time} read` : '';

    return `${date}${updated}${readTime}`;
  }

  generatePreviewMarkdown(blog) {
    const preview = blog.content.split('\n\n').slice(0, 1).join('\n\n');
    return `${preview}\n\n**Read time:** ${blog.read_time}`;
  }

  generateFooter(blog) {
    return this.getDateString(blog, false, true);
  }

  generateSubtitle(blog) {
    return this.getDateString(blog, true, true);
  }

  getBlogBySlug(slug) {
    return this.blogs.find(blog => blog.slug === slug);
  }

  generateBlogPostConfig(slug) {
    const blog = this.getBlogBySlug(slug);
    if (!blog) return null;

    return {
      pageTitle: `${blog.title} - Kuroma.dev`,
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
        centerText: "Kuroma.dev - Blogs"
      },
      header: {
        title: blog.title,
        subtitle: this.generateSubtitle(blog),
        backButtons: [
          { text: "← Back to Blog", href: "#/blog" },
          { text: "← Back Home", href: "#/" }
        ]
      },
      selectionArea: { enabled: false },
      boxes: [{
        id: "blog-content",
        title: "",
        type: "markdown",
        w: 12,
        h: 1,
        isBlogPost: true,
        content: { markdown: blog.content },
        tags: blog.tags,
        footer: this.generateFooter(blog)
      }],
      footer: "© 2026 KK Thuwajit (kuroma.dev)"
    };
  }
}

if (typeof window !== 'undefined') {
  window.blogLoader = new BlogLoader();
}
