/**
 * Markdown-like parser, accepts markdown string and returns HTML elements
 *
 * Supported syntax:
 * **bold**
 * *italic*
 * __underline__
 * ~~strikethrough~~
 * `code`
 * ```language syntax highlighted code```
 * [text]{color:red} - colored text using theme colors
 * [text]{hex:#ff0000} - colored text using custom hex
 * [text]{rainbow} - rainbow animated text
 * # Heading 1
 * ## Heading 2
 * ### Heading 3
 * - Unordered list
 * 1. Ordered list
 * > Blockquote
 * --- (horizontal rule)
 * \n\n (paragraph break)
 * ![Image](url){Image with captions}
 * ![Image](url){Image with size, 800, 600}
 * ![Iframe](url){Iframe with captions}
 * ![Iframe](url){Iframe with size, 800, 600}
 * | Col1 | Col2 | - table
 * ![SVG](name){color1:value1, color2:value2, width, height} - SVG icons
 * #TOC - table of contents
 * $$math$$ - block math (KaTeX display mode, own paragraph)
 * $math$ - inline math (KaTeX inline mode)
 *
 * Logic:
 * 1. Sanitize ALL text first (security)
 * 2. Pre-generate TOC if #TOC is present (even if false positive)
 * 3. Extract triple backtick code blocks (```)
 * 4. For each non-code paragraph:
 *    - If exactly "#TOC", mark as TOC placeholder
 *    - Otherwise, split into single backtick (`) code and non-code segments
 *    - Apply markdown rendering (images, SVGs, iframes, hyperlinks, bold, italic, etc.) to non-code segments
 *    - Convert inline code to <code> HTML tags
 *    - This substitutes paragraph strings with HTML-containing versions
 * 5. Check for block modifiers in order: blockquotes (>), then lists (- or numbers with indents), then tables (|)
 * 6. Render each item based on its type
 */

class MarkdownParser {
  constructor(theme = null, variant = null) {
    this.theme = theme;
    this.variant = variant;
    this.colors = null;
    this.tocHTML = ''; // Pre-generated TOC HTML
    if (theme && variant && typeof THEMES !== 'undefined') {
      this.colors = THEMES[theme][variant];
    }
  }

  /* Sanitize HTML to prevent XSS */
  sanitizeText(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* Escape HTML entities */
  escapeHtml(text) {
    const escapeMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return text.replace(/[&<>"']/g, char => escapeMap[char]);
  }

  /* Heading text -> anchor id (shared by headings and the TOC) */
  slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  /* Split "{caption, w, h}" media params into caption text and numeric size */
  parseMediaParams(params) {
    const parts = (params || '').split(',').map(p => p.trim());
    const numbers = parts.filter(p => /^\d+$/.test(p));
    const text = parts.filter(p => p && !/^\d+$/.test(p));
    return { caption: text.join(', '), width: numbers[0] || '', height: numbers[1] || '' };
  }

  /* Wrap a media element in <figure> when a caption is given */
  withCaption(el, caption) {
    if (!caption) return el.outerHTML;
    const figure = document.createElement('figure');
    figure.appendChild(el);
    const figcaption = document.createElement('figcaption');
    figcaption.textContent = caption;
    figure.appendChild(figcaption);
    return figure.outerHTML;
  }

  /* Sanitize URLs */
  sanitizeUrl(url) {
    if (!url || typeof url !== 'string') return '#';
    const trimmed = url.trim();
    const dangerousProtocols = /^(javascript|data|vbscript|file|about):/i;
    if (dangerousProtocols.test(trimmed)) {
      console.warn('Blocked dangerous URL:', trimmed);
      return '#';
    }
    const safePattern = /^(https?:\/\/|mailto:|tel:|#|\/|\.\.?\/).*$/i;
    if (!safePattern.test(trimmed) && trimmed !== '') {
      console.warn('Blocked suspicious URL:', trimmed);
      return '#';
    }
    return trimmed;
  }

  /* Main parse method */
  parse(text) {
    if (!text) return '';

    // Step 1: Sanitize everything first
    text = this.sanitizeText(text);

    // Step 2: Pre-generate TOC if #TOC is present (even if false positive)
    if (text.includes('#TOC')) {
      this.tocHTML = this.generateTOC(text);
    } else {
      this.tocHTML = '';
    }

    // Step 3: Extract code blocks and inline code, create item list
    const items = this.parseToItems(text);

    // Step 4: Process each item
    let result = '';
    for (const item of items) {
      if (item.is_code) {
        result += this.renderCodeBlock(item.content, item.language);
      } else if (item.is_math_block) {
        result += this.renderMathBlock(item.content);
      } else if (item.is_toc) {
        result += this.tocHTML;
      } else {
        result += this.renderParagraph(item.content, item.has_inline_html);
      }
    }

    return result;
  }

  /* Parse text into array of items */
  parseToItems(text) {
    const items = [];

    // First, extract triple backtick code blocks
    const parts = [];
    let lastIndex = 0;
    const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index)
        });
      }

      // Add code block
      parts.push({
        type: 'code_block',
        language: match[1] || '',
        content: match[2]
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex)
      });
    }

    // Extract $$...$$ math blocks from text parts, but skip $$ inside inline code (`...`)
    const expandedParts = [];
    for (const part of parts) {
      if (part.type !== 'text') {
        expandedParts.push(part);
        continue;
      }
      // Find all inline code spans so we can skip $$ inside them
      const inlineCodeRanges = [];
      const icRegex = /`[^`]+`/g;
      let icMatch;
      while ((icMatch = icRegex.exec(part.content)) !== null) {
        inlineCodeRanges.push({ start: icMatch.index, end: icMatch.index + icMatch[0].length });
      }
      const isInsideInlineCode = (idx) => inlineCodeRanges.some(r => idx >= r.start && idx < r.end);

      const mathBlockRegex = /\$\$([\s\S]+?)\$\$/g;
      let mLastIndex = 0;
      let mMatch;
      while ((mMatch = mathBlockRegex.exec(part.content)) !== null) {
        if (isInsideInlineCode(mMatch.index)) continue;
        if (mMatch.index > mLastIndex) {
          expandedParts.push({ type: 'text', content: part.content.substring(mLastIndex, mMatch.index) });
        }
        expandedParts.push({ type: 'math_block', content: mMatch[1] });
        mLastIndex = mMatch.index + mMatch[0].length;
      }
      if (mLastIndex < part.content.length) {
        expandedParts.push({ type: 'text', content: part.content.substring(mLastIndex) });
      }
    }

    // Now process each part
    for (const part of expandedParts) {
      if (part.type === 'code_block') {
        items.push({ content: part.content, language: part.language, is_code: true });
      } else if (part.type === 'math_block') {
        items.push({ content: part.content, is_math_block: true });
      } else {
        items.push(...this.parseTextPart(part.content));
      }
    }

    return items;
  }

  /* Parse text part (no triple backticks) into items */
  parseTextPart(text) {
    const items = [];

    // Split by double newlines (paragraphs)
    const paragraphs = text.split(/\n\n+/);

    for (const para of paragraphs) {
      if (!para.trim()) continue;

      // Check if this paragraph is exactly #TOC
      if (para.trim() === '#TOC') {
        items.push({ content: '#TOC', is_toc: true });
        continue;
      }

      // Split paragraph into single backtick code blocks and non-code parts
      const inlineCodeRegex = /`([^`]+)`/g;
      const segments = [];
      let lastIdx = 0;
      let hasInlineCode = false;
      let m;

      while ((m = inlineCodeRegex.exec(para)) !== null) {
        hasInlineCode = true;
        // Add text before code
        if (m.index > lastIdx) {
          segments.push({
            type: 'text',
            content: para.substring(lastIdx, m.index)
          });
        }
        // Add inline code
        segments.push({
          type: 'inline_code',
          content: m[1]
        });
        lastIdx = m.index + m[0].length;
      }

      // Add remaining text
      if (lastIdx < para.length) {
        segments.push({
          type: 'text',
          content: para.substring(lastIdx)
        });
      }

      // If no inline code, just add the paragraph for later processing
      if (!hasInlineCode) {
        items.push({ content: para.trim() });
      } else {
        // Paragraph has inline code: render <code> segments (unescape the
        // sanitization pass, then re-escape) and apply inline markdown to the
        // rest; has_inline_html tells renderParagraph to skip processInline
        let rendered = '';
        for (const seg of segments) {
          if (seg.type === 'inline_code') {
            rendered += `<code>${this.escapeHtml(this.unescapeHtml(seg.content))}</code>`;
          } else {
            rendered += this.processInline(seg.content);
          }
        }
        items.push({ content: rendered, has_inline_html: true });
      }
    }

    return items;
  }

  /* Render code block */
  renderCodeBlock(code, language) {
    // Unescape HTML entities from initial sanitization so that e.g. < shows as <
    code = this.unescapeHtml(code);
    const rawCode = code.trim();
    const highlightedCode = this.highlightCode(rawCode, language);
    const langClass = language ? `language-${language}` : '';
    // Store raw code as a data attribute for the copy button (escaped for HTML attribute)
    const escapedRaw = this.escapeHtml(rawCode);
    const copyIcon = typeof window !== 'undefined' && window.getSVG ? window.getSVG('copy', { stroke: 'currentColor' }, 16, 16) : '';
    const checkIcon = typeof window !== 'undefined' && window.getSVG ? window.getSVG('check', { stroke: 'currentColor' }, 16, 16) : '';
    const escapedCopyIcon = copyIcon.replace(/"/g, '&quot;');
    const escapedCheckIcon = checkIcon.replace(/"/g, '&quot;');
    const copyBtn = `<button class="code-copy-btn" title="Copy to clipboard" data-copy-icon="${escapedCopyIcon}" data-check-icon="${escapedCheckIcon}" onclick="var btn=this;navigator.clipboard.writeText(btn.parentElement.querySelector('code').getAttribute('data-raw')).then(function(){btn.innerHTML=btn.getAttribute('data-check-icon');btn.classList.add('copied');setTimeout(function(){btn.innerHTML=btn.getAttribute('data-copy-icon');btn.classList.remove('copied')},2000)})">${copyIcon}</button>`;
    return `<pre class="code-block-wrapper">${copyBtn}<code class="${langClass}" data-raw="${escapedRaw}">${highlightedCode}</code></pre>\n`;
  }

  /* Syntax highlighting */
  highlightCode(code, language) {
    if (language && typeof Prism !== 'undefined') {
      const aliases = {
        'js': 'javascript',
        'ts': 'typescript',
        'py': 'python',
        'sh': 'bash',
        'yml': 'yaml'
      };
      const langToCheck = aliases[language] || language;
      const grammar = Prism.languages[langToCheck];
      if (grammar) {
        return Prism.highlight(code, grammar, langToCheck);
      }
    }
    return this.escapeHtml(code);
  }

  /* Render paragraph with markdown processing */
  renderParagraph(text, hasInlineHtml = false) {
    text = text.trim();
    if (!text) return '';

    // Check for special block types in order: headings, hr, image rows,
    // blockquotes, lists, tables

    const heading = text.match(/^(#{1,3}) /);
    if (heading) {
      const level = heading[1].length;
      const headingText = text.slice(level + 1);
      const content = hasInlineHtml ? headingText : this.processInline(headingText);
      return `<h${level} id="${this.slugify(headingText)}">${content}</h${level}>\n`;
    }

    // Horizontal rule
    if (text.trim() === '---') {
      return '<hr>\n';
    }

    // Image row
    if (text.match(/!\[.*?\]\(.*?\)\{.*?\}(\s*\|\s*!\[.*?\]\(.*?\)\{.*?\})+/)) {
      return this.parseImageRow(text);
    }

    // Blockquote
    if (text.startsWith('&gt; ')) {
      const lines = text.split('\n').map(line =>
        line.startsWith('&gt; ') ? line.slice(5) : line
      ).join(' ');
      const content = hasInlineHtml ? lines : this.processInline(lines);
      return `<blockquote>${content}</blockquote>\n`;
    }

    // Lists (both unordered and ordered)
    if (text.match(/^- /m)) {
      return this.parseList(text, 'ul', hasInlineHtml);
    }
    if (text.match(/^\d+\. /m)) {
      return this.parseList(text, 'ol', hasInlineHtml);
    }

    // Table
    if (text.includes('|') && text.split('\n').length >= 2) {
      const lines = text.split('\n');
      if (lines.length >= 2 && lines[1].match(/^\s*\|?[\s:-]+\|[\s|:-]+\|?\s*$/)) {
        return this.parseTable(lines, hasInlineHtml);
      }
    }

    // Regular paragraph
    const content = hasInlineHtml ? text : this.processInline(text);
    return `<p>${content}</p>\n`;
  }

  /* Process inline markdown (bold, italic, links, etc.) */
  processInline(text) {
    // Note: inline code has already been converted to <code> tags
    // So we won't match backticks here

    let result = text;

    // Inline math ($...$)
    result = result.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
      if (typeof katex !== 'undefined') {
        try {
          return katex.renderToString(this.unescapeHtml(math.trim()), { displayMode: false, throwOnError: false });
        } catch (e) {
          return `$${math}$`;
        }
      }
      return `$${math}$`;
    });

    // Colors (process inner content with processInline so [**text**]{color:x} works)
    result = result.replace(/\[([^\]]+)\]\{color:(\w+)\}/g, (_, content, colorName) => {
      if (!/^[a-z0-9]+$/i.test(colorName)) return content;
      const inner = this.processInline(content);
      if (this.colors && this.colors[colorName]) {
        return `<span style="color: var(--${colorName})">${inner}</span>`;
      }
      return `<span style="color: ${colorName}">${inner}</span>`;
    });

    result = result.replace(/\[([^\]]+)\]\{hex:(#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3})\}/g, (_, content, hex) => {
      const inner = this.processInline(content);
      return `<span style="color: ${hex}">${inner}</span>`;
    });

    result = result.replace(/\[([^\]]+)\]\{rainbow\}/g, (_, content) => {
      return this.createRainbowText(content);
    });

    // SVG icons
    result = result.replace(/!\[SVG\]\(([^\)]+)\)(?:\{([^}]+)\})?/g, (_, name, params) => {
      if (typeof window === 'undefined' || !window.getSVG) {
        return `[SVG: ${name}]`;
      }

      let colors = {};
      let width = 24;
      let height = 24;

      if (params) {
        const parts = params.split(',').map(p => p.trim());
        parts.forEach(part => {
          if (part.includes(':')) {
            const [key, value] = part.split(':').map(s => s.trim());
            if (value.match(/^(#[a-fA-F0-9]{3,6}|var\(--[\w-]+\)|[\w]+)$/)) {
              colors[key] = value;
            }
          }
        });

        const numericParts = parts.filter(p => /^\d+$/.test(p));
        if (numericParts.length >= 1) width = numericParts[0];
        if (numericParts.length >= 2) height = numericParts[1];
      }

      const svg = window.getSVG(name, colors, width, height);
      return svg || `[SVG: ${name} not found]`;
    });

    // Images (not in a row)
    result = result.replace(/!\[Image\]\(([^)]+)\)(?:\{([^}]+)\})?/g, (_, url, params) => {
      const { caption, width, height } = this.parseMediaParams(params);
      const img = document.createElement('img');
      img.src = this.sanitizeUrl(url);
      img.alt = caption || 'Image';
      if (width) img.width = width;
      if (height) img.height = height;
      img.loading = 'lazy';
      img.decoding = 'async';
      return this.withCaption(img, caption);
    });

    // Iframes
    result = result.replace(/!\[Iframe\]\(([^)]+)\)(?:\{([^}]+)\})?/g, (_, url, params) => {
      const { caption, width, height } = this.parseMediaParams(params);
      const iframe = document.createElement('iframe');
      iframe.src = this.sanitizeUrl(url);
      iframe.title = caption || 'Embedded content';
      if (width) iframe.width = width;
      if (height) iframe.height = height;
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allowfullscreen', '');
      return this.withCaption(iframe, caption);
    });

    // Bold, italic, underline, strikethrough
    result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    result = result.replace(/__([^_]+)__/g, '<u>$1</u>');
    result = result.replace(/~~([^~]+)~~/g, '<del>$1</del>');

    // Links
    result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, linkText, url) => {
      const safeUrl = this.sanitizeUrl(url);
      return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
    });

    return result;
  }

  /* Parse image row */
  parseImageRow(text) {
    const images = text.split('|').map(img => img.trim()).filter(img => img);
    const imageHTML = images.map(img => {
      const match = img.match(/!\[Image\]\(([^)]+)\)(?:\{([^}]+)\})?/);
      if (!match) return '';

      const { caption, width, height } = this.parseMediaParams(match[2]);
      const imgEl = document.createElement('img');
      imgEl.src = this.sanitizeUrl(match[1]);
      imgEl.alt = caption || 'Image';
      if (width) imgEl.width = width;
      if (height) imgEl.height = height;
      imgEl.loading = 'lazy';
      imgEl.decoding = 'async';

      const container = document.createElement('div');
      container.className = 'image-row-item';
      container.appendChild(imgEl);
      if (caption) {
        const figcaption = document.createElement('figcaption');
        figcaption.textContent = caption;
        container.appendChild(figcaption);
      }
      return container.outerHTML;
    }).join('');

    return `<div class="image-row">${imageHTML}</div>\n`;
  }

  /* Parse table */
  parseTable(lines, hasInlineHtml = false) {
    let html = '<table>\n';

    const headerCells = lines[0].split('|').map(cell => cell.trim()).filter(cell => cell);
    html += '  <thead>\n    <tr>\n';
    headerCells.forEach(cell => {
      const content = hasInlineHtml ? cell : this.processInline(cell);
      html += `      <th>${content}</th>\n`;
    });
    html += '    </tr>\n  </thead>\n';

    if (lines.length > 2) {
      html += '  <tbody>\n';
      for (let i = 2; i < lines.length; i++) {
        const cells = lines[i].split('|').map(cell => cell.trim()).filter(cell => cell);
        html += '    <tr>\n';
        cells.forEach(cell => {
          const content = hasInlineHtml ? cell : this.processInline(cell);
          html += `      <td>${content}</td>\n`;
        });
        html += '    </tr>\n';
      }
      html += '  </tbody>\n';
    }

    html += '</table>\n';
    return html;
  }

  /* Parse list */
  parseList(text, listType, hasInlineHtml = false) {
    const lines = text.split('\n');
    const items = [];
    let currentItem = '';
    let currentIndent = 0;

    for (const line of lines) {
      const match = line.match(/^(\s*)([-\d]+\.?)\s+(.+)$/);

      if (match) {
        if (currentItem) {
          items.push({ indent: currentIndent, content: currentItem });
        }
        currentIndent = match[1].length;
        currentItem = match[3];
      } else if (line.trim()) {
        currentItem += ' ' + line.trim();
      }
    }

    if (currentItem) {
      items.push({ indent: currentIndent, content: currentItem });
    }

    // Build nested list HTML
    const buildList = (items, startIdx, parentIndent) => {
      let html = `<${listType}>\n`;
      let i = startIdx;

      while (i < items.length && items[i].indent >= parentIndent) {
        if (items[i].indent === parentIndent) {
          const content = hasInlineHtml ? items[i].content : this.processInline(items[i].content);
          html += `  <li>${content}`;

          // Check for nested items
          if (i + 1 < items.length && items[i + 1].indent > parentIndent) {
            const nestedResult = buildList(items, i + 1, items[i + 1].indent);
            html += nestedResult.html;
            i = nestedResult.nextIdx - 1;
          }

          html += '</li>\n';
          i++;
        } else {
          break;
        }
      }

      html += `</${listType}>\n`;
      return { html, nextIdx: i };
    };

    return buildList(items, 0, items[0]?.indent || 0).html;
  }

  /* Generate TOC */
  generateTOC(text) {
    const headings = [];
    let inCodeBlock = false;

    for (const line of text.split('\n')) {
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      if (inCodeBlock) continue;

      const match = line.match(/^(#{1,3}) (.+)$/);
      if (match) headings.push({ level: match[1].length, text: match[2] });
    }

    if (headings.length === 0) {
      return '<div class="toc-empty">No headings found for table of contents.</div>';
    }

    let tocHTML = '<nav class="toc"><div class="toc-title">Table of Contents</div><ul class="toc-list">\n';
    let currentLevel = 0;

    for (const heading of headings) {
      const id = this.slugify(heading.text);

      while (currentLevel < heading.level) {
        if (currentLevel > 0) tocHTML += '<ul class="toc-list">\n';
        currentLevel++;
      }

      while (currentLevel > heading.level) {
        tocHTML += '</ul></li>\n';
        currentLevel--;
      }

      if (currentLevel > 0 && currentLevel === heading.level) {
        tocHTML += '</li>\n';
      }

      tocHTML += `<li class="toc-item toc-level-${heading.level}"><a href="javascript:void(0)" data-scroll-to="${id}">${heading.text}</a>`;
    }

    while (currentLevel > 0) {
      tocHTML += '</li>\n';
      if (currentLevel > 1) tocHTML += '</ul>';
      currentLevel--;
    }

    tocHTML += '</ul></nav>\n';
    return tocHTML;
  }

  /* Unescape sanitized HTML entities for KaTeX input */
  unescapeHtml(text) {
    return text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  }

  /* Render block math ($$...$$) */
  renderMathBlock(math) {
    const raw = this.unescapeHtml(math.trim());
    if (typeof katex !== 'undefined') {
      try {
        return `<div class="katex-display">${katex.renderToString(raw, { displayMode: true, throwOnError: false })}</div>\n`;
      } catch (e) { /* fall through to plain output */ }
    }
    return `<p>$$${this.escapeHtml(raw)}$$</p>\n`;
  }

  /* Create rainbow text */
  createRainbowText(text) {
    let charIndex = 0;
    const words = text.split(' ');
    const wrappedWords = words.map(word => {
      const chars = word.split('').map(char => {
        const delay = charIndex * 0.1;
        charIndex++;
        return `<span class="rainbow-char" style="--rainbow-delay: ${delay}s">${char}</span>`;
      }).join('');
      charIndex++; // account for the space
      return `<span class="rainbow-word">${chars}</span>`;
    });
    return `<span class="rainbow-text">${wrappedWords.join(' ')}</span>`;
  }

  /* Set theme */
  setTheme(theme, variant) {
    this.theme = theme;
    this.variant = variant;
    if (typeof THEMES !== 'undefined') {
      this.colors = THEMES[theme][variant];
    }
  }
}

/* Static KaTeX lazy loader */
MarkdownParser._katexLoaded = false;
MarkdownParser._katexLoading = null;

MarkdownParser.loadKatexIfNeeded = function(text) {
  // Quick check: does the text contain any $ signs?
  if (!text || !text.includes('$')) return Promise.resolve();
  // Already loaded
  if (typeof katex !== 'undefined') {
    MarkdownParser._katexLoaded = true;
    return Promise.resolve();
  }
  // Already loading
  if (MarkdownParser._katexLoading) return MarkdownParser._katexLoading;

  MarkdownParser._katexLoading = new Promise((resolve) => {
    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.28/dist/katex.min.css';
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.28/dist/katex.min.js';
    script.onload = () => {
      MarkdownParser._katexLoaded = true;
      resolve();
    };
    script.onerror = () => {
      console.warn('Failed to load KaTeX');
      resolve(); // Resolve anyway so parsing continues without KaTeX
    };
    document.head.appendChild(script);
  });

  return MarkdownParser._katexLoading;
};

// Export
if (typeof window !== 'undefined') {
  window.MarkdownParser = MarkdownParser;
}
