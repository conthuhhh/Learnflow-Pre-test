import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types';
import type { ReactNode } from 'react';

interface RoleGuardProps {
  role: UserRole;
  children: ReactNode;
  /** Where to redirect if role doesn't match. Defaults to /dashboard */
  redirectTo?: string;
}

export function RoleGuard({ role, children, redirectTo = '/dashboard' }: RoleGuardProps) {
  const { user } = useAuthStore();

  if (user?.role !== role) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
