import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { applyTheme, getThemePreference } from '../utils/theme';
import type { UserProfile } from '../types';
import { api } from '../utils/api';
import {
  GlobeIcon, DatabaseIcon, BellIcon, MoonIcon, SunIcon,
  CreditCardIcon, PaletteIcon, DownloadIcon, UploadIcon,
  TrashIcon, CalendarIcon, AlertCircleIcon, InfoIcon,
  FileTextIcon, GithubIcon, CheckIcon, UserIcon, LockIcon, ShieldIcon
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  useEffect(() => {
    let isActive = true;
    api.getProfile()
      .then(nextProfile => {
        if (!isActive) return;
        setProfile(nextProfile);
        setDisplayName(nextProfile.displayName);
      })
      .catch(() => {
        if (!isActive) return;
        setProfileMessage({ text: 'Profile details will load when the API is available.', type: 'error' });
      });
    return () => { isActive = false; };
  }, []);

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

  const handleProfileSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!displayName.trim()) {
      setProfileMessage({ text: 'Enter a display name.', type: 'error' });
      return;
    }
    setSavingProfile(true);
    setProfileMessage(null);
    try {
      const nextProfile = await api.updateProfile(displayName.trim());
      setProfile(nextProfile);
      setDisplayName(nextProfile.displayName);
      setProfileMessage({ text: 'Profile saved.', type: 'success' });
    } catch (error) {
      setProfileMessage({ text: error instanceof Error ? error.message : 'Could not save profile.', type: 'error' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      setProfileMessage({ text: 'Use at least 8 characters for the new password.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setProfileMessage({ text: 'New password and confirmation do not match.', type: 'error' });
      return;
    }
    setSavingPassword(true);
    setProfileMessage(null);
    try {
      const nextProfile = await api.updatePassword(currentPassword, newPassword);
      setProfile(nextProfile);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setProfileMessage({ text: 'Password updated successfully.', type: 'success' });
    } catch (error) {
      setProfileMessage({ text: error instanceof Error ? error.message : 'Could not update password.', type: 'error' });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <Layout title="Settings" subtitle="Manage your preferences">
      <div className="settings-page max-w-3xl space-y-6">
        <section id="profile" className="card profile-security-card animate-fade-in">
          <div className="profile-security-heading">
            <div className="profile-avatar" aria-hidden="true">{(profile?.displayName || 'P').slice(0, 1).toUpperCase()}</div>
            <div>
              <p className="section-title">Profile & security</p>
              <h2>{profile?.displayName || 'Your profile'}</h2>
              <span>Manage your identity and account password.</span>
            </div>
          </div>

          {profile?.usingDefaultPassword && (
            <div className="profile-security-warning" role="status">
              <AlertCircleIcon className="icon-sm" />
              <span>Your starter password is still active. Change it before continuing to use this profile.</span>
            </div>
          )}

          <form className="profile-name-form" onSubmit={handleProfileSave}>
            <label className="profile-field">
              <span><UserIcon className="icon-sm" /> Display name</span>
              <input className="input" value={displayName} maxLength={60} onChange={event => setDisplayName(event.target.value)} disabled={!profile || savingProfile} />
            </label>
            <button className="btn-primary profile-save-button" type="submit" disabled={!profile || savingProfile}>{savingProfile ? 'Saving…' : 'Save profile'}</button>
          </form>

          <div className="profile-password-section">
            <div className="profile-password-heading">
              <span className="profile-password-icon"><ShieldIcon className="icon" /></span>
              <div><h3>Password</h3><p>Use at least 8 characters. Your password is securely stored as a hash.</p></div>
            </div>
            <form className="profile-password-form" onSubmit={handlePasswordSave}>
              <label className="profile-field">
                <span><LockIcon className="icon-sm" /> Current password</span>
                <input className="input" type="password" autoComplete="current-password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} disabled={!profile || savingPassword} required />
              </label>
              <label className="profile-field">
                <span>New password</span>
                <input className="input" type="password" autoComplete="new-password" minLength={8} maxLength={128} value={newPassword} onChange={event => setNewPassword(event.target.value)} disabled={!profile || savingPassword} required />
              </label>
              <label className="profile-field">
                <span>Confirm new password</span>
                <input className="input" type="password" autoComplete="new-password" minLength={8} maxLength={128} value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} disabled={!profile || savingPassword} required />
              </label>
              <button className="btn-secondary profile-save-button" type="submit" disabled={!profile || savingPassword}>{savingPassword ? 'Updating…' : 'Update password'}</button>
            </form>
          </div>

          {profileMessage && <p className={`profile-message is-${profileMessage.type}`} role="status">{profileMessage.text}</p>}
        </section>

        {settingsSections.map(section => (
          <div key={section.title} className="card settings-card overflow-hidden animate-fade-in">
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
