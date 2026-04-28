CREATE TABLE IF NOT EXISTS validation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  target_audience TEXT,
  category TEXT,
  description TEXT,
  report JSONB NOT NULL,
  data_coverage JSONB,
  overall_score INTEGER,
  attention_score NUMERIC,
  vc_score NUMERIC,
  founder_score NUMERIC,
  verdict TEXT,
  sources_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_history_created ON validation_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_history_query ON validation_history(query);
