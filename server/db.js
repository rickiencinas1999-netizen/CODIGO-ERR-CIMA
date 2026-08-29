const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// better-sqlite3 picks glibc vs musl by reading process.report, which some
// sandboxed hosts (e.g. Render's runtime) don't populate — it then loads the
// musl binary on a glibc host and segfaults on startup. /etc/alpine-release
// is a much more reliable musl signal, so override the binding with it.
function resolveNativeBinding() {
  if (process.platform !== 'linux') return undefined;
  const isMusl = fs.existsSync('/etc/alpine-release');
  const target = `${isMusl ? 'linuxmusl' : 'linux'}-${process.arch}`;
  const candidate = path.join(
    path.dirname(require.resolve('better-sqlite3/package.json')),
    'prebuilds',
    `${target}.node`
  );
  return fs.existsSync(candidate) ? candidate : undefined;
}

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const nativeBinding = resolveNativeBinding();
const db = new Database(path.join(dataDir, 'err.db'), nativeBinding ? { nativeBinding } : undefined);
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
