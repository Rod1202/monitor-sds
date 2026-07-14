-- Eliminar trigger y función que sobrescriben el estado
DROP TRIGGER IF EXISTS trg_device_sync_estado ON device_sync_snapshots;
DROP FUNCTION IF EXISTS update_device_sync_estado;
