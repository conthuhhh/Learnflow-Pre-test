import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types';
import type { ReactNode } from 'react';
import { LoadingScreen } from '@/components/ui/Spinner';

interface RoleGuardProps {
  role: UserRole;
  children: ReactNode;
  redirectTo?: string;
}

export function RoleGuard({ role, children, redirectTo = '/dashboard' }: RoleGuardProps) {
  const { user, isInitialized } = useAuthStore();

  // Chưa khởi tạo xong — đợi
  if (!isInitialized) return <LoadingScreen />;

  // Chưa đăng nhập — ProtectedRoute đã xử lý, nhưng guard thêm để chắc
  if (!user) return <Navigate to="/auth/login" replace />;

  // Fallback: nếu role chưa có (user cũ tạo trước khi thêm cột role) → mặc định student
  const userRole: UserRole = (user.role as UserRole) || 'student';

  if (userRole !== role) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
