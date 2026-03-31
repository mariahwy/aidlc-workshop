import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StoreProvider } from './contexts/StoreContext';
import { SSEProvider } from './contexts/SSEContext';
import { ToastProvider } from './components/Toast';
import RoleGuard from './components/RoleGuard';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineBanner from './components/OfflineBanner';
import LoadingSpinner from './components/LoadingSpinner';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const StoreSelectionPage = lazy(() => import('./pages/StoreSelectionPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TableManagementPage = lazy(() => import('./pages/TableManagementPage'));
const MenuManagementPage = lazy(() => import('./pages/MenuManagementPage'));
const StoreManagementPage = lazy(() => import('./pages/StoreManagementPage'));
const StaffManagementPage = lazy(() => import('./pages/StaffManagementPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    },
  },
});

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/stores" element={<RoleGuard requiredRole="owner"><StoreSelectionPage /></RoleGuard>} />
        <Route path="/dashboard" element={<RoleGuard><Layout><ErrorBoundary><SSEProvider><DashboardPage /></SSEProvider></ErrorBoundary></Layout></RoleGuard>} />
        <Route path="/tables" element={<RoleGuard><Layout><ErrorBoundary><TableManagementPage /></ErrorBoundary></Layout></RoleGuard>} />
        <Route path="/menus" element={<RoleGuard requiredRole="owner"><Layout><ErrorBoundary><MenuManagementPage /></ErrorBoundary></Layout></RoleGuard>} />
        <Route path="/stores/manage" element={<RoleGuard requiredRole="owner"><Layout><ErrorBoundary><StoreManagementPage /></ErrorBoundary></Layout></RoleGuard>} />
        <Route path="/staff" element={<RoleGuard requiredRole="owner"><Layout><ErrorBoundary><StaffManagementPage /></ErrorBoundary></Layout></RoleGuard>} />
        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <StoreProvider>
            <ToastProvider>
              <OfflineBanner />
              <ErrorBoundary fallbackMessage="앱에 오류가 발생했습니다">
                <AppRoutes />
              </ErrorBoundary>
            </ToastProvider>
          </StoreProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
