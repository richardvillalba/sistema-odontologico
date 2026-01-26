import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paciente } from '../../types';
import { pacientesService } from '../../services';

export default function PacientesList() {
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadPacientes();
    }, []);

    const loadPacientes = async () => {
        try {
            setLoading(true);
            const response = await pacientesService.getAll();
            setPacientes(response.items || []);
            setError(null);
        } catch (err) {
            console.error('Error loading patients:', err);
            // Fallback data for demo purposes if API fails
            if (import.meta.env.DEV) {
                setPacientes(MOCK_PACIENTES);
                setError(null);
            } else {
                setError('Error al cargar la lista de pacientes.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number, nombre: string) => {
        if (window.confirm(`¿Está seguro de eliminar a ${nombre}?`)) {
            try {
                await pacientesService.delete(id);
                loadPacientes();
            } catch (err) {
                alert('No se pudo eliminar el paciente.');
            }
        }
    }

    if (loading) return (
        <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="card border-none shadow-sm overflow-hidden">
            {error && (
                <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg mx-4 mt-4">
                    {error}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-secondary text-text-secondary uppercase text-xs tracking-wider">
                            <th className="p-4 font-bold">Historia</th>
                            <th className="p-4 font-bold">Paciente</th>
                            <th className="p-4 font-bold">Documento</th>
                            <th className="p-4 font-bold">Teléfono</th>
                            <th className="p-4 font-bold text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {pacientes.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-text-muted">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-4xl">👥</span>
                                        <p>No se encontraron pacientes registrados.</p>
                                        <button
                                            onClick={() => navigate('/pacientes/nuevo')}
                                            className="bg-transparent text-primary hover:underline"
                                        >
                                            Crear el primero ahora
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            pacientes.map((paciente) => (
                                <tr key={paciente.paciente_id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="p-4 font-mono text-sm font-medium text-primary">
                                        {paciente.numero_historia}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-semibold">{paciente.nombre} {paciente.apellido}</div>
                                        <div className="text-xs text-text-muted">{paciente.email || 'Sin email'}</div>
                                    </td>
                                    <td className="p-4 text-sm">
                                        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold mr-1">{paciente.documento_tipo}</span>
                                        {paciente.documento_numero}
                                    </td>
                                    <td className="p-4 text-sm">{paciente.telefono_principal}</td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                className="bg-primary/10 text-primary p-2 rounded-lg hover:bg-primary hover:text-white transition-all"
                                                title="Ver Detalle"
                                                onClick={() => navigate(`/pacientes/detalle/${paciente.paciente_id}`)}
                                            >
                                                👁️
                                            </button>
                                            <button
                                                className="bg-green-100/50 text-green-700 p-2 rounded-lg hover:bg-green-600 hover:text-white transition-all"
                                                title="Editar"
                                                onClick={() => navigate(`/pacientes/editar/${paciente.paciente_id}`)}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                                                title="Eliminar"
                                                onClick={() => handleDelete(paciente.paciente_id, `${paciente.nombre} ${paciente.apellido}`)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const MOCK_PACIENTES: Paciente[] = [
    {
        paciente_id: 1,
        numero_historia: 'OD-2024-001',
        nombre: 'Juan Carlos',
        apellido: 'Perez Rojas',
        documento_tipo: 'CI',
        documento_numero: '1.234.567',
        fecha_nacimiento: '1990-05-15',
        genero: 'M',
        email: 'juan.perez@email.com',
        telefono_principal: '0981-111-222',
        direccion_ciudad: 'Asunción',
        direccion_calle: 'Av. España 1234'
    },
    {
        paciente_id: 2,
        numero_historia: 'OD-2024-002',
        nombre: 'Maria Elena',
        apellido: 'Benitez Troche',
        documento_tipo: 'CI',
        documento_numero: '3.456.789',
        fecha_nacimiento: '1995-10-20',
        genero: 'F',
        email: 'maria.b@email.com',
        telefono_principal: '0971-333-444',
        direccion_ciudad: 'Luque',
        direccion_calle: 'General Aquino 567'
    },
    {
        paciente_id: 3,
        numero_historia: 'OD-2024-003',
        nombre: 'Carlos Enrique',
        apellido: 'Gonzalez Silva',
        documento_tipo: 'CI',
        documento_numero: '2.876.543',
        fecha_nacimiento: '1985-03-08',
        genero: 'M',
        email: 'carlos.g@email.com',
        telefono_principal: '0991-555-666',
        direccion_ciudad: 'San Lorenzo',
        direccion_calle: 'Mariscal Estigarribia 890'
    }
];
