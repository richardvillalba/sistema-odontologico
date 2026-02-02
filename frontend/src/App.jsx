import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';
import Pacientes from './pages/Pacientes';
import PacienteDetalle from './pages/PacienteDetalle';
import OdontogramaPaciente from './pages/OdontogramaPaciente';
import Citas from './pages/Citas';
import AgendaDoctor from './pages/AgendaDoctor';

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />

                        {/* Pacientes */}
                        <Route path="/pacientes" element={<Pacientes />} />
                        <Route path="/pacientes/:id" element={<PacienteDetalle />} />
                        <Route path="/pacientes/:id/odontograma" element={<OdontogramaPaciente />} />

                        {/* Citas & Agenda */}
                        <Route path="/citas" element={<Citas />} />
                        <Route path="/agenda" element={<AgendaDoctor />} />
                        <Route path="/agenda/:doctorId" element={<AgendaDoctor />} />

                        {/* Placeholders */}
                        <Route path="/historias" element={<div className="p-8 bg-white rounded-xl shadow-sm border border-slate-200 text-center font-bold">Historias Clínicas - Módulo en Desarrollo</div>} />
                        <Route path="/tratamientos" element={<div className="p-8 bg-white rounded-xl shadow-sm border border-slate-200 text-center font-bold">Catálogo de Tratamientos - Módulo en Desarrollo</div>} />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Layout>
            </Router>
        </QueryClientProvider>
    )
}

export default App
