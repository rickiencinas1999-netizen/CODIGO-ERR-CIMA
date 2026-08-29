# Guía de despliegue

Esta app es un servidor Node.js (Express) que sirve una página web y una
base de datos SQLite local. No requiere servicios externos ni cuentas de
terceros — solo Node.js y, si va a ser accesible por internet, un dominio
y certificado HTTPS.

## Desplegar en Render (igual que Código Ictus)

Este repo incluye `render.yaml`, así que Render puede configurar el
servicio automáticamente. Como Claude no tiene acceso a tu cuenta de
Render, estos pasos los tienes que dar tú (toma 2–3 minutos):

1. Entra a [dashboard.render.com](https://dashboard.render.com) → **New +**
   → **Blueprint**.
2. Conecta el repositorio `rickiencinas1999-netizen/codigo-err-cima` (o
   `CODIGO-ERR-CIMA`, es el mismo repo movido de nombre).
3. Render detecta `render.yaml` y propone el servicio `codigo-err-cima`
   (Node, plan Free, build `npm install`, start `npm start`). Confirma con
   **Apply**.
4. Cuando termine el primer deploy, Render te da una URL tipo
   `https://codigo-err-cima.onrender.com` — esa es la app.

Si prefieres no usar el Blueprint, también puedes crear el servicio a mano
con **New +** → **Web Service**, apuntando al mismo repo, Runtime **Node**,
Build Command `npm install`, Start Command `npm start`.

**Nota sobre el plan Free vs. persistencia de datos** — igual que en
Código Ictus: en el plan Free el disco no es persistente, así que
`data/err.db` (los casos guardados "en el servidor") se borra cada vez que
el servicio se reinicia o se redepliega. El historial local del navegador
(`localStorage`) no se pierde, pero si quieren conservar el historial del
servidor entre reinicios, hay que subir el servicio al plan **Starter** (o
superior) y agregar un **disco persistente** montado en `data/` desde el
dashboard de Render (Settings → Disks). Mientras tanto, en Free la app
funciona perfectamente, solo que el guardado "en el servidor" no es
duradero.

**Antes de compartir la URL de Render con todo el hospital**, lee la
sección de seguridad más abajo — la app no tiene login todavía.

## Servidor propio (para el equipo de Sistemas)

Si en vez de Render prefieren correrla en un servidor propio del
hospital, sigue esta sección.

## Antes de exponerla a internet — decisión de seguridad pendiente

**Esta aplicación no tiene inicio de sesión.** Cualquier persona que
conozca la URL puede ver y guardar los casos registrados (incluye datos
clínicos de pacientes). Mientras esté en un enlace de prueba esto puede ser
aceptable, pero antes de publicarla en un dominio del hospital accesible
desde internet, Sistemas debería decidir y aplicar **al menos una** de
estas opciones:

1. **Restringir el acceso por red**: exponerla solo dentro de la VPN o
   red interna del hospital (no en internet abierto), o restringir por
   IP en el firewall/reverse proxy a las IPs del hospital.
2. **Agregar autenticación**: usuario/contraseña compartido a nivel del
   reverse proxy (HTTP Basic Auth en Nginx/Apache es rápido de
   configurar) o un login propio en la app — si lo deciden, pídanle a
   Claude que lo agregue.
3. Como mínimo indispensable en cualquier caso: **HTTPS obligatorio**
   (nunca servir esto por HTTP plano en internet).

Ninguna de estas tres está implementada todavía — es una decisión que
debe tomar el responsable de Sistemas/seguridad de la información del
hospital antes de publicar la URL final.

## Requisitos

- Un servidor (Linux recomendado; también corre en Windows) con salida
  a internet si va a ser pública.
- Node.js 18 o superior instalado.
- Un dominio o subdominio apuntando al servidor (ej.
  `codigoerr.hospitalcima.com`) si va a ser accesible desde internet.
- Un proxy reverso (Nginx o Apache) para servir HTTPS — Node no debe
  exponerse directo a internet sin uno.

## 1. Obtener el código

```bash
git clone https://github.com/rickiencinas1999-netizen/codigo-err-cima.git
cd codigo-err-cima
git checkout claude/codigo-err-programa-init   # o la rama/main que use el hospital
npm install --omit=dev
```

## 2. Probar que arranca

```bash
PORT=3000 npm start
```

Abre `http://<ip-del-servidor>:3000` desde el propio servidor o la red
interna para confirmar que responde. Detén con Ctrl+C.

## 3. Mantenerla corriendo (systemd, Linux)

Crea `/etc/systemd/system/codigo-err.service`:

```ini
[Unit]
Description=Equipo de Respuesta Rápida (ERR) - Hospital CIMA
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/ruta/a/codigo-err-cima
Environment=PORT=3000
ExecStart=/usr/bin/node server/index.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Ajusta `WorkingDirectory`, el usuario del sistema, y la ruta a `node`
(`which node`) según el servidor. Luego:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now codigo-err
sudo systemctl status codigo-err
```

Esto hace que arranque automáticamente si el servidor se reinicia, y se
vuelva a levantar sola si el proceso falla.

(En Windows, el equivalente es registrarla como servicio con `nssm` o
correrla con IIS + `iisnode`; en Docker, con un contenedor y
`restart: unless-stopped`.)

## 4. Reverse proxy con HTTPS (Nginx + Let's Encrypt)

```nginx
server {
    listen 80;
    server_name codigoerr.hospitalcima.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Luego emite el certificado (gratis, se renueva solo):

```bash
sudo certbot --nginx -d codigoerr.hospitalcima.com
```

Certbot ajusta automáticamente el bloque anterior para forzar HTTPS.

> La app ya confía en el encabezado `X-Forwarded-Proto` (necesario para
> que el código QR se genere con `https://` en vez de `http://`), así
> que no hace falta ninguna configuración extra de ese lado.

## 5. Los datos (base de casos)

Los casos guardados "en el servidor" viven en `data/err.db` dentro de
la carpeta del proyecto — es un archivo SQLite normal. Sistemas debe:

- Incluir esa carpeta en el backup periódico del servidor.
- Si migran la app a otra máquina, copiar ese archivo junto con el
  código para no perder el historial.

## 6. Actualizar la app a una versión nueva

```bash
cd /ruta/a/codigo-err-cima
git pull
npm install --omit=dev
sudo systemctl restart codigo-err
```

El archivo `data/err.db` no se toca al actualizar — los casos
guardados se conservan.

## 7. Enlaces a Código Ictus / Código Azul

En la pestaña "Registro ERR" → "Escalamiento", los botones de escalar a
Código Ictus / Código Azul tienen campos opcionales para pegar la URL de
esas apps una vez publicadas en el hospital. Todavía no se configuraron
por defecto porque no se contaba con las URLs de producción al construir
esta app.
