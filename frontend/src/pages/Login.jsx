import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ToothLogo = ({ className = "w-10 h-10" }) => (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M32 4C24.5 4 20 8 18 12C16 16 14 18 10 20C6 22 4 28 6 34C8 40 12 44 16 52C18 56 20 60 24 60C28 60 28 52 30 46C31 43 32 42 32 42C32 42 33 43 34 46C36 52 36 60 40 60C44 60 46 56 48 52C52 44 56 40 58 34C60 28 58 22 54 20C50 18 48 16 46 12C44 8 39.5 4 32 4Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinejoin="round"
        />
    </svg>
);

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.username || !formData.password) {
            setError('Por favor ingrese usuario y contraseña');
            return;
        }
        try {
            setLoading(true);
            const result = await login(formData.username, formData.password);
            if (result.success) {
                navigate('/seleccionar-contexto');
            } else {
                setError(result.mensaje || 'Usuario o contraseña incorrectos');
            }
        } catch {
            setError('Error al iniciar sesión. Por favor intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex animate-in fade-in duration-700">
            {/* Panel Izquierdo - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex-col justify-between p-16 relative overflow-hidden">
                {/* Efectos de fondo */}
                <div className="absolute inset-0">
                    <div className="absolute top-[10%] left-[15%] w-[50%] h-[50%] bg-blue-500/15 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-[10%] right-[10%] w-[45%] h-[45%] bg-indigo-500/10 rounded-full blur-[100px]"></div>
                    <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                </div>

                {/* Logo */}
                <div className="relative z-10 animate-in slide-in-from-left-8 duration-700 delay-150 fill-mode-both">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30 border border-blue-400/20">
                            <ToothLogo className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <span className="text-white font-black text-3xl tracking-tight block leading-none">Denta</span>
                            <span className="text-blue-400/60 text-xs font-bold tracking-[0.15em] uppercase">
                                Gestión Odontológica
                            </span>
                        </div>
                    </div>
                </div>

                {/* Contenido principal */}
                <div className="relative z-10 space-y-10 max-w-lg animate-in slide-in-from-left-12 duration-1000 delay-300 fill-mode-both">
                    <div className="space-y-6">
                        <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tight">
                            Tu clínica,
                            <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mt-1">
                                bajo control total.
                            </span>
                        </h2>
                        <p className="text-slate-400 text-lg leading-relaxed font-medium">
                            Pacientes, citas, facturación e inventario en una sola plataforma diseñada para profesionales de la odontología.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="grid gap-5">
                        {[
                            { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', text: 'Expedientes digitales', desc: 'Odontograma, historias y tratamientos.' },
                            { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', text: 'Facturación integrada', desc: 'Timbrados, pagos y caja en un solo flujo.' },
                            { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', text: 'Agenda inteligente', desc: 'Citas, disponibilidad y recordatorios.' },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 group">
                                <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 transition-colors group-hover:bg-blue-500/10 group-hover:border-blue-500/30 duration-300">
                                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-slate-200 font-bold text-sm">{item.text}</h4>
                                    <p className="text-slate-500 text-sm font-medium">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 flex items-center justify-between border-t border-white/5 pt-8 animate-in fade-in duration-1000 delay-500 fill-mode-both">
                    <p className="text-slate-600 text-xs font-bold tracking-widest uppercase">© 2026 Denta</p>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Online</span>
                    </div>
                </div>
            </div>

            {/* Panel Derecho - Formulario */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 px-6 lg:px-24 py-12 relative overflow-hidden">
                <div className="lg:hidden absolute top-[-10%] right-[-10%] w-64 h-64 bg-blue-200/30 rounded-full blur-3xl"></div>

                <div className="w-full max-w-md relative z-10">
                    <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 p-8 lg:p-12 animate-in zoom-in-95 duration-700">

                        {/* Logo mobile */}
                        <div className="lg:hidden mb-10 flex flex-col items-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-blue-600/20 mb-4">
                                <ToothLogo className="w-9 h-9 text-white" />
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Denta</h1>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.15em] mt-1">Gestión Odontológica</p>
                        </div>

                        {/* Encabezado */}
                        <div className="mb-10 text-center lg:text-left">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3">
                                Bienvenido
                            </h2>
                            <p className="text-slate-400 font-semibold">
                                Ingresá tus credenciales para acceder al sistema.
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-8 flex items-center gap-4 bg-red-50/80 border border-red-100 p-4 rounded-2xl animate-in slide-in-from-top-4 duration-300">
                                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-bold text-red-800">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Usuario */}
                            <div className="space-y-2 group">
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-600">
                                    Usuario
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-slate-300 transition-colors group-focus-within:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="w-full pl-14 pr-5 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-0 focus:border-blue-500/50 focus:bg-white transition-all disabled:opacity-50 font-bold"
                                        placeholder="Tu nombre de usuario"
                                        autoFocus
                                        autoComplete="username"
                                    />
                                </div>
                            </div>

                            {/* Contraseña */}
                            <div className="space-y-2 group">
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-600">
                                    Contraseña
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-slate-300 transition-colors group-focus-within:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="w-full pl-14 pr-14 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-0 focus:border-blue-500/50 focus:bg-white transition-all disabled:opacity-50 font-bold"
                                        placeholder="••••••••••••"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-300 hover:text-blue-600 transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Botón */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 mt-2 group"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-[3px] border-white/30 border-t-white"></div>
                                        <span>Ingresando...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Iniciar Sesión</span>
                                        <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="mt-10 text-center">
                            <p className="text-sm text-slate-400 font-medium">
                                ¿Problemas para acceder? Contactá al administrador.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
