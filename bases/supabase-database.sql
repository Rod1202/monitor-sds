-- ============================================================
-- TABLA: Snapshots de sincronización de equipos
-- ============================================================

CREATE TABLE IF NOT EXISTS device_sync_snapshots (
    snapshot_id     BIGSERIAL PRIMARY KEY,

    -- Datos del cliente
    customer_name   TEXT NOT NULL,
    customer_id     INTEGER NOT NULL,

    -- Datos del equipo
    device_id       INTEGER NOT NULL,
    serial_number   TEXT,
    last_contact    TIMESTAMPTZ,

    -- Fecha en que se realizó la consulta
    snapshot_date   DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Estado calculado por trigger
    estado          TEXT NOT NULL,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FUNCIÓN PARA CALCULAR EL ESTADO
-- ============================================================

CREATE OR REPLACE FUNCTION update_device_sync_estado()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN

    IF NEW.last_contact IS NOT NULL
       AND (NEW.last_contact AT TIME ZONE 'UTC')::DATE = NEW.snapshot_date THEN

        NEW.estado := 'Sincronizado';

    ELSE

        NEW.estado := 'Desincronizado';

    END IF;

    RETURN NEW;

END;
$$;

-- ============================================================
-- TRIGGER
-- ============================================================

DROP TRIGGER IF EXISTS trg_device_sync_estado
ON device_sync_snapshots;

CREATE TRIGGER trg_device_sync_estado
BEFORE INSERT OR UPDATE
ON device_sync_snapshots
FOR EACH ROW
EXECUTE FUNCTION update_device_sync_estado();

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_snapshots_customer_date
ON device_sync_snapshots(customer_id, snapshot_date);

CREATE INDEX IF NOT EXISTS idx_snapshots_estado
ON device_sync_snapshots(estado);

CREATE INDEX IF NOT EXISTS idx_snapshots_device
ON device_sync_snapshots(device_id, snapshot_date);

-- ============================================================
-- EJEMPLO DE INSERCIÓN
-- ============================================================

-- INSERT INTO device_sync_snapshots
-- (
--     customer_name,
--     customer_id,
--     device_id,
--     serial_number,
--     last_contact
-- )
-- VALUES
-- (
--     'Cliente Demo',
--     1,
--     1001,
--     'ABC123',
--     '2026-07-06T14:20:00Z'
-- );

-- ============================================================
-- CONSULTAS ÚTILES
-- ============================================================

-- Resumen del día
-- SELECT customer_name,
--        estado,
--        COUNT(*) cantidad
-- FROM device_sync_snapshots
-- WHERE snapshot_date = CURRENT_DATE
-- GROUP BY customer_name, estado
-- ORDER BY customer_name;

-- Equipos desincronizados
-- SELECT device_id,
--        serial_number,
--        last_contact
-- FROM device_sync_snapshots
-- WHERE customer_id = 1
--   AND snapshot_date = CURRENT_DATE
--   AND estado = 'Desincronizado';

-- Histórico
-- SELECT
--     customer_name,
--     snapshot_date,
--     COUNT(*) FILTER (WHERE estado='Sincronizado') sincronizados,
--     COUNT(*) total,
--     ROUND(
--         COUNT(*) FILTER (WHERE estado='Sincronizado')::numeric
--         / COUNT(*) * 100,
--         2
--     ) porcentaje_sync
-- FROM device_sync_snapshots
-- GROUP BY customer_name, snapshot_date
-- ORDER BY snapshot_date DESC, customer_name;