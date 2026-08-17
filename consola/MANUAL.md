# MANUAL de la CONSOLA

Guía para (1) montarla de forma segura para tus amix, y (2) usarla.

---

# PARTE 1 — Montar la consola (para ti, el admin)

Vas a abrirla a ~4 amix por internet. Sigue estos pasos **en orden**; el paso de
HTTPS + secretos no es opcional si la expones a la red.

## 1. Qué necesitas

- Un VPS barato (con 1 GB de RAM alcanza): Ubuntu/Debian recién instalado.
- Un dominio o subdominio apuntando al VPS (recomendado, para HTTPS gratis).
- Al menos **una** API key de IA: Anthropic (Claude), OpenAI (ChatGPT) o HuggingFace.

## 2. Instalar

```bash
git clone https://github.com/canekzapata/consola.git
cd consola
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

## 3. Crear los usuarios (tú + tus 4 amix)

Las contraseñas **nunca** se guardan en texto plano, solo su hash.

```bash
cp users.example.json users.json

# genera un hash por cada persona (repite cambiando el password):
.venv/bin/python -c "from werkzeug.security import generate_password_hash; print(generate_password_hash('el-password-de-ana'))"
```

Pega cada hash en `users.json`. Queda así:

```json
{
  "users": [
    { "username": "canek", "password_hash": "scrypt:32768:8:1$...." },
    { "username": "ana",   "password_hash": "scrypt:32768:8:1$...." }
  ]
}
```

Dale a cada amix su usuario y su contraseña por un canal privado. `users.json`
está en `.gitignore`: **no lo subas a GitHub**.

## 4. Secretos y configuración (variables de entorno)

Crea un archivo `consola.env` (NO lo subas al repo):

```bash
# obligatorio en produccion: firma las cookies de sesion
FLASK_SECRET_KEY=pega-aqui-un-secreto-largo   # genéralo abajo
# al menos un proveedor de IA:
CLAUDE_API_KEY=sk-ant-...
# CLAUDE_MODEL=claude-sonnet-4-6
# OPENAI_API_KEY=sk-...
# HF_API_KEY=hf_...
# HF_MODEL=meta-llama/Llama-3.1-8B-Instruct

# seguridad detras de nginx + TLS:
CONSOLA_HTTPS=1
CONSOLA_TRUST_PROXY=1

# candado de gasto: llamadas de IA por persona/dia (baja/sube segun tu bolsillo)
CONSOLA_AI_DAILY_LIMIT=40
```

Genera el secreto:

```bash
.venv/bin/python -c "import secrets; print(secrets.token_hex(32))"
```

La tabla completa de variables está en el `README.md`. **Las API keys viven solo en
el server; nunca llegan al navegador de tus amix.**

## 5. Correr en producción (con gunicorn, no el server de desarrollo)

```bash
.venv/bin/pip install gunicorn
set -a && source consola.env && set +a
.venv/bin/gunicorn -w 2 -b 127.0.0.1:5000 server:app
```

Para que arranque solo y reinicie si se cae, crea un servicio systemd
`/etc/systemd/system/consola.service`:

```ini
[Unit]
Description=CONSOLA
After=network.target

[Service]
WorkingDirectory=/home/TU_USUARIO/consola
EnvironmentFile=/home/TU_USUARIO/consola/consola.env
ExecStart=/home/TU_USUARIO/consola/.venv/bin/gunicorn -w 2 -b 127.0.0.1:5000 server:app
Restart=always
User=TU_USUARIO

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now consola
sudo systemctl status consola
```

> Nota: el rate-limit y la cuota diaria viven en memoria **por worker**. Con
> `-w 2` workers, un límite de N se vuelve efectivamente ~2N. Para 5 personas da
> igual; si algún día creces, usa Flask-Limiter + Redis (ver ROADMAP).

## 6. HTTPS + nginx (obligatorio para exponerla a internet)

`/etc/nginx/sites-available/consola`:

```nginx
server {
    server_name consola.tudominio.com;
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/consola /etc/nginx/sites-enabled/
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d consola.tudominio.com   # HTTPS gratis (Let's Encrypt)
sudo systemctl reload nginx
```

Con TLS ya puesto, confirma que en `consola.env` estén `CONSOLA_HTTPS=1` y
`CONSOLA_TRUST_PROXY=1`, y reinicia: `sudo systemctl restart consola`.

## 7. Seguridad — qué ya trae y qué te toca a ti

**Ya viene incluido:**

- Contraseñas con hash (scrypt); nunca en texto plano.
- Cookies de sesión `HttpOnly` + `SameSite=Lax` + `Secure` (con `CONSOLA_HTTPS=1`).
  `SameSite=Lax` mitiga CSRF en las peticiones que cambian estado.
- **Rate-limit de login** (anti fuerza bruta) por IP.
- **Cuota diaria de IA por usuarie** (`CONSOLA_AI_DAILY_LIMIT`) + rate-limit de IA:
  protege tu presupuesto de API.
- **Sanitización anti-XSS** de todo lo que entra al editor/documentos (se quitan
  `<script>`, `<iframe>`, manejadores `onX`, `javascript:` …).
- Topes de tamaño en corpus, prompts, gramáticas y documentos (anti-DoS de CPU).
- Aislamiento: cada persona ve **solo sus** documentos.
- Las API keys viven solo en el server.

**Te toca a ti:**

- Definir un `FLASK_SECRET_KEY` largo y único (si no, las sesiones son efímeras).
- Poner HTTPS (paso 6) antes de compartir la URL.
- No subir `users.json` ni `consola.env` a GitHub (ya están en `.gitignore`).
- Respaldar `consola.db` (paso 8).
- Vigilar el gasto de API (paso 9).

**Modelo de amenaza:** tus amix son *semi-confiables* (los conoces). Las medidas
frenan accidentes, curiosidad, fuerza bruta desde fuera y el gasto desbocado — no
están pensadas para un atacante con cuenta y malas intenciones dentro. Para eso
harían falta más cosas (2FA, auditoría, permisos), que están en el ROADMAP.

## 8. Operación diaria

- **Agregar/quitar un amix:** edita `users.json` y reinicia (`systemctl restart consola`).
- **Backups** (SQLite es un solo archivo). Un cron diario:
  ```bash
  0 4 * * * cp /home/TU_USUARIO/consola/consola.db /home/TU_USUARIO/backups/consola-$(date +\%F).db
  ```
- **Ver el uso de IA** (para vigilar gasto):
  ```bash
  sqlite3 consola.db "SELECT user, day, count FROM ai_usage ORDER BY day DESC;"
  ```
- **Logs:** `sudo journalctl -u consola -f`.

## 9. Costos de IA (importante)

Cada consulta a la IA cuesta según el modelo. Para controlar:

- Baja `CONSOLA_AI_DAILY_LIMIT` (p.ej. 20/persona/día).
- Usa modelos baratos: `OPENAI_MODEL=gpt-4o-mini`, o un modelo chico de HF.
- Revisa `ai_usage` seguido (paso 8) y los dashboards de tu proveedor.
- Pon límites de gasto en la consola de Anthropic/OpenAI/HF.

## 10. Problemas comunes

| síntoma | causa / arreglo |
|---|---|
| panel IA dice "sin key" | falta la API key de ese motor en `consola.env` |
| HF: "no soporta herramientas" | ese modelo no hace tool-calling; cambia `HF_MODEL` |
| las sesiones se caen al reiniciar | define `FLASK_SECRET_KEY` |
| "demasiadas solicitudes" (429) | rate-limit; espera un momento |
| "llegaste al limite diario de IA" | subió la cuota; ajústala o espera a mañana |
| markov "no se pudo generar" | pega más corpus o baja el `state`/`state_size` |
| las cookies no pegan en HTTPS | pon `CONSOLA_HTTPS=1` y `CONSOLA_TRUST_PROXY=1` |

---

# PARTE 2 — Usar la consola (para tus amix)

## Entrar

Abre la URL que te pasó el admin, escribe tu **usuario** y **contraseña**. Cada
quien ve solo sus propios documentos.

## Los paneles

- **EDITOR** (centro): escribe con formato (negritas, tipografías, colores, listas,
  títulos). Guarda solo cada 8 segundos y con `Ctrl/Cmd+S`.
  - **abrir**: importa un `.md`, `.txt` o `.html` (crea un doc nuevo).
  - **.txt / .md / .html**: exporta lo que escribiste.
- **DOCS** (izquierda): tus documentos guardados. Click para abrir; `+ nuevo` / `borrar`.
- **OBJETOS** (derecha): archivos guardados (`.md`, `.txt`, modelos `.json` de Markov)
  y tus docs. Click para abrirlos en el editor (el `.md` se ve ya formateado).
- **TRACERY**: gramáticas generativas (estilo Kate Compton). Edita el JSON y dale
  **generar**: `#simbolo#` se reemplaza por una regla al azar.
- **MARKOV**: pega un corpus **o** escribe el nombre de un modelo guardado
  (ej. `raquel.json`), opcional una **semilla**, y **generar**.
- **IA**: elige motor (**Claude / ChatGPT / HuggingFace**), escribe tu petición y
  **consultar**. Con "herramientas" activado, la IA puede **de verdad** escribir
  Tracery, generar Markov, leer tus objetos y leer páginas web — y te aparece un
  botón para aplicar el resultado. Puedes **adjuntar una imagen** (📎) para que la
  IA la analice (necesita un modelo con visión: Claude, GPT‑4o, etc.). Hay un
  **límite diario** de consultas de IA por persona.
- **WEB**: navegador embebido (**ir**) o **lector** (**leer**): el server baja la
  página y extrae el texto legible — funciona con casi cualquier sitio y puedes
  insertar lo leído en tu texto. La IA también puede leer páginas con `leer_url`.

## Pedirle cosas a la IA (ejemplos)

- *"escribe una gramática tracery sobre el mar y genérame 5 versos"*
- *"genera markov con el modelo raquel.json, 3 frases, semilla 'noche'"*
- *"lee bienvenida.md y hazme un resumen en 3 líneas"*
- *"lee https://es.wikipedia.org/wiki/Cadena_de_Márkov y explícamelo simple"*
- adjunta una foto (📎) y *"describe esta imagen"* o *"transcribe el texto de esta foto"*
- *"toma lo que hay en el editor y dale un tono más oscuro"* (activa "incluir editor")

## Tips

- Todo lo que generes (IA, Tracery, Markov) trae un botón **[ insertar en editor ]**.
- El guardado es automático; el estado (`* sin guardar` / `guardado`) sale abajo.
- Si te sale "límite diario de IA", ya usaste tus consultas de hoy; vuelve mañana
  o pídele al admin que suba el límite.
