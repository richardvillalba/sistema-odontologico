import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Paciente } from '../../types';
import { pacientesService } from '../../services';

export default function PacienteDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [paciente, setPaciente] = useState<Paciente | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            loadPaciente(parseInt(id));
        }
    }, [id]);

    const loadPaciente = async (pacienteId: number) => {
        try {
            setLoading(true);
            const data = await pacientesService.getById(pacienteId);
            setPaciente(data);
        } catch (err) {
            console.error('Error loading patient detail:', err);
            setError('No se pudo encontrar el paciente solicitado.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!paciente) return;
        if (window.confirm(`¿Está seguro de que desea eliminar al paciente ${paciente.nombre} ${paciente.apellido}?`)) {
            try {
                await pacientesService.delete(paciente.paciente_id);
                navigate('/pacientes');
            } catch (err) {
                alert('Error al intentar eliminar el paciente.');
            }
        }
    };

    if (loading) return <div className="p-8 text-center">Cargando detalles...</div>;
    if (error || !paciente) {
        return (
            <div className="card text-center py-12">
                <h2 className="text-red-600 mb-4">{error || 'Paciente no encontrado'}</h2>
                <button onClick={() => navigate('/pacientes')}>Volver a la lista</button>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-5xl">
            {/* Header Actions */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/pacientes')}
                        className="p-2 rounded-full hover:bg-gray-100 bg-transparent text-gray-600"
                    >
                        ←
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold mb-0">
                            {paciente.nombre} {paciente.apellido}
                        </h1>
                        <p className="text-text-muted">Historia Clínica: {paciente.numero_historia}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link to={`/pacientes/editar/${paciente.paciente_id}`} className="button bg-primary text-white px-4 py-2 rounded-md">
                        Editar Datos
                    </Link>
                    <button onClick={handleDelete} className="bg-red-100 text-red-600 border border-red-200">
                        Eliminar
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Info Card */}
                <div className="md:col-span-2 space-y-6">
                    <div className="card">
                        <h3 className="mb-4 text-primary">Información Personal</h3>
                        <div className="grid grid-cols-2 gap-y-4">
                            <div>
                                <p className="text-xs font-bold uppercase text-text-muted mb-1">Identificación</p>
                                <p>{paciente.documento_tipo} {paciente.documento_numero}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase text-text-muted mb-1">Género</p>
                                <p>{paciente.genero === 'M' ? 'Masculino' : paciente.genero === 'F' ? 'Femenino' : 'Otro'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase text-text-muted mb-1">Fecha de Nacimiento</p>
                                <p>{new Date(paciente.fecha_nacimiento).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase text-text-muted mb-1">Grupo Sanguíneo</p>
                                <p>{paciente.grupo_sanguineo || 'No especificado'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="mb-4 text-primary">Información Médica</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-bold uppercase text-text-muted mb-1">Alergias</p>
                                <p className={paciente.alergias ? 'text-red-600 font-medium' : ''}>
                                    {paciente.alergias || 'Sin alergias registradas'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase text-text-muted mb-1">Enfermedades Crónicas</p>
                                <p>{paciente.enfermedades_cronicas || 'Sin enfermedades registradas'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase text-text-muted mb-1">Medicamentos Actuales</p>
                                <p>{paciente.medicamentos_actuales || 'Ninguno'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="card">
                        <h3 className="mb-4 font-semibold">Contacto</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <span className="text-primary text-xl">📞</span>
                                <div>
                                    <p className="text-sm font-medium">Principal</p>
                                    <p className="text-sm">{paciente.telefono_principal}</p>
                                </div>
                            </div>
                            {paciente.telefono_secundario && (
                                <div className="flex items-start gap-3">
                                    <span className="text-primary text-xl">📱</span>
                                    <div>
                                        <p className="text-sm font-medium">Secundario</p>
                                        <p className="text-sm">{paciente.telefono_secundario}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-start gap-3">
                                <span className="text-primary text-xl">✉️</span>
                                <div>
                                    <p className="text-sm font-medium">Email</p>
                                    <p className="text-sm">{paciente.email || 'No disponible'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-primary text-xl">📍</span>
                                <div>
                                    <p className="text-sm font-medium">Dirección</p>
                                    <p className="text-sm">{paciente.direccion_calle}, {paciente.direccion_ciudad}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-surface-secondary border-none">
                        <h3 className="mb-4 font-semibold">Emergencia</h3>
                        {paciente.contacto_emergencia_nombre ? (
                            <div className="space-y-2">
                                <p className="text-sm font-bold">{paciente.contacto_emergencia_nombre}</p>
                                <p className="text-sm">{paciente.contacto_emergencia_telefono}</p>
                                <p className="text-xs text-text-muted italic">{paciente.contacto_emergencia_relacion}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-text-muted italic">Sin contacto de emergencia configurado</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Short-cuts link to other modules (Placeholders) */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="bg-white hover:bg-surface-secondary text-primary font-medium p-4 rounded-lg shadow-sm border border-border">
                    📅 Nueva Cita
                </button>
                <button className="bg-white hover:bg-surface-secondary text-primary font-medium p-4 rounded-lg shadow-sm border border-border">
                    🦷 Odontograma
                </button>
                <button className="bg-white hover:bg-surface-secondary text-primary font-medium p-4 rounded-lg shadow-sm border border-border">
                    📋 Nueva Historia
                </button>
                <button className="bg-white hover:bg-surface-secondary text-primary font-medium p-4 rounded-lg shadow-sm border border-border">
                    💰 Facturar
                </button>
            </div>
        </div>
    );
}
