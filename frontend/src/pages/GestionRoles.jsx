import React, { useState, useEffect } from 'react';
import { rolesService, securityService } from '../services/api';

const ProgramsGrouped = ({ allPrograms, rolePrograms, onToggle }) => {
    // Separar programas principales (sin padre) y sub-programas (con padre)
    const parentPrograms = allPrograms.filter(p => !p.modulo_padre_id);
    const childPrograms = allPrograms.filter(p => p.modulo_padre_id);

    // Agrupar hijos por padre
    const childrenByParent = {};
    childPrograms.forEach(child => {
        if (!childrenByParent[child.modulo_padre_id]) {
            childrenByParent[child.modulo_padre_id] = [];
        }
        childrenByParent[child.modulo_padre_id].push(child);
    });

    const renderItem = (prog) => {
        const isAssigned = rolePrograms.some(rp => rp.programa_id === prog.programa_id);
        return (
            <button
                key={prog.programa_id}
                onClick={() => onToggle(prog.programa_id, isAssigned)}
                className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left group overflow-hidden relative ${isAssigned
                    ? 'bg-primary/5 border-primary shadow-lg shadow-primary/5'
                    : 'bg-surface-raised border-transparent hover:border-border hover:bg-white'}`}
            >
                {isAssigned && (
                    <div className="absolute top-0 right-0 w-8 h-8 bg-primary text-white flex items-center justify-center rounded-bl-xl">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}
                <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center text-xl transition-all ${isAssigned ? 'bg-primary text-white scale-110' : 'bg-surface-card text-text-secondary opacity-40 group-hover:opacity-100 group-hover:scale-110'}`}>
                    {prog.icono || '📄'}
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`font-black text-xs uppercase tracking-tight truncate ${isAssigned ? 'text-primary' : 'text-text-primary'}`}>{prog.nombre}</p>
                    <p className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 mt-0.5 truncate">{prog.codigo}</p>
                </div>
            </button>
        );
    };

    return (
        <div className="space-y-10">
            {parentPrograms.map(parent => {
                const children = childrenByParent[parent.programa_id] || [];
                const hasChildren = children.length > 0;

                return (
                    <div key={parent.programa_id} className="space-y-4">
                        {/* Programa padre */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {renderItem(parent)}
                        </div>

                        {/* Sub-programas agrupados */}
                        {hasChildren && (
                            <div className="ml-8 pl-8 border-l-2 border-border/50 space-y-4">
                                <div className="flex items-center gap-3 opacity-30">
                                    <div className="h-px flex-1 bg-text-secondary"></div>
                                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em]">
                                        Sub-módulos de {parent.nombre}
                                    </p>
                                    <div className="h-px w-8 bg-text-secondary"></div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {children.map(child => renderItem(child))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// ─── Tarjeta de Rol Standardized ───────────────────────────────────────────
const RoleCard = ({ rol, onPrograms, onPermissions, onEdit, onDelete }) => {
    const rolColors = {
        ADMIN: 'from-primary-dark via-primary to-accent',
        DOCTOR: 'from-primary via-primary/80 to-primary/60',
        RECEPCION: 'from-secondary via-secondary/80 to-secondary/60',
        CAJERA: 'from-warning via-warning/80 to-warning/60',
    };
    const gradient = rolColors[rol.codigo] || 'from-text-secondary via-text-secondary/80 to-border';

    return (
        <div className="bg-surface-card rounded-[2.5rem] border border-border shadow-sm group hover:shadow-2xl hover:-translate-y-2 transition-all overflow-hidden flex flex-col">
            <div className={`p-8 bg-gradient-to-br ${gradient} text-white relative overflow-hidden`}>
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                    </svg>
                </div>
                <div className="relative z-10">
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-widest mb-4 border border-white/10">
                        {rol.codigo}
                    </span>
                    <h3 className="text-2xl font-black uppercase tracking-tight leading-none group-hover:translate-x-1 transition-transform">{rol.nombre}</h3>
                </div>
            </div>

            <div className="p-8 flex-1 flex flex-col justify-between">
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest leading-relaxed opacity-60 mb-8 min-h-[3rem]">
                    {rol.descripcion || 'Perfil técnico sin descripción de alcances definida.'}
                </p>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={onPrograms}
                        className="flex items-center justify-center gap-2 bg-surface-raised hover:bg-primary hover:text-white text-text-secondary py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border-2 border-transparent hover:shadow-lg active:scale-95 px-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        Módulos
                    </button>
                    <button
                        onClick={onPermissions}
                        className="flex items-center justify-center gap-2 bg-surface-raised hover:bg-accent hover:text-white text-text-secondary py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border-2 border-transparent hover:shadow-lg active:scale-95 px-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        Permisos
                    </button>
                    <button
                        onClick={onEdit}
                        className="flex items-center justify-center gap-2 bg-white hover:bg-secondary hover:text-white text-text-secondary py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border-2 border-border hover:border-secondary hover:shadow-lg active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                    </button>
                    <button
                        onClick={onDelete}
                        className="flex items-center justify-center gap-2 bg-white hover:bg-danger hover:text-white text-text-secondary py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border-2 border-border hover:border-danger hover:shadow-lg active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Borrar
                    </button>
                </div>
            </div>
        </div>
    );
};

const GestionRoles = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState(null);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);
    const [showProgramsModal, setShowProgramsModal] = useState(false);

    // Form for new/edit role
    const [roleForm, setRoleForm] = useState({
        nombre: '',
        codigo: '',
        descripcion: ''
    });

    // For programs/permissions management
    const [allPrograms, setAllPrograms] = useState([]);
    const [allPermissions, setAllPermissions] = useState([]);
    const [rolePrograms, setRolePrograms] = useState([]);
    const [rolePermissions, setRolePermissions] = useState([]);

    useEffect(() => {
        loadRoles();
        loadCatalogData();
    }, []);

    const loadRoles = async () => {
        try {
            setLoading(true);
            const res = await rolesService.getAll();
            setRoles(res.data?.items || []);
        } catch (error) {
            console.error('Error cargando roles:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCatalogData = async () => {
        try {
            const [progRes, permRes] = await Promise.all([
                securityService.getAllProgramas(),
                securityService.getAllPermisos()
            ]);
            setAllPrograms(progRes.data?.items || []);
            setAllPermissions(permRes.data?.items || []);
        } catch (error) {
            console.error('Error cargando catálogos:', error);
        }
    };

    const handleRoleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing && selectedRole) {
                await rolesService.update(selectedRole.rol_id, roleForm);
            } else {
                await rolesService.create(roleForm);
            }
            setShowRoleModal(false);
            setIsEditing(false);
            setRoleForm({ nombre: '', codigo: '', descripcion: '' });
            setSelectedRole(null);
            loadRoles();
        } catch (error) {
            alert('Error al procesar rol: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEditClick = (role) => {
        setSelectedRole(role);
        setRoleForm({
            nombre: role.nombre,
            codigo: role.codigo,
            descripcion: role.descripcion || ''
        });
        setIsEditing(true);
        setShowRoleModal(true);
    };

    const handleDeleteRole = async (roleId, roleName) => {
        if (!window.confirm(`¿Está seguro que desea desactivar el rol "${roleName}"?`)) return;

        try {
            await rolesService.delete(roleId);
            loadRoles();
        } catch (error) {
            alert('Error al desactivar rol');
        }
    };

    const loadRoleDetails = async (role) => {
        setSelectedRole(role);
        try {
            const [progRes, permRes] = await Promise.all([
                rolesService.getProgramas(role.rol_id),
                rolesService.getPermisos(role.rol_id)
            ]);
            setRolePrograms(progRes.data?.items || []);
            setRolePermissions(permRes.data?.items || []);
        } catch (error) {
            console.error('Error cargando detalles del rol:', error);
        }
    };

    const toggleProgram = async (programId, isAssigned) => {
        try {
            if (isAssigned) {
                await rolesService.quitarPrograma(selectedRole.rol_id, programId);
            } else {
                await rolesService.asignarPrograma(selectedRole.rol_id, programId);
            }
            // Refresh local list
            const res = await rolesService.getProgramas(selectedRole.rol_id);
            setRolePrograms(res.data?.items || []);
        } catch (error) {
            console.error('Error toggling program:', error);
        }
    };

    const togglePermission = async (permissionId, isAssigned) => {
        try {
            if (isAssigned) {
                await rolesService.quitarPermiso(selectedRole.rol_id, permissionId);
            } else {
                await rolesService.asignarPermiso(selectedRole.rol_id, permissionId);
            }
            // Refresh local list
            const res = await rolesService.getPermisos(selectedRole.rol_id);
            setRolePermissions(res.data?.items || []);
        } catch (error) {
            console.error('Error toggling permission:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-text-secondary">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-accent/20 border-b-accent rounded-full animate-spin-reverse"></div>
                    </div>
                </div>
                <span className="mt-6 font-black text-[10px] uppercase tracking-[0.2em] opacity-40">Configurando Perfiles...</span>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            {/* Header Section Standardized */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
                <div>
                    <h1 className="text-3xl font-black text-text-primary uppercase tracking-tight leading-none">
                        Seguridad y <span className="text-primary">Roles de Acceso</span>
                    </h1>
                    <p className="text-text-secondary font-black mt-2 text-[10px] uppercase tracking-widest opacity-40">Configuración técnica de privilegios y módulos del ecosistema clínico</p>
                </div>
                <button
                    onClick={() => setShowRoleModal(true)}
                    className="flex items-center justify-center gap-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark hover:-translate-y-1 transition-all active:scale-95"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Nuevo Rol</span>
                </button>
            </div>

            {/* Roles Grid Standardized */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {roles.map(rol => (
                    <RoleCard
                        key={rol.rol_id}
                        rol={rol}
                        onPrograms={() => { loadRoleDetails(rol); setShowProgramsModal(true); }}
                        onPermissions={() => { loadRoleDetails(rol); setShowPermissionsModal(true); }}
                        onEdit={() => handleEditClick(rol)}
                        onDelete={() => handleDeleteRole(rol.rol_id, rol.nombre)}
                    />
                ))}
            </div>

            {/* Modal: Nuevo / Editar Rol Standardized */}
            {showRoleModal && (
                <div className="fixed inset-0 bg-primary-dark/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-surface-card rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
                        <div className="bg-primary-dark p-8 text-white flex justify-between items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                            <div className="relative z-10">
                                <h1 className="text-2xl font-black uppercase tracking-tight">{isEditing ? 'Configurar' : 'Definir'} <span className="text-primary-light">Perfil</span></h1>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1">Parámetros técnicos de identidad de acceso</p>
                            </div>
                            <button onClick={() => { setShowRoleModal(false); setIsEditing(false); }} className="relative z-10 w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all active:scale-95 group">
                                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleRoleSubmit} className="p-10 space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Nombre Descriptivo</label>
                                    <input
                                        type="text"
                                        required
                                        value={roleForm.nombre}
                                        onChange={e => setRoleForm({ ...roleForm, nombre: e.target.value })}
                                        placeholder="EJ: DIRECTOR TÉCNICO CLÍNICO"
                                        className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-sm text-text-primary placeholder:opacity-20 uppercase"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Identificador Único (Code)</label>
                                    <input
                                        type="text"
                                        required
                                        value={roleForm.codigo}
                                        onChange={e => setRoleForm({ ...roleForm, codigo: e.target.value.toUpperCase() })}
                                        placeholder="EJ: ADMIN_MASTER"
                                        disabled={isEditing}
                                        className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:bg-white focus:border-primary focus:outline-none transition-all font-black text-sm text-text-primary placeholder:opacity-20 uppercase disabled:opacity-40"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Alcances y Definición</label>
                                    <textarea
                                        value={roleForm.descripcion}
                                        onChange={e => setRoleForm({ ...roleForm, descripcion: e.target.value })}
                                        placeholder="Detalla las responsabilidades técnicas de este perfil..."
                                        rows={4}
                                        className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-sm text-text-primary placeholder:opacity-20 min-h-[120px]"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary text-white font-black text-[11px] uppercase tracking-[0.3em] py-5 rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark hover:-translate-y-1 transition-all active:scale-95"
                            >
                                {isEditing ? 'Sincronizar Cambios' : 'Registrar Perfil Maestro'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Gestión de Programas (Módulos) Standardized */}
            {showProgramsModal && selectedRole && (
                <div className="fixed inset-0 bg-primary-dark/60 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-in fade-in duration-500">
                    <div className="bg-surface-card rounded-[4rem] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-white/10 flex flex-col animate-in slide-in-from-bottom-12 duration-500">
                        <div className="bg-primary-dark p-12 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden shrink-0">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                            <div className="relative z-10">
                                <h2 className="text-3xl font-black uppercase tracking-tight leading-none">Arquitectura de <span className="text-primary-light">Módulos</span></h2>
                                <p className="text-[11px] font-black uppercase tracking-[0.4em] mt-3 opacity-40">Asignación técnica para: {selectedRole.nombre}</p>
                            </div>
                            <button onClick={() => setShowProgramsModal(false)} className="relative z-10 bg-white/10 hover:bg-white text-white hover:text-primary-dark px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl border border-white/5">
                                Finalizar Configuración
                            </button>
                        </div>
                        <div className="p-12 overflow-y-auto flex-1 bg-surface-card">
                            <ProgramsGrouped
                                allPrograms={allPrograms}
                                rolePrograms={rolePrograms}
                                onToggle={toggleProgram}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Gestión de Permisos Standardized */}
            {showPermissionsModal && selectedRole && (
                <div className="fixed inset-0 bg-primary-dark/60 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-in fade-in duration-500">
                    <div className="bg-surface-card rounded-[4rem] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-white/10 flex flex-col animate-in slide-in-from-bottom-12 duration-500">
                        <div className="bg-accent p-12 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden shrink-0">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                            <div className="relative z-10">
                                <h2 className="text-3xl font-black uppercase tracking-tight leading-none">Matriz de <span className="text-white">Privilegios</span></h2>
                                <p className="text-[11px] font-black uppercase tracking-[0.4em] mt-3 opacity-40">Nivel de autorización para: {selectedRole.nombre}</p>
                            </div>
                            <button onClick={() => setShowPermissionsModal(false)} className="relative z-10 bg-white/20 hover:bg-white text-white hover:text-accent px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl border border-white/5">
                                Finalizar Configuración
                            </button>
                        </div>
                        <div className="p-12 overflow-y-auto flex-1 bg-surface-card">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {allPermissions.map(perm => {
                                    const isAssigned = rolePermissions.some(rp => rp.permiso_id === perm.permiso_id);
                                    return (
                                        <button
                                            key={perm.permiso_id}
                                            onClick={() => togglePermission(perm.permiso_id, isAssigned)}
                                            className={`flex items-center gap-5 p-6 rounded-3xl border-2 transition-all text-left relative overflow-hidden group ${isAssigned
                                                ? 'bg-accent/5 border-accent shadow-lg shadow-accent/5'
                                                : 'bg-surface-raised border-transparent hover:border-border hover:bg-white'}`}
                                        >
                                            {isAssigned && (
                                                <div className="absolute top-0 right-0 w-8 h-8 bg-accent text-white flex items-center justify-center rounded-bl-xl font-black text-xs">
                                                    ✓
                                                </div>
                                            )}
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all ${isAssigned ? 'bg-accent text-white scale-110' : 'bg-surface-card text-text-secondary opacity-40 group-hover:opacity-100 group-hover:scale-110'}`}>
                                                🔑
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-black text-[11px] uppercase tracking-tight truncate ${isAssigned ? 'text-accent' : 'text-text-primary'}`}>{perm.nombre}</p>
                                                <p className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 mt-1 truncate">{perm.codigo}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionRoles;
