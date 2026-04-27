import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Auth-protected layout with no sidebar or header.
 * Used for full-screen editor pages (e.g. TemplateBuilder).
 */
export default function FullPageLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center u-bg-page">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderBottomColor: 'var(--brand)' }} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen u-bg-page flex flex-col">
      <Outlet />
    </div>
  );
}
