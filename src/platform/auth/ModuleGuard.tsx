import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useModuleBrand, type ModuleId } from '@/platform/theme/ModuleBrand';
import { useEffect } from 'react';

interface ModuleGuardProps {
  module: ModuleId;
  redirectTo?: string;
}

export default function ModuleGuard({ module, redirectTo = '/' }: ModuleGuardProps) {
  const { user, loading } = useAuth();
  const { setModule } = useModuleBrand();

  useEffect(() => {
    if (!loading && user) {
      setModule(module);
    }
  }, [loading, user, module, setModule]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to={redirectTo} replace />;

  const meta = user.user_metadata ?? {};
  const userModule = meta.module as string | undefined;
  const userRole = meta.role as string | undefined;

  // Admin has access to all modules
  if (userRole === 'admin') return <Outlet />;

  // Non-admin can only access their own module
  if (module && userModule && userModule !== module) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
