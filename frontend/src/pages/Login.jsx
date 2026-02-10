import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
                navigate('/');
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
            <div className="hidden lg:flex lg:w-1/2 bg-[#0a0f1d] flex-col justify-between p-16 relative overflow-hidden">
                {/* Capas de degradado dinámico */}
                <div className="absolute inset-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/30 rounded-full blur-[120px] animate-pulse duration-[10s]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/30 rounded-full blur-[120px] animate-pulse duration-[8s]"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[80px]"></div>

                    {/* Grid sutil */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                </div>

                {/* Logo Section */}
                <div className="relative z-10 animate-in slide-in-from-left-8 duration-700 delay-150 fill-mode-both">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40 border border-blue-400/30 group-hover:scale-110 transition-transform duration-500">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.5 12.75l7.5-7.5 7.5 7.5m-15 6l7.5-7.5 7.5 7.5" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-white font-black text-2xl tracking-tight block">Pro-Odonto</span>
                            <span className="bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md border border-blue-500/30">
                                Enterprise Suite
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="relative z-10 space-y-10 max-w-lg animate-in slide-in-from-left-12 duration-1000 delay-300 fill-mode-both">
                    <div className="space-y-6">
                        <h2 className="text-6xl font-black text-white leading-tight tracking-tight">
                            Gestión odontológica
                            <span className="block bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mt-2">
                                profesional y simple.
                            </span>
                        </h2>
                        <p className="text-slate-400 text-xl leading-relaxed font-medium opacity-80">
                            Centralizá la operación de tu clínica con herramientas diseñadas para el máximo rendimiento y control.
                        </p>
                    </div>

                    {/* Features List */}
                    <div className="grid gap-6">
                        {[
                            { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', text: 'Gestión integral de pacientes', desc: 'Fichas clínicas digitales y diagnósticos.' },
                            { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', text: 'Cobros y facturación ORDS', desc: 'Integración automática con cajas y bancos.' },
                            { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', text: 'Agenda inteligente 24/7', desc: 'Control total de citas y disponibilidades.' },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 group">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 transition-colors group-hover:bg-blue-500/20 group-hover:border-blue-500/40 duration-300">
                                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                                    </svg>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-slate-200 font-bold tracking-tight">{item.text}</h4>
                                    <p className="text-slate-500 text-sm font-medium leading-normal">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Section */}
                <div className="relative z-10 flex items-center justify-between border-t border-white/5 pt-8 animate-in fade-in duration-1000 delay-500 fill-mode-both">
                    <p className="text-slate-500 text-xs font-bold tracking-widest uppercase">© 2026 Pro-Odonto Cloud</p>
                    <div className="flex gap-4">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Server Status: Online</span>
                    </div>
                </div>
            </div>

            {/* Panel Derecho - Formulario */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 lg:bg-[#f8fafc] px-6 lg:px-24 py-12 relative overflow-hidden">
                {/* Elementos decorativos de fondo para mobile */}
                <div className="lg:hidden absolute top-[-10%] right-[-10%] w-64 h-64 bg-blue-200/40 rounded-full blur-3xl"></div>

                <div className="w-full max-w-md relative z-10">
                    {/* Glassmorphism Container */}
                    <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 p-8 lg:p-12 animate-in zoom-in-95 duration-700">
                        {/* Logo mobile */}
                        <div className="lg:hidden mb-10 flex flex-col items-center">
                            <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-blue-600/20 mb-4">
                                <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.5 12.75l7.5-7.5 7.5 7.5m-15 6l7.5-7.5 7.5 7.5" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pro-Odonto</h1>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Gestión Médica</p>
                        </div>

                        {/* Encabezado */}
                        <div className="mb-10 text-center lg:text-left">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-4">
                                Hola de nuevo!
                            </h2>
                            <p className="text-slate-500 font-semibold leading-relaxed">
                                Ingresá tus credenciales para acceder a tu panel profesional.
                            </p>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <div className="mb-8 flex items-center gap-4 bg-red-50/80 border border-red-100 p-5 rounded-2xl animate-in slide-in-from-top-4 duration-300">
                                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-black text-red-900 leading-tight">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Input Usuario */}
                            <div className="space-y-2 group">
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-600">
                                    Identificador de Usuario
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-slate-300 transition-colors group-focus-within:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="w-full pl-14 pr-5 py-4.5 bg-slate-50/50 border-2 border-slate-50 rounded-3xl text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-0 focus:border-blue-500/50 focus:bg-white transition-all disabled:opacity-50 font-bold"
                                        placeholder="Tu nombre de usuario"
                                        autoFocus
                                        autoComplete="username"
                                    />
                                </div>
                            </div>

                            {/* Input Contraseña */}
                            <div className="space-y-2 group">
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-600">
                                    Contraseña de Acceso
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-slate-300 transition-colors group-focus-within:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="w-full pl-14 pr-14 py-4.5 bg-slate-50/50 border-2 border-slate-50 rounded-3xl text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-0 focus:border-blue-500/50 focus:bg-white transition-all disabled:opacity-50 font-bold"
                                        placeholder="••••••••••••"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-6 flex items-center text-slate-300 hover:text-blue-600 transition-colors"
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

                            {/* Botón Iniciar Sesión */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-3xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-4 shadow-2xl shadow-slate-900/10 mt-4 group"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-[3px] border-white/30 border-t-white"></div>
                                        <span>Procesando...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Acceder al Sistema</span>
                                        <svg className="w-6 h-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Footer Form */}
                        <div className="mt-12 text-center">
                            <p className="text-sm font-bold text-slate-400">
                                ¿Tenés problemas para acceder?
                            </p>
                            <a href="mailto:soporte@pro-odonto.com" className="inline-block mt-2 text-blue-600 font-extrabold hover:text-blue-700 transition-colors border-b-2 border-blue-100 hover:border-blue-600">
                                Contactar a Soporte Vital
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
