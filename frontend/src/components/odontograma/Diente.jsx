import React from 'react';

/**
 * Componente Diente Interactivo
 * Renderiza un diente con 5 superficies clickeables (FDI standard)
 * 
 * FDI Mapping:
 * O: Oclusal (Centro)
 * V: Vestibular (Superior para arcada superior, Inferior para inferior)
 * L/P: Lingual/Palatino (Inferior para superior, Superior para inferior)
 * M: Mesial (Izquierda/Derecha dependiendo del cuadrante)
 * D: Distal (Derecha/Izquierda dependiendo del cuadrante)
 */
const Diente = ({ numero, hallazgos = [], onClick }) => {
    const num = parseInt(numero);
    const cuadrante = Math.floor(num / 10);

    // Determinar orientación basada en cuadrante
    // Sup: 1, 2 | Inf: 3, 4
    const isUpper = cuadrante === 1 || cuadrante === 2;
    // Izq (desde vista dentista): 2, 3 | Der: 1, 4
    const isLeft = cuadrante === 2 || cuadrante === 3;

    const getSurfaceStatus = (surfaceCode) => {
        // Hallazgos es un array de { tipo_hallazgo, superficies_afectadas }
        const hallazgo = hallazgos.find(h =>
            h.superficies_afectadas?.split(',').includes(surfaceCode)
        );
        if (hallazgo) {
            if (hallazgo.tipo_hallazgo === 'CARIES') return 'caries';
            if (hallazgo.tipo_hallazgo === 'OBTURACION') return 'restauracion';
            return 'otro';
        }
        return 'sano';
    };

    const getSurfaceColor = (surfaceCode) => {
        const status = getSurfaceStatus(surfaceCode);
        switch (status) {
            case 'caries': return '#EF4444'; // Red-500
            case 'restauracion': return '#3B82F6'; // Blue-500
            case 'otro': return '#F59E0B'; // Amber-500
            default: return '#FFFFFF';
        }
    };

    const handleSurfaceClick = (e, surfaceCode) => {
        e.stopPropagation();
        if (onClick) onClick(numero, surfaceCode);
    };

    // Mapeo dinámico de Mesial y Distal
    // En cuadrantes 1 y 4, Mesial está a la izquierda (en vista frontal)
    // En cuadrantes 2 y 3, Mesial está a la derecha
    const mesialSurface = isLeft ? 'right' : 'left';
    const distalSurface = isLeft ? 'left' : 'right';

    // Mapeo dinámico de Vestibular y Palatino/Lingual
    const vestibularSurface = isUpper ? 'top' : 'bottom';
    const palatinoSurface = isUpper ? 'bottom' : 'top';
    const palatinoCode = isUpper ? 'P' : 'L';

    return (
        <div className="flex flex-col items-center group select-none">
            <span className="text-[10px] font-black text-slate-400 mb-2 group-hover:text-primary transition-colors">
                {numero}
            </span>

            <svg
                viewBox="0 0 100 100"
                className="w-10 h-10 sm:w-11 sm:h-11 filter drop-shadow-sm group-hover:drop-shadow-md transition-all scale-100 group-hover:scale-110 active:scale-95 touch-manipulation"
            >
                {/* Vestibular (V) */}
                <path
                    d="M5,5 L95,5 L75,25 L25,25 Z"
                    fill={getSurfaceColor('V')}
                    stroke="#94A3B8"
                    strokeWidth="2"
                    transform={!isUpper ? "rotate(180 50 50)" : ""}
                    onClick={(e) => handleSurfaceClick(e, 'V')}
                    className="hover:brightness-95 cursor-pointer transition-all active:fill-primary/20"
                >
                    <title>Vestibular</title>
                </path>

                {/* Palatino/Lingual (P/L) */}
                <path
                    d="M5,95 L95,95 L75,75 L25,75 Z"
                    fill={getSurfaceColor(palatinoCode)}
                    stroke="#94A3B8"
                    strokeWidth="2"
                    transform={!isUpper ? "rotate(180 50 50)" : ""}
                    onClick={(e) => handleSurfaceClick(e, palatinoCode)}
                    className="hover:brightness-95 cursor-pointer transition-all active:fill-primary/20"
                >
                    <title>{isUpper ? 'Palatino' : 'Lingual'}</title>
                </path>

                {/* Mesial (M) */}
                <path
                    d="M5,5 L5,95 L25,75 L25,25 Z"
                    fill={getSurfaceColor('M')}
                    stroke="#94A3B8"
                    strokeWidth="2"
                    transform={isLeft ? "rotate(180 50 50)" : ""}
                    onClick={(e) => handleSurfaceClick(e, 'M')}
                    className="hover:brightness-95 cursor-pointer transition-all active:fill-primary/20"
                >
                    <title>Mesial</title>
                </path>

                {/* Distal (D) */}
                <path
                    d="M95,5 L95,95 L75,75 L75,25 Z"
                    fill={getSurfaceColor('D')}
                    stroke="#94A3B8"
                    strokeWidth="2"
                    transform={isLeft ? "rotate(180 50 50)" : ""}
                    onClick={(e) => handleSurfaceClick(e, 'D')}
                    className="hover:brightness-95 cursor-pointer transition-all active:fill-primary/20"
                >
                    <title>Distal</title>
                </path>

                {/* Oclusal (O) */}
                <rect
                    x="25"
                    y="25"
                    width="50"
                    height="50"
                    fill={getSurfaceColor('O')}
                    stroke="#94A3B8"
                    strokeWidth="2"
                    onClick={(e) => handleSurfaceClick(e, 'O')}
                    className="hover:brightness-95 cursor-pointer transition-all active:fill-primary/20"
                >
                    <title>Oclusal</title>
                </rect>

                {/* Líneas Divisorias decorativas */}
                <line x1="5" y1="5" x2="25" y2="25" stroke="#CBD5E1" strokeWidth="1.5" pointerEvents="none" />
                <line x1="95" y1="5" x2="75" y2="25" stroke="#CBD5E1" strokeWidth="1.5" pointerEvents="none" />
                <line x1="5" y1="95" x2="25" y2="75" stroke="#CBD5E1" strokeWidth="1.5" pointerEvents="none" />
                <line x1="95" y1="95" x2="75" y2="75" stroke="#CBD5E1" strokeWidth="1.5" pointerEvents="none" />
            </svg>
        </div>
    );
};

export default Diente;
