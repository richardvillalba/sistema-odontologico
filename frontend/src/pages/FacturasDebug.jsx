import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { billingService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const FacturasDebug = () => {
    const { empresaActiva } = useAuth();
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['facturas-debug', empresaActiva?.empresa_id],
        queryFn: () => {
            const params = {
                empresa_id: empresaActiva?.empresa_id
            };
            return billingService.getFacturas(params);
        },
        enabled: !!empresaActiva?.empresa_id,
    });

    console.log('=== FACTURAS DEBUG ===');
    console.log('isLoading:', isLoading);
    console.log('isError:', isError);
    console.log('error:', error);
    console.log('data:', data);
    console.log('data?.data:', data?.data);
    console.log('data?.data?.items:', data?.data?.items);
    console.log('======================');

    if (isLoading) return <div>Cargando...</div>;
    if (isError) return <div>Error: {error?.message || 'Error desconocido'}</div>;

    const facturas = data?.data?.items || [];

    return (
        <div style={{ padding: '20px' }}>
            <h1>DEBUG - Facturas</h1>
            <p>Total de facturas: {facturas.length}</p>
            <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
};

export default FacturasDebug;
