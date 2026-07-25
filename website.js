/**
 * Layout constants shared by the tiling grid and the pre-paint --content-scale
 * estimate inlined in index.html (keep the two copies in sync).
 */
const BREAKPOINT_SMALL = 768;    // below this is phone (small mode)
const BREAKPOINT_MEDIUM = 1024;  // below this is tablet (medium), else desktop (large)
const COLUMNS_SMALL = 4;
const COLUMNS_MEDIUM = 8;
const COLUMNS_LARGE = 12;
const GRID_ROWS = 100;           // rows in the box-placement grid
const GRID_UNIT = 100;           // design px per grid unit; --content-scale tracks it
const PAD_SMALL = 32;            // container horizontal padding estimate (px)
const PAD_LARGE = 64;
const GAP_SMALL = 12;            // inter-box gap estimate (px)
const GAP_LARGE = 16;
const SCALE_MIN = 0.65;          // clamps for --content-scale
const SCALE_MAX = 1;
const SCALE_MAX_BLOG = 1.15;     // blog posts render in a fixed 1000px column

/**
 * Router System
 */

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.stateManager = new StateManager();
  }

  /**
   * Registers a config object under a route path.
   *
   * @param {string} path    - the route path, e.g. "/projects"
   * @param {object} config  - the page config to render for that route
   * @returns {void}
   */
  register(path, config) {
    this.routes[path] = config;
  }

  /**
   * Navigates to a path and renders its page, falling back to /404.
   *
   * Blog paths (/blog/:slug) build their config dynamically via blogLoader;
   * other paths use the registered config. Theme/variant/fontSize are restored
   * from StateManager before rendering.
   *
   * @param {string} path  - the route path (without the leading '#')
   * @returns {Promise<void>}
   */
  async navigate(path) {
    let config = null;

    // blog
    if (path.startsWith('/blog/') && window.blogLoader) {
      const slug = path.replace('/blog/', '');
      config = window.blogLoader.buildPostConfig(slug);
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

  /**
   * Starts the router: listens for hash changes and navigates to the initial path.
   *
   * @returns {void}
   */
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

  /**
   * Reads the persisted state object from localStorage.
   *
   * @returns {object} the parsed state, or {} if missing or invalid
   */
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

  /**
   * Writes one key into the persisted state object.
   *
   * @param {string} key  - the state key to set
   * @param {*} value     - the value to store
   * @returns {void}
   */
  setState(key, value) {
    const state = this.getState();
    state[key] = value;
    localStorage.setItem(this.storageKey, JSON.stringify(state));
  }
}

window.router = new Router();
window.stateManager = new StateManager();

/*
 * Website generator from config
 */

class WebsiteGenerator {
  /**
   * Builds and renders a page from a config object.
   *
   * Resolves theme/variant/font size (falling back to defaults), sets up the
   * markdown parser and tag palette, computes the responsive mode, then runs init().
   *
   * @param {object} config  - the page config (theme, header, boxes, footer, ...)
   */
  constructor(config) {
    this.config = config;
    this.theme = (typeof THEMES !== 'undefined' && THEMES[config.theme]) ? config.theme : 'Natsumikan';
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
    this._placements = [];
    this.init();
  }

  /**
   * Applies appearance and metadata, renders, and binds global listeners.
   *
   * Wires resize (mode switch vs. rescale), font-swap settle passes, system
   * theme changes, outside-click menu closing, and the back-to-top scroll toggle.
   *
   * @returns {void}
   */
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
      } else {
        this.updateRowHeight();
        // debounced re-render restores tags dropped by settleBoxes when the
        // viewport grows back (tiling itself is deterministic)
        clearTimeout(this._resizeTimer);
        this._resizeTimer = setTimeout(() => this.reRenderContent(), 150);
      }
    });
    // re-run cosmetic settle after layout-shifting events (webfont swap, late resources)
    requestAnimationFrame(() => this.settleBoxes());
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => requestAnimationFrame(() => this.settleBoxes()));
    }
    window.addEventListener('load', () => this.settleBoxes(), { once: true });
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
      const settings = document.getElementById('settings-menu');
      if (settings && settings.open && !settings.contains(e.target)) {
        settings.removeAttribute('open');
      }
    });
    // handle scroll for back-to-top button
    window.addEventListener('scroll', () => {
      const backToTop = document.getElementById('back-to-top');
      if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 300);
    });
  }

  /**
   * The responsive mode for the current viewport width.
   *
   * @returns {'small'|'medium'|'large'} phone, tablet, or desktop mode
   */
  getMode() {
    const width = window.innerWidth;
    if (width < BREAKPOINT_SMALL) return 'small';
    if (width < BREAKPOINT_MEDIUM) return 'medium';
    return 'large';
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
   * The number of grid columns the current mode tiles into.
   *
   * @returns {number} 4 (small), 8 (medium), or 12 (large)
   */
  getColumns() {
    const mode = this.currentMode;
    if (mode === 'small') return COLUMNS_SMALL;
    if (mode === 'medium') return COLUMNS_MEDIUM;
    return COLUMNS_LARGE;
  }

  /**
   * The { w, h } a box occupies in the current grid mode.
   *
   * A box may declare a per-mode override object (box.medium / box.small) whose
   * w/h win over the default w/h, so a layout authored for 12 columns can be
   * retiled cleanly at 8 (medium) without leaving gaps. Missing keys fall back
   * to the box default.
   *
   * @param {object} box  - box config, with default w/h and optional overrides
   * @returns {{w: number, h: number}} the width/height for the current mode
   */
  resolveDims(box) {
    const override = box[this.currentMode];
    return {
      w: override && override.w != null ? override.w : box.w,
      h: override && override.h != null ? override.h : box.h,
    };
  }

  /**
   * Applies the current theme palette to CSS variables and caches both variants.
   *
   * Caches light and dark palettes via StateManager so the pre-paint boot script
   * in index.html can restore colors on the next visit without loading themes.js.
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

    // Cache both variants so the inline pre-paint boot script (index.html)
    // can restore the palette on the next visit without loading themes.js
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
   * Applies the page title and favicon from the config.
   *
   * @returns {void}
   */
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

  /**
   * Assigns a palette color to each distinct tag, cycling through colorPalette.
   *
   * @returns {void}
   */
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

  /**
   * Renders the full page into #app: navbar, header, selection, boxes, footer.
   *
   * After rendering, lazy-loads KaTeX and re-renders if any content uses math.
   *
   * @returns {void}
   */
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
    this.updateRowHeight();
    if (this.config.footer) {
      app.appendChild(this.renderFooter());
    }
    app.appendChild(this.renderTopButton());
    this.settleBoxes();

    // Lazy-load KaTeX if any content contains $, then re-render so math displays
    if (!MarkdownParser._katexLoaded) {
      const allText = [
        this.config.navbar?.centerText || '',
        ...this.config.boxes.map(b => b.content?.markdown || b.content?.code || '')
      ].join('\n');
      if (allText.includes('$')) {
        MarkdownParser.loadKatexIfNeeded(allText).then(() => {
          if (MarkdownParser._katexLoaded) {
            this.reRenderContent();
          }
        });
      }
    }
  }

  /**
   * Re-renders only the boxes region, leaving chrome intact.
   *
   * @returns {void}
   */
  reRenderContent() {
    // re render only boxes
    const wrapper = document.getElementById('boxes-wrapper');
    if (wrapper) {
      const newBoxes = this.renderBoxes();
      wrapper.replaceWith(newBoxes);
      this.updateRowHeight();
      this.settleBoxes();
    }
  }

  /**
   * Creates a nav anchor: hash links route via the router, others open a new tab.
   *
   * @param {object} item  - nav item with text and href
   * @returns {HTMLAnchorElement} the nav link element
   */
  createNavLink(item) {
    const link = document.createElement('a');
    link.href = item.href;
    link.textContent = item.text;
    if (item.href.startsWith('#')) {
      const route = item.href.slice(1);
      if (this.isActiveRoute(route)) link.classList.add('active');
      link.onclick = (e) => {
        e.preventDefault();
        window.router?.navigate(route);
      };
    } else {
      link.target = '_blank';
    }
    return link;
  }

  /**
   * Builds the "Aa" appearance popover (palette, mode, and text-size controls).
   *
   * Palette swatches show a light/dark accent gradient; the mode and text-size
   * segments apply live and persist via StateManager.
   *
   * @returns {HTMLDetailsElement} the settings popover element
   */
  createSettingsMenu() {
    const details = document.createElement('details');
    details.className = 'settings-menu';
    details.id = 'settings-menu';

    const summary = document.createElement('summary');
    summary.className = 'settings-toggle';
    summary.title = 'Appearance';
    summary.textContent = 'Aa';
    details.appendChild(summary);

    const body = document.createElement('div');
    body.className = 'settings-body';

    body.appendChild(this.menuLabel('Palette'));
    const swRow = document.createElement('div');
    swRow.className = 'settings-row';
    const themeNames = typeof THEMES !== 'undefined' ? Object.keys(THEMES) : ['Haruhana', 'Natsumikan', 'Akiba', 'Fuyuyuki'];
    themeNames.forEach(name => {
      const sw = document.createElement('button');
      sw.className = 'swatch' + (name === this.theme ? ' active' : '');
      sw.dataset.theme = name;
      sw.title = name;
      if (typeof THEMES !== 'undefined' && THEMES[name]) {
        sw.style.background = `linear-gradient(135deg, ${THEMES[name].light.primary} 50%, ${THEMES[name].dark.primary} 50%)`;
      }
      sw.onclick = (e) => { e.preventDefault(); this.selectTheme(name); };
      swRow.appendChild(sw);
    });
    body.appendChild(swRow);

    body.appendChild(this.menuLabel('Mode'));
    body.appendChild(this.segment('mode', [
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
      { value: 'system', label: 'Auto' }
    ], this.variantMode, v => this.selectVariant(v)));

    body.appendChild(this.menuLabel('Text size'));
    body.appendChild(this.segment('size', [
      { value: 'small', label: 'S' },
      { value: 'medium', label: 'M' },
      { value: 'large', label: 'L' },
      { value: 'xlarge', label: 'XL' }
    ], this.fontSize, v => this.selectFontSize(v)));

    details.appendChild(body);
    return details;
  }

  /**
   * Creates a small label element for a settings section.
   *
   * @param {string} text  - the label text
   * @returns {HTMLDivElement} the label element
   */
  menuLabel(text) {
    const d = document.createElement('div');
    d.className = 'settings-label';
    d.textContent = text;
    return d;
  }

  /**
   * Builds a segmented button group, highlighting the selected value.
   *
   * @param {string} group      - group name, stored on the element dataset
   * @param {object[]} options  - option list of { value, label }
   * @param {string} selected   - the currently selected value
   * @param {function} onPick   - callback invoked with the picked value
   * @returns {HTMLDivElement} the segment element
   */
  segment(group, options, selected, onPick) {
    const seg = document.createElement('div');
    seg.className = 'seg';
    seg.dataset.group = group;
    options.forEach(opt => {
      const b = document.createElement('button');
      b.className = 'seg-btn' + (opt.value === selected ? ' active' : '');
      b.dataset.value = opt.value;
      b.textContent = opt.label;
      b.onclick = (e) => { e.preventDefault(); onPick(opt.value); };
      seg.appendChild(b);
    });
    return seg;
  }

  /**
   * Switches the theme, re-renders content, and persists the choice.
   *
   * @param {string} name  - the theme name to apply
   * @returns {void}
   */
  selectTheme(name) {
    this.theme = name;
    this.parser.setTheme(this.theme, this.variant);
    this.applyTheme();
    this.reRenderContent();
    if (window.stateManager) window.stateManager.setState('theme', this.theme);
    this.syncSettingsMenu();
  }

  /**
   * Switches the color variant (light/dark/system), re-renders, and persists it.
   *
   * @param {'light'|'dark'|'system'} mode  - the variant mode to apply
   * @returns {void}
   */
  selectVariant(mode) {
    this.variantMode = mode;
    this.variant = this.getEffectiveVariant();
    this.parser.setTheme(this.theme, this.variant);
    this.applyTheme();
    this.reRenderContent();
    if (window.stateManager) window.stateManager.setState('variant', this.variantMode);
    this.syncSettingsMenu();
  }

  /**
   * Switches the font size, applies it, and persists the choice.
   *
   * @param {string} size  - the font-size key (small/medium/large/xlarge)
   * @returns {void}
   */
  selectFontSize(size) {
    this.fontSize = size;
    this.applyFontSize();
    if (window.stateManager) window.stateManager.setState('fontSize', this.fontSize);
    this.syncSettingsMenu();
  }

  /**
   * Reflects current theme/variant/size onto the open popover without rebuilding it.
   *
   * @returns {void}
   */
  syncSettingsMenu() {
    document.querySelectorAll('.settings-menu .swatch').forEach(b =>
      b.classList.toggle('active', b.dataset.theme === this.theme));
    const cur = { mode: this.variantMode, size: this.fontSize };
    document.querySelectorAll('.settings-menu .seg').forEach(seg => {
      seg.querySelectorAll('.seg-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.value === cur[seg.dataset.group]));
    });
  }

  /**
   * Renders the navbar: nav links (or hamburger menu), center text, and controls.
   *
   * @returns {HTMLElement} the navbar element
   */
  renderNavbar() {
    const nav = document.createElement('nav');
    nav.className = 'navbar';
    const mode = this.currentMode;
    // left nav
    const leftNav = document.createElement('div');
    leftNav.className = 'navbar-left';

    if (mode === 'small' || mode === 'medium') {
      const hamburger = document.createElement('button');
      hamburger.className = 'hamburger';
      hamburger.setAttribute('aria-label', 'Toggle navigation menu');
      hamburger.innerHTML = getSVG('bars', { stroke: 'currentColor' }, 18, 18);
      hamburger.onclick = (e) => {
        e.stopPropagation();
        this.toggleMobileMenu();
      };
      leftNav.appendChild(hamburger);
      const mobileMenu = document.createElement('div');
      mobileMenu.className = 'mobile-menu';
      mobileMenu.id = 'mobile-menu';
      this.config.navbar.navigation.forEach(item => mobileMenu.appendChild(this.createNavLink(item)));
      leftNav.appendChild(mobileMenu);
    } else {
      this.config.navbar.navigation.forEach(item => leftNav.appendChild(this.createNavLink(item)));
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

    // Right controls: single "Aa" appearance popover (palette + mode + text size)
    const rightDiv = document.createElement('div');
    rightDiv.className = 'navbar-right';
    rightDiv.appendChild(this.createSettingsMenu());
    nav.appendChild(rightDiv);

    return nav;
  }

  /**
   * Toggles the mobile navigation menu open or closed.
   *
   * @returns {void}
   */
  toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('active');
  }

  /**
   * Closes the mobile navigation menu if it is open.
   *
   * @returns {void}
   */
  closeMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
      menu.classList.remove('active');
    }
  }

  /**
   * Whether a nav route matches the current route (blog posts count as /blog).
   *
   * @param {string} route  - the route to test
   * @returns {boolean} true when it is the active route
   */
  isActiveRoute(route) {
    const currentRoute = window.router ? window.router.currentRoute : null;
    if (!currentRoute) return false;
    if (route === '/' || route === '') { return currentRoute === '/' || currentRoute === ''; }
    if (route === '/blog') { return currentRoute === '/blog' || currentRoute.startsWith('/blog/'); }
    return currentRoute === route;
  }

  /**
   * Renders the page header: back buttons, title, subtitle, and avatar.
   *
   * @returns {HTMLDivElement} the header element
   */
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
      avatar.width = 180;
      avatar.height = 180;
      avatar.setAttribute('fetchpriority', 'high');
      avatar.decoding = 'async';
      header.appendChild(avatar);
    }

    return header;
  }

  /**
   * Renders the selection area: search bar, tag filter buttons, and sort dropdown.
   *
   * @returns {HTMLDivElement} the selection-area element
   */
  renderSelectionArea() {
    const selection = document.createElement('div');
    selection.className = 'selection-area';

    // search bar
    const searchBar = document.createElement('input');
    searchBar.type = 'text';
    searchBar.placeholder = 'Search...';
    searchBar.className = 'search-bar';
    searchBar.id = 'search-bar';
    searchBar.setAttribute('aria-label', 'Search');
    selection.appendChild(searchBar);

    // tags
    const controlsLine = document.createElement('div');
    controlsLine.className = 'controls-line';

    const tagsDiv = document.createElement('div');
    tagsDiv.className = 'tags-filter';

    const allTag = document.createElement('button');
    allTag.className = 'tag-button active';
    allTag.textContent = 'All';
    allTag.setAttribute('aria-pressed', 'true');
    allTag.onclick = () => this.filterByTag('All');
    tagsDiv.appendChild(allTag);

    Object.keys(this.tagColors).forEach(tag => {
      const tagBtn = document.createElement('button');
      tagBtn.className = 'tag-button';
      tagBtn.textContent = tag;
      tagBtn.setAttribute('aria-pressed', 'false');
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
      sortSelect.setAttribute('aria-label', 'Sort by');

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

  /**
   * Renders the grid of boxes with first-fit tiling (or auto-flow on small).
   *
   * Filters/sorts/paginates the boxes, places each at its resolved mode size,
   * records placements, and stretches boxes rightward to fill gaps (non-small).
   *
   * @returns {HTMLDivElement} the boxes wrapper (pagination + grid container)
   */
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
    const grid = Array.from({ length: GRID_ROWS }, () => Array(columns).fill(false));
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

    this._placements = [];
    // Small viewports flow boxes in source order with natural heights (no
    // fixed square rows), so long text is never squished into a tight box
    const autoFlow = this.currentMode === 'small';
    boxes.forEach(box => {
      const dims = this.resolveDims(box);
      const boxWidth = Math.min(dims.w, columns);
      if (autoFlow && !box.isBlogPost) {
        container.appendChild(this.renderBox(box, boxWidth, null, dims));
        return;
      }
      const position = this.findPosition(grid, boxWidth, dims.h);
      if (position) {
        const el = this.renderBox(box, boxWidth, position, dims);
        container.appendChild(el);
        for (let row = position.row; row < position.row + dims.h; row++) {
          for (let col = position.col; col < position.col + boxWidth; col++) {
            if (grid[row]) grid[row][col] = true;
          }
        }
        this._placements.push({ box, el, row: position.row, col: position.col, w: boxWidth, h: dims.h, dims });
      }
    });
    if (!allBlogPosts && !autoFlow) {
      this.stretchBoxesRight(grid, columns);
    }
    wrapper.appendChild(container);

    return wrapper;
  }

  /**
   * Stretches boxes rightward to the grid edge when the cells to their right
   * are all free. Square-aspect cards (w == h) are exempt.
   *
   * @param {boolean[][]} grid  - the occupancy grid
   * @param {number} columns    - the column count for the current mode
   * @returns {void}
   */
  stretchBoxesRight(grid, columns) {
    this._placements.forEach(p => {
      if (p.dims.w === p.dims.h) return;
      if (p.col + p.w >= columns) return;
      for (let c = p.col + p.w; c < columns; c++) {
        for (let r = p.row; r < p.row + p.h; r++) {
          if (grid[r][c]) return;
        }
      }
      for (let c = p.col + p.w; c < columns; c++) {
        for (let r = p.row; r < p.row + p.h; r++) grid[r][c] = true;
      }
      p.w = columns - p.col;
      p.el.style.gridColumn = `${p.col + 1} / span ${p.w}`;
    });
  }

  /**
   * Cosmetic post-layout pass that never changes box geometry.
   *
   * Currently drops tags on icon cards when they would wrap below the footer line.
   *
   * @returns {void}
   */
  settleBoxes() {
    // Icon cards: if the tags would wrap below the footer line, drop them
    document.querySelectorAll('.box').forEach(el => {
      if (!el.querySelector('.box-body-image-only')) return;
      const ft = el.querySelector('.box-footer');
      const tg = el.querySelector('.box-tags');
      if (ft && tg && tg.getBoundingClientRect().top > ft.getBoundingClientRect().top + 4) tg.remove();
    });
  }

  /**
   * Renders the pagination bar (item range, prev/next, page indicator).
   *
   * @param {number} totalPages  - total number of pages
   * @param {number} totalBoxes  - total number of boxes across all pages
   * @returns {HTMLDivElement} the pagination element
   */
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

  /**
   * Returns boxes filtered by the active tag and search term, pinned first.
   *
   * @returns {object[]} the filtered boxes (pinned boxes ahead of the rest)
   */
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

  /**
   * Sorts boxes by the active sort config, keeping pinned boxes on top.
   *
   * @param {object[]} boxes  - the boxes to sort
   * @returns {object[]} the sorted boxes (pinned group ahead of the rest)
   */
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

  /**
   * Reads a nested value from an object by a key path.
   *
   * @param {object} obj     - the object to read from
   * @param {string[]} keys  - the key path to follow
   * @returns {*} the nested value, or null if any key is missing
   */
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

  /**
   * Sets --content-scale so fonts track the grid unit, then sizes the grid rows
   * to square units on medium/large screens.
   *
   * Fonts scale relative to the ~100px unit of the large layout, so any viewport
   * renders a proportionally scaled version of that design instead of squishing
   * text (small screens) or leaving blank space (big screens). Padding and gap
   * are rem-based, so solving unit(scale) = GRID_UNIT * scale gives
   * scale = width / (pad + gaps + GRID_UNIT * columns), clamped and capped at
   * SCALE_MAX so wide monitors get side margin instead of upscaled everything.
   *
   * @returns {void}
   */
  updateRowHeight() {
    const columns = this.getColumns();
    const small = this.currentMode === 'small';
    const pad = small ? PAD_SMALL : PAD_LARGE;
    const gapEst = small ? GAP_SMALL : GAP_LARGE;
    // Blog posts render in a fixed 1000px column, so keep their conservative cap
    const isBlogPage = this.config.boxes.every(box => box.isBlogPost);
    const maxScale = isBlogPage ? SCALE_MAX_BLOG : SCALE_MAX;
    const rawScale = window.innerWidth / (pad + (columns - 1) * gapEst + GRID_UNIT * columns);
    const scale = Math.min(maxScale, Math.max(SCALE_MIN, rawScale));
    document.documentElement.style.setProperty('--content-scale', scale.toFixed(3));
    const container = document.querySelector('.boxes-container');
    if (!container) return;
    if (small) {
      // Small mode: natural box heights, square cards keep aspect via CSS
      container.style.gridAutoRows = 'auto';
      return;
    }
    // Medium/large: rows are square units so boxes keep their configured aspect
    const containerWidth = container.clientWidth;
    const gap = parseFloat(getComputedStyle(container).gap) || GAP_LARGE;
    const columnWidth = (containerWidth - (columns - 1) * gap) / columns;
    container.style.gridAutoRows = `${columnWidth}px`;
  }

  /**
   * Finds the first-fit top-left cell for a box of the given size.
   *
   * @param {boolean[][]} grid  - the occupancy grid
   * @param {number} width      - box width in columns
   * @param {number} height     - box height in rows
   * @returns {{row: number, col: number}|null} the position, or null if none fits
   */
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

  /**
   * Whether a box of the given size fits with its top-left at (startRow, startCol).
   *
   * @param {boolean[][]} grid  - the occupancy grid
   * @param {number} startRow   - top row of the candidate position
   * @param {number} startCol   - left column of the candidate position
   * @param {number} width      - box width in columns
   * @param {number} height     - box height in rows
   * @returns {boolean} true when all covered cells are free
   */
  canPlaceBox(grid, startRow, startCol, width, height) {
    for (let row = startRow; row < startRow + height; row++) {
      for (let col = startCol; col < startCol + width; col++) {
        if (grid[row][col]) return false;
      }
    }
    return true;
  }

  /**
   * Renders a box image from an image_url, supporting "svg:name:color" icons.
   *
   * @param {string} imageUrl        - image path or "svg:iconName:color"
   * @param {string} title           - alt text for raster images
   * @param {boolean} isFullSize     - use the full-box image class when true
   * @param {number[]|null} imageSize  - optional [w, h] intrinsic size (CLS hint)
   * @returns {string} the image or SVG HTML, or "" if unavailable
   */
  renderImage(imageUrl, title, isFullSize = false, imageSize = null) {
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
    if (imageSize && imageSize.length === 2) {
      img.width = imageSize[0];
      img.height = imageSize[1];
    }
    img.loading = 'lazy';
    img.decoding = 'async';
    return img.outerHTML;
  }

  /**
   * Renders a single box element (title, body, footer, tags) and its behavior.
   *
   * Places the box via grid position (or auto-flow when position is null),
   * wires optional href navigation, renders markdown/code/image bodies, and
   * attaches TOC scroll and tag-filter handlers.
   *
   * @param {object} box                          - the box config
   * @param {number} width                        - column span for this box
   * @param {{row: number, col: number}|null} position  - grid position, or null for auto-flow
   * @param {{w: number, h: number}} dims         - resolved mode dimensions
   * @returns {HTMLDivElement} the box element
   */
  renderBox(box, width, position, dims) {
    const boxEl = document.createElement('div');
    boxEl.className = `box${box.pinned ? ' box-pinned' : ''}${box.isBlogPost ? ' box-blog-post' : ''}`;
    if (position) {
      boxEl.style.gridColumn = `${position.col + 1} / span ${width}`;
      if (!box.isBlogPost) boxEl.style.gridRow = `${position.row + 1} / span ${dims.h}`;
    } else {
      // Small-viewport auto flow: natural height, source order
      boxEl.style.gridColumn = `span ${width}`;
      boxEl.classList.add('box-auto');
      if (dims.w === dims.h) boxEl.classList.add('box-square');
    }

    // Make box clickable if href provided
    if (box.href) {
      boxEl.classList.add('box-has-link');
      boxEl.setAttribute('role', 'link');
      boxEl.setAttribute('tabindex', '0');
      const navigateBox = () => {
        box.href.startsWith('#')
          ? window.router.navigate(box.href.slice(1))
          : window.open(box.href, '_blank');
      };
      boxEl.addEventListener('click', (e) => {
        if (e.target.tagName !== 'A') {
          e.preventDefault();
          navigateBox();
        }
      });
      boxEl.addEventListener('keydown', (e) => {
        // only when the box itself is focused, so Enter on an inner
        // interactive element (e.g. a spoiler button) keeps its own action
        if (e.key === 'Enter' && e.target === boxEl) {
          e.preventDefault();
          navigateBox();
        }
      });
    } else {
      boxEl.classList.add('box-no-link');
    }

    // Render header with title and optional pinned label
    if (box.title) {
      const title = document.createElement('div');
      title.className = 'box-title';
      title.innerHTML = `<span>${this.parser.processInline(box.title)}</span>`;
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
        imageContainer.innerHTML = this.renderImage(box.image_url, box.title, false, box.image_size);

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
        body.innerHTML = this.renderImage(box.image_url, box.title, true, box.image_size);
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

  /**
   * Renders the site footer (divider and footer text).
   *
   * @returns {HTMLDivElement} the footer element
   */
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

  /**
   * Renders the back-to-top button that smooth-scrolls to the top on click.
   *
   * @returns {HTMLButtonElement} the back-to-top button
   */
  renderTopButton() {
    const button = document.createElement('button');
    button.className = 'back-to-top';
    button.id = 'back-to-top';
    button.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
    button.setAttribute('aria-label', 'Back to top');
    button.title = 'Back to top';
    button.onclick = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    return button;
  }

  /**
   * Sets the active tag filter, resets to page 1, and re-renders content.
   *
   * @param {string} tag  - the tag to filter by ("All" clears the filter)
   * @returns {void}
   */
  filterByTag(tag) {
    this.activeTag = tag;
    this.currentPage = 1; 
    document.querySelectorAll('.tag-button').forEach(btn => {
      const isActive = btn.textContent === tag;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
    this.reRenderContent();
  }

  /**
   * Binds the search-input and sort-select listeners for the selection area.
   *
   * @returns {void}
   */
  attachEventListeners() {
    // Appearance controls live in the "Aa" popover (createSettingsMenu); their
    // change handlers are bound per-button there and persist via StateManager.
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
