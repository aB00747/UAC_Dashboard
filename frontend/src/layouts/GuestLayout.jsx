import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBranding } from '../contexts/BrandingContext';

export default function GuestLayout() {
  const { user, loading } = useAuth();
  const { systemName, logoUrl } = useBranding();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center u-bg-page">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center u-bg-page py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {logoUrl && (
            <img src={logoUrl} alt={systemName} className="h-16 w-16 mx-auto mb-3 rounded-xl object-cover" />
          )}
          <h1 className="text-3xl font-bold u-text-brand">{systemName || 'Umiya Acid & Chemical'}</h1>
          <p className="mt-1 text-sm u-text-3">Management Dashboard</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
