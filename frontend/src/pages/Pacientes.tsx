import { useNavigate } from 'react-router-dom';
import PacientesList from '../components/pacientes/PacientesList';

export default function Pacientes() {
    const navigate = useNavigate();

    return (
        <div className="container mx-auto p-4">
            <header className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Pacientes</h1>
                    <p className="text-gray-600">Administre la información de sus pacientes e historias clínicas.</p>
                </div>
                <button
                    onClick={() => navigate('/pacientes/nuevo')}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl shadow-md transition-all h-fit"
                >
                    <span className="text-xl leading-none">+</span> Nuevo Paciente
                </button>
            </header>

            <main>
                <PacientesList />
            </main>
        </div>
    );
}
