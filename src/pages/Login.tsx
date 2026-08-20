import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, LogIn, UserPlus, Phone, MapPin, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useCustomerAuthStore } from '../store/useCustomerAuthStore';

import { API } from '../config/api';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

export default function Login() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const loginStore = useCustomerAuthStore((s) => s.login);
  const from       = (location.state as any)?.from ?? '/profile';

  const [isLogin, setIsLogin] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [firstName,   setFirstName]   = useState('');
  const [lastName,    setLastName]     = useState('');
  const [email,       setEmail]        = useState('');
  const [phone,       setPhone]        = useState('');
  const [address,     setAddress]      = useState('');
  const [city,        setCity]         = useState('');

  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validateRegister() {
    const e: Record<string, string> = {};
    if (!regUsername.trim())                e.regUsername = 'El usuario es requerido.';
    else if (regUsername.trim().length < 3) e.regUsername = 'Mínimo 3 caracteres.';
    if (!regPassword)                       e.regPassword = 'La contraseña es requerida.';
    else if (regPassword.length < 6)        e.regPassword = 'Mínimo 6 caracteres.';
    if (!firstName.trim())                  e.firstName   = 'El nombre es requerido.';
    if (!lastName.trim())                   e.lastName    = 'Los apellidos son requeridos.';
    if (!phone.trim())                      e.phone       = 'El teléfono es requerido.';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    if (!username.trim() || !password) { setError('Ingresa tu usuario y contraseña.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/customers/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? 'Error al iniciar sesión.');
      }
      loginStore(await res.json());
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!validateRegister()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/customers/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regUsername.trim(),
          password: regPassword,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? 'Error al registrarse.');
      }
      loginStore(await res.json());
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleCredential(response: { credential: string }) {
    setGoogleError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/customers/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? 'Error al iniciar sesión con Google.');
      }
      loginStore(await res.json());
      navigate(from, { replace: true });
    } catch (err: any) {
      setGoogleError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleButtonRef.current) return;

    let cancelled = false;
    const tryRender = () => {
      if (cancelled) return;
      const google = (window as any).google;
      if (!google?.accounts?.id) {
        setTimeout(tryRender, 200);
        return;
      }
      google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleGoogleCredential });
      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = '';
        google.accounts.id.renderButton(googleButtonRef.current, { theme: 'outline', size: 'large', width: 336, text: 'continue_with' });
      }
    };
    tryRender();
    return () => { cancelled = true; };
  }, [isLogin]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-black rounded-sm flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            <span className="italic">A</span>
          </div>
          <h2 className="text-3xl font-extrabold text-black">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); setFieldErrors({}); }}
              className="font-bold text-black hover:underline"
            >
              {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
            </button>
          </p>
        </div>

        <div className="bg-white rounded-sm shadow-md border border-gray-100 p-8">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-sm font-medium">
              {error}
            </div>
          )}
          {googleError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-sm font-medium">
              {googleError}
            </div>
          )}

          {GOOGLE_CLIENT_ID && (
            <>
              <div ref={googleButtonRef} className="flex justify-center mb-5" />
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 uppercase tracking-wider">o continúa con usuario y contraseña</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            </>
          )}

          {isLogin ? (
            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Usuario</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                    placeholder="tu_usuario"
                    className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-sm text-base focus:outline-none focus:ring-1 focus:ring-black" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-3 border border-gray-200 rounded-sm text-base focus:outline-none focus:ring-1 focus:ring-black" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-sm bg-black text-white font-bold text-sm hover:bg-gray-800 disabled:opacity-60 transition-colors">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                {loading ? 'Iniciando sesión…' : 'Iniciar Sesión'}
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleRegister}>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Usuario *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="text" value={regUsername} onChange={e => setRegUsername(e.target.value)}
                      placeholder="mi_usuario"
                      className={`w-full pl-9 pr-3 py-3 border rounded-sm text-base focus:outline-none focus:ring-1 focus:ring-black ${fieldErrors.regUsername ? 'border-red-400' : 'border-gray-200'}`} />
                  </div>
                  {fieldErrors.regUsername && <p className="text-xs text-red-500 mt-0.5">{fieldErrors.regUsername}</p>}
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Contraseña *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type={showPass ? 'text' : 'password'} value={regPassword} onChange={e => setRegPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className={`w-full pl-9 pr-10 py-3 border rounded-sm text-base focus:outline-none focus:ring-1 focus:ring-black ${fieldErrors.regPassword ? 'border-red-400' : 'border-gray-200'}`} />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {fieldErrors.regPassword && <p className="text-xs text-red-500 mt-0.5">{fieldErrors.regPassword}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Nombre *</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Carlos"
                    className={`w-full px-3 py-3 border rounded-sm text-base focus:outline-none focus:ring-1 focus:ring-black ${fieldErrors.firstName ? 'border-red-400' : 'border-gray-200'}`} />
                  {fieldErrors.firstName && <p className="text-xs text-red-500 mt-0.5">{fieldErrors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Apellidos *</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Mendoza"
                    className={`w-full px-3 py-3 border rounded-sm text-base focus:outline-none focus:ring-1 focus:ring-black ${fieldErrors.lastName ? 'border-red-400' : 'border-gray-200'}`} />
                  {fieldErrors.lastName && <p className="text-xs text-red-500 mt-0.5">{fieldErrors.lastName}</p>}
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Teléfono *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="3001234567"
                      className={`w-full pl-9 pr-3 py-3 border rounded-sm text-base focus:outline-none focus:ring-1 focus:ring-black ${fieldErrors.phone ? 'border-red-400' : 'border-gray-200'}`} />
                  </div>
                  {fieldErrors.phone && <p className="text-xs text-red-500 mt-0.5">{fieldErrors.phone}</p>}
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Correo electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@ejemplo.com"
                      className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-sm text-base focus:outline-none focus:ring-1 focus:ring-black" />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Dirección</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Calle 10 # 12-34"
                      className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-sm text-base focus:outline-none focus:ring-1 focus:ring-black" />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Ciudad</label>
                  <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Armenia"
                    className="w-full px-3 py-3 border border-gray-200 rounded-sm text-base focus:outline-none focus:ring-1 focus:ring-black" />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-sm bg-black text-white font-bold text-sm hover:bg-gray-800 disabled:opacity-60 transition-colors">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {loading ? 'Registrando…' : 'Crear Cuenta'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          <Link to="/" className="hover:text-black transition-colors">← Volver a la tienda</Link>
        </p>
      </div>
    </div>
  );
}
