# consola

consola de escritura multi-usuaria con paneles para escribir mas chingón. la IA
puede **usar de verdad** las herramientas: escribe y ejecuta Tracery, genera Markov
(incluso desde modelos guardados como archivos) y lee tus objetos guardados.

## paneles

- **EDITOR** central rich-text (bold, italic, tipografias, listas, colores, headers).
  Importa `.md` / `.txt` / `.html` con **abrir**, exporta `.txt` / `.md` / `.html`.
- **DOCS** sidebar con persistencia SQLite por usuarie + autosave c/8s.
- **OBJETOS** lista tus documentos y los archivos `.md` / `.txt` / `.json` guardados;
  click para abrirlos en el editor (el `.md` se renderiza; los `.json` markov se
  cargan en el panel MARKOV).
- **TRACERY** — gramaticas generativas estilo Kate Compton, editables en vivo
  (motor en el cliente, y tambien en el server para que la IA las ejecute).
- **MARKOV** — cadenas de markov via `markovify`. Entrena desde un corpus pegado
  **o** carga un modelo `.json` guardado (ej. `raquel.json`), con palabra semilla.
- **IA** — multi-proveedor: **Claude (Anthropic)**, **ChatGPT (OpenAI)** y
  **HuggingFace**. Con "herramientas" activadas, el modelo puede llamar a:
  `escribir_tracery`, `generar_markov`, `listar_objetos`, `leer_objeto` y
  `leer_url`. Cada llamada se muestra en el panel y trae un boton para aplicar
  el resultado (cargar la gramatica, insertar el markov/lectura, etc.).
  También puedes **adjuntar una imagen** (📎) y la IA con visión la analiza (la
  imagen se reescala en el navegador antes de enviarse).
- **WEB** — iframe que carga DDG html / wikipedia / archive / cualquier URL.
  Además el botón **leer** usa el *lector server-side*: el server baja la URL y
  extrae el texto legible (funciona con casi cualquier sitio, y la IA puede leerlo
  con `leer_url`). Con protección anti-SSRF (bloquea IPs privadas/metadata).

Estética: net-art noventero, Windows-95-ish, fondo teal, tipografía system + monospace.

## cómo la IA usa las herramientas

El servidor corre un pequeño *loop de herramientas* (agente) valido para los tres
proveedores. Ejemplos de prompts:

- *"escribe una gramatica tracery sobre el mar y generame 5 versos"* → usa
  `escribir_tracery`, valida la gramatica ejecutandola y te ofrece cargarla en el panel.
- *"genera markov con el modelo raquel.json, 3 frases, semilla 'noche'"* → usa
  `generar_markov` sobre el archivo guardado.
- *"lista mis objetos y luego lee bienvenida.md y resumelo"* → usa `listar_objetos`
  y `leer_objeto`.

Los tres proveedores comparten el mismo set de herramientas. OpenAI y HuggingFace
usan el formato de *function calling* estilo OpenAI (HF via su router compatible);
Claude usa *tool use* nativo. Si un modelo de HF no soporta herramientas, el
servidor reintenta la respuesta sin ellas.

## correr en local

```bash
python -m venv .venv
.venv/bin/pip install -r requirements.txt

# crear users.json con tus amix
cp users.example.json users.json
.venv/bin/python -c "from werkzeug.security import generate_password_hash; print(generate_password_hash('mi-password'))"
# pega el hash en users.json para cada usuarie

# variables de entorno (configura al menos un proveedor de IA)
export CLAUDE_API_KEY=sk-ant-...
export FLASK_SECRET_KEY=$(python -c "import secrets; print(secrets.token_hex(32))")

.venv/bin/python server.py
# abre http://localhost:5000
```

## variables de entorno

| variable | qué hace | default |
|---|---|---|
| `FLASK_SECRET_KEY` | secreto para firmar cookies | efímero aleatorio (¡defínelo en prod!) |
| `CONSOLA_HTTPS` | cookies solo por HTTPS (`Secure`) | `off` (actívalo tras TLS) |
| `CONSOLA_TRUST_PROXY` | confiar en `X-Forwarded-*` (detrás de nginx) | `off` |
| `CONSOLA_AI_DAILY_LIMIT` | llamadas de IA por usuarie/día (`0`=ilimitado) | `50` |
| `CONSOLA_USERS_FILE` | ruta del users.json | `./users.json` |
| `CONSOLA_DB_FILE` | ruta del SQLite | `./consola.db` |
| `CONSOLA_OBJETOS_DIR` | carpeta de objetos legibles | `./objetos` |
| `CONSOLA_MARKOV_DIR` | corpus `.txt` y modelos `.json` | `./markov` |
| `CONSOLA_MAX_TOOL_STEPS` | pasos máximos del loop de herramientas | `5` |
| `CONSOLA_MAX_PROMPT` / `_CORPUS` / `_GRAMMAR` / `_DOC` / `_EDITOR` | topes de tamaño (anti-DoS) | ver `server.py` |
| `CONSOLA_READER` | habilitar el lector web (`0` lo apaga) | `1` |
| `CONSOLA_READER_MAX_BYTES` / `_TIMEOUT` | tope de descarga / timeout del lector | `2MB` / `12s` |
| `CONSOLA_MAX_IMAGE_B64` | tope de la imagen enviada a la IA (base64) | `6MB` |
| `PORT` | puerto a escuchar | `5000` |

> **¿Vas a abrirla a más gente?** Lee el **[`MANUAL.md`](MANUAL.md)**: despliegue
> seguro paso a paso (HTTPS, secretos, cuotas, backups) y guía de uso para tus amix.
| **Claude** | | |
| `CLAUDE_API_KEY` | key de Anthropic | (vacía) |
| `CLAUDE_MODEL` | modelo | `claude-sonnet-4-6` |
| **OpenAI (ChatGPT)** | | |
| `OPENAI_API_KEY` | key de OpenAI | (vacía) |
| `OPENAI_MODEL` | modelo | `gpt-4o-mini` |
| `OPENAI_BASE_URL` | endpoint compatible | `https://api.openai.com/v1` |
| **HuggingFace** | | |
| `HF_API_KEY` / `HF_TOKEN` | token de HF | (vacía) |
| `HF_MODEL` | modelo del router | `meta-llama/Llama-3.1-8B-Instruct` |
| `HF_BASE_URL` | router compatible OpenAI | `https://router.huggingface.co/v1` |

El panel IA solo habilita los motores que tengan su key configurada en el server
(lo ves en el selector). Las keys **nunca** viajan al navegador.

## deployar en un server

Cualquier VPS con python sirve. Recomendación mínima con gunicorn detrás de nginx:

```bash
.venv/bin/pip install gunicorn
.venv/bin/gunicorn -w 2 -b 127.0.0.1:5000 server:app
```

Pon nginx delante con HTTPS. Las cookies de sesion ya estan en `HttpOnly` +
`SameSite=Lax`; si vas a HTTPS agrega `SESSION_COOKIE_SECURE=True` en `app.config`.

## archivos

```
server.py            backend Flask (auth + docs + objetos + tracery + markov + IA)
consola.html         frontend principal (post-login)
login.html           pantalla de login
objetos/             archivos legibles (.md/.txt/.json) — demo incluida
markov/              corpus, modelos .json (raquel.json) y libreria markovify vendida
users.example.json   ejemplo de usuarios — cópialo a users.json
requirements.txt     dependencias python
ROADMAP.md           lo que falta para la siguiente iteración
```

## API (resumen)

| endpoint | método | qué hace |
|---|---|---|
| `/api/providers` | GET | qué motores de IA están configurados |
| `/api/docs` | GET/POST | listar / crear documentos |
| `/api/docs/<id>` | GET/PUT/DELETE | leer / actualizar / borrar |
| `/api/objects` | GET | listar objetos (docs + archivos) |
| `/api/objects/<ref>` | GET | leer un objeto (`doc:ID` o `nombre.ext`) |
| `/api/convert` | POST | convertir `md`↔`html` (`{content,to}`) |
| `/api/tracery` | POST | ejecutar una gramatica (`{grammar,origin,n}`) |
| `/api/markov` | POST | generar (`{text|modelo, seed, sentences, state_size}`) |
| `/api/leer-url` | POST | lector web anti-SSRF (`{url}`) → `{title,text,url}` |
| `/api/ai` | POST | IA con herramientas (`{provider,prompt,use_tools,...}`) |
