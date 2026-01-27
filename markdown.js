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
        // Code blocks - just wrap, no markdown processing
        result += this.renderCodeBlock(item.content, item.language);
      } else if (item.is_toc) {
        // TOC placeholder - substitute with pre-generated TOC
        result += this.tocHTML;
      } else if (item.already_rendered) {
        // Already rendered HTML (from inline code segments) - needs block type checking
        result += this.renderParagraph(item.content, item.has_inline_html);
      } else if (item.is_new_paragraph) {
        // Regular content - apply markdown
        result += this.renderParagraph(item.content, item.has_inline_html);
      } else {
        // Inline content (shouldn't happen in this architecture but handle anyway)
        result += this.processInline(item.content);
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

    // Now process each part
    for (const part of parts) {
      if (part.type === 'code_block') {
        // Code block
        items.push({
          content: part.content,
          language: part.language,
          is_code: true,
          is_new_paragraph: true
        });
      } else {
        // Text part - need to handle inline code and paragraphs
        const textItems = this.parseTextPart(part.content);
        items.push(...textItems);
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
        items.push({
          content: '#TOC',
          is_code: false,
          is_new_paragraph: true,
          is_toc: true
        });
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
        items.push({
          content: para.trim(),
          is_code: false,
          is_new_paragraph: true
        });
      } else {
        // Paragraph has inline code - process segments and apply markdown to non-code parts
        let rendered = '';
        for (const seg of segments) {
          if (seg.type === 'inline_code') {
            // Convert code to HTML <code> tag
            rendered += `<code>${this.escapeHtml(seg.content)}</code>`;
          } else {
            // Apply markdown rendering to text segments (images, SVGs, iframes, hyperlinks, bold, italic, etc.)
            rendered += this.processInline(seg.content);
          }
        }

        // Mark as already rendered HTML - skip processInline in renderParagraph
        items.push({
          content: rendered,
          is_code: false,
          is_new_paragraph: true,
          already_rendered: true,
          has_inline_html: true
        });
      }
    }

    return items;
  }

  /* Render code block */
  renderCodeBlock(code, language) {
    const highlightedCode = this.highlightCode(code.trim(), language);
    const langClass = language ? `language-${language}` : '';
    return `<pre><code class="${langClass}">${highlightedCode}</code></pre>\n`;
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
    console.log(text);
    text = text.trim();
    if (!text) return '';

    // Check for special block types in order: blockquotes, then lists, then tables

    // Headings (check first as they're unambiguous)
    if (text.startsWith('# ')) {
      const headingText = text.slice(2);
      const id = headingText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const content = hasInlineHtml ? headingText : this.processInline(headingText);
      return `<h1 id="${id}">${content}</h1>\n`;
    }
    if (text.startsWith('## ')) {
      const headingText = text.slice(3);
      const id = headingText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const content = hasInlineHtml ? headingText : this.processInline(headingText);
      return `<h2 id="${id}">${content}</h2>\n`;
    }
    if (text.startsWith('### ')) {
      const headingText = text.slice(4);
      const id = headingText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const content = hasInlineHtml ? headingText : this.processInline(headingText);
      return `<h3 id="${id}">${content}</h3>\n`;
    }

    // Horizontal rule
    if (text.trim() === '---') {
      return '<hr>\n';
    }

    // Image row
    if (text.match(/!\[.*?\]\(.*?\)\{.*?\}(\s*\|\s*!\[.*?\]\(.*?\)\{.*?\})+/)) {
      return this.parseImageRow(text);
    }

    // 1. Blockquote (check first)
    if (text.startsWith('&gt; ')) {
      const lines = text.split('\n').map(line =>
        line.startsWith('&gt; ') ? line.slice(5) : line
      ).join(' ');
      const content = hasInlineHtml ? lines : this.processInline(lines);
      return `<blockquote>${content}</blockquote>\n`;
    }

    // 2. Lists (check second - both unordered and ordered)
    if (text.match(/^- /m)) {
      return this.parseList(text, 'ul', hasInlineHtml);
    }
    if (text.match(/^\d+\. /m)) {
      return this.parseList(text, 'ol', hasInlineHtml);
    }

    // 3. Table (check third)
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

    // Colors
    result = result.replace(/\[([^\]]+)\]\{color:(\w+)\}/g, (_, content, colorName) => {
      if (!/^[a-z0-9]+$/i.test(colorName)) return content;
      if (this.colors && this.colors[colorName]) {
        return `<span style="color: var(--${colorName})">${content}</span>`;
      }
      return `<span style="color: ${colorName}">${content}</span>`;
    });

    result = result.replace(/\[([^\]]+)\]\{hex:(#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3})\}/g, (_, content, hex) => {
      return `<span style="color: ${hex}">${content}</span>`;
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
      const safeUrl = this.sanitizeUrl(url);
      let caption = '';
      let width = '';
      let height = '';

      if (params) {
        const parts = params.split(',').map(p => p.trim());
        const numbers = parts.filter(p => /^\d+$/.test(p));
        const text = parts.filter(p => !/^\d+$/.test(p));

        if (text.length > 0) caption = text.join(', ');
        if (numbers.length >= 1) width = numbers[0];
        if (numbers.length >= 2) height = numbers[1];
      }

      const img = document.createElement('img');
      img.src = safeUrl;
      img.alt = caption || 'Image';
      if (width) img.width = width;
      if (height) img.height = height;

      if (caption) {
        const figure = document.createElement('figure');
        figure.appendChild(img);
        const figcaption = document.createElement('figcaption');
        figcaption.textContent = caption;
        figure.appendChild(figcaption);
        return figure.outerHTML;
      }

      return img.outerHTML;
    });

    // Iframes
    result = result.replace(/!\[Iframe\]\(([^)]+)\)(?:\{([^}]+)\})?/g, (_, url, params) => {
      const safeUrl = this.sanitizeUrl(url);
      let title = '';
      let width = '';
      let height = '';
      
      if (params) {
        const parts = params.split(',').map(p => p.trim());
        const numbers = parts.filter(p => /^\d+$/.test(p));
        const text = parts.filter(p => !/^\d+$/.test(p));
        
        if (text.length > 0) title = text.join(', ');
        if (numbers.length >= 1) width = numbers[0];
        if (numbers.length >= 2) height = numbers[1];
      }
      
      const iframe = document.createElement('iframe');
      iframe.src = safeUrl;
      iframe.title = title || 'Embedded content';
      if (width) iframe.width = width;
      if (height) iframe.height = height;
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allowfullscreen', '');
      
      if (title) {
        const figure = document.createElement('figure');
        figure.appendChild(iframe);
        const figcaption = document.createElement('figcaption');
        figcaption.textContent = title;
        figure.appendChild(figcaption);
        return figure.outerHTML;
      }
      
      return iframe.outerHTML;
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

      const url = this.sanitizeUrl(match[1]);
      let caption = '';
      let width = '';
      let height = '';

      if (match[2]) {
        const parts = match[2].split(',').map(p => p.trim());
        const numbers = parts.filter(p => /^\d+$/.test(p));
        const text = parts.filter(p => !/^\d+$/.test(p));

        if (text.length > 0) caption = text.join(', ');
        if (numbers.length >= 1) width = numbers[0];
        if (numbers.length >= 2) height = numbers[1];
      }

      const imgEl = document.createElement('img');
      imgEl.src = url;
      imgEl.alt = caption || 'Image';
      if (width) imgEl.width = width;
      if (height) imgEl.height = height;

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
    const lines = text.split('\n');
    let inCodeBlock = false;

    let i = 0;
    for (const line of lines) {
      // Track code block boundaries
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      console.log(line)

      // Skip lines inside code blocks
      if (inCodeBlock) continue;

      const h1Match = line.match(/^# (.+)$/);
      const h2Match = line.match(/^## (.+)$/);
      const h3Match = line.match(/^### (.+)$/);

      if (h1Match) headings.push({ level: 1, text: h1Match[1] });
      else if (h2Match) headings.push({ level: 2, text: h2Match[1] });
      else if (h3Match) headings.push({ level: 3, text: h3Match[1] });
    }

    //console.log("headings: ", headings)

    if (headings.length === 0) {
      return '<div class="toc-empty">No headings found for table of contents.</div>';
    }

    let tocHTML = '<nav class="toc"><div class="toc-title">Table of Contents</div><ul class="toc-list">\n';
    let currentLevel = 0;

    for (const heading of headings) {
      const id = heading.text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

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

  /* Create rainbow text */
  createRainbowText(text) {
    const chars = text.split('');
    const wrapped = chars.map((char, index) => {
      if (char === ' ') return ' ';
      const delay = index * 0.1;
      return `<span class="rainbow-char" style="--rainbow-delay: ${delay}s">${char}</span>`;
    }).join('');
    return `<span class="rainbow-text">${wrapped}</span>`;
  }

  /* Set theme */
  setTheme(theme, variant) {
    this.theme = theme;
    this.variant = variant;
    if (typeof THEMES !== 'undefined') {
      this.colors = THEMES[theme][variant];
    }
  }

  /* Alias for compatibility */
  parseInline(text) {
    return this.processInline(text);
  }
}

// Export
if (typeof window !== 'undefined') {
  window.MarkdownParser = MarkdownParser;
}
