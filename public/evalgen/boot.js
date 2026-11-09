// Pre-paint boot: applies the site's cached palette (same localStorage contract as
// public/graphics/graphics-boot.js) and flags embed mode for iframed use
(function () {
  const root = document.documentElement;
  const SIZES = { small: '14px', medium: '16px', large: '18px', xlarge: '20px' };

  function apply(state) {
    let variant = state.variant || 'dark';
    if (variant === 'system') {
      variant = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    const palette = state.paletteCache && state.paletteCache[variant];
    if (palette) {
      Object.entries(palette).forEach(([name, value]) => root.style.setProperty(`--${name}`, value));
    }
    root.style.setProperty('--font-size-base', SIZES[state.fontSize] || SIZES.medium);
    root.style.colorScheme = variant;
  }

  let state = {};
  try { state = JSON.parse(localStorage.getItem('website-state')) || {}; } catch (e) { /* corrupted state */ }
  apply(state);

  if (window.self !== window.top || new URLSearchParams(location.search).get('embed') === '1') {
    root.classList.add('embed');
  }

  window.addEventListener('storage', (e) => {
    if (e.key !== 'website-state' || !e.newValue) return;
    try { apply(JSON.parse(e.newValue) || {}); } catch (err) { /* ignore */ }
  });
})();
