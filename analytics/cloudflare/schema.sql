CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site TEXT NOT NULL,
  event_name TEXT NOT NULL,
  path TEXT NOT NULL,
  page_href TEXT NOT NULL,
  target_href TEXT,
  label TEXT,
  lang TEXT,
  referrer_host TEXT,
  build_id TEXT,
  browser_family TEXT,
  os_family TEXT,
  country TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at
  ON analytics_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_name_created_at
  ON analytics_events (event_name, created_at DESC);
