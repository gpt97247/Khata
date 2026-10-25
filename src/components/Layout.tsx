import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ExpenseFormModal } from './ExpenseFormModal';
import { useKhata } from '../context/useKhata';
import { useEffect, useState } from 'react';

interface LayoutProps {
  title: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}

export function Layout({ title, subtitle, headerActions, children }: LayoutProps) {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const { categories, tags } = useKhata();

  useEffect(() => {
    const openQuickAdd = () => setShowQuickAdd(true);
    window.addEventListener('khata:quick-add', openQuickAdd);
    return () => window.removeEventListener('khata:quick-add', openQuickAdd);
  }, []);

  return (
    <div className="app-shell flex min-h-screen bg-bg">
      <Sidebar onQuickAdd={() => setShowQuickAdd(true)} />
      <main className="main-content">
        <Header
          title={title}
          subtitle={subtitle}
          actions={headerActions}
        />
        <div className={`page-content page-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {children}
        </div>
      </main>
      {showQuickAdd && (
        <ExpenseFormModal
          categories={categories}
          tags={tags}
          onClose={() => setShowQuickAdd(false)}
        />
      )}
    </div>
  );
}
