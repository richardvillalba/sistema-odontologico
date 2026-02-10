-- Solucin definitiva al ORA-04091: Tabla Mutante
-- Eliminamos los disparadores que causan el conflicto y movemos la lgica al paquete.

BEGIN
    EXECUTE IMMEDIATE 'DROP TRIGGER TRG_VALIDAR_TIMBRADO_ACTIVO';
    DBMS_OUTPUT.PUT_LINE('Trigger TRG_VALIDAR_TIMBRADO_ACTIVO eliminado.');
EXCEPTION
    WHEN OTHERS THEN DBMS_OUTPUT.PUT_LINE('Trigger TRG_VALIDAR_TIMBRADO_ACTIVO no existia o no pudo ser eliminado.');
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TRIGGER TRG_TIMBRADO_UPDATE';
    DBMS_OUTPUT.PUT_LINE('Trigger TRG_TIMBRADO_UPDATE eliminado.');
EXCEPTION
    WHEN OTHERS THEN DBMS_OUTPUT.PUT_LINE('Trigger TRG_TIMBRADO_UPDATE no existia o no pudo ser eliminado.');
END;
/
