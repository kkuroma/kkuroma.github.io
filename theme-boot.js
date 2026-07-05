/**
 * Theme bootstrap: applies the saved (or default) palette before first paint
 * so there is no unthemed flash and page transitions look seamless.
 * Must load synchronously, after themes.js, before any stylesheet paints content.
 */
(function () {
  let s = {};
  try { s = JSON.parse(localStorage.getItem('website-state')) || {}; } catch (e) { /* corrupted state */ }
  const theme = THEMES[s.theme] ? s.theme : 'Natsumikan';
  let variant = s.variant || 'dark';
  if (variant === 'system') {
    variant = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  const root = document.documentElement;
  Object.entries(THEMES[theme][variant]).forEach(([name, value]) => {
    root.style.setProperty(`--${name}`, value);
  });
  const sizes = { small: '14px', medium: '16px', large: '18px', xlarge: '20px' };
  root.style.setProperty('--font-size-base', sizes[s.fontSize] || '16px');
})();
