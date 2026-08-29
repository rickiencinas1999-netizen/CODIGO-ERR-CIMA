const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'err.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS casos (
    id TEXT PRIMARY KEY,
    folio TEXT,
    fecha TEXT,
    estado TEXT,
    tiempo_respuesta REAL,
    capturado_por TEXT,
    informe TEXT,
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

module.exports = db;
