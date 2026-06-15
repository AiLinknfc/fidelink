import { useState, useEffect } from 'react';
import React from 'react';
import { Wallet, Store, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '@/context/AuthContext';

type Mode = 'default' | 'login' | 'signup';

function mapAuthError(msg: string): string {
  if (!msg) return 'Ocurrió un error. Intenta de nuevo.';
  if (msg.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (msg.includes('Email not confirmed')) return 'Debes confirmar tu correo antes de iniciar sesión.';
  if (msg.includes('User already registered') || msg.includes('already registered')) return 'Este correo ya está registrado. Inicia sesión.';
  if (msg.includes('should be at least') || msg.includes('Password should')) return 'La contraseña debe tener al menos 6 caracteres.';
  if (msg.includes('Unable to validate') || msg.includes('invalid email')) return 'El correo no es válido.';
  if (msg.includes('No API key') || msg.includes('apikey')) return 'Error de configuración: la clave de Supabase no es válida. Reinicia el servidor de desarrollo.';
  if (msg.includes('over_email_send_rate_limit') || msg.includes('only request this after') || msg.includes('rate limit')) return 'Límite de registros alcanzado. Espera unos minutos o desactiva "Confirm email" en el dashboard de Supabase.';
  if (msg.includes('fetch') || msg.includes('network') || msg.includes('Failed to fetch')) return 'Error de conexión. Verifica tu internet e intenta de nuevo.';
  return 'Ocurrió un error. Intenta de nuevo.';
}

interface PortalFormProps {
  type: 'client' | 'business';
  onSuccess: (destination: string) => void;
}

function PortalForm({ type, onSuccess }: PortalFormProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('default');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const isClient = type === 'client';
  const destination = isClient ? '/wallet' : '/business';
  const accentClass = isClient ? 'bg-primary' : 'bg-secondary';

  function reset() {
    setName(''); setEmail(''); setPassword('');
    setError(''); setInfo('');
  }

  function switchMode(m: Mode) {
    reset();
    setMode(m);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
      onSuccess(destination);
    } catch (err: any) {
      setError(mapAuthError(err?.message ?? ''));
      setLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { needsConfirmation } = await signUp(email, password, name, type);
      if (needsConfirmation) {
        setInfo('Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.');
        setMode('login');
        setLoading(false);
      } else {
        onSuccess(destination);
      }
    } catch (err: any) {
      setError(mapAuthError(err?.message ?? ''));
      setLoading(false);
    }
  }

  if (mode === 'default') {
    return (
      <div className="mt-auto space-y-3">
        <button
          onClick={() => switchMode('login')}
          className={`w-full h-12 ${accentClass} text-white font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all`}
        >
          Iniciar sesión
        </button>
        <button
          onClick={() => switchMode('signup')}
          className={`w-full h-12 border ${isClient ? 'border-primary text-primary' : 'border-secondary text-secondary'} font-semibold rounded-xl hover:bg-surface-container transition-all active:scale-[0.98]`}
        >
          Crear cuenta nueva
        </button>
      </div>
    );
  }

  const isLogin = mode === 'login';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 flex flex-col"
    >
      <button
        onClick={() => switchMode('default')}
        className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface transition-colors mb-4 text-body-sm"
        disabled={loading}
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </button>

      <h3 className="text-headline-sm font-bold text-on-surface mb-4">
        {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
      </h3>

      {info && (
        <div className="mb-4 p-3 bg-secondary-container text-on-secondary-container rounded-xl text-body-sm">
          {info}
        </div>
      )}

      <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-3 flex-1 flex flex-col" noValidate>
        {!isLogin && (
          <div>
            <label className="block text-label-md font-bold text-on-surface-variant mb-1">Nombre</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-body-md"
              placeholder="Tu nombre completo"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={loading}
            />
          </div>
        )}

        <div>
          <label className="block text-label-md font-bold text-on-surface-variant mb-1">Correo electrónico</label>
          <input
            type="email"
            required
            className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-body-md"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-label-md font-bold text-on-surface-variant mb-1">Contraseña</label>
          <input
            type="password"
            required
            className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-body-md"
            placeholder={isLogin ? 'Tu contraseña' : 'Mínimo 6 caracteres'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        {error && (
          <div className="p-3 bg-error-container text-on-error-container rounded-xl text-body-sm">
            {error}
          </div>
        )}

        <div className="mt-auto pt-2 space-y-3">
          <button
            type="submit"
            disabled={loading || !email.trim() || !password.trim() || (!isLogin && !name.trim())}
            className={`w-full h-11 ${accentClass} text-white font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isLogin ? 'Entrar' : 'Registrarme'}
          </button>

          <button
            type="button"
            onClick={() => switchMode(isLogin ? 'signup' : 'login')}
            disabled={loading}
            className="w-full text-body-sm text-on-surface-variant hover:text-on-surface transition-colors py-1"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

export default function Welcome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pendingNav, setPendingNav] = useState<string | null>(null);

  useEffect(() => {
    if (user && pendingNav) {
      navigate(pendingNav);
    }
  }, [user, pendingNav, navigate]);

  function handleSuccess(destination: string) {
    setPendingNav(destination);
  }

  return (
    <div className="relative min-h-screen bg-background text-on-background overflow-hidden flex flex-col items-center justify-center">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[40%] -right-[5%] w-[40%] h-[50%] rounded-full bg-secondary-container/20 blur-[100px]" />
      </div>

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-7xl px-4 md:px-12 py-12 flex flex-col items-center"
      >
        <header className="mb-12 text-center">
          <h1 className="text-primary text-[32px] md:text-[48px] font-bold tracking-tight mb-2">fidelink</h1>
          <p className="text-on-surface-variant text-body-lg max-w-md mx-auto">
            Tarjetas de fidelización para el mundo moderno. Elige tu modo para comenzar.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
          {/* Customer Portal */}
          <section className="group relative overflow-hidden bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col min-h-[440px]">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <Wallet className="w-48 h-48" />
            </div>
            <div className="mb-6">
              <div className="w-14 h-14 bg-primary-container/10 rounded-xl flex items-center justify-center text-primary mb-4">
                <Wallet className="w-8 h-8" />
              </div>
              <h2 className="text-headline-md text-on-surface mb-2 font-bold">Soy Cliente</h2>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                Acumula sellos, canjea recompensas y gestiona tus tarjetas de fidelización en un solo lugar.
              </p>
            </div>
            <PortalForm type="client" onSuccess={handleSuccess} />
          </section>

          {/* Business Portal */}
          <section className="group relative overflow-hidden bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col min-h-[440px]">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <Store className="w-48 h-48" />
            </div>
            <div className="mb-6">
              <div className="w-14 h-14 bg-secondary-container/20 rounded-xl flex items-center justify-center text-secondary mb-4">
                <Store className="w-8 h-8" />
              </div>
              <h2 className="text-headline-md text-on-surface mb-2 font-bold">Soy Empresa</h2>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                Lanza tu programa de lealtad, registra compras y fideliza a tus clientes con herramientas profesionales.
              </p>
            </div>
            <PortalForm type="business" onSuccess={handleSuccess} />
          </section>
        </div>

        <footer className="mt-12 flex gap-6 text-body-sm text-on-surface-variant">
          <a className="hover:text-primary transition-colors" href="#">Privacidad</a>
          <a className="hover:text-primary transition-colors" href="#">Términos</a>
          <a className="hover:text-primary transition-colors" href="#">Soporte</a>
        </footer>
      </motion.main>
    </div>
  );
}
