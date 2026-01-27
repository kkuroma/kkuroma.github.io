/**
 * Router System
 */

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.stateManager = new StateManager();
  }

  register(path, config) {
    this.routes[path] = config;
  }

  async navigate(path) {
    let config = null;

    // blog
    if (path.startsWith('/blog/') && window.blogLoader) {
      const slug = path.replace('/blog/', '');
      config = window.blogLoader.generateBlogPostConfig(slug);
      if (!config) {
        console.error(`Blog post not found: ${slug}`);
        // Show 404 for non-existent blog posts
        if (this.routes['/404']) {
          config = JSON.parse(JSON.stringify(this.routes['/404']));
        } else {
          return;
        }
      }
    } else if (!this.routes[path]) {
      console.error(`Route ${path} not found`);
      // Show 404 page for non-existent routes
      if (this.routes['/404']) {
        config = JSON.parse(JSON.stringify(this.routes['/404']));
        path = '/404'; // Update path to 404
      } else {
        return;
      }
    } else {
      config = JSON.parse(JSON.stringify(this.routes[path]));
    }

    this.currentRoute = path;
    window.location.hash = path;

    // restore state
    const state = this.stateManager.getState();
    if (state.theme) config.theme = state.theme;
    if (state.variant) config.variant = state.variant;
    if (state.fontSize) config.fontSize = state.fontSize;

    window.currentWebsite = new WebsiteGenerator(config);
  }

  init() {
    window.addEventListener('hashchange', () => {
      const path = window.location.hash.slice(1) || '/';
      this.navigate(path);
    });
    const initialPath = window.location.hash.slice(1) || '/';
    this.navigate(initialPath);
  }
}

/*
 * State manager to keep website theme consistent
 */

class StateManager {
  constructor() {
    this.storageKey = 'website-state';
  }

  getState() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return {};
      }
    }
    return {};
  }

  setState(key, value) {
    const state = this.getState();
    state[key] = value;
    localStorage.setItem(this.storageKey, JSON.stringify(state));
  }

  clearState() {
    localStorage.removeItem(this.storageKey);
  }
}

window.router = new Router();
window.stateManager = new StateManager();

/*
 * Website generator from config
 */

class WebsiteGenerator {
  constructor(config) {
    this.config = config;
    this.theme = config.theme || 'catppuccin';
    this.variantMode = config.variant || 'dark'; // 'dark', 'light', or 'system'
    this.variant = this.getEffectiveVariant();
    this.fontSize = config.fontSize || 'medium';
    this.parser = new MarkdownParser(this.theme, this.variant); // markdown parser
    this.tagColors = {};
    this.colorPalette = ['red', 'green', 'blue', 'yellow', 'pink', 'mauve', 'teal', 'peach'];
    this.currentMode = this.getMode(); // small/medium/large
    this.activeTag = 'All';
    this.activeSortBy = null;
    this.currentPage = 1;
    this.maxItemsPerPage = config.maxItemsPerPage || null; // null = render all
    this.init();
  }

  init() {
    this.applyTheme();
    this.applyFontSize();
    this.applyMetadata();
    this.assignTagColors();
    this.render();
    this.attachEventListeners();
    // handle resize page
    window.addEventListener('resize', () => {
      const newMode = this.getMode();
      if (newMode !== this.currentMode) {
        this.currentMode = newMode;
        this.render();
      }
    });
    // handle system theme
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this.variantMode === 'system') {
        this.variant = this.getEffectiveVariant();
        this.parser.setTheme(this.theme, this.variant);
        this.applyTheme();
        this.reRenderContent();
      }
    });
    // handle click outside mobile menu
    document.addEventListener('click', (e) => {
      const menu = document.getElementById('mobile-menu');
      const hamburger = document.querySelector('.hamburger');
      if (menu && !menu.contains(e.target) && hamburger && !hamburger.contains(e.target)) {
        this.closeMobileMenu();
      }
    });
    // handle scroll for back-to-top button
    window.addEventListener('scroll', () => {
      const backToTop = document.getElementById('back-to-top');
      if (backToTop) {
        if (window.scrollY > 300) {
          backToTop.classList.add('visible');
        } else {
          backToTop.classList.remove('visible');
        }
      }
    });
  }

  getMode() {
    const width = window.innerWidth;
    if (width < 768) return 'small'; // phone sized
    if (width < 1024) return 'medium'; // tablet sized
    return 'large'; // desktop sized
  }

  getEffectiveVariant() {
    if (this.variantMode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return this.variantMode;
  }

  getColumns() {
    const mode = this.currentMode;
    if (mode === 'small') return 4;
    if (mode === 'medium') return 8;
    return 12;
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

  applyMetadata() {
    if (this.config.pageTitle) { document.title = this.config.pageTitle; }
    if (this.config.favicon) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = this.config.favicon;
    }
  }

  assignTagColors() {
    const allTags = new Set();
    this.config.boxes.forEach(box => {
      if (box.tags) {
        box.tags.forEach(tag => allTags.add(tag));
      }
    });

    let colorIndex = 0;
    allTags.forEach(tag => {
      this.tagColors[tag] = this.colorPalette[colorIndex % this.colorPalette.length];
      colorIndex++;
    });
  }

  render() {
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(this.renderNavbar());
    if (this.config.header) {
      app.appendChild(this.renderHeader());
    }
    if (this.config.selectionArea?.enabled) {
      app.appendChild(this.renderSelectionArea());
    }
    app.appendChild(this.renderBoxes());
    if (this.config.footer) {
      app.appendChild(this.renderFooter());
    }
    app.appendChild(this.renderBackToTop());
  }

  reRenderContent() {
    // re render only boxes
    const wrapper = document.getElementById('boxes-wrapper');
    if (wrapper) {
      const newBoxes = this.renderBoxes();
      wrapper.replaceWith(newBoxes);
    }
  }

  renderNavbar() {
    const nav = document.createElement('nav');
    nav.className = 'navbar';
    const mode = this.currentMode;
    // left nav
    const leftNav = document.createElement('div');
    leftNav.className = 'navbar-left';

    if (mode === 'small') {
      // Hamburger menu
      const hamburger = document.createElement('button');
      hamburger.className = 'hamburger';
      hamburger.innerHTML = '<i class="fa fa-bars"></i>';
      hamburger.onclick = (e) => {
        e.stopPropagation();
        this.toggleMobileMenu();
      };
      leftNav.appendChild(hamburger);
      const mobileMenu = document.createElement('div');
      mobileMenu.className = 'mobile-menu';
      mobileMenu.id = 'mobile-menu';
      this.config.navbar.navigation.forEach(item => {
        const link = document.createElement('a');
        if (item.href.startsWith('#')) {
          link.href = item.href;
          const route = item.href.slice(1);
          if (this.isActiveRoute(route)) {
            link.classList.add('active');
          }
          link.onclick = (e) => {
            e.preventDefault();
            if (window.router) {
              window.router.navigate(route);
            }
          };
        } else {
          link.href = item.href;
          if (!item.href.startsWith('#')) {
            link.target = '_blank';
          }
        }
        link.textContent = item.text;
        mobileMenu.appendChild(link);
      });
      leftNav.appendChild(mobileMenu);
    } else {
      // Regular navigation
      this.config.navbar.navigation.forEach(item => {
        const link = document.createElement('a');
        // Check if it's a route (starts with #) or external link
        if (item.href.startsWith('#')) {
          link.href = item.href;
          const route = item.href.slice(1);

          // Add active class if current route matches
          if (this.isActiveRoute(route)) {
            link.classList.add('active');
          }

          link.onclick = (e) => {
            e.preventDefault();
            if (window.router) {
              window.router.navigate(route);
            }
          };
        } else {
          link.href = item.href;
          if (!item.href.startsWith('#')) {
            link.target = '_blank';
          }
        }
        link.textContent = item.text;
        leftNav.appendChild(link);
      });
    }

    nav.appendChild(leftNav);

    // Center text (only in large mode)
    if (mode === 'large' && this.config.navbar.centerText) {
      const centerDiv = document.createElement('div');
      centerDiv.className = 'navbar-center';
      centerDiv.innerHTML = this.parser.parse(this.config.navbar.centerText);
      nav.appendChild(centerDiv);
    } else if (this.config.navbar.centerText) {
      // Add empty spacer to maintain layout balance
      const centerDiv = document.createElement('div');
      centerDiv.className = 'navbar-center';
      centerDiv.style.flex = '0';
      nav.appendChild(centerDiv);
    }

    // Right controls (theme switcher + dark/light toggle)
    const rightDiv = document.createElement('div');
    rightDiv.className = 'navbar-right';

    // font size dropdown
    const fontSizeSelect = document.createElement('select');
    fontSizeSelect.id = 'font-size-select';
    fontSizeSelect.className = 'theme-select';
    fontSizeSelect.title = 'Font Size';
    [
      { value: 'small', label: 'Small' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Large' },
      { value: 'xlarge', label: 'XLarge' }
    ].forEach(size => {
      const option = document.createElement('option');
      option.value = size.value;
      option.textContent = size.label;
      option.selected = size.value === this.fontSize;
      fontSizeSelect.appendChild(option);
    });
    rightDiv.appendChild(fontSizeSelect);

    // theme dropdown
    const themeSelect = document.createElement('select');
    themeSelect.id = 'theme-select';
    themeSelect.className = 'theme-select';
    const availableThemes = typeof THEMES !== 'undefined' ? Object.keys(THEMES) : ['catppuccin', 'gruvbox', 'tokyonight'];
    availableThemes.forEach(theme => {
      const option = document.createElement('option');
      option.value = theme;
      option.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
      option.selected = theme === this.theme;
      themeSelect.appendChild(option);
    });
    rightDiv.appendChild(themeSelect);

    // light/dark mode dropdown
    const variantSelect = document.createElement('select');
    variantSelect.id = 'variant-select';
    variantSelect.className = 'theme-select';
    variantSelect.title = 'Color Mode';
    [
      { value: 'dark', label: 'Dark' },
      { value: 'light', label: 'Light' },
      { value: 'system', label: 'System' }
    ].forEach(variant => {
      const option = document.createElement('option');
      option.value = variant.value;
      option.textContent = variant.label;
      option.selected = variant.value === this.variantMode;
      variantSelect.appendChild(option);
    });
    rightDiv.appendChild(variantSelect);

    nav.appendChild(rightDiv);

    return nav;
  }

  toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('active');
  }

  closeMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
      menu.classList.remove('active');
    }
  }

  isActiveRoute(route) {
    const currentRoute = window.router ? window.router.currentRoute : null;
    if (!currentRoute) return false;
    if (route === '/' || route === '') { return currentRoute === '/' || currentRoute === ''; }
    if (route === '/blog') { return currentRoute === '/blog' || currentRoute.startsWith('/blog/'); }
    return currentRoute === route;
  }

  renderHeader() {
    const header = document.createElement('div');
    header.className = 'header';

    // Back buttons (support both single backButton and array backButtons)
    const buttons = this.config.header.backButtons || (this.config.header.backButton ? [this.config.header.backButton] : []);

    if (buttons.length > 0) {
      const buttonsContainer = document.createElement('div');
      buttonsContainer.className = 'header-buttons';

      buttons.forEach(buttonConfig => {
        const backBtn = document.createElement('a');
        backBtn.href = buttonConfig.href;
        backBtn.textContent = buttonConfig.text;
        backBtn.className = 'back-button';

        // Only handle hash links with router, let external/relative links work normally
        if (buttonConfig.href.startsWith('#')) {
          backBtn.onclick = (e) => {
            e.preventDefault();
            const route = buttonConfig.href.slice(1); // Remove #
            window.router.navigate(route);
          };
        }

        buttonsContainer.appendChild(backBtn);
      });

      header.appendChild(buttonsContainer);
    }

    if (this.config.header.title) {
      const title = document.createElement('h1');
      title.textContent = this.config.header.title;
      header.appendChild(title);
    }

    if (this.config.header.title && this.config.header.subtitle) {
      const hr = document.createElement('hr');
      header.appendChild(hr);
    }

    if (this.config.header.subtitle) {
      const subtitle = document.createElement('p');
      subtitle.className = 'subtitle';
      subtitle.textContent = this.config.header.subtitle;
      header.appendChild(subtitle);
    }

    if (this.config.header.avatar) {
      const avatar = document.createElement('img');
      avatar.src = this.config.header.avatar;
      avatar.alt = 'Avatar';
      avatar.className = 'header-avatar';
      header.appendChild(avatar);
    }

    return header;
  }

  renderSelectionArea() {
    const selection = document.createElement('div');
    selection.className = 'selection-area';

    // search bar
    const searchBar = document.createElement('input');
    searchBar.type = 'text';
    searchBar.placeholder = 'Search...';
    searchBar.className = 'search-bar';
    searchBar.id = 'search-bar';
    selection.appendChild(searchBar);

    // tags
    const controlsLine = document.createElement('div');
    controlsLine.className = 'controls-line';

    const tagsDiv = document.createElement('div');
    tagsDiv.className = 'tags-filter';

    const allTag = document.createElement('button');
    allTag.className = 'tag-button active';
    allTag.textContent = 'All';
    allTag.onclick = () => this.filterByTag('All');
    tagsDiv.appendChild(allTag);

    Object.keys(this.tagColors).forEach(tag => {
      const tagBtn = document.createElement('button');
      tagBtn.className = 'tag-button';
      tagBtn.textContent = tag;
      tagBtn.style.setProperty('--tag-color', `var(--${this.tagColors[tag]})`);
      tagBtn.onclick = () => this.filterByTag(tag);
      tagsDiv.appendChild(tagBtn);
    });
    controlsLine.appendChild(tagsDiv);

    // sortby
    if (this.config.selectionArea.sortby && this.config.selectionArea.sortby.length > 0) {
      const sortDiv = document.createElement('div');
      sortDiv.className = 'sort-by';

      const label = document.createElement('span');
      label.textContent = 'Sort by: ';
      sortDiv.appendChild(label);

      const sortSelect = document.createElement('select');
      sortSelect.id = 'sort-select';

      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'Default';
      sortSelect.appendChild(defaultOption);

      this.config.selectionArea.sortby.forEach((sortOption, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = sortOption.name;
        sortSelect.appendChild(option);
      });

      sortDiv.appendChild(sortSelect);
      controlsLine.appendChild(sortDiv);
    }

    selection.appendChild(controlsLine);

    return selection;
  }

  renderBoxes() {
    const wrapper = document.createElement('div');
    wrapper.id = 'boxes-wrapper';
    const container = document.createElement('div');

    // Check if all boxes are blog posts (single-item blog page)
    const allBlogPosts = this.config.boxes.every(box => box.isBlogPost);
    if (allBlogPosts) {
      container.className = 'boxes-container-blog';
    } else {
      container.className = 'boxes-container';
    }

    const columns = this.getColumns();
    const grid = Array.from({ length: 100 }, () => Array(columns).fill(false));
    let boxes = this.getFilteredBoxes();
    if (this.activeSortBy !== null) {
      boxes = this.sortBoxes(boxes);
    }

    const totalBoxes = boxes.length;
    const totalPages = this.maxItemsPerPage ? Math.ceil(totalBoxes / this.maxItemsPerPage) : 1;
    if (this.maxItemsPerPage && this.maxItemsPerPage > 0) {
      const startIdx = (this.currentPage - 1) * this.maxItemsPerPage;
      const endIdx = startIdx + this.maxItemsPerPage;
      boxes = boxes.slice(startIdx, endIdx);
    }
    if (this.maxItemsPerPage && totalPages > 1) {
      wrapper.appendChild(this.renderPagination(totalPages, totalBoxes));
    }

    boxes.forEach(box => {
      const boxWidth = Math.min(box.w, columns);
      const position = this.findPosition(grid, boxWidth, box.h);
      if (position) {
        container.appendChild(this.renderBox(box, boxWidth, position));
        for (let row = position.row; row < position.row + box.h; row++) {
          for (let col = position.col; col < position.col + boxWidth; col++) {
            if (grid[row]) grid[row][col] = true;
          }
        }
      }
    });
    wrapper.appendChild(container);

    return wrapper;
  }

  renderPagination(totalPages, totalBoxes) {
    const pagination = document.createElement('div');
    pagination.className = 'pagination';

    const startItem = (this.currentPage - 1) * this.maxItemsPerPage + 1;
    const endItem = Math.min(this.currentPage * this.maxItemsPerPage, totalBoxes);

    const info = document.createElement('span');
    info.className = 'pagination-info';
    info.textContent = `Showing ${startItem}-${endItem} of ${totalBoxes}`;
    pagination.appendChild(info);

    const controls = document.createElement('div');
    controls.className = 'pagination-controls';

    const prevBtn = document.createElement('button');
    prevBtn.textContent = '← Prev';
    prevBtn.className = 'pagination-btn';
    prevBtn.disabled = this.currentPage === 1;
    prevBtn.onclick = () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.reRenderContent();
      }
    };
    controls.appendChild(prevBtn);

    const pageInfo = document.createElement('span');
    pageInfo.className = 'pagination-page';
    pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
    controls.appendChild(pageInfo);

    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next →';
    nextBtn.className = 'pagination-btn';
    nextBtn.disabled = this.currentPage === totalPages;
    nextBtn.onclick = () => {
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.reRenderContent();
      }
    };
    controls.appendChild(nextBtn);

    pagination.appendChild(controls);

    return pagination;
  }

  getFilteredBoxes() {
    let boxes = [...this.config.boxes];
    if (this.activeTag !== 'All') {
      boxes = boxes.filter(box => box.tags && box.tags.includes(this.activeTag));
    }
    const searchTerm = document.getElementById('search-bar')?.value.toLowerCase();
    if (searchTerm) {
      boxes = boxes.filter(box =>
        box.title && box.title.toLowerCase().includes(searchTerm)
      );
    }
    const pinnedBoxes = boxes.filter(box => box.pinned === true);
    const unpinnedBoxes = boxes.filter(box => box.pinned !== true);
    return [...pinnedBoxes, ...unpinnedBoxes];
  }

  sortBoxes(boxes) {
    if (this.activeSortBy === null) return boxes;

    const sortConfig = this.config.selectionArea.sortby[this.activeSortBy];

    const pinnedBoxes = boxes.filter(box => box.pinned === true);
    const unpinnedBoxes = boxes.filter(box => box.pinned !== true);

    const sortFn = (a, b) => {
      const aValue = this.getNestedValue(a, sortConfig.key);
      const bValue = this.getNestedValue(b, sortConfig.key);
      if (aValue === null) return 1;
      if (bValue === null) return -1;
      const aStr = String(aValue);
      const bStr = String(bValue);
      const comparison = aStr.localeCompare(bStr);
      return sortConfig.ascending ? comparison : -comparison;
    };

    const sortedPinned = [...pinnedBoxes].sort(sortFn);
    const sortedUnpinned = [...unpinnedBoxes].sort(sortFn);
    return [...sortedPinned, ...sortedUnpinned];
  }

  getNestedValue(obj, keys) {
    let value = obj;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return null;
      }
    }
    return value;
  }

  findPosition(grid, width, height) {
    for (let row = 0; row < grid.length - height; row++) {
      for (let col = 0; col <= grid[0].length - width; col++) {
        if (this.canPlaceBox(grid, row, col, width, height)) {
          return { row, col };
        }
      }
    }
    return null;
  }

  canPlaceBox(grid, startRow, startCol, width, height) {
    for (let row = startRow; row < startRow + height; row++) {
      for (let col = startCol; col < startCol + width; col++) {
        if (grid[row][col]) return false;
      }
    }
    return true;
  }

  // Helper: render image or SVG from image_url
  renderImage(imageUrl, title, isFullSize = false) {
    if (imageUrl.startsWith('svg:')) {
      const [, iconName, color = ''] = imageUrl.split(':');
      if (window.getSVG) {
        const colors = color ? { fill: color, stroke: color } : {};
        // Don't specify size - let CSS control it for container fill
        const svg = window.getSVG(iconName, colors, undefined, undefined) || '';
        // Add class for CSS styling
        return svg.replace('<svg', `<svg class="${isFullSize ? 'box-image-full' : 'box-image'}"`);
      }
      return '';
    }

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = title || 'Box image';
    img.className = isFullSize ? 'box-image-full' : 'box-image';
    return img.outerHTML;
  }

  renderBox(box, width, position) {
    const boxEl = document.createElement('div');
    boxEl.className = `box${box.pinned ? ' box-pinned' : ''}${box.isBlogPost ? ' box-blog-post' : ''}`;
    boxEl.style.gridColumn = `${position.col + 1} / span ${width}`;
    if (!box.isBlogPost) boxEl.style.gridRow = `${position.row + 1} / span ${box.h}`;

    // Make box clickable if href provided
    if (box.href) {
      boxEl.style.cursor = 'pointer';
      boxEl.addEventListener('click', (e) => {
        if (e.target.tagName !== 'A') {
          box.href.startsWith('#')
            ? (e.preventDefault(), window.router.navigate(box.href.slice(1)))
            : window.open(box.href, '_blank');
        }
      });
    }

    // Render header with title and optional pinned label
    if (box.title) {
      const title = document.createElement('div');
      title.className = 'box-title';
      title.innerHTML = `<span>${this.parser.parseInline(box.title)}</span>`;
      if (box.pinned) {
        title.innerHTML += '<span class="pinned-label">PINNED</span>';
      }
      boxEl.appendChild(title);
    }

    // Render body content
    const body = document.createElement('div');
    body.className = 'box-body';

    if (box.type === 'markdown') {
      const hasMarkdown = box.content.markdown;
      const hasImage = box.image_url;

      if (hasMarkdown && hasImage) {
        body.className = 'box-body box-body-split';
        const imageContainer = document.createElement('div');
        imageContainer.className = 'box-image-container';
        imageContainer.innerHTML = this.renderImage(box.image_url, box.title);

        const markdownContainer = document.createElement('div');
        markdownContainer.className = 'box-markdown-container markdown-content';
        markdownContainer.innerHTML = this.parser.parse(box.content.markdown);

        body.appendChild(imageContainer);
        body.appendChild(markdownContainer);
      } else if (hasMarkdown) {
        body.className = 'box-body markdown-content';
        body.innerHTML = this.parser.parse(box.content.markdown);
      } else if (hasImage) {
        body.className = 'box-body box-body-image-only';
        body.innerHTML = this.renderImage(box.image_url, box.title, true);
      }
    } else if (box.type === 'code' && box.content.code) {
      body.className = 'box-body box-body-code markdown-content';
      const language = box.content.language || '';
      body.innerHTML = this.parser.parse(`\`\`\`${language}\n${box.content.code}\n\`\`\``);
    }

    boxEl.appendChild(body);

    // Add TOC link scroll handlers
    const tocLinks = boxEl.querySelectorAll('a[data-scroll-to]');
    tocLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent box click
        const targetId = link.getAttribute('data-scroll-to');
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // footer + tags
    if (box.footer || (this.config.selectionArea?.enabled && box.tags && box.tags.length > 0)) {
      const footerContainer = document.createElement('div');
      footerContainer.className = 'box-footer-container';
      if (box.footer) {
        const footer = document.createElement('div');
        footer.className = 'box-footer';
        footer.textContent = box.footer;
        footerContainer.appendChild(footer);
      }
      if (this.config.selectionArea?.enabled && box.tags && box.tags.length > 0) {
        const tagsDiv = document.createElement('div');
        tagsDiv.className = 'box-tags';
        box.tags.forEach(tag => {
          const tagSpan = document.createElement('span');
          tagSpan.className = 'box-tag';
          tagSpan.textContent = tag;
          tagSpan.style.setProperty('--tag-bg-color', `var(--${this.tagColors[tag]})`);
          tagSpan.onclick = (e) => {
            e.stopPropagation(); // Prevent box click
            this.filterByTag(tag);
          };
          tagsDiv.appendChild(tagSpan);
        });
        footerContainer.appendChild(tagsDiv);
      }
      boxEl.appendChild(footerContainer);
    }
    return boxEl;
  }

  renderFooter() {
    const footer = document.createElement('div');
    footer.className = 'site-footer';

    const hr = document.createElement('hr');
    footer.appendChild(hr);

    const text = document.createElement('p');
    text.textContent = this.config.footer;
    footer.appendChild(text);

    return footer;
  }

  renderBackToTop() {
    const button = document.createElement('button');
    button.className = 'back-to-top';
    button.id = 'back-to-top';
    button.innerHTML = '<i class="fa fa-arrow-up"></i>';
    button.title = 'Back to top';
    button.onclick = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    return button;
  }

  filterByTag(tag) {
    this.activeTag = tag;
    this.currentPage = 1; 
    document.querySelectorAll('.tag-button').forEach(btn => {
      btn.classList.toggle('active', btn.textContent === tag);
    });
    this.reRenderContent();
  }

  attachEventListeners() {
    const fontSizeSelect = document.getElementById('font-size-select');
    if (fontSizeSelect) {
      fontSizeSelect.addEventListener('change', (e) => {
        this.fontSize = e.target.value;
        this.applyFontSize();
        if (window.stateManager) {
          window.stateManager.setState('fontSize', this.fontSize);
        }
      });
    }
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        this.theme = e.target.value;
        this.parser.setTheme(this.theme, this.variant);
        this.applyTheme();
        this.reRenderContent();
        if (window.stateManager) {
          window.stateManager.setState('theme', this.theme);
        }
      });
    }

    const variantSelect = document.getElementById('variant-select');
    if (variantSelect) {
      variantSelect.addEventListener('change', (e) => {
        this.variantMode = e.target.value;
        this.variant = this.getEffectiveVariant();
        this.parser.setTheme(this.theme, this.variant);
        this.applyTheme();
        this.reRenderContent();
        if (window.stateManager) {
          window.stateManager.setState('variant', this.variantMode);
        }
      });
    }

    const searchBar = document.getElementById('search-bar');
    if (searchBar) {
      searchBar.addEventListener('input', () => {
        this.currentPage = 1; // Reset to first page when searching
        this.reRenderContent();
      });
    }

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.activeSortBy = e.target.value === '' ? null : parseInt(e.target.value);
        this.currentPage = 1;
        this.reRenderContent();
      });
    }
  }
}

/*
 * Site gen wrapper
 */
function initWebsite(config) {
  if (!config) {
    console.error('No config provided');
    document.getElementById('app').innerHTML = '<p>Error: No website configuration provided.</p>';
    return;
  }

  try {
    new WebsiteGenerator(config);
  } catch (error) {
    console.error('Failed to initialize website:', error);
    document.getElementById('app').innerHTML = '<p>Error initializing website.</p>';
  }
}
