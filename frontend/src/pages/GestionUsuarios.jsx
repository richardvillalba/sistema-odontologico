import React, { useState, useEffect } from 'react';
import { usersService, rolesService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// ─── Modal Crear / Editar Usuario ───────────────────────────────────────────
const ModalUsuario = ({ usuario, onClose, onSuccess }) => {
    const { usuario: authUser } = useAuth();
    const isEdit = !!usuario;
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        nombre: '',
        apellido: '',
        telefono: '',
        documento_tipo: 'CI',
        documento_numero: '',
        especialidad: '',
        empresa_id: authUser?.empresa_id || 1,
        creado_por: authUser?.usuario_id || 1,
        ...(isEdit ? usuario : {}),
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.nombre.trim() || !form.apellido.trim() || !form.email.trim()) {
            setError('Nombre, apellido y email son obligatorios.');
            return;
        }
        if (!isEdit && !form.username.trim()) {
            setError('El nombre de usuario es obligatorio.');
            return;
        }
        if (!isEdit && !form.password.trim()) {
            setError('La contraseña es obligatoria al crear un usuario.');
            return;
        }
        setSaving(true);
        try {
            if (isEdit) {
                await usersService.update(usuario.usuario_id, {
                    email: form.email,
                    nombre: form.nombre,
                    apellido: form.apellido,
                    telefono: form.telefono,
                    documento_tipo: form.documento_tipo,
                    documento_numero: form.documento_numero,
                    especialidad: form.especialidad,
                    modificado_por: authUser?.usuario_id || 1,
                });
            } else {
                await usersService.create(form);
            }
            onSuccess();
        } catch (err) {
            const msg = err.response?.data?.mensaje || err.response?.data?.error || 'Error al guardar el usuario.';
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900">
                        {isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
                    )}

                    {/* Username + Email */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Usuario {!isEdit && '*'}
                                {isEdit && <span className="ml-1 text-xs font-normal text-slate-400">(no editable)</span>}
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                disabled={isEdit}
                                className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none ${
                                    isEdit
                                        ? 'border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed'
                                        : 'border-slate-300 focus:ring-2 focus:ring-indigo-500'
                                }`}
                                placeholder="nombre.apellido"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="usuario@clinica.com"
                            />
                        </div>
                    </div>

                    {/* Nombre + Apellido */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre *</label>
                            <input
                                type="text"
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Juan"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Apellido *</label>
                            <input
                                type="text"
                                name="apellido"
                                value={form.apellido}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Pérez"
                            />
                        </div>
                    </div>

                    {/* Password (solo al crear) */}
                    {!isEdit && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Contraseña *</label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Mínimo 6 caracteres"
                            />
                        </div>
                    )}

                    {/* Teléfono + Especialidad */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Teléfono</label>
                            <input
                                type="text"
                                name="telefono"
                                value={form.telefono}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="0981 000 000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Especialidad</label>
                            <input
                                type="text"
                                name="especialidad"
                                value={form.especialidad}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Odontología General"
                            />
                        </div>
                    </div>

                    {/* Documento */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo Doc.</label>
                            <select
                                name="documento_tipo"
                                value={form.documento_tipo}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="CI">CI</option>
                                <option value="RUC">RUC</option>
                                <option value="PASAPORTE">Pasaporte</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Número</label>
                            <input
                                type="text"
                                name="documento_numero"
                                value={form.documento_numero}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="1234567"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors text-sm disabled:opacity-50"
                        >
                            {saving ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Crear Usuario'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Modal Reset Contraseña ──────────────────────────────────────────────────
const ModalResetPass = ({ usuario, onClose, onSuccess }) => {
    const { usuario: authUser } = useAuth();
    const [pass, setPass] = useState('');
    const [confirm, setConfirm] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (pass.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
        if (pass !== confirm) { setError('Las contraseñas no coinciden.'); return; }
        setSaving(true);
        try {
            await usersService.resetPassword(usuario.usuario_id, pass, authUser?.usuario_id || 1);
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al cambiar contraseña.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900">Cambiar Contraseña</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
                    )}
                    <p className="text-sm text-slate-600">
                        Cambiando contraseña de <strong>{usuario.nombre} {usuario.apellido}</strong>
                    </p>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Nueva contraseña</label>
                        <input
                            type="password"
                            value={pass}
                            onChange={e => setPass(e.target.value)}
                            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Confirmar contraseña</label>
                        <input
                            type="password"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Repetir contraseña"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm">
                            Cancelar
                        </button>
                        <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors text-sm disabled:opacity-50">
                            {saving ? 'Guardando...' : 'Cambiar Contraseña'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Modal Asignar Rol ───────────────────────────────────────────────────────
const ModalRol = ({ usuario, roles, onClose, onSuccess }) => {
    const { usuario: authUser } = useAuth();
    const [rolId, setRolId] = useState(usuario.rol_id || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rolId) { setError('Seleccioná un rol.'); return; }
        setSaving(true);
        try {
            await usersService.asignarRol(usuario.usuario_id, rolId, authUser?.usuario_id || 1);
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al asignar rol.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900">Asignar Rol</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
                    )}
                    <p className="text-sm text-slate-600">
                        Usuario: <strong>{usuario.nombre} {usuario.apellido}</strong>
                    </p>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Rol</label>
                        <select
                            value={rolId}
                            onChange={e => setRolId(e.target.value)}
                            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">-- Seleccionar rol --</option>
                            {roles.map(r => (
                                <option key={r.rol_id} value={r.rol_id}>{r.nombre}</option>
                            ))}
                        </select>
                    </div>
                    {rolId && (
                        <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600">
                            {roles.find(r => r.rol_id === parseInt(rolId))?.descripcion || ''}
                        </div>
                    )}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm">
                            Cancelar
                        </button>
                        <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors text-sm disabled:opacity-50">
                            {saving ? 'Guardando...' : 'Asignar Rol'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Fila de Usuario ─────────────────────────────────────────────────────────
const UsuarioRow = ({ usuario, roles, onEdit, onRol, onResetPass, onToggleActivo }) => {
    const rol = roles.find(r => r.rol_id === usuario.rol_id);
    const initials = `${(usuario.nombre || '')[0] || ''}${(usuario.apellido || '')[0] || ''}`.toUpperCase();
    const activo = usuario.activo === 'S';

    const rolColors = {
        ADMIN: 'bg-red-100 text-red-700',
        DOCTOR: 'bg-blue-100 text-blue-700',
        CAJERA: 'bg-green-100 text-green-700',
        RECEPCION: 'bg-amber-100 text-amber-700',
    };
    const rolColor = rolColors[rol?.codigo] || 'bg-slate-100 text-slate-600';

    return (
        <tr className="hover:bg-slate-50 transition-colors">
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${activo ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'}`}>
                        {initials}
                    </div>
                    <div>
                        <p className="font-semibold text-slate-900 text-sm">{usuario.nombre} {usuario.apellido}</p>
                        <p className="text-xs text-slate-500">{usuario.username}</p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3 text-sm text-slate-600">{usuario.email}</td>
            <td className="px-4 py-3 text-sm text-slate-500">{usuario.telefono || '—'}</td>
            <td className="px-4 py-3">
                {rol ? (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${rolColor}`}>
                        {rol.nombre}
                    </span>
                ) : (
                    <span className="text-xs text-slate-400 italic">Sin rol</span>
                )}
            </td>
            <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${activo ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                    {activo ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                    <button
                        title="Editar usuario"
                        onClick={() => onEdit(usuario)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        title="Asignar rol"
                        onClick={() => onRol(usuario)}
                        className="p-1.5 text-slate-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </button>
                    <button
                        title="Cambiar contraseña"
                        onClick={() => onResetPass(usuario)}
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </button>
                    <button
                        title={activo ? 'Desactivar usuario' : 'Activar usuario'}
                        onClick={() => onToggleActivo(usuario)}
                        className={`p-1.5 rounded-lg transition-colors ${activo
                            ? 'text-slate-500 hover:text-red-600 hover:bg-red-50'
                            : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
                    >
                        {activo ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </button>
                </div>
            </td>
        </tr>
    );
};

// ─── Página Principal ─────────────────────────────────────────────────────────
const GestionUsuarios = () => {
    const { usuario: authUser } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroRol, setFiltroRol] = useState('');

    // Modales
    const [modalUsuario, setModalUsuario] = useState(null); // null | 'create' | usuario_obj
    const [modalResetPass, setModalResetPass] = useState(null);
    const [modalRol, setModalRol] = useState(null);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [usuariosRes, rolesRes] = await Promise.all([
                usersService.getAll(),
                rolesService.getAll(),
            ]);
            setUsuarios(usuariosRes.data?.items || []);
            setRoles(rolesRes.data?.items || []);
        } catch (err) {
            console.error('Error cargando usuarios:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActivo = async (usuario) => {
        const nuevo = usuario.activo === 'S' ? 'N' : 'S';
        const accion = nuevo === 'S' ? 'activar' : 'desactivar';
        if (!window.confirm(`¿Confirmas ${accion} al usuario ${usuario.nombre} ${usuario.apellido}?`)) return;
        try {
            await usersService.setActivo(usuario.usuario_id, nuevo, authUser?.usuario_id || 1);
            loadData();
        } catch (err) {
            alert(err.response?.data?.mensaje || 'Error al cambiar estado.');
        }
    };

    const handleSuccess = () => {
        setModalUsuario(null);
        setModalResetPass(null);
        setModalRol(null);
        loadData();
    };

    const usuariosFiltrados = usuarios.filter(u => {
        const txt = search.toLowerCase();
        const matchSearch = !search
            || (u.nombre || '').toLowerCase().includes(txt)
            || (u.apellido || '').toLowerCase().includes(txt)
            || (u.email || '').toLowerCase().includes(txt)
            || (u.username || '').toLowerCase().includes(txt);
        const matchEstado = !filtroEstado || u.activo === filtroEstado;
        const matchRol = !filtroRol || String(u.rol_id) === filtroRol;
        return matchSearch && matchEstado && matchRol;
    });

    const totalActivos = usuarios.filter(u => u.activo === 'S').length;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Usuarios</h1>
                    <p className="text-slate-500 font-medium">Gestioná los accesos y roles del sistema.</p>
                </div>
                <button
                    onClick={() => setModalUsuario('create')}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm text-sm"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo Usuario
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</p>
                    <p className="text-3xl font-black text-slate-900 mt-1">{usuarios.length}</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Activos</p>
                    <p className="text-3xl font-black text-emerald-600 mt-1">{totalActivos}</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Roles</p>
                    <p className="text-3xl font-black text-slate-900 mt-1">{roles.length}</p>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap gap-3">
                <div className="flex-1 min-w-48">
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar por nombre, email o usuario..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>
                <select
                    value={filtroEstado}
                    onChange={e => setFiltroEstado(e.target.value)}
                    className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                    <option value="">Todos los estados</option>
                    <option value="S">Activos</option>
                    <option value="N">Inactivos</option>
                </select>
                <select
                    value={filtroRol}
                    onChange={e => setFiltroRol(e.target.value)}
                    className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                    <option value="">Todos los roles</option>
                    {roles.map(r => (
                        <option key={r.rol_id} value={r.rol_id}>{r.nombre}</option>
                    ))}
                </select>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16 text-slate-500">
                        <svg className="animate-spin w-6 h-6 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Cargando usuarios...
                    </div>
                ) : usuariosFiltrados.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-slate-400 font-medium">No se encontraron usuarios</p>
                        <p className="text-slate-400 text-sm mt-1">Probá ajustando los filtros o creá uno nuevo.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Usuario</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Teléfono</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Rol</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {usuariosFiltrados.map(u => (
                                <UsuarioRow
                                    key={u.usuario_id}
                                    usuario={u}
                                    roles={roles}
                                    onEdit={usr => setModalUsuario(usr)}
                                    onRol={usr => setModalRol(usr)}
                                    onResetPass={usr => setModalResetPass(usr)}
                                    onToggleActivo={handleToggleActivo}
                                />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modales */}
            {modalUsuario && (
                <ModalUsuario
                    usuario={modalUsuario === 'create' ? null : modalUsuario}
                    onClose={() => setModalUsuario(null)}
                    onSuccess={handleSuccess}
                />
            )}
            {modalResetPass && (
                <ModalResetPass
                    usuario={modalResetPass}
                    onClose={() => setModalResetPass(null)}
                    onSuccess={handleSuccess}
                />
            )}
            {modalRol && (
                <ModalRol
                    usuario={modalRol}
                    roles={roles}
                    onClose={() => setModalRol(null)}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
};

export default GestionUsuarios;
