// Shared pre-paint boot for the CS559 demo pages: applies the site's cached
// palette (same localStorage contract as the index.html boot script) and
// flags embed mode so iframed demos hide their standalone chrome.
(function () {
  const root = document.documentElement;

  function apply(state) {
    let variant = state.variant || 'dark';
    if (variant === 'system') {
      variant = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    const palette = state.paletteCache && state.paletteCache[variant];
    if (palette) {
      Object.entries(palette).forEach(([name, value]) => {
        root.style.setProperty(`--${name}`, value);
      });
    }
  }

  let state = {};
  try { state = JSON.parse(localStorage.getItem('website-state')) || {}; } catch (e) { /* corrupted state */ }
  apply(state);

  if (window.self !== window.top || new URLSearchParams(location.search).get('embed') === '1') {
    root.classList.add('embed');
  }

  // Theme changes made in the parent site land here live: storage events
  // fire in every other same-origin context when website-state is written
  window.addEventListener('storage', (e) => {
    if (e.key !== 'website-state' || !e.newValue) return;
    try { apply(JSON.parse(e.newValue) || {}); } catch (err) { /* ignore */ }
  });
})();
