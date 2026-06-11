import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types';
import type { ReactNode } from 'react';

interface RoleGuardProps {
  role: UserRole;
  children: ReactNode;
  redirectTo?: string;
}

export function RoleGuard({ role, children, redirectTo = '/dashboard' }: RoleGuardProps) {
  const { user } = useAuthStore();

  // Fallback: nếu role chưa load (undefined/null) → mặc định coi là student
  const userRole: UserRole = (user?.role as UserRole) || 'student';

  if (userRole !== role) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
