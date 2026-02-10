import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useTimbradoAlerts } from '../../hooks/useTimbradoAlerts';
import { usePointOfSale } from '../../context/PointOfSaleContext';
import { useAuth } from '../../contexts/AuthContext';
import PointOfSaleSelector from '../facturacion/PointOfSaleSelector';

export default function Layout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, usuario } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);
    const { alertas, count, hasCritical } = useTimbradoAlerts({ usuarioId: usuario?.usuario_id || 1 });
    const { selectedPoint, setShowSelector, isValid } = usePointOfSale();
    const notificationRef = useRef(null);

    // Cerrar notificaciones al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const menuItems = [
        { name: 'Inicio', path: '/', icon: '📊' },
        { name: 'Pacientes', path: '/pacientes', icon: '👥' },
        { name: 'Citas', path: '/citas', icon: '📅' },
        { name: 'Agenda', path: '/agenda', icon: '🕒' },
        { name: 'Historias', path: '/historias', icon: '📋' },
        { name: 'Tratamientos', path: '/tratamientos', icon: '💊' },
        { name: 'Caja', path: '/caja', icon: '💵' },
        { name: 'Compras', path: '/compras', icon: '🛒' },
        { name: 'Facturación', path: '/facturas', icon: '🧾' },
        { name: 'Configuraciones', path: '/configuraciones', icon: '⚙️' },
    ];

    return (
        <div className="flex h-screen bg-slate-100 font-sans">
            <PointOfSaleSelector />

            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
                <div className="p-6">
                    <h1 className="text-2xl font-black flex items-center gap-2 tracking-tight">
                        <span className="text-3xl filter drop-shadow-md">🦷</span> Pro-Odonto
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-4">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path !== '/' && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <span className={`text-xl group-hover:scale-110 transition-transform ${isActive ? 'scale-110' : ''}`}>{item.icon}</span>
                                <span className="font-bold text-sm tracking-wide">{item.name.toUpperCase()}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800/50">
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/30 rounded-2xl border border-white/5">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-black shadow-inner uppercase text-sm">
                            {usuario?.nombre?.charAt(0) || ''}{usuario?.apellido?.charAt(0) || '?'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-black truncate leading-tight">
                                {usuario?.nombre && usuario?.apellido
                                    ? `${usuario.nombre} ${usuario.apellido}`
                                    : usuario?.username || 'Usuario'}
                            </p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                {selectedPoint ? `${selectedPoint.establecimiento}-${selectedPoint.punto_expedicion}` : "Sin Punto"}
                            </p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-8 z-10">
                    <div className="flex items-center gap-6">
                        {location.pathname !== '/' && (
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-2 group transition-all"
                            >
                                <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:border-blue-500 group-hover:text-blue-600 transition-all shadow-sm group-hover:shadow-md">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Volver</span>
                                    <h2 className="text-lg font-black text-slate-800 leading-tight">
                                        {menuItems.find(i => i.path !== '/' && location.pathname.startsWith(i.path))?.name || 'Detalle'}
                                    </h2>
                                </div>
                            </button>
                        )}
                        {location.pathname === '/' && (
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Resumen</span>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Panel de Control</h2>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Selector de Punto Activo en Header */}
                        <button
                            onClick={() => setShowSelector(true)}
                            className={`hidden md:flex items-center gap-3 px-4 py-2 border rounded-2xl transition-all shadow-sm hover:shadow-md active:scale-95 ${!isValid ? 'bg-red-50 border-red-100 hover:bg-red-100' : 'bg-indigo-50 border-indigo-100 hover:bg-indigo-100'}`}
                        >
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-sm border ${!isValid ? 'bg-white text-red-600 border-red-100' : 'bg-white text-indigo-600 border-indigo-100'}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <p className={`text-[10px] font-bold uppercase tracking-widest leading-none ${!isValid ? 'text-red-400' : 'text-indigo-400'}`}>Punto Activo</p>
                                <p className={`text-sm font-black leading-tight flex items-center gap-1.5 ${!isValid ? 'text-red-900' : 'text-indigo-900'}`}>
                                    {!isValid && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>}
                                    {selectedPoint ? `${selectedPoint.establecimiento}-${selectedPoint.punto_expedicion}` : "Seleccionar..."}
                                </p>
                            </div>
                        </button>

                        <div className="h-8 w-px bg-slate-200"></div>

                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`p-2.5 rounded-xl transition-all relative ${showNotifications ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                                    }`}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {count > 0 && (
                                    <span className={`absolute top-1.5 right-1.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black text-white ${hasCritical ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}>
                                        {count}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-5 duration-200">
                                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                        <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Notificaciones</span>
                                        <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{count} nuevas</span>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {alertas.length > 0 ? (
                                            alertas.map((alerta, idx) => (
                                                <div key={idx} className="p-4 border-b border-slate-50 hover:bg-blue-50/30 transition-colors cursor-pointer group">
                                                    <div className="flex gap-3">
                                                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${alerta.tipo_alerta === 'VENCIDO' || alerta.tipo_alerta === 'AGOTADO' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-amber-500'}`}></div>
                                                        <div className="flex-1">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-0.5">{alerta.tipo_alerta.replace('_', ' ')}</p>
                                                            <p className="text-sm font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors">Timbrado #{alerta.numero_timbrado}</p>
                                                            <p className="text-xs text-slate-500 mt-1">Exp: {alerta.establecimiento}-{alerta.punto_expedicion} • {alerta.dias_para_vencer !== null ? `En ${alerta.dias_para_vencer} días` : `${alerta.numeros_disponibles} disponibles`}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-slate-400 text-sm font-bold">No hay notificaciones</div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => { navigate('/configuraciones/timbrados'); setShowNotifications(false); }}
                                        className="w-full p-4 text-xs font-black text-blue-600 hover:bg-blue-50 transition-colors uppercase tracking-widest border-t border-slate-100"
                                    >
                                        Ver todos los timbrados
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="h-8 w-px bg-slate-200"></div>

                        {/* Botón Cerrar Sesión con icono */}
                        <button
                            onClick={logout}
                            className="p-2.5 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all group"
                            title="Cerrar Sesión"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-auto bg-slate-50/50">
                    <div className="p-8 max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
