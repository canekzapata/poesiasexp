# seguridad

Resumen de la postura de seguridad de la CONSOLA. La guía operativa (HTTPS,
secretos, backups) está en el **[`MANUAL.md`](MANUAL.md)**.

## qué está implementado

- **Autenticación**: contraseñas con hash `scrypt` (Werkzeug); nunca en texto plano.
- **Sesiones**: cookies `HttpOnly` + `SameSite=Lax` + `Secure` (con `CONSOLA_HTTPS=1`).
  `SameSite=Lax` mitiga CSRF en peticiones que cambian estado.
- **Secreto de sesión**: si no defines `FLASK_SECRET_KEY`, se usa uno aleatorio
  efímero (y el server te avisa). Defínelo en producción.
- **Aislamiento**: cada usuarie solo puede leer/editar/borrar sus propios documentos
  (todas las consultas filtran por `owner`).
- **Rate-limit de login** por IP (anti fuerza bruta) y de las rutas de IA/generadores.
- **Cuota diaria de IA por usuarie** (`CONSOLA_AI_DAILY_LIMIT`): protege el
  presupuesto de las API keys compartidas.
- **Anti-XSS**: todo el HTML que entra al editor/documentos (importado, convertido
  desde Markdown, o guardado) pasa por un sanitizador con allowlist que elimina
  `<script>`, `<style>`, `<iframe>`, `<object>`, manejadores `onX` y URLs
  `javascript:`.
- **Anti-DoS**: topes de tamaño en prompts, corpus, gramáticas y documentos;
  `MAX_CONTENT_LENGTH` de 8 MB; guardas de recursión en el motor Tracery; límite de
  pasos en el loop de herramientas de la IA.
- **Imágenes a la IA**: se validan tipo (`png`/`jpeg`/`webp`/`gif`) y tamaño, y que
  el base64 decodifique, antes de reenviarse al proveedor; se reescalan en el
  cliente. No se guardan en el server.
- **Path traversal**: la lectura de objetos usa solo el nombre base del archivo y
  una allowlist de extensiones (`.txt`/`.md`/`.json`).
- **Anti-SSRF (lector web)**: `/api/leer-url` y la herramienta `leer_url` solo
  aceptan `http`/`https`, resuelven el host y **rechazan** IPs privadas, loopback,
  link-local (incluida la metadata de la nube `169.254.169.254`), reservadas y
  multicast; revalidan cada redirect y limitan tamaño/timeout. (Riesgo residual
  conocido: DNS rebinding — aceptable para un grupo semi-confiable; para más
  garantías, fijar la conexión a la IP validada.)
- **Secretos del server**: las API keys nunca se exponen al cliente; `/api/providers`
  solo devuelve si cada motor está configurado y el nombre del modelo.

## qué NO cubre (todavía)

Pensado para un grupo pequeño y *semi-confiable*. No incluye: 2FA, verificación de
correo, roles/permisos, auditoría, ni protección contra un usuarie autenticado y
malicioso. El rate-limit/cuota viven en memoria por proceso (para escala real:
Flask-Limiter + Redis). Ver `ROADMAP.md`.

## reportar un problema

Si encuentras una vulnerabilidad, avísale en privado al admin del despliegue
(no abras un issue público con los detalles).
