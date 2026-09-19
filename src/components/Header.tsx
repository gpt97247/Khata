import { useState, useRef, useEffect } from 'react';
import { applyTheme, isDarkTheme } from '../utils/theme';

function SunIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
}
function MoonIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
}
function BellIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
}
function UserIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
}
function ChevronDownIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
}
function LogoutIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
}
function SettingsIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const getInitialDarkMode = () => {
  return isDarkTheme();
};

export function Header({ title, subtitle, actions }: HeaderProps) {
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const syncTheme = () => setDarkMode(isDarkTheme());
    window.addEventListener('khata:theme-change', syncTheme);
    return () => window.removeEventListener('khata:theme-change', syncTheme);
  }, []);

  const toggleDarkMode = () => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    applyTheme(newDark ? 'dark' : 'light');
  };

  return (
    <header className="header">
      <div className="flex items-center gap-4 min-w-0">
        <h1 className="text-xl font-bold text-white truncate max-w-[350px]">{title}</h1>
        {subtitle && <span className="text-sm text-muted hidden sm:block">{subtitle}</span>}
      </div>

      <div className="flex items-center gap-2">
        {actions}

        <div className="dropdown relative" ref={notifRef}>
          <button
            className="icon-btn tooltip"
            data-tip="Notifications"
            onClick={() => setNotifOpen(!notifOpen)}
            aria-label="Notifications"
            aria-expanded={notifOpen}
          >
            <BellIcon className="icon" />
          </button>
          {notifOpen && (
            <div className="dropdown-menu w-80 animate-slide-down">
              <div className="p-3 border-b flex items-center justify-between">
                <h3 className="font-semibold text-sm">Notifications</h3>
                <span className="badge badge-primary text-xs">3 new</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="p-3 border-b hover:bg-hover transition-colors">
                  <p className="font-medium text-sm">Welcome to Khata!</p>
                  <p className="text-xs text-dim mt-1">Start tracking your expenses today</p>
                  <p className="text-xs text-dim mt-1">Just now</p>
                </div>
                <div className="p-3 border-b hover:bg-hover transition-colors">
                  <p className="font-medium text-sm">New category added</p>
                  <p className="text-xs text-dim mt-1">Food & Dining category created</p>
                  <p className="text-xs text-dim mt-1">5 minutes ago</p>
                </div>
                <div className="p-3 hover:bg-hover transition-colors">
                  <p className="font-medium text-sm">Monthly report ready</p>
                  <p className="text-xs text-dim mt-1">Your January summary is available</p>
                  <p className="text-xs text-dim mt-1">1 hour ago</p>
                </div>
              </div>
              <div className="p-3 border-t">
                <button className="btn-secondary text-sm w-full">View all notifications</button>
              </div>
            </div>
          )}
        </div>

        <button
          className="icon-btn tooltip"
          data-tip={darkMode ? 'Light mode' : 'Dark mode'}
          onClick={toggleDarkMode}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-pressed={darkMode}
        >
          {darkMode ? <SunIcon className="icon" /> : <MoonIcon className="icon" />}
        </button>

        <div className="dropdown relative" ref={userRef}>
          <button
            className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-hover transition-colors"
            onClick={() => setUserOpen(!userOpen)}
            aria-label="User menu"
            aria-expanded={userOpen}
            aria-haspopup="true"
          >
            <div className="avatar">D</div>
            <span className="hidden sm:block text-sm font-medium">Daniyal</span>
            <ChevronDownIcon className="icon-sm text-muted hidden sm:block" />
          </button>
          {userOpen && (
            <div className="dropdown-menu w-56 animate-slide-down">
              <div className="p-3 border-b flex items-center gap-3">
                <div className="avatar">D</div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">Daniyal</p>
                  <p className="text-xs text-dim truncate">daniyal@example.com</p>
                </div>
              </div>
              <button className="dropdown-item w-full justify-start flex items-center gap-3" onClick={() => { setUserOpen(false); }}>
                <UserIcon className="icon-sm" />
                <span>Profile</span>
              </button>
              <button className="dropdown-item w-full justify-start flex items-center gap-3" onClick={() => { setUserOpen(false); }}>
                <SettingsIcon className="icon-sm" />
                <span>Settings</span>
              </button>
              <div className="dropdown-divider" />
              <button className="dropdown-item w-full justify-start flex items-center gap-3 danger" onClick={() => { setUserOpen(false); }}>
                <LogoutIcon className="icon-sm" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
