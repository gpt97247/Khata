import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ExpenseFormModal } from './ExpenseFormModal';
import { useKhata } from '../context/useKhata';
import { PlusIcon } from './Icons';
import { useState } from 'react';

interface LayoutProps {
  title: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}

export function Layout({ title, subtitle, headerActions, children }: LayoutProps) {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const { categories, tags } = useKhata();

  return (
    <div className="app-shell flex min-h-screen bg-bg">
      <Sidebar onQuickAdd={() => setShowQuickAdd(true)} />
      <main className="main-content">
        <Header
          title={title}
          subtitle={subtitle}
          actions={
            <>
              {headerActions}
              <button className="quick-add-header" onClick={() => setShowQuickAdd(true)}>
                <PlusIcon className="icon-sm" />
                <span>Add expense</span>
              </button>
            </>
          }
        />
        <div className="page-content">
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
