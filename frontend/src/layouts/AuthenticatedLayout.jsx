import { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBranding } from '../contexts/BrandingContext';
import { navigation } from '../constants/navigation';
import { SidebarContent } from '../components/SidebarContent';
import { ErrorBoundary } from '../components/common';
import Header from './Header';

export default function AuthenticatedLayout() {
  const { user, loading } = useAuth();
  const { systemName, logoUrl } = useBranding();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center u-bg-page">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const filteredNav = navigation.filter(
    (item) => !item.roles || item.roles.includes(user.role?.name)
  );

  return (
    <div className="min-h-screen u-bg-page">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="fixed inset-0 w-full h-full u-overlay border-none cursor-default"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 u-bg-sidebar shadow-xl z-50">
            <SidebarContent currentPath={location.pathname} onClose={() => setSidebarOpen(false)} systemName={systemName} logoUrl={logoUrl} navItems={filteredNav} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow u-bg-sidebar u-border-r overflow-y-auto">
          <SidebarContent currentPath={location.pathname} systemName={systemName} logoUrl={logoUrl} navItems={filteredNav} />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
