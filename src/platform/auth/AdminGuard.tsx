import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useModuleBrand } from '@/platform/theme/ModuleBrand';
import { useEffect } from 'react';

export default function AdminGuard() {
  const { user, loading } = useAuth();
  const { setModule } = useModuleBrand();

  useEffect(() => {
    if (!loading && user) {
      setModule('admin');
    }
  }, [loading, user, setModule]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  const role = user.user_metadata?.role as string | undefined;
  if (role !== 'admin') return <Navigate to="/" replace />;

  return <Outlet />;
}
