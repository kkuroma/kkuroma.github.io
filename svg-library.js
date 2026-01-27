/**
 * Stores SVG icons
 *
 * Usage in markdown:
 * ![SVG](name){color1:value1, color2:value2, width, height}
 *
 * Example:
 * ![SVG](github){fill:var(--blue), 24, 24}
 * ![SVG](email){primary:#ffffff, secondary:#000000, 32, 32}
 */

const SVG_LIBRARY = {
  github: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" fill="{{fill}}"/>
  </svg>`,

  email: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z" stroke="{{stroke}}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  linkedin: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="{{fill}}"/>
  </svg>`,

  resume: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="{{stroke}}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14 2V8H20" stroke="{{stroke}}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M16 13H8" stroke="{{stroke}}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M16 17H8" stroke="{{stroke}}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M10 9H9H8" stroke="{{stroke}}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  twitter: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" stroke="{{stroke}}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  website: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="{{stroke}}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="{{stroke}}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  link: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="{{stroke}}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="{{stroke}}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  download: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="{{stroke}}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  external: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="{{stroke}}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  arrow: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12h14M12 5l7 7-7 7" stroke="{{stroke}}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  check: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17l-5-5" stroke="{{stroke}}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  star: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="{{fill}}" stroke="{{stroke}}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  home: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="{{stroke}}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9 22V12h6v10" stroke="{{stroke}}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  document: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="{{stroke}}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14 2V8H20" stroke="{{stroke}}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  blog: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="{{stroke}}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  warning: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="{{stroke}}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 9v4M12 17h.01" stroke="{{stroke}}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  alert: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="{{stroke}}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 8v4M12 16h.01" stroke="{{stroke}}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
};

// helper function, adds color width and height attributes to svg
function getSVG(name, colors = {}, width = 24, height = 24) {
  if (!SVG_LIBRARY[name]) {
    console.warn(`SVG "${name}" not found in library`);
    return '';
  }
  let svg = SVG_LIBRARY[name];
  Object.entries(colors).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    svg = svg.replaceAll(placeholder, value);
  });
  svg = svg.replaceAll(/\{\{(\w+)\}\}/g, 'currentColor');

  // If width/height are undefined, don't add size attributes (allows CSS control)
  if (width !== undefined && height !== undefined) {
    svg = svg.replace('<svg', `<svg width="${width}" height="${height}"`);
  }
  return svg;
}

// export modules
if (typeof window !== 'undefined') {
  window.SVG_LIBRARY = SVG_LIBRARY;
  window.getSVG = getSVG;
}
