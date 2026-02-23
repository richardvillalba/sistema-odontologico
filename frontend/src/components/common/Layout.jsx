import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePointOfSale } from '../../context/PointOfSaleContext';
import { useTimbradoAlerts } from '../../hooks/useTimbradoAlerts';
import PointOfSaleSelector from '../facturacion/PointOfSaleSelector';

/* ────────────────────────── SVG Icons ────────────────────────── */
const IconHome = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const IconUsers = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const IconCalendar = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const IconClock = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconCash = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const IconCart = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const IconFileText = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const IconChart = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m0 0a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v14" /></svg>;
const IconSettings = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><circle cx="12" cy="12" r="3" strokeWidth="2.5" /></svg>;

export default function Layout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, usuario, tieneAccesoPrograma, empresaActiva, sucursalActiva } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);
    const { alertas, count, hasCritical } = useTimbradoAlerts({ empresaId: empresaActiva?.empresa_id, usuarioId: usuario?.usuario_id });
    const { selectedPoint, setShowSelector, isValid } = usePointOfSale();
    const notificationRef = useRef(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

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

    // Cerrar sidebar al cambiar de ruta en mobile
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    // Cerrar sidebar al hacer resize a desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const allMenuItems = [
        { name: 'Inicio', path: '/', icon: IconHome, codigo: 'DASHBOARD' },
        { name: 'Pacientes', path: '/pacientes', icon: IconUsers, codigo: 'PACIENTES' },
        { name: 'Citas', path: '/citas', icon: IconCalendar, codigo: 'CITAS' },
        { name: 'Agenda', path: '/agenda', icon: IconClock, codigo: 'CITAS' },
        { name: 'Caja', path: '/caja', icon: IconCash, codigo: 'CAJA' },
        { name: 'Compras', path: '/compras', icon: IconCart, codigo: 'COMPRAS' },
        { name: 'Facturación', path: '/facturas', icon: IconFileText, codigo: 'FACTURACION' },
        { name: 'Reportes', path: '/reportes', icon: IconChart, codigo: 'REPORTES' },
        { name: 'Configuraciones', path: '/configuraciones', icon: IconSettings, codigo: 'CONFIGURACIONES' },
    ];
    const menuItems = allMenuItems.filter(item => tieneAccesoPrograma(item.codigo));

    return (
        <div className="flex h-screen bg-surface font-sans">
            <PointOfSaleSelector />

            {/* Backdrop overlay for mobile sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-primary-dark text-white flex flex-col shadow-xl
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:relative lg:translate-x-0 lg:z-20
            `}>
                <div className="p-6 flex items-center justify-between">
                    <h1 className="text-2xl font-black flex items-center gap-2.5 tracking-tight">
                        <svg className="w-8 h-8 text-blue-400" viewBox="0 0 64 64" fill="currentColor"><path d="M32 4C24.5 4 20 8 18 12C16 16 14 18 10 20C6 22 4 28 6 34C8 40 12 44 16 52C18 56 20 60 24 60C28 60 28 52 30 46C31 43 32 42 32 42C32 42 33 43 34 46C36 52 36 60 40 60C44 60 46 56 48 52C52 44 56 40 58 34C60 28 58 22 54 20C50 18 48 16 46 12C44 8 39.5 4 32 4Z" /></svg>
                        Denta
                    </h1>
                    {/* Botón cerrar sidebar en mobile */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden w-8 h-8 rounded-lg bg-primary-900 hover:bg-primary-800 flex items-center justify-center text-primary-200"
                    >
                        ✕
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path !== '/' && location.pathname.startsWith(item.path));
                        const IconComp = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                    : 'text-primary-200 hover:bg-primary/10 hover:text-white'
                                    }`}
                            >
                                <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                    <IconComp />
                                </span>
                                <span className="font-bold text-sm tracking-wide">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-primary-800/50 space-y-2">
                    {/* Empresa y Sucursal activa */}
                    <button
                        onClick={() => navigate('/seleccionar-contexto')}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-xl border border-indigo-500/20 transition-all group text-left"
                        title="Cambiar empresa o sucursal"
                    >
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div className="overflow-hidden flex-1">
                            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest truncate">
                                {empresaActiva?.nombre || 'Sin empresa'}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                                {sucursalActiva?.nombre || 'Sin sucursal'}
                            </p>
                        </div>
                        <svg className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                    </button>

                    {/* Usuario */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-primary-800/30 rounded-2xl border border-white/5">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-black shadow-inner uppercase text-sm">
                            {usuario?.nombre?.charAt(0) || ''}{usuario?.apellido?.charAt(0) || '?'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-black truncate leading-tight">
                                {usuario?.nombre && usuario?.apellido
                                    ? `${usuario.nombre} ${usuario.apellido}`
                                    : usuario?.username || 'Usuario'}
                            </p>
                            <p className="text-[10px] text-primary-300 font-bold uppercase tracking-widest">
                                {selectedPoint ? `${selectedPoint.establecimiento}-${selectedPoint.punto_expedicion}` : "Sin Punto"}
                            </p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden w-full">
                <header className="h-16 lg:h-20 bg-surface-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 lg:px-8 z-10">
                    <div className="flex items-center gap-3 lg:gap-6">
                        {/* Hamburger menu - mobile only */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {location.pathname !== '/' && (
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-3 group transition-all"
                            >
                                <div className="w-9 h-9 lg:w-11 lg:h-11 rounded-xl lg:rounded-2xl bg-surface-card border border-border flex items-center justify-center text-text-secondary group-hover:border-primary group-hover:text-primary transition-all shadow-sm group-hover:shadow-md">
                                    <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                                </div>
                                <div className="hidden sm:flex flex-col text-left">
                                    <span className="text-[10px] font-black text-text-secondary opacity-50 uppercase tracking-widest leading-none">Volver</span>
                                    <h2 className="text-base lg:text-lg font-black text-text-primary leading-tight">
                                        {menuItems.find(i => i.path !== '/' && location.pathname.startsWith(i.path))?.name || 'Detalle'}
                                    </h2>
                                </div>
                            </button>
                        )}
                        {location.pathname === '/' && (
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-text-secondary opacity-50 uppercase tracking-widest leading-none hidden sm:block">Resumen</span>
                                <h2 className="text-xl lg:text-2xl font-black text-text-primary tracking-tight">Panel de Control</h2>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 lg:gap-4">
                        {/* Selector de Punto Activo en Header */}
                        <button
                            onClick={() => setShowSelector(true)}
                            className={`hidden md:flex items-center gap-3 px-3 lg:px-4 py-2 border rounded-2xl transition-all shadow-sm hover:shadow-md active:scale-95 ${!isValid ? 'bg-danger-light border-danger/20 hover:bg-danger/5' : 'bg-primary-light border-primary/20 hover:bg-primary/5'}`}
                        >
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-sm border ${!isValid ? 'bg-white text-danger border-danger-light' : 'bg-white text-primary border-primary-light'}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <p className={`text-[10px] font-bold uppercase tracking-widest leading-none ${!isValid ? 'text-danger' : 'text-primary'}`}>Punto Activo</p>
                                <p className={`text-sm font-black leading-tight flex items-center gap-1.5 ${!isValid ? 'text-danger' : 'text-primary-dark'}`}>
                                    {!isValid && <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse"></span>}
                                    {selectedPoint ? `${selectedPoint.establecimiento}-${selectedPoint.punto_expedicion}` : "Seleccionar..."}
                                </p>
                            </div>
                        </button>

                        <div className="h-8 w-px bg-border hidden md:block"></div>

                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`p-2 lg:p-2.5 rounded-xl transition-all relative ${showNotifications ? 'bg-primary-light text-primary' : 'text-text-secondary opacity-60 hover:bg-primary-light hover:text-primary hover:opacity-100'
                                    }`}
                            >
                                <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {count > 0 && (
                                    <span className={`absolute top-1 right-1 lg:top-1.5 lg:right-1.5 w-4 h-4 rounded-full border-2 border-surface-card flex items-center justify-center text-[8px] font-black text-white ${hasCritical ? 'bg-danger animate-pulse' : 'bg-primary'}`}>
                                        {count}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-surface-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in slide-in-from-top-5 duration-200">
                                    <div className="p-4 border-b border-border flex justify-between items-center bg-surface-raised">
                                        <span className="text-xs font-black text-text-primary uppercase tracking-widest">Notificaciones</span>
                                        <span className="text-[10px] font-black bg-primary-light text-primary px-2 py-0.5 rounded-full">{count} nuevas</span>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {alertas.length > 0 ? (
                                            alertas.map((alerta, idx) => (
                                                <div key={idx} className="p-4 border-b border-surface-raised hover:bg-primary-light/30 transition-colors cursor-pointer group">
                                                    <div className="flex gap-3">
                                                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${alerta.tipo_alerta === 'VENCIDO' || alerta.tipo_alerta === 'AGOTADO' ? 'bg-danger shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-warning'}`}></div>
                                                        <div className="flex-1">
                                                            <p className="text-[10px] font-black text-text-secondary opacity-60 uppercase mb-0.5">{alerta.tipo_alerta.replace('_', ' ')}</p>
                                                            <p className="text-sm font-bold text-text-primary leading-snug group-hover:text-primary transition-colors">Timbrado #{alerta.numero_timbrado}</p>
                                                            <p className="text-xs text-text-secondary mt-1">Exp: {alerta.establecimiento}-{alerta.punto_expedicion} • {alerta.dias_para_vencer !== null ? `En ${alerta.dias_para_vencer} días` : `${alerta.numeros_disponibles} disponibles`}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-text-secondary opacity-60 text-sm font-bold">No hay notificaciones</div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => { navigate('/configuraciones/timbrados'); setShowNotifications(false); }}
                                        className="w-full p-4 text-xs font-black text-primary hover:bg-primary-light transition-colors uppercase tracking-widest border-t border-border"
                                    >
                                        Ver todos los timbrados
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="h-8 w-px bg-border hidden sm:block"></div>

                        {/* Botón Cerrar Sesión con icono */}
                        <button
                            onClick={logout}
                            className="p-2 lg:p-2.5 rounded-xl text-text-secondary opacity-60 hover:bg-danger-light hover:text-danger hover:opacity-100 transition-all group"
                            title="Cerrar Sesión"
                        >
                            <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-auto bg-surface">
                    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
