import { useEffect, useState } from 'react';
import { MoonIcon, PlusIcon, SunIcon } from './Icons';
import { applyTheme, isDarkTheme } from '../utils/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const [darkMode, setDarkMode] = useState(isDarkTheme);

  useEffect(() => {
    const syncTheme = () => setDarkMode(isDarkTheme());
    window.addEventListener('khata:theme-change', syncTheme);
    return () => window.removeEventListener('khata:theme-change', syncTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = !darkMode;
    setDarkMode(nextTheme);
    applyTheme(nextTheme ? 'dark' : 'light');
  };

  return (
    <header className="app-header">
      <div className="app-header__identity">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className="app-header__actions">
        {actions && <div className="app-header__utility">{actions}</div>}
        <button
          type="button"
          className="app-header__icon-button"
          onClick={toggleTheme}
          aria-label={darkMode ? 'Use light theme' : 'Use dark theme'}
          title={darkMode ? 'Use light theme' : 'Use dark theme'}
        >
          {darkMode ? <SunIcon className="icon" /> : <MoonIcon className="icon" />}
        </button>
        <button type="button" className="app-header__add" onClick={() => window.dispatchEvent(new Event('khata:quick-add'))}>
          <PlusIcon className="icon-sm" />
          <span>Add transaction</span>
        </button>
      </div>
    </header>
  );
}
