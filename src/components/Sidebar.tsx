import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

type IconProps = { className?: string; style?: React.CSSProperties };

function HomeIcon({ className, style }: IconProps) {
  return <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
}
function ReceiptIcon({ className, style }: IconProps) {
  return <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
}
function CategoryIcon({ className, style }: IconProps) {
  return <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>;
}
function TagIcon({ className, style }: IconProps) {
  return <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-5-5a2 2 0 010-2.828L10.586 3.586A1.99 1.99 0 0112 3h5z" /></svg>;
}
function ChartIcon({ className, style }: IconProps) {
  return <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2z" /></svg>;
}
function SettingsIcon({ className, style }: IconProps) {
  return <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
}
function MenuIcon({ className, style }: IconProps) {
  return <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
}
function CloseIcon({ className, style }: IconProps) {
  return <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M18 6L6 18" /></svg>;
}
function PlusIcon({ className, style }: IconProps) {
  return <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: HomeIcon },
  { path: '/expenses', label: 'Expenses', icon: ReceiptIcon },
  { path: '/categories', label: 'Categories', icon: CategoryIcon },
  { path: '/tags', label: 'Tags', icon: TagIcon },
  { path: '/reports', label: 'Reports', icon: ChartIcon },
  { path: '/settings', label: 'Settings', icon: SettingsIcon },
];

interface SidebarProps {
  onQuickAdd: () => void;
}

export function Sidebar({ onQuickAdd }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const closeMobileMenu = () => setMobileOpen(false);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMobileMenu();
    };
    const closeOnDesktop = () => {
      if (window.innerWidth > 900) closeMobileMenu();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    window.addEventListener('resize', closeOnDesktop);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('resize', closeOnDesktop);
    };
  }, [mobileOpen]);

  return (
    <>
      {!mobileOpen && (
        <button type="button" className="mobile-menu-button" onClick={() => setMobileOpen(true)} aria-label="Open navigation" aria-expanded={false} aria-controls="primary-navigation">
          <MenuIcon className="icon" />
        </button>
      )}

      <aside className={`app-sidebar ${mobileOpen ? 'is-open' : ''}`} aria-label="Primary navigation">
        <div className="app-sidebar__brand">
          <NavLink to="/" className="app-sidebar__brand-link" onClick={closeMobileMenu}>
            <span className="app-sidebar__mark">&#8377;</span>
            <span className="app-sidebar__name"><strong>khata</strong><small>Personal finance</small></span>
          </NavLink>
          <button type="button" className="app-sidebar__close" onClick={closeMobileMenu} aria-label="Close navigation">
            <CloseIcon className="icon" />
          </button>
        </div>

        <nav id="primary-navigation" className="app-sidebar__nav" aria-label="Main navigation">
          <p className="app-sidebar__label">Workspace</p>
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
            return (
              <NavLink key={path} to={path} className={`app-sidebar__link ${active ? 'is-active' : ''}`} onClick={closeMobileMenu}>
                <Icon className="icon" />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="app-sidebar__footer">
          <button type="button" className="app-sidebar__quick-add" onClick={() => { onQuickAdd(); closeMobileMenu(); }}>
            <PlusIcon className="icon" />
            <span>Add transaction</span>
          </button>
          <p className="app-sidebar__sync"><span />Changes saved</p>
        </div>
      </aside>

      {mobileOpen && <button type="button" className="app-sidebar__scrim" onClick={closeMobileMenu} aria-label="Close navigation" />}
    </>
  );
}
