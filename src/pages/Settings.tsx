import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { applyTheme, getThemePreference } from '../utils/theme';
import {
  GlobeIcon, DatabaseIcon, BellIcon, MoonIcon, SunIcon,
  CreditCardIcon, PaletteIcon, DownloadIcon, UploadIcon,
  TrashIcon, CalendarIcon, AlertCircleIcon, InfoIcon,
  FileTextIcon, GithubIcon, CheckIcon
} from '../components/Icons';

interface SettingItem {
  id: string;
  label: string;
  description: string;
  icon: typeof GlobeIcon;
  toggle?: boolean;
  action?: boolean;
  danger?: boolean;
}

const settingsSections = [
  {
    title: 'General',
    items: [
      { id: 'theme', label: 'Theme', description: 'Choose your preferred color scheme', icon: PaletteIcon },
      { id: 'currency', label: 'Currency', description: 'Default currency for amounts', icon: CreditCardIcon },
      { id: 'language', label: 'Language', description: 'App language', icon: GlobeIcon },
    ] as SettingItem[],
  },
  {
    title: 'Data & Privacy',
    items: [
      { id: 'export', label: 'Export Data', description: 'Download your expenses as CSV', icon: DownloadIcon, action: true },
      { id: 'import', label: 'Import Data', description: 'Import expenses from CSV', icon: UploadIcon, action: true },
      { id: 'backup', label: 'Auto Backup', description: 'Automatically backup to cloud', icon: DatabaseIcon },
      { id: 'clear', label: 'Clear All Data', description: 'Permanently delete all expenses', icon: TrashIcon, danger: true },
    ] as SettingItem[],
  },
  {
    title: 'Notifications',
    items: [
      { id: 'daily', label: 'Daily Reminder', description: 'Remind me to log expenses daily', icon: BellIcon, toggle: true },
      { id: 'weekly', label: 'Weekly Summary', description: 'Send weekly spending summary', icon: CalendarIcon, toggle: true },
      { id: 'budget', label: 'Budget Alerts', description: 'Notify when approaching budget limits', icon: AlertCircleIcon, toggle: true },
    ] as SettingItem[],
  },
  {
    title: 'About',
    items: [
      { id: 'version', label: 'Version', description: '1.0.0', icon: InfoIcon },
      { id: 'license', label: 'License', description: 'MIT License', icon: FileTextIcon },
      { id: 'github', label: 'Source Code', description: 'View on GitHub', icon: GithubIcon, action: true },
    ] as SettingItem[],
  },
];

const themes = [
  { id: 'dark' as const, label: 'Dark', icon: MoonIcon },
  { id: 'light' as const, label: 'Light', icon: SunIcon },
  { id: 'system' as const, label: 'System', icon: GlobeIcon },
];

const currencies = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
];

export function Settings() {
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(() => {
    return getThemePreference();
  });
  const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'INR');
  const [notifications, setNotifications] = useState({
    daily: true,
    weekly: false,
    budget: false,
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const handleExport = () => {
    alert('Export functionality would be implemented here');
  };

  const handleImport = () => {
    alert('Import functionality would be implemented here');
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to delete ALL data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <Layout title="Settings" subtitle="Manage your preferences">
      <div className="max-w-3xl space-y-6">
        {settingsSections.map(section => (
          <div key={section.title} className="card overflow-hidden animate-fade-in">
            <div className="px-5 py-4 border-b bg-bg/50">
              <h2 className="font-semibold text-sm text-muted uppercase tracking-wider">{section.title}</h2>
            </div>
            <div className="divide-y">
              {section.items.map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="flex items-center justify-between p-5 hover:bg-hover transition-colors group">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--primary)' + '15' }}>
                        <Icon className="icon" style={{ color: 'var(--primary)' }} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{item.label}</p>
                        <p className="text-sm text-dim truncate">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      {item.id === 'theme' && (
                        <div className="flex items-center gap-1 bg-bg rounded-lg p-1">
                          {themes.map(t => (
                            <button
                              key={t.id}
                              onClick={() => setTheme(t.id)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-all ${
                                theme === t.id
                                  ? 'bg-primary text-white shadow-sm'
                                  : 'text-muted hover:text-white hover:bg-hover'
                              }`}
                            >
                              <t.icon className="icon-sm" />
                              {t.label}
                            </button>
                          ))}
                        </div>
                      )}
                      {item.id === 'currency' && (
                        <select
                          value={currency}
                          onChange={e => setCurrency(e.target.value)}
                          className="select w-auto"
                        >
                          {currencies.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.name}</option>)}
                        </select>
                      )}
                      {item.toggle && (
                        <label className="toggle">
                          <input
                            type="checkbox"
                            checked={notifications[item.id as keyof typeof notifications]}
                            onChange={e => setNotifications(n => ({ ...n, [item.id]: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="toggle-slider" />
                        </label>
                      )}
                      {item.action && item.id === 'export' && (
                        <button className="btn-secondary text-sm" onClick={handleExport}>
                          <DownloadIcon className="icon-sm" /> Export
                        </button>
                      )}
                      {item.action && item.id === 'import' && (
                        <button className="btn-secondary text-sm" onClick={handleImport}>
                          <UploadIcon className="icon-sm" /> Import
                        </button>
                      )}
                      {item.action && item.id === 'github' && (
                        <button className="btn-secondary text-sm">
                          <GithubIcon className="icon-sm" /> View
                        </button>
                      )}
                      {item.danger && (
                        <button className="btn-danger text-sm bg-danger text-white hover:bg-danger/90" onClick={handleClearData}>
                          <TrashIcon className="icon-sm" /> Clear
                        </button>
                      )}
                      {item.id === 'version' && <span className="text-dim font-mono">1.0.0</span>}
                      {item.id === 'license' && <span className="text-dim">MIT</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="card p-6 bg-gradient-to-r from-primary/10 to-purple/10 border-primary/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <CheckIcon className="icon-lg text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">All set!</h3>
              <p className="text-sm text-muted mt-1">Your preferences have been saved. Changes take effect immediately.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
