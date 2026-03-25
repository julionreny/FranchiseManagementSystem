const pool = require('./config/db');

const createHQReportsTable = `
CREATE TABLE IF NOT EXISTS hq_reports (
  report_id VARCHAR(50) PRIMARY KEY,
  franchise_id INTEGER NOT NULL REFERENCES franchises(franchise_id),
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'Draft',
  summary TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hq_reports_franchise_id ON hq_reports(franchise_id);
`;

async function migrate() {
  try {
    await pool.query(createHQReportsTable);
    console.log("hq_reports table created successfully");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    pool.end();
  }
}

migrate();
