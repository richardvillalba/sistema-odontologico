import React, { useState, useEffect } from 'react';
import { rolesService, securityService } from '../services/api';
import '../styles/GestionRoles.css';

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

    if (loading) return <div className="loading">Cargando roles...</div>;

    return (
        <div className="gestion-roles-container">
            <div className="page-header">
                <div>
                    <h1>🎭 Gestión de Roles</h1>
                    <p className="subtitle">Configura los roles del sistema, sus módulos y permisos detallados</p>
                </div>
                <button className="btn-nuevo-rol" onClick={() => setShowRoleModal(true)}>
                    + Nuevo Rol
                </button>
            </div>

            <div className="roles-grid">
                {roles.map(rol => (
                    <div key={rol.rol_id} className="role-card">
                        <div className={`role-card-header rol-${rol.codigo?.toLowerCase()}`}>
                            <h3>{rol.nombre}</h3>
                            <span className="role-tag">{rol.codigo}</span>
                        </div>
                        <div className="role-card-body">
                            <p className="description">{rol.descripcion || 'Sin descripción'}</p>
                            <div className="role-actions">
                                <button onClick={() => { loadRoleDetails(rol); setShowProgramsModal(true); }}>
                                    📦 Módulos
                                </button>
                                <button onClick={() => { loadRoleDetails(rol); setShowPermissionsModal(true); }}>
                                    🔑 Permisos
                                </button>
                                <button className="btn-edit-role" onClick={() => handleEditClick(rol)}>
                                    ✏️ Editar
                                </button>
                                <button className="btn-delete-role" onClick={() => handleDeleteRole(rol.rol_id, rol.nombre)}>
                                    🗑️ Borrar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal: Nuevo Rol */}
            {showRoleModal && (
                <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{isEditing ? 'Editar Rol' : 'Crear Nuevo Rol'}</h2>
                        </div>
                        <form onSubmit={handleRoleSubmit} className="modal-body">
                            <div className="form-group">
                                <label>Nombre del Rol</label>
                                <input
                                    type="text"
                                    required
                                    value={roleForm.nombre}
                                    onChange={e => setRoleForm({ ...roleForm, nombre: e.target.value })}
                                    placeholder="Ej: Administrador de Inventario"
                                />
                            </div>
                            <div className="form-group">
                                <label>Código Único</label>
                                <input
                                    type="text"
                                    required
                                    value={roleForm.codigo}
                                    onChange={e => setRoleForm({ ...roleForm, codigo: e.target.value.toUpperCase() })}
                                    placeholder="Ej: ADMIN_INV"
                                    disabled={isEditing}
                                />
                            </div>
                            <div className="form-group">
                                <label>Descripción</label>
                                <textarea
                                    value={roleForm.descripcion}
                                    onChange={e => setRoleForm({ ...roleForm, descripcion: e.target.value })}
                                    placeholder="Describe qué puede hacer este rol..."
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => { setShowRoleModal(false); setIsEditing(false); }}>Cancelar</button>
                                <button type="submit" className="btn-confirmar">{isEditing ? 'Guardar Cambios' : 'Crear Rol'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Gestión de Programas (Módulos) */}
            {showProgramsModal && selectedRole && (
                <div className="modal-overlay" onClick={() => setShowProgramsModal(false)}>
                    <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>📦 Módulos para: {selectedRole.nombre}</h2>
                        </div>
                        <div className="modal-body">
                            <div className="items-selection-grid">
                                {allPrograms.map(prog => {
                                    const isAssigned = rolePrograms.some(rp => rp.programa_id === prog.programa_id);
                                    return (
                                        <div
                                            key={prog.programa_id}
                                            className={`selection-item ${isAssigned ? 'selected' : ''}`}
                                            onClick={() => toggleProgram(prog.programa_id, isAssigned)}
                                        >
                                            <span className="icon">{prog.icono || '📄'}</span>
                                            <div className="info">
                                                <span className="title">{prog.nombre}</span>
                                                <span className="subtitle">{prog.codigo}</span>
                                            </div>
                                            <div className="checkbox">{isAssigned ? '✓' : ''}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setShowProgramsModal(false)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Gestión de Permisos */}
            {showPermissionsModal && selectedRole && (
                <div className="modal-overlay" onClick={() => setShowPermissionsModal(false)}>
                    <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>🔑 Permisos para: {selectedRole.nombre}</h2>
                        </div>
                        <div className="modal-body">
                            <div className="items-selection-grid">
                                {allPermissions.map(perm => {
                                    const isAssigned = rolePermissions.some(rp => rp.permiso_id === perm.permiso_id);
                                    return (
                                        <div
                                            key={perm.permiso_id}
                                            className={`selection-item ${isAssigned ? 'selected' : ''}`}
                                            onClick={() => togglePermission(perm.permiso_id, isAssigned)}
                                        >
                                            <div className="info">
                                                <span className="title">{perm.nombre}</span>
                                                <span className="subtitle">{perm.codigo}</span>
                                            </div>
                                            <div className="checkbox">{isAssigned ? '✓' : ''}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setShowPermissionsModal(false)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionRoles;
