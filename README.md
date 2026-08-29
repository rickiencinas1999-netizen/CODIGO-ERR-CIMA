# codigo-err-cima

Aplicación web para el **Equipo de Respuesta Rápida (ERR)** — Hospital CIMA,
basada en la política **PR-ENF/GRL-015** ("Integración y Dinámica del Equipo
de Respuesta Rápida", versión 6).

El ERR no es un código de emergencia como Código Ictus o Código Azul: es el
sistema de **detección temprana y activación previa** para intervenir ante
deterioro clínico de un paciente hospitalizado (fuera de terapia intensiva,
incluye cunero fisiológico, pediátricos y adultos) antes de que llegue a
necesitar un código de emergencia formal.

Incluye:

- **Activación del ERR**: quién activa, extensiones (1800 intensivista /
  1400 urgenciólogo de respaldo / 1401 cunero fisiológico), y checklist de
  criterios de activación directa (Anexo 2).
- **Tiempo de respuesta**: cronómetro y marcado de llegada del ERR, respaldo,
  laboratorio, imagenología y supervisora de enfermería, contra la meta
  institucional de menos de 5 minutos.
- **Calculadora NEWS 2** (adultos ≥ 18 años) con interpretación y triage por
  color (Azul/Verde/Amarillo/Naranja/Rojo) según el Anexo 3 del documento.
- **PEWS 2 (pediátrico)**: captura de datos por grupo de edad — el cálculo
  automático del puntaje total está pendiente de que el hospital confirme
  las tablas de corte por edad del Anexo 7 (ver nota en la propia app).
- **Guía del evento**: liderazgo, roles del equipo, cadena de supervivencia
  5R, modelo de comunicación SBAR y escalamiento a Código Ictus / SICA /
  Código Azul.
- **Registro de caso (Anexo 6)**: encabezado, motivo de activación,
  intervenciones, personal involucrado, SBAR narrativo, evaluación inicial y
  final, reporte final, resultados y retroalimentación.
- **Exportar informe**: resumen de texto para copiar, imprimir o descargar,
  y envío por correo (mailto).
- **Código QR** de acceso generado por el propio servidor.
- **Historial de casos**: cada dispositivo guarda su propio historial en
  `localStorage`, y además se puede guardar en el servidor.

## Requisitos

- Node.js 18+

## Instalación y uso

```bash
npm install
npm start
```

La aplicación queda disponible en `http://localhost:3000` (o el puerto
definido en la variable de entorno `PORT`).

## Datos

Los casos guardados "en el servidor" se almacenan en una base de datos
SQLite local en `data/err.db` (se crea automáticamente al arrancar). Esa
carpeta está excluida de git.

## Estructura

- `server/index.js` — servidor Express: sirve la app estática y expone
  `GET/POST /api/casos` y `GET /api/qr`.
- `server/db.js` — conexión SQLite (better-sqlite3) y esquema de la tabla
  `casos`.
- `public/index.html` — la aplicación completa (activación, escalas,
  registro Anexo 6).

## Pendientes clínicos conocidos

El PR-ENF/GRL-015 tiene puntos de ambigüedad que se le señalaron al usuario
y quedaron marcados directamente en la app (no se inventaron valores
clínicos):

1. La tabla de "Oxígeno suplementario" de NEWS 2 repite los mismos valores
   en ambas columnas en vez de tener una escala distinta — se usa una sola
   escala.
2. NEWS 2 tiene dos tablas de corte de interpretación ligeramente distintas
   (cuerpo del texto 3.10–3.12 vs. Anexo 3 tabular) — se usa el Anexo 3.
3. PEWS 2 requiere tablas de corte de FC/FR/TAS distintas para 5 grupos de
   edad (Anexo 7) que no se digitalizaron por precaución clínica — la app
   solo captura los valores crudos, no calcula el puntaje total.
4. El rango de llenado capilar ">4 segundos" no tiene puntaje asignado en
   el documento.
5. La tabla de SpO2 de PEWS 2 solo da puntaje explícito hasta 94% (→0); la
   app asume que valores mayores también puntúan 0, pendiente de
   confirmación.
