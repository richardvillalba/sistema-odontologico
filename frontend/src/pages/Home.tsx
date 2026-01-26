import { useState, useEffect } from 'react'

function Home() {
    const [message] = useState('Sistema de Gestión Odontológica')

    useEffect(() => {
        document.title = 'Sistema de Odontología'
    }, [])

    return (
        <div className="home">
            <header className="header">
                <div className="header-content">
                    <h1>🦷 {message}</h1>
                    <p className="subtitle">Plataforma integral para consultorios dentales</p>
                </div>
            </header>

            <main className="main-content">
                <div className="welcome-card">
                    <h2>Bienvenido al Sistema</h2>
                    <p>Frontend inicializado con React + TypeScript + Vite</p>

                    <div className="modules-grid">
                        <div className="module-card">
                            <h3>👥 Pacientes</h3>
                            <p>Gestión completa de pacientes</p>
                        </div>

                        <div className="module-card">
                            <h3>📅 Citas</h3>
                            <p>Agenda y programación</p>
                        </div>

                        <div className="module-card">
                            <h3>📋 Historia Clínica</h3>
                            <p>Registro médico detallado</p>
                        </div>

                        <div className="module-card">
                            <h3>🦷 Odontograma</h3>
                            <p>Odontograma digital FDI</p>
                        </div>

                        <div className="module-card">
                            <h3>💊 Tratamientos</h3>
                            <p>Catálogo y seguimiento</p>
                        </div>

                        <div className="module-card">
                            <h3>💰 Facturación</h3>
                            <p>Facturación electrónica Paraguay</p>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="footer">
                <p>Sistema de Odontología v0.1.0 - React + Oracle + ORDS</p>
            </footer>
        </div>
    )
}

export default Home
