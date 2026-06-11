import { type ReactNode } from 'react';
import { Navbar } from './Navbar';
import { ToastContainer } from '@/components/ui/Toast';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <Navbar />
      <main>{children}</main>
      <ToastContainer />
    </div>
  );
}
