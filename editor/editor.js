/**
 * Blog Editor
 * Main logic for the blog editor interface
 */

class BlogEditor {
  /**
   * Creates the editor, restoring theme/variant/fontSize shared with the site.
   *
   * Reads the saved appearance from StateManager (website.js) so the editor
   * matches the main site, seeds empty metadata/content, then runs init().
   */
  constructor() {
    this.mode = 'edit'; // 'edit' or 'preview' mode
    // Share theme/variant/fontSize with the main site via StateManager (website.js)
    const saved = window.stateManager ? window.stateManager.getState() : {};
    this.theme = (typeof THEMES !== 'undefined' && THEMES[saved.theme]) ? saved.theme : 'Natsumikan';
    this.variantMode = saved.variant || 'dark';
    this.variant = this.getEffectiveVariant();
    this.fontSize = saved.fontSize || 'medium';
    this.metadata = {
      title: '',
      date_created: '',
      date_updated: null,
      tags: [],
      preview_img: null,
      pinned: false
    };
    this.content = '';
    this.previewGenerator = null;

    this.init();
  }

  /**
   * Wires up the editor: dropdowns, appearance, listeners, and default date.
   *
   * @returns {void}
   */
  init() {
    this.populateDropdowns();
    this.applyTheme();
    this.applyFontSize();
    this.attachEventListeners();
    this.setDefaultDate();
    this.updateCharCount();
    const loading = document.getElementById('editor-loading');
    if (loading) loading.remove();
  }

  /**
   * Fills the font-size, theme, and variant selects with their options.
   *
   * @returns {void}
   */
  populateDropdowns() {
    const fill = (id, options, selected) => {
      const select = document.getElementById(id);
      options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        option.selected = opt.value === selected;
        select.appendChild(option);
      });
    };

    fill('font-size-select', [
      { value: 'small', label: 'Small' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Large' },
      { value: 'xlarge', label: 'XLarge' }
    ], this.fontSize);

    const availableThemes = typeof THEMES !== 'undefined' ? Object.keys(THEMES) : ['Natsumikan'];
    fill('theme-select', availableThemes.map(t => ({ value: t, label: t })), this.theme);

    fill('variant-select', [
      { value: 'dark', label: 'Dark' },
      { value: 'light', label: 'Light' },
      { value: 'system', label: 'System' }
    ], this.variantMode);
  }

  /**
   * Resolves 'system' variant to the OS preference, else the chosen variant.
   *
   * @returns {'dark'|'light'} the effective color variant
   */
  getEffectiveVariant() {
    if (this.variantMode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return this.variantMode;
  }

  /**
   * Applies the current theme palette to CSS variables and syncs the boot cache.
   *
   * Writes both light and dark variants to the StateManager paletteCache so the
   * pre-paint boot script in index.html can restyle without a flash.
   *
   * @returns {void}
   */
  applyTheme() {
    if (typeof THEMES === 'undefined') return;
    const colors = THEMES[this.theme][this.variant];
    const root = document.documentElement;
    Object.entries(colors).forEach(([name, value]) => {
      root.style.setProperty(`--${name}`, value);
    });
    // Keep the pre-paint boot script's palette cache in sync (see index.html)
    if (window.stateManager) {
      window.stateManager.setState('paletteCache', {
        theme: this.theme,
        light: THEMES[this.theme].light,
        dark: THEMES[this.theme].dark
      });
    }
  }

  /**
   * Sets the base font size CSS variable from the current fontSize key.
   *
   * @returns {void}
   */
  applyFontSize() {
    const root = document.documentElement;
    const fontSizes = {
      'small': '14px',
      'medium': '16px',
      'large': '18px',
      'xlarge': '20px'
    };
    root.style.setProperty('--font-size-base', fontSizes[this.fontSize] || fontSizes['medium']);
  }

  /**
   * Defaults the creation-date input to today's date.
   *
   * @returns {void}
   */
  setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date-created-input').value = today;
  }

  /**
   * Binds all toolbar, input, and appearance-control event listeners.
   *
   * Appearance changes are persisted via StateManager so the main site picks
   * up the same theme/variant/font size.
   *
   * @returns {void}
   */
  attachEventListeners() {
    // Mode toggle
    document.getElementById('toggle-mode-btn').addEventListener('click', () => {
      this.toggleMode();
    });

    // Upload
    document.getElementById('upload-btn').addEventListener('click', () => {
      document.getElementById('file-input').click();
    });

    document.getElementById('file-input').addEventListener('change', (e) => {
      this.handleFileUpload(e);
    });

    // Export
    document.getElementById('export-btn').addEventListener('click', () => {
      this.exportBlog();
    });

    // Clear
    document.getElementById('clear-btn').addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all fields? This cannot be undone.')) {
        this.clearEditor();
      }
    });

    // Character count
    document.getElementById('content-textarea').addEventListener('input', () => {
      this.updateCharCount();
    });

    // Theme controls (persisted so the main site picks them up too)
    document.getElementById('font-size-select').addEventListener('change', (e) => {
      this.fontSize = e.target.value;
      this.applyFontSize();
      if (window.stateManager) window.stateManager.setState('fontSize', this.fontSize);
    });

    document.getElementById('theme-select').addEventListener('change', (e) => {
      this.theme = e.target.value;
      this.applyTheme();
      if (window.stateManager) window.stateManager.setState('theme', this.theme);
    });

    document.getElementById('variant-select').addEventListener('change', (e) => {
      this.variantMode = e.target.value;
      this.variant = this.getEffectiveVariant();
      this.applyTheme();
      if (window.stateManager) window.stateManager.setState('variant', this.variantMode);
    });
  }

  /**
   * Refreshes the character-count readout from the content textarea.
   *
   * @returns {void}
   */
  updateCharCount() {
    const textarea = document.getElementById('content-textarea');
    const count = textarea.value.length;
    document.getElementById('char-count').textContent = count.toLocaleString();
  }

  /**
   * Toggles between edit and preview modes, rendering the preview on entry.
   *
   * @returns {void}
   */
  toggleMode() {
    const btnText = document.getElementById('toggle-mode-text');
    const editMode = document.getElementById('edit-mode');
    const previewMode = document.getElementById('preview-mode');

    if (this.mode === 'edit') {
      // Switch to preview
      this.mode = 'preview';
      btnText.textContent = 'Edit';
      editMode.style.display = 'none';
      previewMode.style.display = 'block';
      this.renderPreview();
      this.addPreviewScroll();
    } else {
      // Switch to edit
      this.mode = 'edit';
      btnText.textContent = 'Preview';
      editMode.style.display = 'block';
      previewMode.style.display = 'none';
      this.removePreviewScroll();
    }
  }

  /**
   * Adds the scroll listener that shows the preview's back-to-top button.
   *
   * @returns {void}
   */
  addPreviewScroll() {
    // Add scroll listener for back-to-top button in preview
    this.previewScrollHandler = () => {
      const backToTop = document.getElementById('preview-back-to-top');
      if (backToTop) {
        if (window.scrollY > 300) {
          backToTop.classList.add('visible');
        } else {
          backToTop.classList.remove('visible');
        }
      }
    };
    window.addEventListener('scroll', this.previewScrollHandler);
  }

  /**
   * Removes the preview scroll listener if one is attached.
   *
   * @returns {void}
   */
  removePreviewScroll() {
    if (this.previewScrollHandler) {
      window.removeEventListener('scroll', this.previewScrollHandler);
    }
  }

  /**
   * Renders the live preview: header, parsed markdown body, and footer.
   *
   * Collects the current metadata and content, parses the markdown (lazy-loading
   * KaTeX when needed), applies syntax highlighting, and injects a back-to-top
   * button.
   *
   * @returns {Promise<void>}
   */
  async renderPreview() {
    // Collect current data
    this.collectMetadata();
    this.content = document.getElementById('content-textarea').value;

    // Clear preview container
    const container = document.getElementById('preview-container');
    container.innerHTML = '';

    // Create preview wrapper
    const previewWrapper = document.createElement('div');
    previewWrapper.className = 'preview-wrapper';

    // Create header section
    const header = document.createElement('div');
    header.className = 'preview-header';
    const title = document.createElement('h1');
    title.textContent = this.metadata.title || 'Untitled Blog Post';
    title.style.color = 'var(--primary)';
    const subtitle = document.createElement('p');
    subtitle.textContent = this.dateLine(false);
    subtitle.style.color = 'var(--subtext0)';
    header.appendChild(title);
    header.appendChild(subtitle);

    // Create content section
    const contentBox = document.createElement('div');
    contentBox.className = 'preview-content-box';

    const contentBody = document.createElement('div');
    contentBody.className = 'preview-content markdown-content';

    // Parse markdown (lazy-load KaTeX if needed)
    const parser = new MarkdownParser(this.theme, this.variant);
    await MarkdownParser.loadKatexIfNeeded(this.content);
    contentBody.innerHTML = parser.parse(this.content || '*No content yet. Start writing in edit mode!*');

    // Add syntax highlighting
    if (typeof Prism !== 'undefined') {
      Prism.highlightAllUnder(contentBody);
    }

    contentBox.appendChild(contentBody);

    // Create footer section
    const footer = document.createElement('div');
    footer.className = 'preview-footer';

    if (this.metadata.tags && this.metadata.tags.length > 0) {
      const tagsDiv = document.createElement('div');
      tagsDiv.className = 'preview-tags';
      this.metadata.tags.forEach(tag => {
        const tagSpan = document.createElement('span');
        tagSpan.className = 'preview-tag';
        tagSpan.textContent = tag;
        tagsDiv.appendChild(tagSpan);
      });
      footer.appendChild(tagsDiv);
    }

    const footerText = document.createElement('div');
    footerText.textContent = this.dateLine(true);
    footerText.style.color = 'var(--subtext0)';
    footerText.style.marginTop = '1rem';
    footer.appendChild(footerText);

    // Assemble preview
    previewWrapper.appendChild(header);
    previewWrapper.appendChild(contentBox);
    previewWrapper.appendChild(footer);
    container.appendChild(previewWrapper);

    // Add back-to-top button
    const backToTop = document.createElement('button');
    backToTop.className = 'back-to-top';
    backToTop.id = 'preview-back-to-top';
    backToTop.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
    backToTop.title = 'Back to top';
    backToTop.onclick = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    container.appendChild(backToTop);
  }

  /**
   * Builds the date + read-time line for the preview header or footer.
   *
   * The subtitle and footer differ only in how the optional "Updated" date is
   * wrapped, selected by parenUpdated.
   *
   * @param {boolean} parenUpdated  - wrap the update date in parens when true
   * @returns {string} the assembled date/meta line
   */
  dateLine(parenUpdated) {
    const date = this.metadata.date_created
      ? new Date(this.metadata.date_created).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'No date';
    let updated = '';
    if (this.metadata.date_updated) {
      const short = new Date(this.metadata.date_updated).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      updated = parenUpdated ? ` (Updated ${short})` : ` · Updated ${short}`;
    }
    return `${date}${updated} · ${this.calculateReadingTime(this.content)} read`;
  }

  /**
   * Reads the metadata form fields into this.metadata.
   *
   * @returns {void}
   */
  collectMetadata() {
    this.metadata.title = document.getElementById('title-input').value;
    this.metadata.date_created = document.getElementById('date-created-input').value;
    const dateUpdated = document.getElementById('date-updated-input').value;
    this.metadata.date_updated = dateUpdated || null;
    const tagsStr = document.getElementById('tags-input').value;
    this.metadata.tags = BlogParser.parseTags(tagsStr);
    const previewImg = document.getElementById('preview-img-input').value;
    this.metadata.preview_img = previewImg || null;
    this.metadata.pinned = document.getElementById('pinned-input').checked;
  }

  /**
   * Estimates reading time from a markdown string at 250 words per minute.
   *
   * @param {string} markdownContent  - the raw markdown to measure
   * @returns {string} human-readable duration, e.g. "5 min"
   */
  calculateReadingTime(markdownContent) {
    const words = markdownContent.split(/\s+/).filter(word => word.trim().length > 0);
    const wordCount = words.length;
    const WPM = 250;
    const readTime = Math.ceil(wordCount / WPM);
    return `${readTime} min`;
  }

  /**
   * Handles a BLOG_*.js file upload, parsing it and loading it into the form.
   *
   * @param {Event} event  - the file input change event
   * @returns {void}
   */
  handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file extension
    if (!file.name.endsWith('.js')) {
      alert('Please upload a valid .js file (BLOG_*.js format)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContent = e.target.result;
      const config = BlogParser.parseBlogFile(fileContent);

      if (!config) {
        alert('Failed to parse blog file. Please ensure it\'s a valid BLOG_*.js file.');
        return;
      }

      // Populate fields
      this.loadConfig(config);
      alert('Blog loaded successfully!');
    };

    reader.onerror = () => {
      alert('Failed to read file');
    };

    reader.readAsText(file);

    // Reset file input
    event.target.value = '';
  }

  /**
   * Populates the editor form and content from a parsed blog config.
   *
   * @param {object} config  - parsed blog config (title, dates, tags, content, ...)
   * @returns {void}
   */
  loadConfig(config) {
    // Populate metadata fields
    document.getElementById('title-input').value = config.title || '';
    document.getElementById('date-created-input').value = config.date_created || '';
    document.getElementById('date-updated-input').value = config.date_updated || '';
    document.getElementById('tags-input').value = BlogParser.formatTags(config.tags || []);
    document.getElementById('preview-img-input').value = config.preview_img || '';
    document.getElementById('pinned-input').checked = config.pinned || false;

    // Populate content
    document.getElementById('content-textarea').value = config.content || '';

    // Update char count
    this.updateCharCount();
  }

  /**
   * Validates the form, generates a BLOG_*.js file, and downloads it.
   *
   * @returns {void}
   */
  exportBlog() {
    // Collect data
    this.collectMetadata();
    this.content = document.getElementById('content-textarea').value;

    // Validate required fields
    if (!this.metadata.title) {
      alert('Please enter a blog title');
      return;
    }

    if (!this.metadata.date_created) {
      alert('Please enter a creation date');
      return;
    }

    if (!this.content) {
      alert('Please write some content');
      return;
    }

    // Generate file
    const fileContent = BlogParser.generateBlogFile(this.metadata, this.content);
    const filename = BlogParser.generateFilename(this.metadata.title);

    // Download file
    const blob = new Blob([fileContent], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`Exported as ${filename}`);
  }

  /**
   * Clears every form field and resets the creation date to today.
   *
   * @returns {void}
   */
  clearEditor() {
    // Clear all fields
    document.getElementById('title-input').value = '';
    document.getElementById('date-updated-input').value = '';
    document.getElementById('tags-input').value = '';
    document.getElementById('preview-img-input').value = '';
    document.getElementById('pinned-input').checked = false;
    document.getElementById('content-textarea').value = '';

    // Reset date to today
    this.setDefaultDate();

    // Update char count
    this.updateCharCount();
  }
}

// Initialize editor when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.blogEditor = new BlogEditor();
});
