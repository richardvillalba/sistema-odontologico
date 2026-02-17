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
import Historias from './pages/Historias';

import Configuraciones from './pages/Configuraciones';
import Compras from './pages/Compras';
import Proveedores from './pages/Proveedores';
import Articulos from './pages/Articulos';
import Inventario from './pages/Inventario';
import RegistroCompra from './pages/RegistroCompra';
import Timbrados from './pages/Timbrados';
import DatosClinica from './pages/configuraciones/DatosClinica';
import ConfiguracionCajas from './pages/configuraciones/ConfiguracionCajas';
import GestionEmpresas from './pages/configuraciones/GestionEmpresas';
import GestionSucursales from './pages/configuraciones/GestionSucursales';
import GestionUsuarios from './pages/GestionUsuarios';
import GestionRoles from './pages/GestionRoles';
import Facturas from './pages/Facturas';
import FacturasDebug from './pages/FacturasDebug';
import FacturaNueva from './pages/FacturaNueva';
import FacturaDetalle from './pages/FacturaDetalle';
import RegistrarPago from './pages/RegistrarPago';
import Caja from './pages/Caja';
import CajaDetalle from './pages/CajaDetalle';
import Tratamientos from './pages/Tratamientos';

import { PointOfSaleProvider } from './context/PointOfSaleContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import SinAcceso from './pages/SinAcceso';
import SeleccionContexto from './pages/SeleccionContexto';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30000, // Los datos se consideran frescos por 30 segundos
            cacheTime: 300000, // Mantener en caché por 5 minutos
            refetchOnWindowFocus: false, // No refrescar al volver a la ventana
            refetchOnMount: false, // No refrescar al montar si hay datos en caché
            retry: 1, // Solo 1 reintento en caso de error
        },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <Router>
                    <Routes>
                        {/* Ruta pública - Login */}
                        <Route path="/login" element={<Login />} />

                        {/* Ruta de error de acceso */}
                        <Route path="/sin-acceso" element={<SinAcceso />} />

                        {/* Seleccion de empresa/sucursal */}
                        <Route path="/seleccionar-contexto" element={
                            <ProtectedRoute skipContextCheck>
                                <SeleccionContexto />
                            </ProtectedRoute>
                        } />

                        {/* Rutas protegidas */}
                        <Route path="/*" element={
                            <ProtectedRoute>
                                <PointOfSaleProvider>
                                    <Layout>
                                        <Routes>
                                            <Route path="/" element={<Dashboard />} />

                                            {/* Pacientes */}
                                            <Route path="/pacientes" element={<Pacientes />} />
                                            <Route path="/pacientes/:id" element={<PacienteDetalle />} />
                                            <Route path="/pacientes/:id/odontograma" element={<OdontogramaPaciente />} />

                                            {/* Citas */}
                                            <Route path="/citas" element={<Citas />} />
                                            <Route path="/agenda" element={<AgendaDoctor />} />
                                            <Route path="/historias" element={<Historias />} />

                                            {/* Compras */}
                                            <Route path="/compras" element={<Compras />} />
                                            <Route path="/compras/proveedores" element={<Proveedores />} />
                                            <Route path="/compras/articulos" element={<Articulos />} />
                                            <Route path="/compras/inventario" element={<Inventario />} />
                                            <Route path="/compras/facturas/nueva" element={<RegistroCompra />} />

                                            {/* Facturación */}
                                            <Route path="/facturas" element={<Facturas />} />
                                            <Route path="/facturas-debug" element={<FacturasDebug />} />
                                            <Route path="/facturas/nueva" element={<FacturaNueva />} />
                                            <Route path="/facturas/:id" element={<FacturaDetalle />} />
                                            <Route path="/facturas/:id/registrar-pago" element={<RegistrarPago />} />

                                            {/* Configuraciones */}
                                            <Route path="/configuraciones" element={<Configuraciones />} />
                                            <Route path="/configuraciones/timbrados" element={<Timbrados />} />
                                            <Route path="/configuraciones/clinica" element={<DatosClinica />} />
                                            <Route path="/configuraciones/usuarios" element={<GestionUsuarios />} />
                                            <Route path="/configuraciones/roles" element={<GestionRoles />} />
                                            <Route path="/configuraciones/cajas" element={<ConfiguracionCajas />} />
                                            <Route path="/configuraciones/empresas" element={<GestionEmpresas />} />
                                            <Route path="/configuraciones/sucursales" element={<GestionSucursales />} />

                                            {/* Caja */}
                                            <Route path="/caja" element={<Caja />} />
                                            <Route path="/caja/:id" element={<CajaDetalle />} />

                                            {/* Tratamientos (dentro de Configuraciones) */}
                                            <Route path="/configuraciones/tratamientos" element={<Tratamientos />} />

                                            {/* Redirección por defecto */}
                                            <Route path="*" element={<Navigate to="/" replace />} />
                                        </Routes>
                                    </Layout>
                                </PointOfSaleProvider>
                            </ProtectedRoute>
                        } />
                    </Routes>
                </Router>
            </AuthProvider>
        </QueryClientProvider>
    )
}

export default App
