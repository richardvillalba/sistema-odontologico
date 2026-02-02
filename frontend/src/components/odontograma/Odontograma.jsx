import React, { useState } from 'react';
import Diente from './Diente';

const Odontograma = () => {
    // Ejemplo de estado inicial de hallazgos
    const [hallazgos, setHallazgos] = useState({
        '11': { center: 'caries' },
        '24': { top: 'restauracion' },
        '46': { center: 'endodoncia' },
    });

    const arcadaSuperior = [
        ['18', '17', '16', '15', '14', '13', '12', '11'],
        ['21', '22', '23', '24', '25', '26', '27', '28']
    ];

    const arcadaInferior = [
        ['48', '47', '46', '45', '44', '43', '42', '41'],
        ['31', '32', '33', '34', '35', '36', '37', '38']
    ];

    const handleDienteClick = (numero, superficie) => {
        console.log(`Diente ${numero}, Superficie: ${superficie}`);
        // Aquí se abriría un modal para elegir el hallazgo
    };

    const renderArcada = (arcada) => (
        <div className="flex flex-col gap-8">
            <div className="flex justify-center gap-4 md:gap-8 flex-wrap">
                {arcada[0].map(num => (
                    <Diente
                        key={num}
                        numero={num}
                        hallazgos={hallazgos[num]}
                        onClick={handleDienteClick}
                    />
                ))}
                {/* Divisor central */}
                <div className="w-px bg-slate-200 h-16 self-end mx-4 hidden md:block"></div>
                {arcada[1].map(num => (
                    <Diente
                        key={num}
                        numero={num}
                        hallazgos={hallazgos[num]}
                        onClick={handleDienteClick}
                    />
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-12 p-4 md:p-8 animate-in fade-in duration-1000">
            {/* Leyenda y Herramientas */}
            <div className="flex flex-wrap items-center justify-between gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-inner">
                <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-[#F87171] shadow-sm"></div>
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Caries</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-[#60A5FA] shadow-sm"></div>
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Restauración</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-[#FBBF24] shadow-sm"></div>
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Endodoncia</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-slate-200 shadow-sm"></div>
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Sano</span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm">
                        🔄 Resetear Vista
                    </button>
                    <button className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-600 transition-all shadow-lg shadow-primary/20">
                        💾 Guardar Cambios
                    </button>
                </div>
            </div>

            {/* Mapa Dental Principal */}
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl overflow-x-auto">
                <div className="min-w-[800px] space-y-16">
                    {/* Sección Superior */}
                    <div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] text-center mb-8">Arcada Superior</p>
                        {renderArcada(arcadaSuperior)}
                    </div>

                    {/* Separador Horizontal */}
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent"></div>

                    {/* Sección Inferior */}
                    <div>
                        {renderArcada(arcadaInferior)}
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] text-center mt-8">Arcada Inferior</p>
                    </div>
                </div>
            </div>

            {/* Info adicional */}
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl flex items-start gap-4">
                <span className="text-2xl">💡</span>
                <div>
                    <p className="text-blue-900 font-bold mb-1">Instrucciones de Uso</p>
                    <p className="text-blue-700 text-sm leading-relaxed">Selecciona una cara específica de cualquier diente para registrar un nuevo hallazgo clínico. El sistema guardará automáticamente la evolución dental del paciente.</p>
                </div>
            </div>
        </div>
    );
};

export default Odontograma;
