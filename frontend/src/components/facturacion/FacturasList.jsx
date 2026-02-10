import React from 'react';
import { useNavigate } from 'react-router-dom';

const FacturasList = ({ facturas, loading, error }) => {
    const navigate = useNavigate();

    const getStatusStyle = (estado) => {
        switch (estado) {
            case 'BORRADOR':
                return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'PENDIENTE':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'PAGADA':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'PARCIAL':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'ANULADA':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (loading) return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                <p className="text-sm text-gray-500 font-medium">Cargando facturas...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="bg-red-50 border border-red-100 p-8 rounded-xl text-center">
            <p className="text-red-600 font-medium">{error}</p>
        </div>
    );

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in text-slate-900">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Número</th>
                            <th className="px-6 py-4">Fecha</th>
                            <th className="px-6 py-4">Paciente</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Pendiente</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {facturas.length > 0 ? (
                            facturas.map((factura) => (
                                <tr key={factura.factura_id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4 font-mono font-bold text-indigo-700">
                                        {factura.numero_factura_completo}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {new Date(factura.fecha_emision).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900">{factura.nombre_paciente}</div>
                                        <div className="text-xs text-gray-500">{factura.numero_documento_paciente}</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900">
                                        {new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(factura.total)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`font-semibold ${factura.saldo_pendiente > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(factura.saldo_pendiente)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(factura.estado)}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${factura.estado === 'PENDIENTE' || factura.estado === 'PARCIAL' ? 'bg-amber-500 animate-pulse' :
                                                    factura.estado === 'PAGADA' ? 'bg-green-500' :
                                                        factura.estado === 'ANULADA' ? 'bg-red-500' : 'bg-gray-500'
                                                }`}></span>
                                            {factura.estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => navigate(`/facturas/${factura.factura_id}`)}
                                            className="text-indigo-600 hover:text-indigo-900 font-bold text-xs uppercase"
                                        >
                                            Ver Detalle
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-lg font-medium text-gray-900">No se encontraron facturas</p>
                                        <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FacturasList;
