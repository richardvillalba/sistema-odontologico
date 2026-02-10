import { useState, useEffect, useCallback } from 'react';
import { billingService } from '../services/api';

/**
 * Hook para gestionar las alertas de timbrados de forma global.
 * @param {Object} options 
 * @param {number} options.empresaId - ID de la empresa.
 * @param {number} options.usuarioId - ID del usuario (opcional, para filtrar por sus puntos asignados).
 */
export const useTimbradoAlerts = ({ empresaId = 1, usuarioId = null } = {}) => {
    const [alertas, setAlertas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadAlertas = useCallback(async () => {
        try {
            setLoading(true);
            // Pasamos usuario_id como parámetro de consulta
            const response = await billingService.getAlertasTimbrados(empresaId, 30, 100, usuarioId);
            setAlertas(response.data.items || []);
            setError(null);
        } catch (err) {
            console.error("Error cargando alertas de timbrados:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [empresaId, usuarioId]);

    useEffect(() => {
        loadAlertas();

        // Polling cada 5 minutos para mantener las alertas frescas
        const interval = setInterval(loadAlertas, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [loadAlertas]);

    return {
        alertas,
        loading,
        error,
        refetch: loadAlertas,
        count: alertas.length,
        hasCritical: alertas.some(a => a.tipo_alerta === 'VENCIDO' || a.tipo_alerta === 'AGOTADO')
    };
};
