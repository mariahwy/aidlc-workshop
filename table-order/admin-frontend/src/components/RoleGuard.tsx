import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { ReactNode } from 'react';

interface RoleGuardProps {
  children: ReactNode;
  requiredRole?: 'owner' | 'staff';
}

export default function RoleGuard({ children, requiredRole }: RoleGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'owner' && user?.role !== 'owner') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
