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
        <div className="min-h-screen flex animate-in fade-in duration-700 bg-surface">
            {/* Panel Izquierdo - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-primary-dark flex-col justify-between p-20 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-primary/20 rounded-full blur-[150px] animate-pulse duration-[12s]"></div>
                    <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-indigo-600/10 rounded-full blur-[150px] animate-pulse duration-[10s]"></div>
                    <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-white to-white/80 rounded-3xl flex items-center justify-center shadow-2xl border border-white/20">
                            <svg className="w-10 h-10 text-primary-dark" viewBox="0 0 64 64" fill="currentColor"><path d="M32 4C24.5 4 20 8 18 12C16 16 14 18 10 20C6 22 4 28 6 34C8 40 12 44 16 52C18 56 20 60 24 60C28 60 28 52 30 46C31 43 32 42 32 42C32 42 33 43 34 46C36 52 36 60 40 60C44 60 46 56 48 52C52 44 56 40 58 34C60 28 58 22 54 20C50 18 48 16 46 12C44 8 39.5 4 32 4Z" /></svg>
                        </div>
                        <div>
                            <span className="text-white font-black text-4xl tracking-tighter block leading-none">Denta</span>
                            <span className="text-primary/60 text-[10px] font-black tracking-[0.3em] uppercase mt-1 block">
                                Clinical OS
                            </span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 space-y-8 max-w-xl">
                    <h2 className="text-6xl font-black text-white leading-[1.1] tracking-tighter">
                        {paso === 'empresa' ? (
                            <>Vincule su <span className="bg-gradient-to-r from-primary-light to-white bg-clip-text text-transparent">Nodo Operativo</span></>
                        ) : (
                            <>Localice su <span className="bg-gradient-to-r from-primary-light to-white bg-clip-text text-transparent">Punto de Acceso</span></>
                        )}
                    </h2>
                    <p className="text-white/40 text-xl font-medium leading-relaxed">
                        {paso === 'empresa'
                            ? 'Seleccione la entidad corporativa para inicializar los protocolos de gestión.'
                            : 'Establezca la conexión con la sucursal asignada para su jornada.'}
                    </p>
                </div>

                <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-10">
                    <div className="flex flex-col">
                        <p className="text-white/20 text-[10px] font-black tracking-[0.4em] uppercase">Status de Terminal</p>
                        <div className="flex items-center gap-3 mt-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                            <span className="text-xs font-black text-white/80 uppercase tracking-widest">{usuario?.nombre}</span>
                        </div>
                    </div>
                    <p className="text-white/20 text-[10px] font-black tracking-[0.2em] uppercase">SYSTEM V.2026</p>
                </div>
            </div>

            {/* Panel Derecho - Seleccion */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-surface-raised px-6 lg:px-20 py-12 relative overflow-hidden">
                <div className="w-full max-w-2xl relative z-10">
                    <div className="bg-surface-card rounded-[4rem] shadow-2xl shadow-primary-dark/5 border border-white p-10 lg:p-16 animate-in zoom-in-95 duration-700">

                        {/* Logo mobile */}
                        <div className="lg:hidden mb-12 flex flex-col items-center">
                            <div className="w-16 h-16 bg-primary-dark rounded-3xl flex items-center justify-center shadow-2xl mb-4">
                                <svg className="w-10 h-10 text-white" viewBox="0 0 64 64" fill="currentColor"><path d="M32 4C24.5 4 20 8 18 12C16 16 14 18 10 20C6 22 4 28 6 34C8 40 12 44 16 52C18 56 20 60 24 60C28 60 28 52 30 46C31 43 32 42 32 42C32 42 33 43 34 46C36 52 36 60 40 60C44 60 46 56 48 52C52 44 56 40 58 34C60 28 58 22 54 20C50 18 48 16 46 12C44 8 39.5 4 32 4Z" /></svg>
                            </div>
                            <h1 className="text-3xl font-black text-text-primary tracking-tighter uppercase">Denta</h1>
                        </div>

                        {/* Header */}
                        <div className="mb-12">
                            {paso === 'sucursal' && empresas.length > 1 && (
                                <button
                                    onClick={handleVolverEmpresas}
                                    className="flex items-center gap-3 text-[10px] font-black text-text-secondary hover:text-primary uppercase tracking-[0.2em] mb-6 transition-all group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </div>
                                    Reversar Entidad
                                </button>
                            )}
                            <h2 className="text-4xl font-black text-text-primary tracking-tighter uppercase mb-4">
                                {paso === 'empresa' ? 'Selección Corporativa' : 'Módulo de Acceso'}
                            </h2>
                            <p className="text-text-secondary font-medium text-lg">
                                {paso === 'empresa'
                                    ? 'Gestione sus accesos corporativos autorizados.'
                                    : (
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">
                                                    {empresaSeleccionada?.nombre}
                                                </span>
                                            </div>
                                            <span className="text-sm opacity-60 uppercase font-black tracking-widest mt-1">Defina el nodo operativo local</span>
                                        </div>
                                    )}
                            </p>
                        </div>

                        {/* Paso 1: Seleccion de Empresa */}
                        {paso === 'empresa' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                                {empresas.map(empresa => (
                                    <button
                                        key={empresa.empresa_id}
                                        onClick={() => handleSeleccionarEmpresa(empresa)}
                                        className="w-full p-8 bg-surface-raised/50 hover:bg-white border-2 border-border hover:border-primary/30 rounded-[2.5rem] text-left transition-all duration-300 group shadow-sm hover:shadow-xl hover:shadow-primary/5"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-white rounded-2xl border-2 border-border group-hover:border-primary/10 group-hover:bg-primary/[0.02] flex items-center justify-center transition-all duration-300 shrink-0 shadow-inner">
                                                <svg className="w-8 h-8 text-text-secondary group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-text-primary text-xl uppercase tracking-tighter truncate">{empresa.nombre}</p>
                                                <p className="text-xs text-text-secondary font-bold truncate opacity-50 uppercase tracking-widest mt-1">{empresa.razon_social}</p>
                                                <div className="flex items-center gap-3 mt-4">
                                                    <span className="text-[10px] font-black text-text-secondary/30 uppercase tracking-[0.2em]">ID: {empresa.ruc}</span>
                                                    {empresa.es_principal === 'S' && (
                                                        <span className="text-[9px] font-black text-primary bg-primary/5 border border-primary/20 px-2 py-0.5 rounded uppercase tracking-widest">
                                                            Matriz
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-border/30 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-primary text-white transition-all duration-500 -translate-x-4 group-hover:translate-x-0">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Paso 2: Seleccion de Sucursal */}
                        {paso === 'sucursal' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                                {loadingSucursales ? (
                                    <div className="flex flex-col items-center justify-center py-24 text-text-secondary/40">
                                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                        <span className="mt-6 font-black text-[10px] uppercase tracking-[0.4em]">Sincronizando Nodes...</span>
                                    </div>
                                ) : sinSucursales ? (
                                    <div className="text-center py-16 p-10 bg-danger/5 border-2 border-dashed border-danger/20 rounded-[3rem] space-y-6">
                                        <div className="w-20 h-20 bg-danger/10 rounded-3xl flex items-center justify-center mx-auto border border-danger/20 shadow-inner">
                                            <svg className="w-10 h-10 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xl font-black text-text-primary uppercase tracking-tighter">Acceso Denegado</p>
                                            <p className="text-sm text-text-secondary font-medium mt-3 leading-relaxed opacity-60">
                                                No posee vinculaciones operativas en la entidad corporativa seleccionada.
                                            </p>
                                        </div>
                                        {empresas.length > 1 && (
                                            <button
                                                onClick={handleVolverEmpresas}
                                                className="mt-4 px-10 py-4 bg-danger text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-danger-dark transition-all active:scale-95 shadow-xl shadow-danger/20"
                                            >
                                                Retornar Selección
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {sucursales.map(sucursal => (
                                            <button
                                                key={sucursal.sucursal_id}
                                                onClick={() => handleSeleccionarSucursal(sucursal)}
                                                className="w-full p-8 bg-surface-raised/50 hover:bg-white border-2 border-border hover:border-primary/30 rounded-[2.5rem] text-left transition-all duration-300 group shadow-sm hover:shadow-xl hover:shadow-primary/5"
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 bg-white rounded-2xl border-2 border-border group-hover:border-primary/10 group-hover:bg-primary/[0.02] flex items-center justify-center transition-all duration-300 shrink-0 shadow-inner">
                                                        <svg className="w-8 h-8 text-text-secondary group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-black text-text-primary text-xl uppercase tracking-tighter truncate">{sucursal.nombre}</p>
                                                        {sucursal.direccion ? (
                                                            <p className="text-xs text-text-secondary font-bold truncate opacity-50 uppercase tracking-widest mt-1">{sucursal.direccion}</p>
                                                        ) : (
                                                            <p className="text-xs text-text-secondary font-bold truncate opacity-20 uppercase tracking-widest mt-1">Ubicación No Especificada</p>
                                                        )}
                                                        <div className="flex items-center gap-3 mt-4">
                                                            <span className="text-[10px] font-black text-text-secondary/30 uppercase tracking-[0.2em]">{sucursal.ciudad || 'N/A'}</span>
                                                            {sucursal.es_principal === 'S' && (
                                                                <span className="text-[9px] font-black text-success bg-success/5 border border-success/20 px-2 py-0.5 rounded uppercase tracking-widest">
                                                                    HQ Central
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="w-12 h-12 rounded-xl bg-border/30 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-primary text-white transition-all duration-500 -translate-x-4 group-hover:translate-x-0">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
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
