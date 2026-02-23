import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SinAcceso = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { usuario, logout } = useAuth();
    const sinRol = location.state?.sinRol;

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface px-4 animate-in fade-in duration-500">
            <div className="max-w-xl w-full text-center">
                {/* Icon */}
                <div className="mb-12 relative flex justify-center">
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center opacity-10">
                        <div className={`w-64 h-64 blur-3xl rounded-full ${sinRol ? 'bg-warning' : 'bg-danger'}`}></div>
                    </div>
                    <div className={`relative w-40 h-40 ${sinRol ? 'bg-warning/10 border-warning/20' : 'bg-danger/10 border-danger/20'} border-2 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner`}>
                        {sinRol ? (
                            <svg className="w-20 h-20 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        ) : (
                            <svg className="w-20 h-20 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        )}
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-5xl font-black text-text-primary mb-6 uppercase tracking-tighter">
                    {sinRol ? 'Privilegios Insuficientes' : 'Acceso Restringido'}
                </h1>

                {/* Message */}
                <div className="space-y-3 mb-12">
                    <p className="text-xl text-text-secondary font-medium tracking-tight">
                        {sinRol
                            ? 'Este terminal no ha sido autorizado con un rango operativo.'
                            : 'Su perfil actual no posee las credenciales para este sector.'}
                    </p>
                    <div className="flex items-center justify-center gap-4 text-[11px] font-black text-text-secondary/40 uppercase tracking-[0.2em]">
                        {usuario?.nombre && (
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-border"></span>
                                AGENTE: {usuario.nombre} {usuario.apellido}
                            </div>
                        )}
                        {usuario?.rol_codigo && (
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-border"></span>
                                ROL: {usuario.rol_codigo}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-6 justify-center">
                    {sinRol ? (
                        <button
                            onClick={logout}
                            className="px-10 py-4 bg-text-primary text-white rounded-2xl hover:bg-black font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-black/10"
                        >
                            Cerrar Sesión Segura
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate(-1)}
                                className="px-10 py-4 bg-surface-card text-text-primary border-2 border-border rounded-2xl hover:bg-surface-raised font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-sm"
                            >
                                Reintentar
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="px-10 py-4 bg-primary text-white rounded-2xl hover:bg-primary-dark font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-primary/20"
                            >
                                Retornar a Matriz
                            </button>
                        </>
                    )}
                </div>

                {/* Protocol Info */}
                <div className="mt-16 p-8 bg-surface-card border-2 border-border rounded-[2.5rem] text-left relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                        <svg className="w-24 h-24 text-text-primary" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                        </svg>
                    </div>
                    <h3 className="font-black text-text-primary uppercase tracking-[0.15em] text-xs mb-4 flex items-center gap-3">
                        <span className="w-4 h-1 bg-primary rounded-full"></span>
                        {sinRol ? 'Protocolo de Activación' : 'Solicitud de Permisos'}
                    </h3>
                    <p className="text-sm text-text-secondary font-medium leading-relaxed">
                        {sinRol
                            ? 'Contacte al Departamento de Administración para la vinculación de su cuenta con un rol jerárquico activo.'
                            : 'Si este acceso es mandatorio para su jornada, eleve una solicitud de actualización de permisos a su supervisor directo.'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SinAcceso;
