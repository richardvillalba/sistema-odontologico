import { Link, useLocation, useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { name: 'Inicio', path: '/', icon: '📊' },
        { name: 'Pacientes', path: '/pacientes', icon: '👥' },
        { name: 'Citas', path: '/citas', icon: '📅' },
        { name: 'Agenda', path: '/agenda', icon: '🕒' },
        { name: 'Historias', path: '/historias', icon: '📋' },
        { name: 'Tratamientos', path: '/tratamientos', icon: '💊' },
    ];

    return (
        <div className="flex h-screen bg-slate-100">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
                <div className="p-6">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <span className="text-3xl">🦷</span> Pro-Odonto
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-4">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                    ? 'bg-primary text-white shadow-lg'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-2">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold">
                            AD
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">Dr. Administrador</p>
                            <p className="text-xs text-slate-500 truncate">Clínica Central</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
                    <div className="flex items-center gap-6">
                        {location.pathname !== '/' && (
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-2 group transition-all"
                            >
                                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 group-hover:border-primary group-hover:text-primary transition-all shadow-sm">
                                    ←
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Volver</span>
                                    <h2 className="text-lg font-black text-slate-800 leading-tight">
                                        {menuItems.find(i => i.path === location.pathname)?.name || 'Detalle'}
                                    </h2>
                                </div>
                            </button>
                        )}
                        {location.pathname === '/' && (
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Inicio</h2>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                            🔔
                        </button>
                        <div className="h-8 w-px bg-slate-200"></div>
                        <button className="text-sm font-medium text-slate-600 hover:text-primary">
                            Cerrar Sesión
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
