CREATE OR REPLACE PACKAGE PKG_FACTURAS AS
    TYPE t_cursor IS REF CURSOR;

    -- ========================================
    -- SECCIÓN: TIMBRADOS
    -- ========================================
    
    PROCEDURE crear_timbrado(
        p_empresa_id         IN NUMBER,
        p_numero_timbrado    IN VARCHAR2,
        p_establecimiento    IN VARCHAR2,
        p_punto_expedicion   IN VARCHAR2,
        p_tipo_documento     IN VARCHAR2,
        p_numero_inicio      IN NUMBER,
        p_numero_fin         IN NUMBER,
        p_fecha_inicio       IN DATE,
        p_fecha_vencimiento  IN DATE,
        p_creado_por         IN NUMBER,
        p_timbrado_id        OUT NUMBER,
        p_resultado          OUT NUMBER,
        p_mensaje            OUT VARCHAR2
    );
    
    PROCEDURE actualizar_timbrado(
        p_timbrado_id        IN NUMBER,
        p_numero_timbrado    IN VARCHAR2 DEFAULT NULL,
        p_fecha_vencimiento  IN DATE DEFAULT NULL,
        p_modificado_por     IN NUMBER,
        p_resultado          OUT NUMBER,
        p_mensaje            OUT VARCHAR2
    );
    
    PROCEDURE cambiar_estado_timbrado(
        p_timbrado_id    IN NUMBER,
        p_activo         IN CHAR,
        p_modificado_por IN NUMBER,
        p_resultado      OUT NUMBER,
        p_mensaje        OUT VARCHAR2
    );
    
    PROCEDURE get_timbrados_empresa(
        p_empresa_id IN NUMBER,
        p_activo     IN CHAR DEFAULT NULL,
        p_cursor     OUT t_cursor,
        p_resultado  OUT NUMBER,
        p_mensaje    OUT VARCHAR2
    );
    
    PROCEDURE get_timbrado(
        p_timbrado_id IN NUMBER,
        p_cursor      OUT t_cursor,
        p_resultado   OUT NUMBER,
        p_mensaje     OUT VARCHAR2
    );
    
    PROCEDURE verificar_alertas_timbrados(
        p_empresa_id     IN NUMBER,
        p_dias_alerta    IN NUMBER DEFAULT 30,
        p_margen_numeros IN NUMBER DEFAULT 100,
        p_cursor         OUT t_cursor,
        p_resultado      OUT NUMBER,
        p_mensaje        OUT VARCHAR2
    );

    -- ========================================
    -- SECCIÓN: PUNTOS DE EXPEDICIÓN
    -- ========================================
    
    PROCEDURE asignar_punto_usuario(
        p_usuario_id    IN NUMBER,
        p_timbrado_id   IN NUMBER,
        p_asignado_por  IN NUMBER,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );
    
    PROCEDURE desactivar_punto_usuario(
        p_usuario_id     IN NUMBER,
        p_timbrado_id    IN NUMBER DEFAULT NULL,
        p_modificado_por IN NUMBER,
        p_resultado      OUT NUMBER,
        p_mensaje        OUT VARCHAR2
    );
    
    PROCEDURE get_punto_usuario(
        p_usuario_id IN NUMBER,
        p_cursor     OUT t_cursor,
        p_resultado  OUT NUMBER,
        p_mensaje    OUT VARCHAR2
    );

    -- ========================================
    -- SECCIÓN: FACTURAS
    -- ========================================
    
    PROCEDURE crear_factura(
        p_paciente_id           IN NUMBER,
        p_usuario_id            IN NUMBER,
        p_empresa_id            IN NUMBER,
        p_sucursal_id           IN NUMBER,
        p_tipo_factura          IN VARCHAR2 DEFAULT 'CONTADO',
        p_condicion_operacion   IN VARCHAR2 DEFAULT 'CONTADO',
        p_plazo_credito_dias    IN NUMBER DEFAULT NULL,
        p_observaciones         IN VARCHAR2 DEFAULT NULL,
        p_factura_id            OUT NUMBER,
        p_numero_factura        OUT VARCHAR2,
        p_resultado             OUT NUMBER,
        p_mensaje               OUT VARCHAR2
    );
    
    PROCEDURE agregar_detalle_factura(
        p_factura_id            IN NUMBER,
        p_tratamiento_paciente_id IN NUMBER DEFAULT NULL,
        p_descripcion           IN VARCHAR2,
        p_cantidad              IN NUMBER,
        p_precio_unitario       IN NUMBER,
        p_descuento             IN NUMBER DEFAULT 0,
        p_detalle_id            OUT NUMBER,
        p_resultado             OUT NUMBER,
        p_mensaje               OUT VARCHAR2
    );
    
    PROCEDURE calcular_totales_factura(
        p_factura_id IN NUMBER,
        p_resultado  OUT NUMBER,
        p_mensaje    OUT VARCHAR2
    );
    
    PROCEDURE anular_factura(
        p_factura_id     IN NUMBER,
        p_motivo         IN VARCHAR2,
        p_anulado_por    IN NUMBER,
        p_resultado      OUT NUMBER,
        p_mensaje        OUT VARCHAR2
    );
    
    PROCEDURE get_factura(
        p_factura_id IN NUMBER,
        p_cursor     OUT t_cursor,
        p_resultado  OUT NUMBER,
        p_mensaje    OUT VARCHAR2
    );

    PROCEDURE get_factura_detalles(
        p_factura_id IN NUMBER,
        p_cursor     OUT t_cursor,
        p_resultado  OUT NUMBER,
        p_mensaje    OUT VARCHAR2
    );
    
    PROCEDURE get_facturas_paciente(
        p_paciente_id IN NUMBER,
        p_cursor      OUT t_cursor,
        p_resultado   OUT NUMBER,
        p_mensaje     OUT VARCHAR2
    );
    
    PROCEDURE get_facturas_empresa(
        p_empresa_id    IN NUMBER,
        p_estado        IN VARCHAR2 DEFAULT NULL,
        p_fecha_desde   IN DATE DEFAULT NULL,
        p_fecha_hasta   IN DATE DEFAULT NULL,
        p_limit         IN NUMBER DEFAULT 50,
        p_offset        IN NUMBER DEFAULT 0,
        p_cursor        OUT t_cursor,
        p_total         OUT NUMBER,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- ========================================
    -- SECCIÓN: PAGOS
    -- ========================================
    
    PROCEDURE registrar_pago(
        p_factura_id     IN NUMBER,
        p_monto          IN NUMBER,
        p_metodo_pago    IN VARCHAR2,
        p_referencia     IN VARCHAR2 DEFAULT NULL,
        p_banco          IN VARCHAR2 DEFAULT NULL,
        p_registrado_por IN NUMBER,
        p_pago_id        OUT NUMBER,
        p_resultado      OUT NUMBER,
        p_mensaje        OUT VARCHAR2
    );
    
    PROCEDURE get_pagos_factura(
        p_factura_id IN NUMBER,
        p_cursor     OUT t_cursor,
        p_resultado  OUT NUMBER,
        p_mensaje    OUT VARCHAR2
    );
    
    PROCEDURE get_cuenta_corriente_paciente(
        p_paciente_id IN NUMBER,
        p_cursor      OUT t_cursor,
        p_resultado   OUT NUMBER,
        p_mensaje     OUT VARCHAR2
    );

END PKG_FACTURAS;
/
