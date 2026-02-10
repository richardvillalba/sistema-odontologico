import React, { useState, useEffect, useRef } from 'react';
import { pacientesService } from '../../services/api';

const PacienteSelector = ({ onSelect, selectedPaciente }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (searchTerm.length >= 2) {
                performSearch();
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(delaySearch);
    }, [searchTerm]);

    const performSearch = async () => {
        setLoading(true);
        try {
            const response = await pacientesService.search(searchTerm);
            setResults(response.data.items || []);
            setIsOpen(true);
        } catch (error) {
            console.error("Error searching patients:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (paciente) => {
        onSelect(paciente);
        setSearchTerm('');
        setResults([]);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            {!selectedPaciente ? (
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
                    <input
                        type="text"
                        placeholder="Buscar paciente por nombre o documento..."
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => searchTerm.length >= 2 && setIsOpen(true)}
                    />
                    {loading && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-indigo-50 border-2 border-indigo-100 rounded-2xl p-4 flex items-center justify-between group animate-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
                            {selectedPaciente.nombre?.charAt(0)}{selectedPaciente.apellido?.charAt(0)}
                        </div>
                        <div>
                            <p className="font-black text-indigo-900 leading-tight">
                                {selectedPaciente.nombre_completo || `${selectedPaciente.nombre} ${selectedPaciente.apellido}`}
                            </p>
                            <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest mt-0.5">
                                ID: {selectedPaciente.documento_numero} • HC: {selectedPaciente.numero_historia}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => onSelect(null)}
                        className="p-2 hover:bg-indigo-100 rounded-lg text-indigo-400 group-hover:text-indigo-600 transition-colors"
                    >
                        Cambiar
                    </button>
                </div>
            )}

            {isOpen && results.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                    {results.map((p) => (
                        <div
                            key={p.paciente_id}
                            className="p-4 hover:bg-slate-50 cursor-pointer flex items-center gap-4 border-b border-slate-50 last:border-b-0"
                            onClick={() => handleSelect(p)}
                        >
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                                {p.nombre?.charAt(0)}{p.apellido?.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-slate-800">{p.nombre_completo || `${p.nombre} ${p.apellido}`}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase">DOC: {p.documento_numero}</p>
                            </div>
                            <div className="text-indigo-600 font-black text-[10px] uppercase bg-indigo-50 px-2 py-1 rounded-md">
                                Seleccionar
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PacienteSelector;
