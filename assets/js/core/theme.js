/** Theme definitions and switcher — persisted in localStorage */

export const THEMES = [
  { id: 'dark', label: 'Dark', icon: '🌙' },
  { id: 'light', label: 'Light', icon: '☀️' },
  { id: 'midnight', label: 'Midnight', icon: '🌌' },
  { id: 'ocean', label: 'Ocean', icon: '🌊' },
  { id: 'forest', label: 'Forest', icon: '🌲' },
  { id: 'sunset', label: 'Sunset', icon: '🌅' },
  { id: 'lavender', label: 'Lavender', icon: '💜' },
  { id: 'rose', label: 'Rose', icon: '🌸' },
  { id: 'contrast', label: 'High Contrast', icon: '⚡' },
  { id: 'sepia', label: 'Sepia', icon: '📜' },
];

const STORAGE_KEY = 'jwt-theme';
const DEFAULT = 'dark';

export function getTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return THEMES.some(t => t.id === saved) ? saved : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

export function setTheme(id) {
  const theme = THEMES.find(t => t.id === id) ? id : DEFAULT;
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* ignore */ }
  updateMetaThemeColor(theme);
  const select = document.getElementById('theme-select');
  if (select && select.value !== theme) select.value = theme;
}

function updateMetaThemeColor(themeId) {
  const colors = {
    dark: '#0f172a', light: '#ffffff', midnight: '#0a0a12', ocean: '#0c1929',
    forest: '#0a1a0f', sunset: '#1a1008', lavender: '#15101f', rose: '#1a0f14',
    contrast: '#000000', sepia: '#f4ecd8',
  };
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  meta.content = colors[themeId] || colors.dark;
}

export function initTheme() {
  setTheme(getTheme());
}

export function initThemeSwitcher() {
  const wrap = document.getElementById('theme-switcher');
  const select = document.getElementById('theme-select');
  if (!wrap || !select) return;

  select.innerHTML = THEMES.map(t =>
    `<option value="${t.id}">${t.icon} ${t.label}</option>`
  ).join('');
  select.value = getTheme();

  select.addEventListener('change', () => setTheme(select.value));
}

initTheme();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initThemeSwitcher);
} else {
  initThemeSwitcher();
}
