import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './styles/App.css'
import Home from './pages/Home'
import Pacientes from './pages/Pacientes'
import PacienteForm from './components/pacientes/PacienteForm'
import PacienteDetail from './components/pacientes/PacienteDetail'

function App() {
    return (
        <Router>
            <div className="app">
                <nav className="bg-white shadow-sm p-4 sticky top-0 z-10 border-b border-border">
                    <div className="container mx-auto flex items-center justify-between">
                        <div className="flex gap-10 items-center">
                            <Link to="/" className="font-bold text-2xl text-primary flex items-center gap-2 tracking-tight">
                                <span className="text-3xl">🦷</span>
                                <span className="hidden sm:inline">PRO-ODONTO</span>
                            </Link>
                            <div className="flex gap-6 items-center">
                                <Link to="/" className="text-text-secondary hover:text-primary font-semibold transition-colors">Inicio</Link>
                                <Link to="/pacientes" className="text-text-secondary hover:text-primary font-semibold transition-colors">Pacientes</Link>
                                <Link to="/citas" className="text-text-secondary hover:text-primary font-semibold transition-colors opacity-50 cursor-not-allowed">Citas</Link>
                                <Link to="/facturacion" className="text-text-secondary hover:text-primary font-semibold transition-colors opacity-50 cursor-not-allowed">Facturación</Link>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex flex-col items-end mr-2">
                                <span className="text-sm font-bold text-text-primary">Dr. Administrador</span>
                                <span className="text-xs text-text-muted">Clínica Central</span>
                            </div>
                            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                AD
                            </div>
                        </div>
                    </div>
                </nav>

                <main className="flex-1 py-8">
                    <Routes>
                        <Route path="/" element={<Home />} />

                        {/* Pacientes Routes */}
                        <Route path="/pacientes" element={<Pacientes />} />
                        <Route path="/pacientes/nuevo" element={<PacienteForm />} />
                        <Route path="/pacientes/editar/:id" element={<PacienteForm />} />
                        <Route path="/pacientes/detalle/:id" element={<PacienteDetail />} />

                        {/* 404 Redirect to home */}
                        <Route path="*" element={<Home />} />
                    </Routes>
                </main>

                <footer className="bg-white border-t border-border py-6 mt-12">
                    <div className="container mx-auto text-center text-text-muted text-sm">
                        &copy; {new Date().getFullYear()} PRO-ODONTO - Sistema de Gestión Odontológica Profesional. Todos los derechos reservados.
                    </div>
                </footer>
            </div>
        </Router>
    )
}

export default App
