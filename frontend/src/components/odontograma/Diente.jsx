import React from 'react';

/**
 * Componente Diente Interactivo
 * Renderiza un diente con 5 superficies clickeables (FDI standard)
 * 
 * @param {string} numero - Número FDI del diente (ej. "11")
 * @param {object} hallazgos - Objeto con los hallazgos actuales { vestibular: 'caries', mesial: 'restauracion', ... }
 * @param {function} onClick - Función al hacer clic en una superficie (diente, superficie)
 */
const Diente = ({ numero, hallazgos = {}, onClick }) => {

    const getSurfaceColor = (surface) => {
        const estado = hallazgos[surface];
        switch (estado) {
            case 'caries': return '#F87171'; // Rojo
            case 'restauracion': return '#60A5FA'; // Azul
            case 'endodoncia': return '#FBBF24'; // Amarillo
            default: return '#F1F5F9'; // Slate-100 (Saludable)
        }
    };

    const handleSurfaceClick = (surface) => {
        if (onClick) onClick(numero, surface);
    };

    return (
        <div className="flex flex-col items-center group">
            {/* Etiqueta del Diente */}
            <span className="text-[10px] font-black text-slate-400 mb-2 group-hover:text-primary transition-colors">
                {numero}
            </span>

            {/* SVG del Diente (5 superficies) */}
            <svg
                viewBox="0 0 100 100"
                className="w-12 h-12 dr-diente cursor-pointer drop-shadow-sm group-hover:drop-shadow-md transition-all scale-100 group-hover:scale-110"
            >
                {/* Superficie Superior (Vestibular/Palatina dependiendo de arcada) */}
                <path
                    d="M20,20 L80,20 L70,30 L30,30 Z"
                    fill={getSurfaceColor('top')}
                    stroke="#CBD5E1"
                    strokeWidth="1"
                    onClick={() => handleSurfaceClick('top')}
                    className="hover:opacity-80 transition-opacity"
                />

                {/* Superficie Inferior (Lingual/Vestibular) */}
                <path
                    d="M20,80 L80,80 L70,70 L30,70 Z"
                    fill={getSurfaceColor('bottom')}
                    stroke="#CBD5E1"
                    strokeWidth="1"
                    onClick={() => handleSurfaceClick('bottom')}
                    className="hover:opacity-80 transition-opacity"
                />

                {/* Superficie Izquierda (Mesial/Distal) */}
                <path
                    d="M20,20 L20,80 L30,70 L30,30 Z"
                    fill={getSurfaceColor('left')}
                    stroke="#CBD5E1"
                    strokeWidth="1"
                    onClick={() => handleSurfaceClick('left')}
                    className="hover:opacity-80 transition-opacity"
                />

                {/* Superficie Derecha (Distal/Mesial) */}
                <path
                    d="M80,20 L80,80 L70,70 L70,30 Z"
                    fill={getSurfaceColor('right')}
                    stroke="#CBD5E1"
                    strokeWidth="1"
                    onClick={() => handleSurfaceClick('right')}
                    className="hover:opacity-80 transition-opacity"
                />

                {/* Superficie Central (Oclusal/Incisal) */}
                <path
                    d="M30,30 L70,30 L70,70 L30,70 Z"
                    fill={getSurfaceColor('center')}
                    stroke="#CBD5E1"
                    strokeWidth="1"
                    onClick={() => handleSurfaceClick('center')}
                    className="hover:opacity-100 group/center"
                >
                    <title>Diente {numero} - Oclusal</title>
                </path>

                {/* Líneas Divisorias para mejor estética */}
                <line x1="20" y1="20" x2="30" y2="30" stroke="#CBD5E1" strokeWidth="0.5" />
                <line x1="80" y1="20" x2="70" y2="30" stroke="#CBD5E1" strokeWidth="0.5" />
                <line x1="20" y1="80" x2="30" y2="70" stroke="#CBD5E1" strokeWidth="0.5" />
                <line x1="80" y1="80" x2="70" y2="70" stroke="#CBD5E1" strokeWidth="0.5" />
            </svg>
        </div>
    );
};

export default Diente;
