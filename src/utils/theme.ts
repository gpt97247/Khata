export type ThemePreference = 'dark' | 'light' | 'system';

export function getThemePreference(): ThemePreference {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || saved === 'light' || saved === 'system') return saved;
  return 'dark';
}

export function isDarkTheme(theme = getThemePreference()): boolean {
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function applyTheme(theme: ThemePreference): void {
  if (typeof window === 'undefined') return;
  const dark = isDarkTheme(theme);
  localStorage.setItem('theme', theme);
  // Keep this legacy value in sync for existing installs.
  localStorage.setItem('darkMode', String(dark));
  document.documentElement.classList.toggle('dark', dark);
  window.dispatchEvent(new Event('khata:theme-change'));
}
