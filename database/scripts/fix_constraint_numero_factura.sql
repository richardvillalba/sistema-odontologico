-- Fix: Eliminar constraint única incorrecta en NUMERO_FACTURA
-- El error indica: ADMIN.SYS_C0030042 on NUMERO_FACTURA

-- 1. Eliminar la constraint específica que está causando el problema
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE ODO_FACTURAS DROP CONSTRAINT SYS_C0030042';
    DBMS_OUTPUT.PUT_LINE('Constraint SYS_C0030042 eliminada');
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error eliminando SYS_C0030042: ' || SQLERRM);
END;
/

-- 2. Buscar y eliminar cualquier otra constraint UNIQUE en NUMERO_FACTURA solamente
DECLARE
    v_count NUMBER := 0;
BEGIN
    FOR c IN (
        SELECT cc.constraint_name
        FROM user_constraints uc
        JOIN user_cons_columns cc ON uc.constraint_name = cc.constraint_name
        WHERE uc.table_name = 'ODO_FACTURAS'
        AND uc.constraint_type = 'U'
        AND cc.column_name = 'NUMERO_FACTURA'
        -- Solo constraints de una columna
        AND (SELECT COUNT(*) FROM user_cons_columns WHERE constraint_name = uc.constraint_name) = 1
    ) LOOP
        BEGIN
            EXECUTE IMMEDIATE 'ALTER TABLE ODO_FACTURAS DROP CONSTRAINT ' || c.constraint_name;
            DBMS_OUTPUT.PUT_LINE('Constraint ' || c.constraint_name || ' eliminada');
            v_count := v_count + 1;
        EXCEPTION
            WHEN OTHERS THEN
                DBMS_OUTPUT.PUT_LINE('Error con ' || c.constraint_name || ': ' || SQLERRM);
        END;
    END LOOP;
    DBMS_OUTPUT.PUT_LINE('Total constraints eliminadas: ' || v_count);
END;
/

-- 3. Eliminar índices únicos solo en NUMERO_FACTURA
DECLARE
    v_count NUMBER := 0;
BEGIN
    FOR idx IN (
        SELECT ui.index_name
        FROM user_indexes ui
        JOIN user_ind_columns uic ON ui.index_name = uic.index_name
        WHERE ui.table_name = 'ODO_FACTURAS'
        AND ui.uniqueness = 'UNIQUE'
        AND uic.column_name = 'NUMERO_FACTURA'
        -- Solo índices de una columna
        AND (SELECT COUNT(*) FROM user_ind_columns WHERE index_name = ui.index_name) = 1
    ) LOOP
        BEGIN
            EXECUTE IMMEDIATE 'DROP INDEX ' || idx.index_name;
            DBMS_OUTPUT.PUT_LINE('Indice ' || idx.index_name || ' eliminado');
            v_count := v_count + 1;
        EXCEPTION
            WHEN OTHERS THEN
                DBMS_OUTPUT.PUT_LINE('Error con indice ' || idx.index_name || ': ' || SQLERRM);
        END;
    END LOOP;
    DBMS_OUTPUT.PUT_LINE('Total indices eliminados: ' || v_count);
END;
/

-- 4. Crear la nueva constraint compuesta correcta (si no existe)
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE ODO_FACTURAS ADD CONSTRAINT UK_FACTURA_TIMBRADO_NUMERO UNIQUE (TIMBRADO_ID, NUMERO_FACTURA)';
    DBMS_OUTPUT.PUT_LINE('Constraint UK_FACTURA_TIMBRADO_NUMERO creada exitosamente');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -2261 THEN
            DBMS_OUTPUT.PUT_LINE('Constraint UK_FACTURA_TIMBRADO_NUMERO ya existe');
        ELSE
            DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
        END IF;
END;
/

-- 5. También agregar constraint única para NUMERO_FACTURA_COMPLETO por empresa (si no existe)
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE ODO_FACTURAS ADD CONSTRAINT UK_FACTURA_EMPRESA_NUMCOMPLETO UNIQUE (EMPRESA_ID, NUMERO_FACTURA_COMPLETO)';
    DBMS_OUTPUT.PUT_LINE('Constraint UK_FACTURA_EMPRESA_NUMCOMPLETO creada exitosamente');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -2261 THEN
            DBMS_OUTPUT.PUT_LINE('Constraint UK_FACTURA_EMPRESA_NUMCOMPLETO ya existe');
        ELSE
            DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
        END IF;
END;
/

COMMIT;

-- 6. Verificar resultado final
SELECT 'CONSTRAINTS ACTUALES:' as info FROM DUAL;

SELECT constraint_name, constraint_type
FROM user_constraints
WHERE table_name = 'ODO_FACTURAS'
AND constraint_type = 'U'
ORDER BY constraint_name;

SELECT constraint_name, column_name, position
FROM user_cons_columns
WHERE constraint_name IN (
    SELECT constraint_name FROM user_constraints
    WHERE table_name = 'ODO_FACTURAS' AND constraint_type = 'U'
)
ORDER BY constraint_name, position;
