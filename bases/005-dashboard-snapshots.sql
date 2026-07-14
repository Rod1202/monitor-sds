-- ============================================================
-- TABLA: Snapshots de KPIs agregados del dashboard
-- ============================================================

CREATE TABLE IF NOT EXISTS dashboard_snapshots (
    snapshot_id       BIGSERIAL PRIMARY KEY,
    snapshot_date     DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Estatus KPIs
    total_clients     INTEGER NOT NULL DEFAULT 0,
    active_clients    INTEGER NOT NULL DEFAULT 0,
    expired_clients   INTEGER NOT NULL DEFAULT 0,
    total_devices     INTEGER NOT NULL DEFAULT 0,
    online_pct        NUMERIC(5,2) NOT NULL DEFAULT 0,
    offline_pct       NUMERIC(5,2) NOT NULL DEFAULT 0,
    coverage_clients  INTEGER NOT NULL DEFAULT 0,
    discovered_30d    INTEGER NOT NULL DEFAULT 0,

    -- Alertas KPIs
    no_contact_24h    INTEGER NOT NULL DEFAULT 0,
    no_contact_7d     INTEGER NOT NULL DEFAULT 0,
    never_contacted   INTEGER NOT NULL DEFAULT 0,
    duplicate_serials INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_dashboard_snapshots_date
ON dashboard_snapshots(snapshot_date DESC);
