import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { billingService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const PointOfSaleContext = createContext();

export const usePointOfSale = () => {
    const context = useContext(PointOfSaleContext);
    if (!context) {
        throw new Error('usePointOfSale must be used within a PointOfSaleProvider');
    }
    return context;
};

export const PointOfSaleProvider = ({ children }) => {
    const location = useLocation();
    const { usuario, empresaActiva } = useAuth();
    const [points, setPoints] = useState([]);
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showSelector, setShowSelector] = useState(false);
    const [isMandatory, setIsMandatory] = useState(false);
    const [error, setError] = useState(null);

    const usuarioId = usuario?.usuario_id || null;

    // Rutas que requieren un punto de expedición activo y válido
    const billingRoutes = ['/facturacion', '/facturas', '/pagos'];
    const isBillingPath = billingRoutes.some(r => location.pathname.startsWith(r));

    const checkPointStatus = (p) => {
        if (!p) return { valid: false, reason: 'No seleccionado' };

        const isExpired = p.fecha_vencimiento && new Date(p.fecha_vencimiento) < new Date();
        const isExhausted = p.numeros_disponibles !== undefined && p.numeros_disponibles <= 0;

        if (isExpired) return { valid: false, reason: 'vencido', critical: true };
        if (isExhausted) return { valid: false, reason: 'agotado', critical: true };

        return { valid: true };
    };

    const empresaId = empresaActiva?.empresa_id || null;

    const fetchPoints = async (currentSelectedPointId = null) => {
        setIsLoading(true);
        try {
            const response = await billingService.getPointsByUsuario(usuarioId);
            const allPoints = response.data.items || [];

            // Filtrar puntos por la empresa activa
            const activePoints = empresaId
                ? allPoints.filter(p => Number(p.empresa_id) === Number(empresaId))
                : allPoints;
            setPoints(activePoints);

            // Prioridad: 1) ID pasado como parámetro, 2) sessionStorage, 3) punto actual
            const savedPointId = sessionStorage.getItem('selectedPointId');
            const pointIdToFind = currentSelectedPointId || (savedPointId ? Number(savedPointId) : null);

            if (pointIdToFind) {
                const found = activePoints.find(p => p.timbrado_id === pointIdToFind);
                if (found) {
                    setSelectedPoint(found);
                } else {
                    // El punto guardado no pertenece a esta empresa, limpiar
                    setSelectedPoint(null);
                    sessionStorage.removeItem('selectedPointId');
                }
            } else if (activePoints.length === 1) {
                const status = checkPointStatus(activePoints[0]);
                if (status.valid) {
                    setSelectedPoint(activePoints[0]);
                    sessionStorage.setItem('selectedPointId', activePoints[0].timbrado_id);
                }
            }
            setError(null);
        } catch (err) {
            console.error("Error fetching user points:", err);
            if (isBillingPath) {
                setError("Error al cargar sus puntos de expedición.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Recargar cuando cambie el usuario o la empresa activa
    useEffect(() => {
        if (usuarioId) {
            fetchPoints();
        }
    }, [usuarioId, empresaId]);

    // Validación automática al cambiar de ruta
    useEffect(() => {
        if (!isLoading) {
            const status = checkPointStatus(selectedPoint);
            if (isBillingPath) {
                if (!selectedPoint || !status.valid) {
                    setShowSelector(true);
                    setIsMandatory(true);
                    if (!selectedPoint) setError("Debe seleccionar un punto para facturar.");
                    else setError(`Su punto seleccionado está ${status.reason}.`);
                }
            } else {
                setIsMandatory(false);
            }
        }
    }, [location.pathname, selectedPoint, isLoading]);

    const selectPoint = (point) => {
        const status = checkPointStatus(point);
        if (isBillingPath && !status.valid) {
            setError(`No puede usar este punto: está ${status.reason}.`);
            return;
        }

        setSelectedPoint(point);
        sessionStorage.setItem('selectedPointId', point.timbrado_id);
        setShowSelector(false);
        setIsMandatory(false);
        setError(null);
    };

    const value = useMemo(() => ({
        points,
        selectedPoint,
        isLoading,
        showSelector,
        setShowSelector,
        isMandatory,
        error,
        selectPoint,
        refreshPoints: fetchPoints,
        isValid: checkPointStatus(selectedPoint).valid
    }), [points, selectedPoint, isLoading, showSelector, isMandatory, error]);

    return (
        <PointOfSaleContext.Provider value={value}>
            {children}
        </PointOfSaleContext.Provider>
    );
};
