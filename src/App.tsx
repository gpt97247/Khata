import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { KhataProvider } from './context/KhataContext';
import { Dashboard } from './pages/Dashboard';
import { Expenses } from './pages/Expenses';
import { Categories } from './pages/Categories';
import { Tags } from './pages/Tags';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

function App() {
  return (
    <KhataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/tags" element={<Tags />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </KhataProvider>
  );
}

export default App;