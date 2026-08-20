# ROADMAP — el loop de lo que falta

Estado de las cosas que pediste y qué queda para la siguiente vuelta.

## ✅ hecho y verificado (offline, sin API keys)

- [x] **IA multi-proveedor**: Claude, ChatGPT (OpenAI) y HuggingFace, con selector
      en el panel IA. Las keys viven solo en el server.
- [x] **La IA usa Tracery de verdad**: herramienta `escribir_tracery` — el modelo
      escribe la gramatica, el server la **ejecuta** (motor Tracery propio en python)
      y ofrece cargarla en el panel.
- [x] **La IA lee y genera Markov**: herramienta `generar_markov` — desde corpus o
      desde un modelo `.json` guardado (probado con `raquel.json`), con semilla.
- [x] **La IA lee los objetos guardados como archivos**: `listar_objetos` +
      `leer_objeto` (documentos de la db y archivos `.md`/`.txt`/`.json`).
- [x] **El editor ve `.md` y `.txt`**: importar (`abrir`) y exportar `.md`/`.txt`/`.html`;
      conversion md↔html en el server.
- [x] **Panel OBJETOS**: lista y abre archivos guardados en el editor.
- [x] Loop de herramientas (agente) compartido por los 3 proveedores, con reintento
      sin herramientas si un modelo HF no las soporta.
- [x] Pruebas: 24 unitarias + 11 de integración HTTP + 20 de seguridad, todas
      verdes (con proveedor simulado para el loop de la IA).
- [x] **Seguridad para abrir a tus amix**: rate-limit de login, cuota diaria de IA
      por usuarie, sanitización anti-XSS, topes de tamaño, cookies endurecidas
      (`Secure`/`SameSite`/`HttpOnly`), `ProxyFix` para nginx, y menos superficie
      (se quitó el endpoint legacy). Ver `SECURITY.md` y `MANUAL.md`.
- [x] **Navegador — opción A (lector server-side)**: botón **leer** en el panel WEB
      + endpoint `/api/leer-url` + herramienta `leer_url` para la IA. Con protección
      **anti-SSRF** (bloquea IPs privadas/loopback/metadata, revalida redirects,
      topes de tamaño/timeout).
- [x] **Imágenes a la IA (multimodal)**: adjuntar una imagen (📎) en el panel IA;
      la IA con visión la analiza. Formato correcto por proveedor (bloque `image`
      en Claude, `image_url` en OpenAI/HF), validación de tipo/tamaño y reescalado
      en el cliente.

## ⚠️ falta probar con keys reales (no lo pude hacer aquí)

El loop es correcto y está testeado con un proveedor **simulado**, pero no tengo
API keys en este entorno. Para cerrar el círculo, con keys reales:

- [ ] `CLAUDE_API_KEY` → probar un prompt que dispare `escribir_tracery`.
- [ ] `OPENAI_API_KEY` → confirmar function-calling real (gpt-4o-mini).
- [ ] `HF_API_KEY` + un `HF_MODEL` que soporte tools (ej. un Llama-3.x-Instruct
      en el router). Ojo: **no todos** los modelos de HF soportan herramientas; si
      falla, el server responde igual pero sin usar tools. Elegir bien el modelo.

## 🌐 decisión del navegador — RESUELTA (opción A) ✅

Se implementó la **opción A (lector server-side)**: el panel WEB conserva el
`<iframe>` (botón **ir**) y suma un **lector** (botón **leer**) que baja la URL en el
server, extrae el título + texto legible y lo trae al panel para insertarlo en tu
escritura. La IA lo usa con la herramienta `leer_url`. Todo con **protección
anti-SSRF** (ver `SECURITY.md`).

Queda como opción futura la **B** (búsqueda `web_search` nativa del proveedor) para
sumarla como otra herramienta de la IA cuando quieras "preguntar" en vez de "leer una
URL puntual".

## 🔜 siguiente iteración (propuesta, ordenada)

1. **Búsqueda web para la IA (opción B)**: tool `web_search` (nativa de Claude/OpenAI,
   o una API de búsqueda) para research abierto, no solo una URL puntual.
2. **Guardar objetos desde la IA**: tool `guardar_objeto` para que el modelo escriba
   `.md`/`.txt` en `objetos/` (ahora solo lee).
3. **Editar Tracery/Markov y que la IA vea el estado actual** del panel (no solo lo
   que escribe): pasar la gramatica/corpus actuales como contexto de las tools.
4. **Streaming** de la respuesta de la IA (hoy es de un jalón).
5. **Modelos markov combinados con pesos** (ya existe en `markov/appint.py`): exponerlo
   como tool y en el panel.
6. **Compartir documentos entre usuaries** (hoy cada quien ve solo lo suyo) — al
   hacerlo, el sanitizador anti-XSS ya te cubre.
7. **Seguridad para más escala** (cuando pases de un grupo chico): rate-limit/cuota
   con Flask-Limiter + Redis (hoy es en memoria por proceso), 2FA, roles/permisos y
   auditoría. Ver `SECURITY.md`.

## notas

- El archivo `gitignore` (sin punto) no estaba activo; se reemplazó por `.gitignore`
  real para no trackear `.venv/`, `users.json` ni `consola.db`.
- `README (1).md` se reemplazó por `README.md` (portada del repo).
