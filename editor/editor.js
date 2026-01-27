/**
 * Blog Editor
 * Main logic for the blog editor interface
 */

class BlogEditor {
  constructor() {
    this.mode = 'edit'; // 'edit' or 'preview' mode
    this.theme = 'catppuccin';
    this.variant = 'dark';
    this.fontSize = 'medium';
    this.metadata = {
      title: '',
      date_created: '',
      date_updated: null,
      read_time: '',
      tags: [],
      preview_img: null,
      pinned: false
    };
    this.content = '';
    this.previewGenerator = null;

    this.init();
  }

  init() {
    this.populateDropdowns();
    this.applyTheme();
    this.applyFontSize();
    this.attachEventListeners();
    this.setDefaultDate();
    this.updateCharCount();
  }

  populateDropdowns() {

    // font size
    const fontSizeSelect = document.getElementById('font-size-select');
    const fontSizes = [
      { value: 'small', label: 'Small' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Large' },
      { value: 'xlarge', label: 'XLarge' }
    ];
    fontSizes.forEach(size => {
      const option = document.createElement('option');
      option.value = size.value;
      option.textContent = size.label;
      option.selected = size.value === this.fontSize;
      fontSizeSelect.appendChild(option);
    });

    // theme
    const themeSelect = document.getElementById('theme-select');
    const availableThemes = typeof THEMES !== 'undefined' ? Object.keys(THEMES) : ['catppuccin'];
    availableThemes.forEach(theme => {
      const option = document.createElement('option');
      option.value = theme;
      option.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
      option.selected = theme === this.theme;
      themeSelect.appendChild(option);
    });

    // variant
    const variantSelect = document.getElementById('variant-select');
    const variants = [
      { value: 'dark', label: 'Dark' },
      { value: 'light', label: 'Light' },
      { value: 'system', label: 'System' }
    ];
    variants.forEach(variant => {
      const option = document.createElement('option');
      option.value = variant.value;
      option.textContent = variant.label;
      option.selected = variant.value === this.variant;
      variantSelect.appendChild(option);
    });
  }

  applyTheme() {
    if (typeof THEMES === 'undefined') return;
    const colors = THEMES[this.theme][this.variant];
    const root = document.documentElement;
    Object.entries(colors).forEach(([name, value]) => {
      root.style.setProperty(`--${name}`, value);
    });
  }

  applyFontSize() {
    const root = document.documentElement;
    const fontSizes = {
      'small': '14px',
      'medium': '16px',
      'large': '18px',
      'xlarge': '20px'
    };
    root.style.fontSize = fontSizes[this.fontSize] || fontSizes['medium'];
  }

  setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date-created-input').value = today;
  }

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

    // Theme controls
    document.getElementById('font-size-select').addEventListener('change', (e) => {
      this.fontSize = e.target.value;
      this.applyFontSize();
    });

    document.getElementById('theme-select').addEventListener('change', (e) => {
      this.theme = e.target.value;
      this.applyTheme();
    });

    document.getElementById('variant-select').addEventListener('change', (e) => {
      this.variant = e.target.value;
      this.applyTheme();
    });
  }

  updateCharCount() {
    const textarea = document.getElementById('content-textarea');
    const count = textarea.value.length;
    document.getElementById('char-count').textContent = count.toLocaleString();
  }

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
      this.setupPreviewScrollListener();
    } else {
      // Switch to edit
      this.mode = 'edit';
      btnText.textContent = 'Preview';
      editMode.style.display = 'block';
      previewMode.style.display = 'none';
      this.removePreviewScrollListener();
    }
  }

  setupPreviewScrollListener() {
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

  removePreviewScrollListener() {
    if (this.previewScrollHandler) {
      window.removeEventListener('scroll', this.previewScrollHandler);
    }
  }

  renderPreview() {
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
    title.style.color = 'var(--blue)';
    const subtitle = document.createElement('p');
    subtitle.textContent = this.generateSubtitle();
    subtitle.style.color = 'var(--subtext0)';
    header.appendChild(title);
    header.appendChild(subtitle);

    // Create content section
    const contentBox = document.createElement('div');
    contentBox.className = 'preview-content-box';

    const contentBody = document.createElement('div');
    contentBody.className = 'preview-content markdown-content';

    // Parse markdown
    const parser = new MarkdownParser(this.theme, this.variant);
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
    footerText.textContent = this.generateFooter();
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
    backToTop.innerHTML = '<i class="fa fa-arrow-up"></i>';
    backToTop.title = 'Back to top';
    backToTop.onclick = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    container.appendChild(backToTop);
  }

  generateSubtitle() {
    const date = this.metadata.date_created
      ? new Date(this.metadata.date_created).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : 'No date';

    const updated = this.metadata.date_updated
      ? ` · Updated ${new Date(this.metadata.date_updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      : '';

    const readTime = this.metadata.read_time || 'Unknown';

    return `${date}${updated} · ${readTime} read`;
  }

  generateFooter() {
    const date = this.metadata.date_created
      ? new Date(this.metadata.date_created).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : 'No date';

    const updated = this.metadata.date_updated
      ? ` (Updated ${new Date(this.metadata.date_updated).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })})`
      : '';

    return `${date}${updated} · ${this.metadata.read_time || 'Unknown'} read`;
  }

  collectMetadata() {
    this.metadata.title = document.getElementById('title-input').value;
    this.metadata.date_created = document.getElementById('date-created-input').value;
    const dateUpdated = document.getElementById('date-updated-input').value;
    this.metadata.date_updated = dateUpdated || null;
    this.metadata.read_time = document.getElementById('read-time-input').value || '5 min';
    const tagsStr = document.getElementById('tags-input').value;
    this.metadata.tags = BlogParser.parseTags(tagsStr);
    const previewImg = document.getElementById('preview-img-input').value;
    this.metadata.preview_img = previewImg || null;
    this.metadata.pinned = document.getElementById('pinned-input').checked;
  }

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

  loadConfig(config) {
    // Populate metadata fields
    document.getElementById('title-input').value = config.title || '';
    document.getElementById('date-created-input').value = config.date_created || '';
    document.getElementById('date-updated-input').value = config.date_updated || '';
    document.getElementById('read-time-input').value = config.read_time || '5 min';
    document.getElementById('tags-input').value = BlogParser.formatTags(config.tags || []);
    document.getElementById('preview-img-input').value = config.preview_img || '';
    document.getElementById('pinned-input').checked = config.pinned || false;

    // Populate content
    document.getElementById('content-textarea').value = config.content || '';

    // Update char count
    this.updateCharCount();
  }

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

  clearEditor() {
    // Clear all fields
    document.getElementById('title-input').value = '';
    document.getElementById('date-updated-input').value = '';
    document.getElementById('read-time-input').value = '';
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
