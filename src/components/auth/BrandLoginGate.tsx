import { useState, type FormEvent } from 'react';
import { Sparkles, Fingerprint, Chrome, ShieldAlert, KeyRound, Loader2, Building2, Smartphone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function BrandLoginGate() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [loginMode, setLoginMode] = useState<'CLIENTES' | 'EMPRESAS'>('EMPRESAS');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('ailink.nfc@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusError, setStatusError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const role = loginMode === 'EMPRESAS' ? 'business' : 'client';

  // Detect module from URL query param (e.g. ?module=biografias)
  // In production, this would be derived from subdomain
  const searchParams = new URLSearchParams(window.location.search);
  const detectedModule = searchParams.get('module') as 'fidelizacion' | 'biografias' | 'ventas' | null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsProcessing(true);
    setStatusMsg(isSignUp ? 'Creando tu cuenta segura...' : 'Validando credenciales...');
    setStatusError('');

    try {
      if (isSignUp) {
        if (!name.trim()) {
          setStatusError('El nombre es obligatorio.');
          setIsProcessing(false);
          return;
        }
        const { needsConfirmation } = await signUp(email, password, name, role, detectedModule);
        if (needsConfirmation) {
          setStatusMsg('Revisa tu correo para confirmar la cuenta. Luego inicia sesión.');
          setIsProcessing(false);
          setIsSignUp(false);
          return;
        }
      } else {
        await signIn(email, password);
      }
      navigate(role === 'business' ? '/business' : '/wallet');
    } catch (err: any) {
      const msg = err?.message ?? 'Error de autenticación. Intenta de nuevo.';
      setStatusError(msg);
      if (msg.includes('Invalid login credentials')) {
        setStatusError('Credenciales inválidas. Verifica tu email y contraseña.');
      } else if (msg.includes('Email not confirmed')) {
        setStatusError('Confirma tu correo electrónico antes de iniciar sesión.');
      } else if (msg.includes('User already registered')) {
        setStatusError('Ya existe una cuenta con este correo. Inicia sesión.');
      }
    }
    setIsProcessing(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300/20 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-300/20 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800" />

      <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 relative z-10">
        <div className="md:col-span-5 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full filter blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-black text-lg shadow-md mb-4">F</div>
            <h2 className="text-xl font-bold font-headline tracking-tight leading-snug">AiLink Hub</h2>
            <p className="text-xs text-blue-200 font-mono mt-1 tracking-wider uppercase font-semibold">Consola Co-Branded</p>
          </div>

          <div className="space-y-4 my-8 relative z-10">
            <div className="flex gap-3">
              <div className="p-1.5 rounded-lg bg-white/10 shrink-0">
                <Sparkles className="w-4 h-4 text-blue-200" />
              </div>
              <p className="text-xs text-blue-100 leading-relaxed">
                <strong className="text-white block font-semibold">Diseño Clásico & Efectos Sutiles</strong>
                Fondo blanco pulcro de alta legibilidad combinado con reflejos de iluminación interactiva al cursor.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="p-1.5 rounded-lg bg-white/10 shrink-0">
                <Fingerprint className="w-4 h-4 text-blue-200" />
              </div>
              <p className="text-xs text-blue-100 leading-relaxed">
                <strong className="text-white block font-semibold">Tokenización de Accesos</strong>
                Llaves de cercanía NFC y pasarelas distribuidas integrando múltiples opciones de firma rápida.
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 relative z-10">
            <p className="text-[10px] text-blue-200/80 font-mono">Socio Co-Branded Principal • v1.0 PRO</p>
          </div>
        </div>

        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-between bg-white text-slate-800">
          <div>
            <div className="mb-5">
              <span className="text-[9px] uppercase tracking-widest font-mono font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full inline-block">
                {loginMode === 'EMPRESAS' ? 'PORTAL DE SOCIOS UNIFICADO' : 'WALLET MÓVIL DE CLIENTES'}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold font-headline tracking-tight text-slate-800 mt-2">
                {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
              </h1>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                {loginMode === 'EMPRESAS'
                  ? 'Gestiona tus tarjetas, automatizaciones de marketing y tableros de analítica avanzada.'
                  : 'Consulta tus cupones, tarjetas de fidelidad guardadas y canjea regalos en tienda.'}
              </p>
            </div>

            <div className="mb-6 p-1 bg-slate-100 rounded-xl flex border border-slate-200/50 font-sans">
              <button type="button" onClick={() => setLoginMode('EMPRESAS')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  loginMode === 'EMPRESAS' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'
                }`}>
                <Building2 className="w-3.5 h-3.5" /> Empresas (Socios)
              </button>
              <button type="button" onClick={() => setLoginMode('CLIENTES')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  loginMode === 'CLIENTES' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'
                }`}>
                <Smartphone className="w-3.5 h-3.5" /> Clientes (Wallet)
              </button>
            </div>

            {/* SSO Providers (disabled — coming soon) */}
            <div className="space-y-2.5 mb-6">
              <label className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Iniciar rápido con Proveedores Seguros:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button type="button" disabled
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold border border-slate-200/90 rounded-xl text-slate-400 text-left opacity-60 cursor-not-allowed"
                  title="Próximamente">
                  <Chrome className="w-4 h-4 text-red-400" />
                  <span>Entrar con Google</span>
                </button>
                <button type="button" disabled
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold border border-slate-200/90 rounded-xl text-slate-400 text-left opacity-60 cursor-not-allowed"
                  title="Próximamente">
                  <span className="font-bold text-sm tracking-tighter text-slate-400 font-mono -mt-0.5"></span>
                  <span>Apple ID / Mac</span>
                </button>
                <button type="button" disabled
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold border border-slate-200/90 rounded-xl text-slate-400 text-left opacity-60 cursor-not-allowed"
                  title="Próximamente">
                  <span className="w-3.5 h-3.5 grid grid-cols-2 gap-0.5 shrink-0 opacity-40">
                    <span className="bg-red-400" />
                    <span className="bg-green-400" />
                    <span className="bg-blue-400" />
                    <span className="bg-yellow-400" />
                  </span>
                  <span>Microsoft 365</span>
                </button>
                <button type="button" disabled
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold border border-slate-200/90 rounded-xl text-slate-400 text-left opacity-60 cursor-not-allowed"
                  title="Próximamente">
                  <Fingerprint className="w-4 h-4 text-slate-400" />
                  <span>Acceso con NFC Key</span>
                </button>
              </div>
            </div>

            {/* Separator */}
            <div className="flex items-center gap-3 my-4">
              <span className="h-px bg-slate-200/80 flex-1" />
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">O usa tu cuenta Fidelink</span>
              <span className="h-px bg-slate-200/80 flex-1" />
            </div>

            {isProcessing && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl mb-4 flex items-center gap-2.5 text-xs text-blue-700 font-mono animate-pulse">
                <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
                <span className="font-semibold">{statusMsg}</span>
              </div>
            )}

            {statusError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl mb-4 text-xs text-red-700 font-medium">
                {statusError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {isSignUp && (
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-500 mb-1 font-sans">NOMBRE COMPLETO</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 placeholder:text-slate-400 font-medium"
                    placeholder="Tu nombre" required />
                </div>
              )}

              <div>
                <label className="block text-[10.5px] font-bold text-slate-500 mb-1 font-sans">CORREO ELECTRÓNICO</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 placeholder:text-slate-400 font-medium"
                  placeholder="correo@ejemplo.com" required />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10.5px] font-bold text-slate-500 font-sans">CONTRASEÑA</label>
                </div>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 placeholder:text-slate-400 font-medium font-sans"
                  required />
              </div>

              {!isSignUp && (
                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-600">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-200 focus:ring-blue-500 text-blue-600" />
                    <span>Recordar sesión en este equipo</span>
                  </label>
                  <div className="flex items-center gap-1 text-[10.5px] text-slate-400">
                    <KeyRound className="w-3.5 h-3.5 text-slate-300" />
                    <span>Bóveda AES-256</span>
                  </div>
                </div>
              )}

              <button type="submit" disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 text-xs rounded-xl shadow-md shadow-blue-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4">
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isSignUp ? 'Crear Cuenta' : 'Inicia Sesión con tu Correo'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button type="button" onClick={() => { setIsSignUp(!isSignUp); setStatusError(''); }}
                className="text-[11px] text-blue-600 font-bold hover:underline cursor-pointer">
                {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1 mt-6">
            <ShieldAlert className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>Este sistema cuenta con autenticación mutua certificada SSL y políticas de protección de datos.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
