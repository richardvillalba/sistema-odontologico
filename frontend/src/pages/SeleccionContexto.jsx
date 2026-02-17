import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';

const SeleccionContexto = () => {
    const navigate = useNavigate();
    const { usuario, empresas, empresaActiva, setEmpresaActiva, setSucursalActiva } = useAuth();
    const [paso, setPaso] = useState(empresas.length > 1 ? 'empresa' : 'sucursal');
    const [sucursales, setSucursales] = useState([]);
    const [loadingSucursales, setLoadingSucursales] = useState(false);
    const [empresaSeleccionada, setEmpresaSeleccionada] = useState(empresaActiva);
    const [sinSucursales, setSinSucursales] = useState(false);

    // Si solo tiene una empresa, cargar sus sucursales directamente
    useEffect(() => {
        if (empresas.length === 1) {
            setEmpresaSeleccionada(empresas[0]);
            cargarSucursales(empresas[0].empresa_id);
        }
    }, [empresas]);

    const cargarSucursales = async (empresaId) => {
        setLoadingSucursales(true);
        try {
            const response = await authService.getSucursales(usuario.usuario_id, empresaId);
            const suc = response.data.items || [];
            setSucursales(suc);

            // Si solo tiene una sucursal, auto-seleccionar y continuar
            if (suc.length === 1) {
                setEmpresaActiva(empresas.find(e => e.empresa_id === empresaId) || empresaSeleccionada);
                setSucursalActiva(suc[0]);
                navigate('/', { replace: true });
            } else if (suc.length === 0) {
                setSinSucursales(true);
                setPaso('sucursal');
            } else {
                setSinSucursales(false);
                setPaso('sucursal');
            }
        } catch (error) {
            console.error('Error cargando sucursales:', error);
        } finally {
            setLoadingSucursales(false);
        }
    };

    const handleSeleccionarEmpresa = (empresa) => {
        setEmpresaSeleccionada(empresa);
        cargarSucursales(empresa.empresa_id);
    };

    const handleSeleccionarSucursal = (sucursal) => {
        setEmpresaActiva(empresaSeleccionada);
        setSucursalActiva(sucursal);
        navigate('/', { replace: true });
    };

    const handleVolverEmpresas = () => {
        setPaso('empresa');
        setSucursales([]);
        setEmpresaSeleccionada(null);
        setSinSucursales(false);
    };

    return (
        <div className="min-h-screen flex animate-in fade-in duration-700">
            {/* Panel Izquierdo - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#0a0f1d] flex-col justify-between p-16 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/30 rounded-full blur-[120px] animate-pulse duration-[10s]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/30 rounded-full blur-[120px] animate-pulse duration-[8s]"></div>
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40 border border-blue-400/30">
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

                <div className="relative z-10 space-y-6 max-w-lg">
                    <h2 className="text-5xl font-black text-white leading-tight tracking-tight">
                        {paso === 'empresa' ? (
                            <>Selecciona tu <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">empresa</span></>
                        ) : (
                            <>Selecciona tu <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">sucursal</span></>
                        )}
                    </h2>
                    <p className="text-slate-400 text-lg font-medium">
                        {paso === 'empresa'
                            ? 'Elige la empresa con la que deseas trabajar en esta sesion.'
                            : 'Elige la sucursal donde operas actualmente.'}
                    </p>
                </div>

                <div className="relative z-10 flex items-center justify-between border-t border-white/5 pt-8">
                    <p className="text-slate-500 text-xs font-bold tracking-widest uppercase">2026 Pro-Odonto Cloud</p>
                    <div className="flex gap-4">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Conectado como {usuario?.nombre}</span>
                    </div>
                </div>
            </div>

            {/* Panel Derecho - Seleccion */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 px-6 lg:px-16 py-12 relative overflow-hidden">
                <div className="w-full max-w-lg relative z-10">
                    <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 p-8 lg:p-12 animate-in zoom-in-95 duration-700">

                        {/* Logo mobile */}
                        <div className="lg:hidden mb-8 flex flex-col items-center">
                            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/20 mb-3">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.5 12.75l7.5-7.5 7.5 7.5m-15 6l7.5-7.5 7.5 7.5" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-black text-slate-900">Pro-Odonto</h1>
                        </div>

                        {/* Header */}
                        <div className="mb-8">
                            {paso === 'sucursal' && empresas.length > 1 && (
                                <button
                                    onClick={handleVolverEmpresas}
                                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 font-bold mb-4 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Cambiar empresa
                                </button>
                            )}
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                                {paso === 'empresa' ? 'Elegir Empresa' : 'Elegir Sucursal'}
                            </h2>
                            <p className="text-slate-500 font-medium">
                                {paso === 'empresa'
                                    ? 'Tienes acceso a varias empresas. Selecciona una para continuar.'
                                    : (
                                        <>
                                            <span className="text-indigo-600 font-bold">{empresaSeleccionada?.nombre}</span>
                                            {' '} - Selecciona la sucursal donde operas.
                                        </>
                                    )}
                            </p>
                        </div>

                        {/* Paso 1: Seleccion de Empresa */}
                        {paso === 'empresa' && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                                {empresas.map(empresa => (
                                    <button
                                        key={empresa.empresa_id}
                                        onClick={() => handleSeleccionarEmpresa(empresa)}
                                        className="w-full p-5 bg-slate-50/50 hover:bg-indigo-50 border-2 border-slate-100 hover:border-indigo-300 rounded-2xl text-left transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 group-hover:border-indigo-300 group-hover:bg-indigo-50 flex items-center justify-center transition-colors shrink-0">
                                                <svg className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-slate-900 text-lg truncate">{empresa.nombre}</p>
                                                <p className="text-sm text-slate-500 font-medium truncate">{empresa.razon_social}</p>
                                                <p className="text-xs text-slate-400 font-bold mt-1">RUC: {empresa.ruc}</p>
                                            </div>
                                            {empresa.es_principal === 'S' && (
                                                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded-lg uppercase tracking-wider shrink-0">
                                                    Principal
                                                </span>
                                            )}
                                            <svg className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Paso 2: Seleccion de Sucursal */}
                        {paso === 'sucursal' && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                                {loadingSucursales ? (
                                    <div className="flex justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                    </div>
                                ) : sinSucursales ? (
                                    <div className="text-center py-8 space-y-4">
                                        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
                                            <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-slate-900">Sin sucursales asignadas</p>
                                            <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">
                                                No tienes ninguna sucursal asignada en{' '}
                                                <span className="font-bold text-indigo-600">{empresaSeleccionada?.nombre}</span>.
                                            </p>
                                            <p className="text-sm text-slate-500 font-medium mt-1">
                                                Contacta al administrador para que te asigne una sucursal.
                                            </p>
                                        </div>
                                        {empresas.length > 1 && (
                                            <button
                                                onClick={handleVolverEmpresas}
                                                className="mt-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                                            >
                                                Elegir otra empresa
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    sucursales.map(sucursal => (
                                        <button
                                            key={sucursal.sucursal_id}
                                            onClick={() => handleSeleccionarSucursal(sucursal)}
                                            className="w-full p-5 bg-slate-50/50 hover:bg-indigo-50 border-2 border-slate-100 hover:border-indigo-300 rounded-2xl text-left transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 group-hover:border-indigo-300 group-hover:bg-indigo-50 flex items-center justify-center transition-colors shrink-0">
                                                    <svg className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-black text-slate-900 text-lg truncate">{sucursal.nombre}</p>
                                                    {sucursal.direccion && (
                                                        <p className="text-sm text-slate-500 font-medium truncate">{sucursal.direccion}</p>
                                                    )}
                                                    {sucursal.ciudad && (
                                                        <p className="text-xs text-slate-400 font-bold mt-1">{sucursal.ciudad}</p>
                                                    )}
                                                </div>
                                                {sucursal.es_principal === 'S' && (
                                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg uppercase tracking-wider shrink-0">
                                                        Principal
                                                    </span>
                                                )}
                                                <svg className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeleccionContexto;
