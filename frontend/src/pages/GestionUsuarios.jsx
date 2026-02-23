import { useState, useEffect } from 'react';
import { usersService, rolesService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// ─── Modal Crear / Editar Usuario ───────────────────────────────────────────
// ─── Modal Crear / Editar Usuario Standardized ───────────────────────────────────────────
const ModalUsuario = ({ usuario, onClose, onSuccess }) => {
    const { usuario: authUser, empresaActiva } = useAuth();
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
        empresa_id: empresaActiva?.empresa_id,
        creado_por: authUser?.usuario_id,
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
        if (!isEdit && form.password.trim().length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres.');
            return;
        }
        setSaving(true);
        try {
            let res;
            if (isEdit) {
                res = await usersService.update(usuario.usuario_id, {
                    email: form.email,
                    nombre: form.nombre,
                    apellido: form.apellido,
                    telefono: form.telefono,
                    documento_tipo: form.documento_tipo,
                    documento_numero: form.documento_numero,
                    especialidad: form.especialidad,
                    modificado_por: authUser?.usuario_id,
                });
            } else {
                res = await usersService.create(form);
            }
            const data = res?.data;
            if (data?.resultado === 0) {
                setError(data?.mensaje || 'Error al guardar el usuario.');
                return;
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
        <div className="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface-card rounded-[2.5rem] shadow-2xl w-full max-w-lg max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between px-8 py-6 border-b border-border bg-surface-raised/50">
                    <div>
                        <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">
                            {isEdit ? 'Actualizar' : 'Registrar'} <span className="text-primary">Usuario</span>
                        </h2>
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 mt-1">Gestión técnica de credenciales y perfiles</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-surface-raised rounded-xl transition-colors text-text-secondary opacity-40 hover:opacity-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="bg-danger/5 border-2 border-danger/20 text-danger text-[10px] font-black uppercase tracking-widest rounded-2xl px-6 py-4 animate-shake">
                            {error}
                        </div>
                    )}

                    {/* Username + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 ml-1">
                                Identificador {!isEdit && '*'}
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                disabled={isEdit}
                                className={`w-full px-5 py-3.5 rounded-2xl border-2 border-border transition-all font-black text-sm ${isEdit
                                    ? 'bg-surface-raised text-text-secondary opacity-50 cursor-not-allowed'
                                    : 'bg-surface-raised focus:border-primary focus:outline-none text-text-primary'
                                    }`}
                                placeholder="nombre.apellido"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 ml-1">Email Institucional *</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full px-5 py-3.5 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:outline-none transition-all font-bold text-sm text-text-primary"
                                placeholder="usuario@clinica.com"
                            />
                        </div>
                    </div>

                    {/* Nombre + Apellido */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 ml-1">Nombres *</label>
                            <input
                                type="text"
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                className="w-full px-5 py-3.5 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:outline-none transition-all font-bold text-sm text-text-primary"
                                placeholder="Juan"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 ml-1">Apellidos *</label>
                            <input
                                type="text"
                                name="apellido"
                                value={form.apellido}
                                onChange={handleChange}
                                className="w-full px-5 py-3.5 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:outline-none transition-all font-bold text-sm text-text-primary"
                                placeholder="Pérez"
                            />
                        </div>
                    </div>

                    {/* Password (solo al crear) */}
                    {!isEdit && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 ml-1">Clave de Acceso *</label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                className="w-full px-5 py-3.5 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:outline-none transition-all font-black text-sm text-text-primary"
                                placeholder="Mínimo 8 caracteres"
                            />
                        </div>
                    )}

                    {/* Teléfono + Especialidad */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 ml-1">Contacto Telefónico</label>
                            <input
                                type="text"
                                name="telefono"
                                value={form.telefono}
                                onChange={handleChange}
                                className="w-full px-5 py-3.5 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:outline-none transition-all font-bold text-sm text-text-primary"
                                placeholder="0981 000 000"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 ml-1">Área / Especialidad</label>
                            <input
                                type="text"
                                name="especialidad"
                                value={form.especialidad}
                                onChange={handleChange}
                                className="w-full px-5 py-3.5 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:outline-none transition-all font-bold text-sm text-text-primary"
                                placeholder="Odontología General"
                            />
                        </div>
                    </div>

                    {/* Documento */}
                    <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 ml-1">Tipo Doc.</label>
                            <select
                                name="documento_tipo"
                                value={form.documento_tipo}
                                onChange={handleChange}
                                className="w-full px-4 py-3.5 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:outline-none transition-all font-bold text-sm text-text-primary appearance-none cursor-pointer"
                            >
                                <option value="CI">CI</option>
                                <option value="RUC">RUC</option>
                                <option value="PAS">PAS</option>
                            </select>
                        </div>
                        <div className="col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 ml-1">Nro. Documento</label>
                            <input
                                type="text"
                                name="documento_numero"
                                value={form.documento_numero}
                                onChange={handleChange}
                                className="w-full px-5 py-3.5 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:outline-none transition-all font-bold text-sm text-text-primary"
                                placeholder="1.234.567"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full sm:flex-1 py-4 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark hover:-translate-y-1 transition-all disabled:opacity-50"
                        >
                            {saving ? 'Procesando...' : isEdit ? 'Confirmar Cambios' : 'Registrar Usuario'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:flex-1 py-4 border-2 border-border text-text-secondary font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-surface-raised transition-all order-last sm:order-none"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Modal Reset Contraseña ──────────────────────────────────────────────────
// ─── Modal Reset Contraseña Standardized ──────────────────────────────────────────────────
const ModalResetPass = ({ usuario, onClose, onSuccess }) => {
    const { usuario: authUser } = useAuth();
    const [pass, setPass] = useState('');
    const [confirm, setConfirm] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (pass.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return; }
        if (pass !== confirm) { setError('Las contraseñas no coinciden.'); return; }
        setSaving(true);
        try {
            const res = await usersService.resetPassword(usuario.usuario_id, pass, authUser?.usuario_id);
            if (res?.data?.resultado === 0) { setError(res.data.mensaje || 'Error al cambiar contraseña.'); return; }
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al cambiar contraseña.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface-card rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between px-8 py-6 border-b border-border bg-surface-raised/50">
                    <div>
                        <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">Reiniciar <span className="text-warning">Clave</span></h2>
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 mt-1">Procedimiento de seguridad de acceso</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-surface-raised rounded-xl transition-colors text-text-secondary opacity-40 hover:opacity-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-danger/5 border-2 border-danger/20 text-danger text-[10px] font-black uppercase tracking-widest rounded-2xl px-6 py-4 animate-shake">
                            {error}
                        </div>
                    )}
                    <div className="bg-surface-raised rounded-2xl p-4 border border-border">
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 mb-1">Usuario Objetivo</p>
                        <p className="text-sm font-black text-text-primary uppercase tracking-tight">
                            {usuario.nombre} {usuario.apellido}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 ml-1">Nueva Contraseña</label>
                        <input
                            type="password"
                            value={pass}
                            onChange={e => setPass(e.target.value)}
                            className="w-full px-5 py-3.5 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:outline-none transition-all font-black text-sm text-text-primary"
                            placeholder="Mínimo 8 caracteres"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 ml-1">Confirmar Nueva Contraseña</label>
                        <input
                            type="password"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            className="w-full px-5 py-3.5 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:outline-none transition-all font-black text-sm text-text-primary"
                            placeholder="Repetir contraseña"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        <button type="submit" disabled={saving} className="w-full sm:flex-1 py-4 bg-warning text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-warning/20 hover:bg-orange-600 hover:-translate-y-1 transition-all disabled:opacity-50">
                            {saving ? 'Procesando...' : 'Aplicar Nueva Clave'}
                        </button>
                        <button type="button" onClick={onClose} className="w-full sm:flex-1 py-4 border-2 border-border text-text-secondary font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-surface-raised transition-all order-last sm:order-none">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Modal Asignar Rol ───────────────────────────────────────────────────────
// ─── Modal Asignar Rol Standardized ───────────────────────────────────────────────────────
const ModalRol = ({ usuario, roles, onClose, onSuccess }) => {
    const { usuario: authUser } = useAuth();
    const [rolId, setRolId] = useState(usuario.rol_id || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!rolId) { setError('Seleccioná un rol.'); return; }
        setSaving(true);
        try {
            const res = await usersService.asignarRol(usuario.usuario_id, rolId, authUser?.usuario_id);
            if (res?.data?.resultado === 0) { setError(res.data.mensaje || 'Error al asignar rol.'); return; }
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al asignar rol.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface-card rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between px-8 py-6 border-b border-border bg-surface-raised/50">
                    <div>
                        <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">Vincular <span className="text-accent">Perfil</span></h2>
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 mt-1">Asignación técnica de privilegios</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-surface-raised rounded-xl transition-colors text-text-secondary opacity-40 hover:opacity-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-danger/5 border-2 border-danger/20 text-danger text-[10px] font-black uppercase tracking-widest rounded-2xl px-6 py-4 animate-shake">
                            {error}
                        </div>
                    )}
                    <div className="bg-surface-raised rounded-2xl p-4 border border-border">
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 mb-1">Usuario Objetivo</p>
                        <p className="text-sm font-black text-text-primary uppercase tracking-tight">
                            {usuario.nombre} {usuario.apellido}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 ml-1">Perfil de Usuario</label>
                        <div className="relative group">
                            <select
                                value={rolId}
                                onChange={e => setRolId(e.target.value)}
                                className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-accent focus:outline-none transition-all font-bold text-sm text-text-primary appearance-none cursor-pointer"
                            >
                                <option value="">-- Seleccionar perfil --</option>
                                {roles.map(r => (
                                    <option key={r.rol_id} value={r.rol_id}>{r.nombre}</option>
                                ))}
                            </select>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary opacity-30">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    {rolId && (
                        <div className="bg-accent/5 rounded-2xl p-5 text-[10px] font-black uppercase tracking-widest text-accent leading-relaxed border border-accent/10">
                            {roles.find(r => r.rol_id === parseInt(rolId))?.descripcion || ''}
                        </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        <button type="submit" disabled={saving} className="w-full sm:flex-1 py-4 bg-accent text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-accent/20 hover:bg-indigo-700 hover:-translate-y-1 transition-all disabled:opacity-50">
                            {saving ? 'Procesando...' : 'Asignar Perfil'}
                        </button>
                        <button type="button" onClick={onClose} className="w-full sm:flex-1 py-4 border-2 border-border text-text-secondary font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-surface-raised transition-all order-last sm:order-none">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Fila de Usuario ─────────────────────────────────────────────────────────
// ─── Fila de Usuario Standardized ─────────────────────────────────────────
const UsuarioRow = ({ usuario, roles, onEdit, onRol, onResetPass, onToggleActivo }) => {
    const rol = roles.find(r => r.rol_id === usuario.rol_id);
    const initials = `${(usuario.nombre || '')[0] || ''}${(usuario.apellido || '')[0] || ''}`.toUpperCase();
    const activo = usuario.activo === 'S';

    const rolColors = {
        ADMIN: 'bg-danger/10 text-danger border-danger/20',
        DOCTOR: 'bg-primary/10 text-primary border-primary/20',
        CAJERA: 'bg-secondary/10 text-secondary border-secondary/20',
        RECEPCION: 'bg-warning/10 text-warning border-warning/20',
    };
    const rolClass = rolColors[rol?.codigo] || 'bg-surface-raised text-text-secondary border-border';

    return (
        <tr className="hover:bg-surface-raised/50 transition-colors group">
            <td className="px-8 py-5">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center text-sm font-black border-2 transition-all group-hover:scale-110 shadow-sm ${activo ? 'bg-primary/5 text-primary border-primary/10' : 'bg-surface-raised text-text-secondary opacity-40 border-border'}`}>
                        {initials}
                    </div>
                    <div>
                        <p className="font-black text-text-primary uppercase tracking-tight text-sm leading-tight group-hover:text-primary transition-colors">{usuario.nombre} {usuario.apellido}</p>
                        <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest mt-1 opacity-40">@{usuario.username}</p>
                    </div>
                </div>
            </td>
            <td className="px-8 py-5">
                <span className="text-xs font-bold text-text-secondary opacity-60">{usuario.email}</span>
            </td>
            <td className="px-8 py-5">
                <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">{usuario.telefono || 'Sin contacto'}</span>
            </td>
            <td className="px-8 py-5">
                {rol ? (
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-sm ${rolClass}`}>
                        {rol.nombre}
                    </span>
                ) : (
                    <span className="text-[9px] text-text-secondary/30 italic font-black uppercase tracking-widest">Sin perfil asignado</span>
                )}
            </td>
            <td className="px-8 py-5">
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-sm ${activo ? 'bg-secondary/5 text-secondary border-secondary/10' : 'bg-surface-raised text-text-secondary/40 border-border'}`}>
                    <span className={`w-2 h-2 rounded-full animate-pulse ${activo ? 'bg-secondary' : 'bg-text-secondary/40'}`}></span>
                    {activo ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td className="px-8 py-5">
                <div className="flex items-center justify-center gap-2">
                    <button
                        title="Configurar perfil"
                        onClick={() => onEdit(usuario)}
                        className="p-2.5 text-text-secondary opacity-40 hover:opacity-100 hover:text-primary hover:bg-white hover:shadow-lg rounded-[1rem] transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        title="Gestionar permisos"
                        onClick={() => onRol(usuario)}
                        className="p-2.5 text-text-secondary opacity-40 hover:opacity-100 hover:text-accent hover:bg-white hover:shadow-lg rounded-[1rem] transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </button>
                    <button
                        title="Resetear credenciales"
                        onClick={() => onResetPass(usuario)}
                        className="p-2.5 text-text-secondary opacity-40 hover:opacity-100 hover:text-warning hover:bg-white hover:shadow-lg rounded-[1rem] transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </button>
                    <button
                        title={activo ? 'Suspender acceso' : 'Restaurar acceso'}
                        onClick={() => onToggleActivo(usuario)}
                        className={`p-2.5 rounded-[1rem] transition-all opacity-40 hover:opacity-100 ${activo
                            ? 'text-text-secondary hover:text-danger hover:bg-white hover:shadow-lg'
                            : 'text-text-secondary hover:text-secondary hover:bg-white hover:shadow-lg'}`}
                    >
                        {activo ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </button>
                </div>
            </td>
        </tr>
    );
};

// ─── Página Principal ─────────────────────────────────────────────────────────
// ─── Página Principal Standardized ───────────────────────────────────────────
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
        const accion = nuevo === 'S' ? 'activar' : 'suspender';
        if (!window.confirm(`¿Confirmas ${accion} el acceso al usuario ${usuario.nombre} ${usuario.apellido}?`)) return;
        try {
            await usersService.setActivo(usuario.usuario_id, nuevo, authUser?.usuario_id);
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
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            {/* Header Section Standardized */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
                <div>
                    <h1 className="text-3xl font-black text-text-primary uppercase tracking-tight leading-none">
                        Gestión de <span className="text-primary">Usuarios</span>
                    </h1>
                    <p className="text-text-secondary font-black mt-2 text-[10px] uppercase tracking-widest opacity-40">Administración técnica de credenciales y perfiles de acceso</p>
                </div>
                <button
                    onClick={() => setModalUsuario('create')}
                    className="flex items-center justify-center gap-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark hover:-translate-y-1 transition-all active:scale-95"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Nuevo Usuario</span>
                </button>
            </div>

            {/* Stats Section Standardized */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-surface-card rounded-[2.5rem] border border-border p-8 shadow-sm group hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-surface-raised flex items-center justify-center text-text-secondary opacity-40 group-hover:bg-primary group-hover:text-white group-hover:opacity-100 transition-all">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40">Total Registrados</p>
                    </div>
                    <p className="text-4xl font-black text-text-primary tracking-tight">{usuarios.length}</p>
                </div>

                <div className="bg-surface-card rounded-[2.5rem] border border-border p-8 shadow-sm group hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-surface-raised flex items-center justify-center text-secondary opacity-40 group-hover:bg-secondary group-hover:text-white group-hover:opacity-100 transition-all">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-[10px] font-black text-secondary uppercase tracking-widest opacity-40">Accesos Activos</p>
                    </div>
                    <p className="text-4xl font-black text-text-primary tracking-tight">{totalActivos}</p>
                </div>

                <div className="bg-surface-card rounded-[2.5rem] border border-border p-8 shadow-sm group hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-surface-raised flex items-center justify-center text-accent opacity-40 group-hover:bg-accent group-hover:text-white group-hover:opacity-100 transition-all">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <p className="text-[10px] font-black text-accent uppercase tracking-widest opacity-40">Perfiles Definidos</p>
                    </div>
                    <p className="text-4xl font-black text-text-primary tracking-tight">{roles.length}</p>
                </div>
            </div>

            {/* Filters Section Standardized */}
            <div className="bg-surface-card rounded-[2.5rem] border border-border p-4 shadow-sm flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative group">
                    <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary opacity-20 group-focus-within:opacity-100 group-focus-within:text-primary transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="BUSCAR POR NOMBRE, EMAIL O USUARIO..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-16 pr-6 py-4 rounded-2xl border-2 border-transparent bg-surface-raised focus:bg-white focus:border-primary focus:outline-none transition-all font-black text-[10px] uppercase tracking-widest text-text-primary placeholder:text-text-secondary/30"
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative group min-w-[180px]">
                        <select
                            value={filtroEstado}
                            onChange={e => setFiltroEstado(e.target.value)}
                            className="w-full px-6 py-4 rounded-2xl border-2 border-transparent bg-surface-raised focus:bg-white focus:border-primary focus:outline-none transition-all font-black text-[10px] uppercase tracking-widest text-text-primary appearance-none cursor-pointer"
                        >
                            <option value="">TODOS LOS ESTADOS</option>
                            <option value="S">SOLO ACTIVOS</option>
                            <option value="N">SUSPENDIDOS</option>
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary opacity-30">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                    <div className="relative group min-w-[200px]">
                        <select
                            value={filtroRol}
                            onChange={e => setFiltroRol(e.target.value)}
                            className="w-full px-6 py-4 rounded-2xl border-2 border-transparent bg-surface-raised focus:bg-white focus:border-primary focus:outline-none transition-all font-black text-[10px] uppercase tracking-widest text-text-primary appearance-none cursor-pointer"
                        >
                            <option value="">TODOS LOS PERFILES</option>
                            {roles.map(r => (
                                <option key={r.rol_id} value={r.rol_id}>{r.nombre.toUpperCase()}</option>
                            ))}
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary opacity-30">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Standardized */}
            <div className="bg-surface-card rounded-[3rem] border border-border shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-text-secondary">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 border-4 border-accent/20 border-b-accent rounded-full animate-spin-reverse"></div>
                            </div>
                        </div>
                        <span className="mt-6 font-black text-[10px] uppercase tracking-[0.2em] opacity-40">Sincronizando Usuarios...</span>
                    </div>
                ) : usuariosFiltrados.length === 0 ? (
                    <div className="text-center py-32">
                        <div className="w-24 h-24 bg-surface-raised rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-text-secondary opacity-20">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <p className="text-xl font-black text-text-primary uppercase tracking-tight">No hay coincidencias</p>
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 mt-2">Ajustá los parámetros de búsqueda o registrá un nuevo usuario técnico.</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View Standardized */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-raised/50 border-b border-border">
                                        <th className="px-8 py-6 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40">Usuario e Identificador</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40">Contacto</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40">Teléfono</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40">Perfil / Rol</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40">Estado</th>
                                        <th className="px-8 py-6 text-center text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40">Acciones Técnicas</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/40">
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
                        </div>

                        {/* Mobile Card View Standardized */}
                        <div className="lg:hidden divide-y divide-border/40">
                            {usuariosFiltrados.map(u => {
                                const rol = roles.find(r => r.rol_id === u.rol_id);
                                const activo = u.activo === 'S';
                                const initials = `${(u.nombre || '')[0] || ''}${(u.apellido || '')[0] || ''}`.toUpperCase();

                                const rolColors = {
                                    ADMIN: 'bg-danger/10 text-danger border-danger/20',
                                    DOCTOR: 'bg-primary/10 text-primary border-primary/20',
                                    CAJERA: 'bg-secondary/10 text-secondary border-secondary/20',
                                    RECEPCION: 'bg-warning/10 text-warning border-warning/20',
                                };
                                const rolClass = rolColors[rol?.codigo] || 'bg-surface-raised text-text-secondary border-border';

                                return (
                                    <div key={u.usuario_id} className="p-8 space-y-6 hover:bg-surface-raised/30 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black border-2 shadow-sm ${activo ? 'bg-primary/5 text-primary border-primary/10' : 'bg-surface-raised text-text-secondary opacity-40 border-border'}`}>
                                                    {initials}
                                                </div>
                                                <div>
                                                    <p className="font-black text-text-primary uppercase tracking-tight leading-tight">{u.nombre} {u.apellido}</p>
                                                    <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest mt-1 opacity-40">@{u.username}</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border shadow-sm ${rolClass}`}>
                                                {rol?.nombre || 'SIN PERFIL'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 bg-surface-raised/50 rounded-2xl p-4 border border-border/40">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest opacity-40">Email</p>
                                                <p className="text-xs font-bold text-text-primary truncate">{u.email}</p>
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest opacity-40">Estado de Acceso</p>
                                                <span className={`inline-flex items-center gap-2 font-black text-[9px] uppercase ${activo ? 'text-secondary' : 'text-text-secondary/40'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${activo ? 'bg-secondary animate-pulse' : 'bg-text-secondary/40'}`}></span>
                                                    {activo ? 'Activo' : 'Suspendido'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setModalUsuario(u)}
                                                className="flex-1 bg-white hover:bg-primary hover:text-white text-text-secondary py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border-2 border-border hover:border-primary shadow-sm active:scale-95"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => setModalRol(u)}
                                                className="flex-1 bg-white hover:bg-accent hover:text-white text-text-secondary py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border-2 border-border hover:border-accent shadow-sm active:scale-95"
                                            >
                                                Perfil
                                            </button>
                                            <button
                                                onClick={() => setModalResetPass(u)}
                                                className="p-3.5 bg-white hover:bg-warning hover:text-white text-text-secondary rounded-2xl transition-all border-2 border-border hover:border-warning shadow-sm active:scale-95"
                                                title="Reset Pass"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleToggleActivo(u)}
                                                className={`p-3.5 rounded-2xl transition-all border-2 shadow-sm active:scale-95 ${activo ? 'bg-white text-danger border-border hover:bg-danger hover:text-white hover:border-danger' : 'bg-white text-secondary border-border hover:bg-secondary hover:text-white hover:border-secondary'}`}
                                            >
                                                {activo ? (
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
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
