import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Paciente, PacienteFormData } from '../../types';
import { pacientesService } from '../../services';

const initialFormState: PacienteFormData = {
    numero_historia: '',
    nombre: '',
    apellido: '',
    documento_tipo: 'CI',
    documento_numero: '',
    fecha_nacimiento: '',
    genero: 'M',
    email: '',
    telefono_principal: '',
    telefono_secundario: '',
    direccion_calle: '',
    direccion_ciudad: '',
    codigo_postal: '',
    contacto_emergencia_nombre: '',
    contacto_emergencia_telefono: '',
    contacto_emergencia_relacion: '',
    alergias: '',
    medicamentos_actuales: '',
    enfermedades_cronicas: '',
};

export default function PacienteForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState<PacienteFormData>(initialFormState);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isEdit && id) {
            loadPaciente(parseInt(id));
        }
    }, [id]);

    const loadPaciente = async (pacienteId: number) => {
        try {
            setLoading(true);
            const data = await pacientesService.getById(pacienteId);
            // Construct form data from patient data
            const { paciente_id, fecha_creacion, creado_por, fecha_modificacion, modificado_por, activo, ...rest } = data;
            setFormData(rest as PacienteFormData);
        } catch (err) {
            console.error('Error loading patient:', err);
            setError('No se pudo cargar la información del paciente.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            setError(null);
            if (isEdit && id) {
                await pacientesService.update(parseInt(id), formData);
            } else {
                await pacientesService.create(formData);
            }
            navigate('/pacientes');
        } catch (err) {
            console.error('Error saving patient:', err);
            setError('Ocurrió un error al guardar los datos del paciente.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Cargando datos...</div>;

    return (
        <div className="card max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2>{isEdit ? 'Editar Paciente' : 'Nuevo Paciente'}</h2>
                <button type="button" onClick={() => navigate('/pacientes')} className="bg-gray-100 text-gray-700">
                    Cancelar
                </button>
            </div>

            {error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info Section */}
                <section>
                    <h3 className="border-b pb-2 mb-4 text-primary">Información Básica</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium mb-1">Cédula/Documento</label>
                            <div className="flex gap-2">
                                <select
                                    name="documento_tipo"
                                    value={formData.documento_tipo}
                                    onChange={handleChange}
                                    className="w-24"
                                >
                                    <option value="CI">CI</option>
                                    <option value="RUC">RUC</option>
                                    <option value="DNI">DNI</option>
                                    <option value="PAS">PAS</option>
                                </select>
                                <input
                                    type="text"
                                    name="documento_numero"
                                    value={formData.documento_numero}
                                    onChange={handleChange}
                                    placeholder="Número"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Nombres</label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Apellidos</label>
                            <input
                                type="text"
                                name="apellido"
                                value={formData.apellido}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Fecha Nacimiento</label>
                            <input
                                type="date"
                                name="fecha_nacimiento"
                                value={formData.fecha_nacimiento}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Género</label>
                            <select name="genero" value={formData.genero} onChange={handleChange}>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                                <option value="O">Otro</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Nº Historia Clínica</label>
                            <input
                                type="text"
                                name="numero_historia"
                                value={formData.numero_historia}
                                onChange={handleChange}
                                placeholder="Ej: HC-001"
                            />
                        </div>
                    </div>
                </section>

                {/* Contact Info */}
                <section>
                    <h3 className="border-b pb-2 mb-4 text-primary">Contacto y Dirección</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Teléfono Principal</label>
                            <input
                                type="tel"
                                name="telefono_principal"
                                value={formData.telefono_principal}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Ciudad</label>
                            <input
                                type="text"
                                name="direccion_ciudad"
                                value={formData.direccion_ciudad}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium mb-1">Dirección</label>
                            <input
                                type="text"
                                name="direccion_calle"
                                value={formData.direccion_calle}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </section>

                {/* Medical Info */}
                <section>
                    <h3 className="border-b pb-2 mb-4 text-primary">Información Médica</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Alergias</label>
                            <textarea
                                name="alergias"
                                value={formData.alergias}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Describa alergias si tiene..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Enfermedades Crónicas</label>
                            <textarea
                                name="enfermedades_cronicas"
                                value={formData.enfermedades_cronicas}
                                onChange={handleChange}
                                rows={3}
                            />
                        </div>
                    </div>
                </section>

                <div className="flex justify-end gap-4 pt-4 border-t">
                    <button
                        type="button"
                        onClick={() => navigate('/pacientes')}
                        className="bg-white text-gray-700 border border-gray-300"
                    >
                        Volver
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                    >
                        {saving ? 'Guardando...' : 'Guardar Paciente'}
                    </button>
                </div>
            </form>
        </div>
    );
}
