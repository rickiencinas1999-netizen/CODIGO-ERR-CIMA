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
- **Calculadora PEWS 2** (pediátrico, recién nacido a 17 años) con las
  tablas de corte de FC/FR/TAS por 5 grupos de edad del Anexo 7, más
  conciencia, llenado capilar, SpO2, uso de O2 y temperatura, con
  interpretación por rango (Bajo/Medio/[5–6]/Alto).
- **PEWS 2 — valoración subjetiva** (Anexo 8): escala cualitativa alterna
  de 5 parámetros, para cuando no se pueden tomar todos los valores
  numéricos.
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

## Decisiones sobre ambigüedades del documento (confirmadas con el hospital)

El PR-ENF/GRL-015 tenía algunos puntos de ambigüedad que se le señalaron al
usuario antes de programar las calculadoras. Así quedaron resueltos:

1. **NEWS 2 — oxígeno suplementario**: la tabla repite los mismos valores
   en ambas columnas en vez de tener una escala distinta — confirmado, se
   usa una sola escala de flujo de O2.
2. **NEWS 2 — interpretación**: se usa la tabla del Anexo 3 (confirmado por
   el usuario) para el triage por color.
3. **PEWS 2 — tablas por edad (Anexo 7)**: el usuario compartió las tablas
   completas de FC/FR/TAS por los 5 grupos de edad; ya están implementadas
   tal cual en la calculadora.
4. **PEWS 2 — llenado capilar ">4 segundos"**: el usuario confirmó que
   puntúa igual que "4 segundos" (3 puntos, el máximo del parámetro).
5. **PEWS 2 — SpO2**: confirmado que la tabla solo define el lado
   izquierdo (&lt;91→3, 92→2, 93→1, ≥94→0); no hay valores más altos con
   puntaje distinto.

Dos particularidades del documento que **no** son errores y se manejan
igual en ambas escalas: la tabla de "uso de oxígeno" de PEWS 2 es
simétrica (mismos L/min a ambos lados = mismo puntaje), igual que la de
NEWS 2, así que se usa una sola escala por flujo. Además, en el Anexo 7 la
fila de 5–6 puntos no tiene un nombre de categoría asignado (solo color e
indicaciones clínicas) — la app lo muestra así, sin inventar una etiqueta.

La valoración subjetiva PEWS 2 (Anexo 8) tampoco define categorías de
riesgo para su puntaje total (0–15); la app solo muestra la suma, sin
interpretación, tal como está en el documento.
