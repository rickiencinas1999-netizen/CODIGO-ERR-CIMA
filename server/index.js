const path = require('path');
const express = require('express');
const QRCode = require('qrcode');
const db = require('./db');

const app = express();
app.set('trust proxy', true);
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

const upsertCaso = db.prepare(`
  INSERT INTO casos (id, folio, fecha, estado, tiempo_respuesta, capturado_por, informe, data, updated_at)
  VALUES (@id, @folio, @fecha, @estado, @tiempo_respuesta, @capturado_por, @informe, @data, @updated_at)
  ON CONFLICT(id) DO UPDATE SET
    folio = excluded.folio,
    fecha = excluded.fecha,
    estado = excluded.estado,
    tiempo_respuesta = excluded.tiempo_respuesta,
    capturado_por = excluded.capturado_por,
    informe = excluded.informe,
    data = excluded.data,
    updated_at = excluded.updated_at
`);
const selectAllCasos = db.prepare('SELECT * FROM casos ORDER BY updated_at ASC');

function rowToRecord(row) {
  let extra = {};
  try { extra = JSON.parse(row.data); } catch (e) { extra = {}; }
  return {
    id: row.id,
    folio: row.folio,
    fecha: row.fecha,
    estado: row.estado,
    tiempoRespuesta: row.tiempo_respuesta,
    capturadoPor: row.capturado_por,
    informe: row.informe,
    ...extra,
  };
}

app.get('/api/casos', (req, res) => {
  res.json(selectAllCasos.all().map(rowToRecord));
});

app.post('/api/casos', (req, res) => {
  const record = req.body;
  if (!record || typeof record.id !== 'string' || !record.id) {
    return res.status(400).json({ error: 'id de caso requerido' });
  }
  const { id, folio, fecha, estado, tiempoRespuesta, capturadoPor, informe, ...extra } = record;
  upsertCaso.run({
    id,
    folio: folio ?? null,
    fecha: fecha ?? null,
    estado: estado ?? null,
    tiempo_respuesta: typeof tiempoRespuesta === 'number' ? tiempoRespuesta : null,
    capturado_por: capturadoPor ?? null,
    informe: informe ?? null,
    data: JSON.stringify(extra),
    updated_at: new Date().toISOString(),
  });
  res.json({ ok: true });
});

app.get('/api/qr', async (req, res) => {
  const url = `${req.protocol}://${req.get('host')}/`;
  try {
    const buf = await QRCode.toBuffer(url, { width: 260, margin: 1 });
    res.set('Cache-Control', 'no-store');
    res.type('png').send(buf);
  } catch (e) {
    res.status(500).end();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Equipo de Respuesta Rápida (ERR) escuchando en http://localhost:${PORT}`);
});
