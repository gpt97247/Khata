import { useContext } from 'react';
import { KhataContext } from './KhataContext';

export function useKhata() {
  const context = useContext(KhataContext);
  if (!context) throw new Error('useKhata must be used within KhataProvider');
  return context;
}