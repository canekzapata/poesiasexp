"""
CONSOLA — servidor multi-usuario para escribir con markov, tracery, IA y web.

La IA es multi-proveedor (Claude / OpenAI / HuggingFace) y puede USAR herramientas:
escribir y ejecutar gramaticas Tracery, entrenar/generar Markov (incluyendo
modelos guardados como .json), y listar/leer los objetos guardados como archivos.

Configuracion via variables de entorno:
  FLASK_SECRET_KEY   - secreto para firmar cookies de sesion
  CONSOLA_USERS_FILE - ruta al users.json (default: users.json)
  CONSOLA_DB_FILE    - ruta al SQLite (default: consola.db)
  CONSOLA_OBJETOS_DIR- carpeta de objetos/archivos legibles (default: objetos)
  CONSOLA_MARKOV_DIR - carpeta con corpus .txt y modelos .json (default: markov)
  PORT               - puerto a escuchar (default: 5000)

  # proveedores de IA (configura al menos uno)
  CLAUDE_API_KEY / CLAUDE_MODEL           (Anthropic)
  OPENAI_API_KEY / OPENAI_MODEL / OPENAI_BASE_URL
  HF_API_KEY     / HF_MODEL     / HF_BASE_URL   (HuggingFace router, OpenAI-compat)

Para correr en local:
  python -m venv .venv && .venv/bin/pip install -r requirements.txt
  cp users.example.json users.json   # edita y agrega hashes
  export CLAUDE_API_KEY=sk-ant-...
  export FLASK_SECRET_KEY=$(python -c "import secrets;print(secrets.token_hex(32))")
  python server.py
"""

import base64
import html
import ipaddress
import json
import os
import random
import re
import secrets
import socket
import sqlite3
import threading
import time
from functools import wraps
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse

import markovify
import requests
from flask import Flask, g, jsonify, redirect, request, send_from_directory, session
from werkzeug.middleware.proxy_fix import ProxyFix
from werkzeug.security import check_password_hash

try:
    import markdown as _markdown
except Exception:  # pragma: no cover - opcional
    _markdown = None
try:
    from markdownify import markdownify as _markdownify
except Exception:  # pragma: no cover - opcional
    _markdownify = None


def _html_to_md(html):
    if _markdownify is None:
        return None
    return _markdownify(html, heading_style="ATX")

BASE_DIR = Path(__file__).resolve().parent
USERS_FILE = Path(os.environ.get("CONSOLA_USERS_FILE", BASE_DIR / "users.json"))
DB_FILE = Path(os.environ.get("CONSOLA_DB_FILE", BASE_DIR / "consola.db"))
OBJETOS_DIR = Path(os.environ.get("CONSOLA_OBJETOS_DIR", BASE_DIR / "objetos"))
MARKOV_DIR = Path(os.environ.get("CONSOLA_MARKOV_DIR", BASE_DIR / "markov"))

# ─── proveedores de IA ───────────────────────────────────────────────────
CLAUDE_API_KEY = os.environ.get("CLAUDE_API_KEY", "")
CLAUDE_MODEL = os.environ.get("CLAUDE_MODEL", "claude-sonnet-4-6")

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_BASE_URL = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1")

HF_API_KEY = os.environ.get("HF_API_KEY", "") or os.environ.get("HF_TOKEN", "")
HF_MODEL = os.environ.get("HF_MODEL", "meta-llama/Llama-3.1-8B-Instruct")
HF_BASE_URL = os.environ.get("HF_BASE_URL", "https://router.huggingface.co/v1")

MAX_TOOL_STEPS = int(os.environ.get("CONSOLA_MAX_TOOL_STEPS", "5"))

# ─── limites (protegen tu presupuesto de API y la CPU del server) ────────
AI_DAILY_LIMIT = int(os.environ.get("CONSOLA_AI_DAILY_LIMIT", "50"))  # llamadas IA por usuarie/dia (0 = ilimitado)
MAX_PROMPT_CHARS = int(os.environ.get("CONSOLA_MAX_PROMPT", "12000"))
MAX_EDITOR_CHARS = int(os.environ.get("CONSOLA_MAX_EDITOR", "40000"))
MAX_CORPUS_CHARS = int(os.environ.get("CONSOLA_MAX_CORPUS", "300000"))
MAX_GRAMMAR_CHARS = int(os.environ.get("CONSOLA_MAX_GRAMMAR", "20000"))
MAX_DOC_CHARS = int(os.environ.get("CONSOLA_MAX_DOC", "500000"))
MAX_IMAGE_B64 = int(os.environ.get("CONSOLA_MAX_IMAGE_B64", str(6 * 1024 * 1024)))  # base64 chars
IMAGE_TYPES = {"image/png", "image/jpeg", "image/webp", "image/gif"}

# rate limits: (max_llamadas, ventana_segundos)
RL_LOGIN = (10, 300)     # por IP
RL_AI = (12, 60)         # por usuarie
RL_GEN = (40, 60)        # markov/tracery por usuarie
RL_READER = (20, 60)     # lector web por usuarie

# ─── lector web (WEB opción A: el server baja la URL y extrae texto) ─────
READER_ENABLED = os.environ.get("CONSOLA_READER", "1").lower() not in ("0", "false", "no", "off")
READER_MAX_BYTES = int(os.environ.get("CONSOLA_READER_MAX_BYTES", str(2 * 1024 * 1024)))
READER_TIMEOUT = int(os.environ.get("CONSOLA_READER_TIMEOUT", "12"))
READER_UA = os.environ.get("CONSOLA_READER_UA", "ConsolaReader/0.1 (+writing tool)")

# ─── secreto de sesion ───────────────────────────────────────────────────
_secret = os.environ.get("FLASK_SECRET_KEY", "")
_SECRET_EPHEMERAL = False
if not _secret or _secret == "dev-insecure-change-me":
    _secret = secrets.token_hex(32)  # efimero: las sesiones se caen al reiniciar
    _SECRET_EPHEMERAL = True

# ¿estamos detras de un proxy TLS (nginx)? entonces confia en X-Forwarded-*
_TRUST_PROXY = os.environ.get("CONSOLA_TRUST_PROXY", "").lower() in ("1", "true", "yes")
# ¿servir cookies solo por HTTPS? (actívalo en produccion con TLS)
_HTTPS = os.environ.get("CONSOLA_HTTPS", "").lower() in ("1", "true", "yes")

app = Flask(__name__)
app.secret_key = _secret
if _TRUST_PROXY:
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=_HTTPS,
    MAX_CONTENT_LENGTH=8 * 1024 * 1024,
)


class ProviderError(Exception):
    """Error de un proveedor de IA (red o respuesta != 200)."""

    def __init__(self, message, status=502):
        super().__init__(message)
        self.status = status


# ─── users ──────────────────────────────────────────────────────────────

def load_users():
    if not USERS_FILE.exists():
        return {}
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    return {u["username"]: u["password_hash"] for u in data.get("users", [])}


# ─── db ─────────────────────────────────────────────────────────────────

def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_FILE)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(_exc):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    conn = sqlite3.connect(DB_FILE)
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            owner TEXT NOT NULL,
            title TEXT NOT NULL DEFAULT 'sin titulo',
            body  TEXT NOT NULL DEFAULT '',
            created_at REAL NOT NULL,
            updated_at REAL NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_documents_owner ON documents(owner);

        CREATE TABLE IF NOT EXISTS ai_usage (
            user  TEXT NOT NULL,
            day   TEXT NOT NULL,
            count INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (user, day)
        );
        """
    )
    conn.commit()
    conn.close()


# ─── auth helpers ───────────────────────────────────────────────────────

def login_required(fn):
    @wraps(fn)
    def wrapper(*a, **kw):
        if not session.get("user"):
            return jsonify({"error": "no auth"}), 401
        return fn(*a, **kw)
    return wrapper


def current_user():
    return session.get("user")


# ─── rate limiting (en memoria, por proceso) ─────────────────────────────
# Suficiente para un despliegue chico (pocos amix). Para escala real usa
# Flask-Limiter + Redis (ver MANUAL.md).
_rl_lock = threading.Lock()
_rl_hits = {}


def _rate_ok(key, limit, window):
    now = time.time()
    with _rl_lock:
        q = _rl_hits.setdefault(key, [])
        cutoff = now - window
        while q and q[0] < cutoff:
            q.pop(0)
        if len(q) >= limit:
            return False
        q.append(now)
        return True


def rate_limit(rule, scope="ip"):
    limit, window = rule

    def deco(fn):
        @wraps(fn)
        def wrapper(*a, **kw):
            ident = current_user() if scope == "user" and current_user() else (request.remote_addr or "?")
            if not _rate_ok(f"{fn.__name__}:{scope}:{ident}", limit, window):
                return jsonify({"error": "demasiadas solicitudes, espera un momento"}), 429
            return fn(*a, **kw)
        return wrapper
    return deco


# ─── cuota diaria de IA por usuarie (protege el presupuesto de API) ──────

def ai_quota_check_and_incr(user):
    if AI_DAILY_LIMIT <= 0:
        return True, 0, 0
    day = time.strftime("%Y-%m-%d")
    db = get_db()
    row = db.execute("SELECT count FROM ai_usage WHERE user = ? AND day = ?", (user, day)).fetchone()
    used = row["count"] if row else 0
    if used >= AI_DAILY_LIMIT:
        return False, used, AI_DAILY_LIMIT
    db.execute(
        "INSERT INTO ai_usage(user, day, count) VALUES(?, ?, 1) "
        "ON CONFLICT(user, day) DO UPDATE SET count = count + 1",
        (user, day),
    )
    db.commit()
    return True, used + 1, AI_DAILY_LIMIT


# ─── sanitizador HTML (defensa contra XSS en docs importados/guardados) ──

class _Sanitizer(HTMLParser):
    ALLOWED = {
        "p", "br", "hr", "div", "span", "b", "strong", "i", "em", "u", "s", "strike",
        "del", "ins", "mark", "sub", "sup", "h1", "h2", "h3", "h4", "h5", "h6",
        "ul", "ol", "li", "blockquote", "pre", "code", "a", "img", "font",
        "table", "thead", "tbody", "tr", "td", "th", "caption",
    }
    VOID = {"br", "hr", "img"}
    DROP_WITH_CONTENT = {"script", "style", "iframe", "object", "embed", "template"}
    OK_ATTRS = {"style", "color", "face", "size", "align", "title", "class", "alt",
                "colspan", "rowspan"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out = []
        self._skip = 0

    def _safe_url(self, v, allow_data_image=False):
        v = (v or "").strip()
        low = v.lower()
        if low.startswith(("http://", "https://", "mailto:", "#", "/")):
            return v
        if allow_data_image and low.startswith("data:image/"):
            return v
        return None

    def handle_starttag(self, tag, attrs):
        if tag in self.DROP_WITH_CONTENT:
            self._skip += 1
            return
        if self._skip or tag not in self.ALLOWED:
            return
        safe = []
        for k, v in attrs:
            k = k.lower()
            if k.startswith("on"):
                continue
            if k == "href":
                u = self._safe_url(v)
                if u:
                    safe.append((k, u))
                continue
            if k == "src":
                u = self._safe_url(v, allow_data_image=True)
                if u:
                    safe.append((k, u))
                continue
            if k in self.OK_ATTRS:
                low = (v or "").lower()
                if "javascript:" in low or "expression(" in low or "</" in low:
                    continue
                safe.append((k, v))
        attr_str = "".join(f' {k}="{html.escape(v or "", quote=True)}"' for k, v in safe)
        self.out.append(f"<{tag}{attr_str}>")

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)

    def handle_endtag(self, tag):
        if tag in self.DROP_WITH_CONTENT:
            if self._skip:
                self._skip -= 1
            return
        if self._skip or tag not in self.ALLOWED or tag in self.VOID:
            return
        self.out.append(f"</{tag}>")

    def handle_data(self, data):
        if self._skip:
            return
        self.out.append(html.escape(data))

    def result(self):
        return "".join(self.out)


def sanitize_html(s):
    if not s:
        return ""
    p = _Sanitizer()
    try:
        p.feed(s)
        p.close()
    except Exception:  # noqa: BLE001 - ante cualquier fallo, escapa todo
        return html.escape(s)
    return p.result()


# ─── tracery (motor propio en python) ────────────────────────────────────
# Subset del Tracery de Kate Compton: expansion de #simbolos#, listas de reglas,
# acciones [clave:valor] (push) y modificadores .capitalize/.a/.s/.ed/etc.

def _mod_capitalize(s):
    return s[:1].upper() + s[1:] if s else s


def _mod_capitalize_all(s):
    return " ".join(w[:1].upper() + w[1:] for w in s.split(" "))


def _mod_a(s):
    if not s:
        return s
    first = s.lstrip()[:1].lower()
    if first in "aeiou":
        return "an " + s
    return "a " + s


def _mod_s(s):
    if not s:
        return s
    if re.search(r"[^aeiou]y$", s):
        return s[:-1] + "ies"
    if s.endswith(("s", "x", "z", "sh", "ch")):
        return s + "es"
    return s + "s"


def _mod_ed(s):
    if not s:
        return s
    if s.endswith("e"):
        return s + "d"
    if re.search(r"[^aeiou]y$", s):
        return s[:-1] + "ied"
    return s + "ed"


TRACERY_MODIFIERS = {
    "capitalize": _mod_capitalize,
    "capitalizeAll": _mod_capitalize_all,
    "a": _mod_a,
    "s": _mod_s,
    "ed": _mod_ed,
    "uppercase": lambda s: s.upper(),
    "lowercase": lambda s: s.lower(),
}


def _tracery_flatten_rule(rule, grammar, overlay, depth):
    if depth > 200:
        return rule
    out = []
    i, n = 0, len(rule)
    while i < n:
        c = rule[i]
        if c == "\\" and i + 1 < n:
            out.append(rule[i + 1])
            i += 2
        elif c == "[":
            j = rule.find("]", i)
            if j == -1:
                out.append(c)
                i += 1
                continue
            _tracery_apply_action(rule[i + 1:j], grammar, overlay, depth)
            i = j + 1
        elif c == "#":
            j = rule.find("#", i + 1)
            if j == -1:
                out.append(c)
                i += 1
                continue
            out.append(_tracery_expand_tag(rule[i + 1:j], grammar, overlay, depth))
            i = j + 1
        else:
            out.append(c)
            i += 1
    return "".join(out)


def _tracery_apply_action(action, grammar, overlay, depth):
    if ":" not in action:
        return
    key, val = action.split(":", 1)
    key = key.strip()
    if not key:
        return
    expanded = _tracery_flatten_rule(val, grammar, overlay, depth + 1)
    overlay[key] = [expanded]


def _tracery_expand_tag(tag, grammar, overlay, depth):
    # acciones incrustadas al inicio del tag: [k:v]#sym#
    while tag.startswith("["):
        j = tag.find("]")
        if j == -1:
            break
        _tracery_apply_action(tag[1:j], grammar, overlay, depth)
        tag = tag[j + 1:]
    if not tag:
        return ""
    parts = tag.split(".")
    sym, mods = parts[0], parts[1:]
    rules = overlay.get(sym, grammar.get(sym))
    if rules is None:
        return "((" + sym + "))"
    if isinstance(rules, str):
        rules = [rules]
    chosen = random.choice(rules)
    val = _tracery_flatten_rule(str(chosen), grammar, overlay, depth + 1)
    for m in mods:
        fn = TRACERY_MODIFIERS.get(m.split("(")[0])
        if fn:
            val = fn(val)
    return val


def tracery_flatten(grammar, origin="#origin#"):
    if not isinstance(grammar, dict):
        raise ValueError("la gramatica debe ser un objeto JSON")
    return _tracery_flatten_rule(str(origin), grammar, {}, 0)


# ─── objetos guardados como archivos ─────────────────────────────────────

_ALLOWED_OBJ_EXT = {".txt", ".md", ".json"}


def _safe_name(name):
    """Solo el nombre base, sin rutas ni traversal."""
    return Path(str(name)).name


def list_objects(user):
    items = []
    rows = get_db().execute(
        "SELECT id, title, updated_at FROM documents WHERE owner = ? ORDER BY updated_at DESC",
        (user,),
    ).fetchall()
    for r in rows:
        items.append({
            "tipo": "doc",
            "nombre": r["title"],
            "ref": f"doc:{r['id']}",
            "updated_at": r["updated_at"],
        })
    seen = set()
    for base in (OBJETOS_DIR, MARKOV_DIR):
        if not base.exists():
            continue
        for p in sorted(base.glob("*")):
            if not p.is_file() or p.suffix.lower() not in _ALLOWED_OBJ_EXT:
                continue
            if p.name in seen:
                continue
            seen.add(p.name)
            items.append({
                "tipo": "archivo",
                "nombre": p.name,
                "ref": p.name,
                "bytes": p.stat().st_size,
                "ext": p.suffix.lower().lstrip("."),
            })
    return items


def read_object(user, ref):
    ref = str(ref or "").strip()
    if ref.startswith("doc:"):
        try:
            doc_id = int(ref.split(":", 1)[1])
        except ValueError:
            raise FileNotFoundError(ref)
        row = get_db().execute(
            "SELECT title, body FROM documents WHERE id = ? AND owner = ?",
            (doc_id, user),
        ).fetchone()
        if not row:
            raise FileNotFoundError(ref)
        body = row["body"] or ""
        text = _html_to_md(body) or body
        return f"# {row['title']}\n\n{text}".strip()
    name = _safe_name(ref)
    for base in (OBJETOS_DIR, MARKOV_DIR):
        p = base / name
        if p.is_file() and p.suffix.lower() in _ALLOWED_OBJ_EXT:
            return p.read_text(encoding="utf-8", errors="replace")
    raise FileNotFoundError(ref)


# ─── markov ──────────────────────────────────────────────────────────────

def _load_markov_model(name):
    name = _safe_name(name)
    if not name.endswith(".json"):
        name += ".json"
    for base in (MARKOV_DIR, OBJETOS_DIR):
        p = base / name
        if p.is_file():
            return markovify.Text.from_json(p.read_text(encoding="utf-8"))
    raise FileNotFoundError(f"modelo markov no encontrado: {name}")


def markov_generate(text=None, model_name=None, sentences=3, state_size=2, seed=None):
    sentences = max(1, min(int(sentences or 3), 20))
    state_size = max(1, min(int(state_size or 2), 4))
    if model_name:
        model = _load_markov_model(model_name)
    else:
        if not text or not text.strip():
            raise ValueError("necesito corpus de entrenamiento o un modelo .json")
        model = markovify.Text(text, state_size=state_size)
    out = []
    use_seed = (seed or "").strip() or None
    for _ in range(sentences):
        s = None
        if use_seed:
            try:
                s = model.make_sentence_with_start(use_seed, strict=False, tries=100)
            except Exception:
                s = None
            use_seed = None  # la semilla solo arranca la primera frase
        if not s:
            s = model.make_sentence(tries=100)
        if s:
            out.append(s)
    if not out:
        raise ValueError("no se pudo generar (mas corpus o baja el state_size)")
    return " ".join(out)


# ─── lector web (con proteccion anti-SSRF) ───────────────────────────────

def _host_is_public(hostname):
    """True solo si TODAS las IPs del host son publicas (bloquea loopback,
    redes privadas, link-local 169.254.x, reservadas, multicast)."""
    try:
        infos = socket.getaddrinfo(hostname, None)
    except Exception:
        return False, "no se pudo resolver el host"
    if not infos:
        return False, "sin direcciones"
    for info in infos:
        ip = info[4][0].split("%")[0]  # quita zona IPv6
        try:
            addr = ipaddress.ip_address(ip)
        except ValueError:
            return False, "ip invalida"
        if (addr.is_private or addr.is_loopback or addr.is_link_local
                or addr.is_reserved or addr.is_multicast or addr.is_unspecified):
            return False, f"ip no permitida ({ip})"
    return True, None


def fetch_url(url, max_bytes=None, timeout=None, max_redirects=5):
    """Baja una URL de forma segura: solo http/https, host publico, revalidando
    cada redirect, con tope de tamano y timeout. Devuelve (url_final, html)."""
    max_bytes = max_bytes or READER_MAX_BYTES
    timeout = timeout or READER_TIMEOUT
    seen = 0
    while True:
        p = urlparse(url)
        if p.scheme not in ("http", "https"):
            raise ValueError("solo se permiten URLs http/https")
        if not p.hostname:
            raise ValueError("URL sin host")
        ok, reason = _host_is_public(p.hostname)
        if not ok:
            raise ValueError(f"host no permitido: {reason}")
        r = requests.get(
            url, timeout=timeout, stream=True, allow_redirects=False,
            headers={"User-Agent": READER_UA, "Accept": "text/html,text/plain,*/*"},
        )
        try:
            if r.status_code in (301, 302, 303, 307, 308):
                loc = r.headers.get("Location")
                if not loc or seen >= max_redirects:
                    raise ValueError("demasiados redirects")
                url = urljoin(url, loc)
                seen += 1
                continue
            ctype = (r.headers.get("Content-Type") or "").lower()
            if ctype and "html" not in ctype and "text" not in ctype and "xml" not in ctype:
                raise ValueError(f"tipo de contenido no soportado: {ctype}")
            total, chunks = 0, []
            for c in r.iter_content(8192):
                if not c:
                    continue
                chunks.append(c)
                total += len(c)
                if total > max_bytes:
                    break
            raw = b"".join(chunks)
            enc = r.encoding or "utf-8"
            try:
                return url, raw.decode(enc, errors="replace")
            except (LookupError, TypeError):
                return url, raw.decode("utf-8", errors="replace")
        finally:
            r.close()


class _Reader(HTMLParser):
    """Extractor simple de 'lectura': quita chrome (nav/scripts/etc.) y junta
    el texto de bloques (parrafos, titulos, listas, citas)."""
    SKIP = {"script", "style", "nav", "header", "footer", "aside", "form",
            "noscript", "svg", "button", "iframe", "template", "select"}
    BLOCK = {"p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "blockquote", "pre", "br"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self._skip = 0
        self._in_title = False
        self.title = ""
        self.parts = []
        self._buf = []

    def handle_starttag(self, tag, attrs):
        if tag in self.SKIP:
            self._skip += 1
            return
        if tag == "title":
            self._in_title = True
        if tag in self.BLOCK:
            self._flush()

    def handle_startendtag(self, tag, attrs):
        if tag == "br":
            self._flush()

    def handle_endtag(self, tag):
        if tag in self.SKIP:
            if self._skip:
                self._skip -= 1
            return
        if tag == "title":
            self._in_title = False
        if tag in self.BLOCK:
            self._flush()

    def handle_data(self, data):
        if self._skip:
            return
        if self._in_title:
            self.title += data
            return
        self._buf.append(data)

    def _flush(self):
        if self._buf:
            line = re.sub(r"\s+", " ", "".join(self._buf)).strip()
            if len(line) > 1:
                self.parts.append(line)
            self._buf = []

    def close(self):
        super().close()
        self._flush()


def extract_readable(page_html, max_paras=500, max_chars=60000):
    r = _Reader()
    try:
        r.feed(page_html)
        r.close()
    except Exception:  # noqa: BLE001
        pass
    paras, seen = [], set()
    for p in r.parts:
        if p in seen:  # dedup lineas repetidas (menus, etc.)
            continue
        seen.add(p)
        paras.append(p)
        if len(paras) >= max_paras:
            break
    title = re.sub(r"\s+", " ", r.title).strip()
    if not title and paras:
        title = paras[0][:120]
    text = "\n\n".join(paras)[:max_chars]
    return {"title": title, "text": text, "paras": paras}


def read_web(url):
    final_url, page = fetch_url(url)
    data = extract_readable(page)
    data["url"] = final_url
    return data


# ─── herramientas para la IA (esquema estilo OpenAI) ─────────────────────

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "escribir_tracery",
            "description": (
                "Escribe/define una gramatica Tracery (estilo Kate Compton) y la EJECUTA "
                "para generar ejemplos reales. Usala cuando el usuario quiera generar texto "
                "con reglas/plantillas o variar frases. La gramatica es un objeto JSON de "
                "simbolo -> lista de reglas de texto; usa #otroSimbolo# para expandir y "
                "modificadores como .capitalize o .a"
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "grammar": {
                        "type": "object",
                        "description": "Gramatica Tracery JSON. Cada clave es un simbolo, cada valor una lista de reglas.",
                    },
                    "origin": {"type": "string", "description": "Regla inicial, por defecto '#origin#'."},
                    "n": {"type": "integer", "description": "Cuantas expansiones generar (1-20)."},
                },
                "required": ["grammar"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "generar_markov",
            "description": (
                "Genera texto con cadenas de Markov (markovify). Puedes entrenar desde un "
                "corpus de texto, o cargar un modelo guardado como archivo .json (p.ej. "
                "'raquel.json'). Opcionalmente una palabra semilla para arrancar."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "corpus": {"type": "string", "description": "Texto de entrenamiento (si no usas un modelo)."},
                    "modelo": {"type": "string", "description": "Nombre de un modelo .json guardado (p.ej. 'raquel.json')."},
                    "oraciones": {"type": "integer", "description": "Cuantas oraciones (1-20)."},
                    "state_size": {"type": "integer", "description": "Tamano de estado 1-4 (default 2)."},
                    "seed": {"type": "string", "description": "Palabra para iniciar la primera oracion."},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "listar_objetos",
            "description": "Lista los objetos guardados: documentos del usuario y archivos .txt/.md/.json disponibles.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "leer_objeto",
            "description": "Lee el contenido de un objeto guardado. Usa el 'ref' o nombre devuelto por listar_objetos (doc:ID o nombre.ext).",
            "parameters": {
                "type": "object",
                "properties": {"nombre": {"type": "string", "description": "ref (doc:ID) o nombre de archivo."}},
                "required": ["nombre"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "leer_url",
            "description": (
                "Lee una pagina web (http/https) y devuelve su texto legible (titulo + "
                "contenido, sin menus ni scripts). Util para citar o resumir research. "
                "Solo sitios publicos."
            ),
            "parameters": {
                "type": "object",
                "properties": {"url": {"type": "string", "description": "URL http/https a leer."}},
                "required": ["url"],
            },
        },
    },
]


def anthropic_tools():
    return [
        {
            "name": t["function"]["name"],
            "description": t["function"]["description"],
            "input_schema": t["function"].get("parameters", {"type": "object", "properties": {}}),
        }
        for t in TOOLS
    ]


def _clamp_int(v, lo, hi, default):
    try:
        return max(lo, min(int(v), hi))
    except (TypeError, ValueError):
        return default


def execute_tool(name, args, ctx):
    """Ejecuta una herramienta y devuelve texto para el modelo. Registra 'acciones'
    que el frontend puede aplicar (cargar gramatica, insertar texto, etc.)."""
    args = args or {}
    try:
        if name == "escribir_tracery":
            grammar = args.get("grammar") or {}
            if len(json.dumps(grammar)) > MAX_GRAMMAR_CHARS:
                return "ERROR: la gramatica es demasiado grande."
            if isinstance(grammar, str):
                grammar = json.loads(grammar)
            origin = (args.get("origin") or "#origin#")[:500]
            n = _clamp_int(args.get("n"), 1, 20, 3)
            samples = [tracery_flatten(grammar, origin) for _ in range(n)]
            ctx["actions"].append({"type": "tracery", "grammar": grammar, "origin": origin, "samples": samples})
            return "Gramatica valida. Ejemplos generados:\n" + "\n".join(f"- {s}" for s in samples)

        if name == "generar_markov":
            corpus = (args.get("corpus") or "")[:MAX_CORPUS_CHARS] or None
            modelo = (args.get("modelo") or "")[:200] or None
            if not modelo and not (corpus and corpus.strip()):
                et = ctx.get("editor_text") or ""
                if len(et.split()) >= 20:
                    corpus = et
            text = markov_generate(
                text=corpus,
                model_name=modelo,
                sentences=args.get("oraciones", 3),
                state_size=args.get("state_size", 2),
                seed=args.get("seed"),
            )
            ctx["actions"].append({"type": "markov", "text": text})
            return text

        if name == "listar_objetos":
            items = list_objects(ctx["user"])
            if not items:
                return "No hay objetos guardados todavia."
            return json.dumps(items, ensure_ascii=False)

        if name == "leer_objeto":
            ref = args.get("nombre") or args.get("name") or args.get("ref") or ""
            content = read_object(ctx["user"], ref)
            ctx["actions"].append({"type": "objeto", "nombre": ref, "content": content})
            return content[:6000]

        if name == "leer_url":
            if not READER_ENABLED:
                return "ERROR: el lector web esta deshabilitado en este server."
            data = read_web((args.get("url") or "").strip())
            ctx["actions"].append({"type": "web", "url": data["url"], "title": data["title"], "text": data["text"]})
            head = f"{data['title']}\n{data['url']}\n\n" if data["title"] else ""
            return (head + data["text"])[:6000]

        return f"ERROR: herramienta desconocida '{name}'"
    except Exception as e:  # noqa: BLE001 - queremos devolver el error al modelo
        return f"ERROR en {name}: {e}"


# ─── loops de proveedores ────────────────────────────────────────────────

SYSTEM_PROMPT = (
    "Eres un asistente de escritura dentro de CONSOLA, una consola creativa multi-panel. "
    "Puedes usar herramientas para: escribir y EJECUTAR gramaticas Tracery, entrenar/generar "
    "cadenas de Markov (incluyendo modelos guardados como archivos .json), listar/leer los "
    "objetos guardados (documentos y archivos .txt/.md), y leer paginas web publicas con "
    "leer_url. Cuando el usuario pida generar con Tracery o Markov, o citar/resumir una URL, "
    "USA la herramienta correspondiente en vez de inventar el resultado. "
    "Responde en espanol, breve y directo."
)


def parse_image(data_url):
    """Valida una imagen enviada como data URL base64. Devuelve {media_type, data}
    o None si no hay imagen. Lanza ValueError si es invalida o muy grande."""
    if not data_url:
        return None
    m = re.match(r"^data:(image/[a-z0-9.+-]+);base64,(.+)$", str(data_url).strip(), re.I | re.S)
    if not m:
        raise ValueError("imagen invalida (se espera un data URL base64)")
    mt = m.group(1).lower()
    if mt == "image/jpg":
        mt = "image/jpeg"
    if mt not in IMAGE_TYPES:
        raise ValueError(f"tipo de imagen no soportado: {mt}")
    b64 = m.group(2)
    if len(b64) > MAX_IMAGE_B64:
        raise ValueError("imagen demasiado grande")
    try:
        base64.b64decode(b64, validate=True)
    except Exception:
        raise ValueError("base64 invalido")
    return {"media_type": mt, "data": b64}


def run_anthropic(system, user_content, ctx, max_tokens=1500):
    if not CLAUDE_API_KEY:
        raise ProviderError("el servidor no tiene CLAUDE_API_KEY configurada", 500)
    headers = {
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }
    img = ctx.get("image")
    if img:
        first = [
            {"type": "text", "text": user_content},
            {"type": "image", "source": {"type": "base64", "media_type": img["media_type"], "data": img["data"]}},
        ]
    else:
        first = user_content
    messages = [{"role": "user", "content": first}]
    tools = anthropic_tools() if ctx.get("use_tools") else None
    final_text = ""
    for _ in range(MAX_TOOL_STEPS):
        body = {"model": CLAUDE_MODEL, "max_tokens": max_tokens, "system": system, "messages": messages}
        if tools:
            body["tools"] = tools
        try:
            r = requests.post("https://api.anthropic.com/v1/messages", headers=headers, json=body, timeout=90)
        except requests.RequestException as e:
            raise ProviderError(f"red: {e}")
        if r.status_code != 200:
            try:
                msg = r.json().get("error", {}).get("message", r.text)
            except Exception:
                msg = r.text
            raise ProviderError(f"claude: {msg}", r.status_code)
        data = r.json()
        blocks = data.get("content", [])
        text = "".join(b.get("text", "") for b in blocks if b.get("type") == "text")
        if text:
            final_text = text
        tool_uses = [b for b in blocks if b.get("type") == "tool_use"]
        if not tool_uses:
            break
        messages.append({"role": "assistant", "content": blocks})
        results = []
        for tu in tool_uses:
            res = execute_tool(tu.get("name"), tu.get("input", {}), ctx)
            ctx["transcript"].append({"tool": tu.get("name"), "args": tu.get("input", {}), "result": res})
            results.append({"type": "tool_result", "tool_use_id": tu.get("id"), "content": res})
        messages.append({"role": "user", "content": results})
    return final_text, CLAUDE_MODEL


def run_openai_style(base_url, api_key, model, system, user_content, ctx, provider_label, max_tokens=1500):
    if not api_key:
        raise ProviderError(f"el servidor no tiene la API key de {provider_label} configurada", 500)
    url = base_url.rstrip("/") + "/chat/completions"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    img = ctx.get("image")
    if img:
        user_msg = [
            {"type": "text", "text": user_content},
            {"type": "image_url", "image_url": {"url": f"data:{img['media_type']};base64,{img['data']}"}},
        ]
    else:
        user_msg = user_content
    messages = [{"role": "system", "content": system}, {"role": "user", "content": user_msg}]
    use_tools = bool(ctx.get("use_tools"))
    final_text = ""
    for _ in range(MAX_TOOL_STEPS):
        body = {"model": model, "messages": messages, "max_tokens": max_tokens}
        if use_tools:
            body["tools"] = TOOLS
            body["tool_choice"] = "auto"
        try:
            r = requests.post(url, headers=headers, json=body, timeout=90)
        except requests.RequestException as e:
            raise ProviderError(f"red: {e}")
        if r.status_code != 200:
            # algunos modelos HF no soportan tools -> reintenta sin tools una vez
            if use_tools:
                use_tools = False
                continue
            try:
                msg = r.json().get("error", {})
                msg = msg.get("message", msg) if isinstance(msg, dict) else msg
            except Exception:
                msg = r.text
            raise ProviderError(f"{provider_label}: {msg}", r.status_code)
        data = r.json()
        msg = data["choices"][0]["message"]
        content = msg.get("content") or ""
        if content:
            final_text = content
        tool_calls = msg.get("tool_calls")
        if not tool_calls:
            break
        messages.append(msg)
        for tc in tool_calls:
            fn = tc.get("function", {}).get("name")
            try:
                fargs = json.loads(tc.get("function", {}).get("arguments") or "{}")
            except Exception:
                fargs = {}
            res = execute_tool(fn, fargs, ctx)
            ctx["transcript"].append({"tool": fn, "args": fargs, "result": res})
            messages.append({"role": "tool", "tool_call_id": tc.get("id"), "content": res})
    return final_text, model


def providers_status():
    return {
        "claude": {"ok": bool(CLAUDE_API_KEY), "model": CLAUDE_MODEL},
        "openai": {"ok": bool(OPENAI_API_KEY), "model": OPENAI_MODEL},
        "hf": {"ok": bool(HF_API_KEY), "model": HF_MODEL},
        "reader": bool(READER_ENABLED),
    }


# ─── routes: static + auth ──────────────────────────────────────────────

@app.route("/")
def index():
    if not session.get("user"):
        return send_from_directory(BASE_DIR, "login.html")
    return send_from_directory(BASE_DIR, "consola.html")


@app.route("/static/<path:filename>")
def static_files(filename):
    return send_from_directory(BASE_DIR / "static", filename)


@app.route("/login", methods=["POST"])
@rate_limit(RL_LOGIN, scope="ip")
def login():
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    users = load_users()
    if username in users and check_password_hash(users[username], password):
        session["user"] = username
        return jsonify({"ok": True, "user": username})
    return jsonify({"error": "credenciales invalidas"}), 401


@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"ok": True})


@app.route("/me")
def me():
    user = session.get("user")
    if not user:
        return jsonify({"user": None}), 401
    return jsonify({"user": user})


@app.route("/api/providers")
@login_required
def api_providers():
    return jsonify(providers_status())


# ─── routes: documents ──────────────────────────────────────────────────

@app.route("/api/docs", methods=["GET"])
@login_required
def docs_list():
    rows = get_db().execute(
        "SELECT id, title, updated_at FROM documents WHERE owner = ? ORDER BY updated_at DESC",
        (current_user(),),
    ).fetchall()
    return jsonify({"docs": [dict(r) for r in rows]})


@app.route("/api/docs", methods=["POST"])
@login_required
def docs_create():
    data = request.get_json() or {}
    title = ((data.get("title") or "sin titulo").strip() or "sin titulo")[:200]
    body = sanitize_html((data.get("body") or "")[:MAX_DOC_CHARS])
    now = time.time()
    db = get_db()
    cur = db.execute(
        "INSERT INTO documents (owner, title, body, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
        (current_user(), title, body, now, now),
    )
    db.commit()
    return jsonify({"id": cur.lastrowid, "title": title, "updated_at": now})


@app.route("/api/docs/<int:doc_id>", methods=["GET"])
@login_required
def docs_get(doc_id):
    row = get_db().execute(
        "SELECT id, title, body, updated_at FROM documents WHERE id = ? AND owner = ?",
        (doc_id, current_user()),
    ).fetchone()
    if not row:
        return jsonify({"error": "no existe"}), 404
    return jsonify(dict(row))


@app.route("/api/docs/<int:doc_id>", methods=["PUT"])
@login_required
def docs_update(doc_id):
    data = request.get_json() or {}
    db = get_db()
    row = db.execute(
        "SELECT id FROM documents WHERE id = ? AND owner = ?",
        (doc_id, current_user()),
    ).fetchone()
    if not row:
        return jsonify({"error": "no existe"}), 404
    fields, values = [], []
    if "title" in data:
        fields.append("title = ?")
        values.append(((data["title"] or "sin titulo").strip() or "sin titulo")[:200])
    if "body" in data:
        fields.append("body = ?")
        values.append(sanitize_html((data["body"] or "")[:MAX_DOC_CHARS]))
    fields.append("updated_at = ?")
    now = time.time()
    values.append(now)
    values.extend([doc_id, current_user()])
    db.execute(
        f"UPDATE documents SET {', '.join(fields)} WHERE id = ? AND owner = ?",
        values,
    )
    db.commit()
    return jsonify({"ok": True, "updated_at": now})


@app.route("/api/docs/<int:doc_id>", methods=["DELETE"])
@login_required
def docs_delete(doc_id):
    db = get_db()
    row = db.execute(
        "SELECT id FROM documents WHERE id = ? AND owner = ?",
        (doc_id, current_user()),
    ).fetchone()
    if not row:
        return jsonify({"error": "no existe"}), 404
    db.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
    db.commit()
    return jsonify({"ok": True})


# ─── routes: objetos (archivos legibles) ─────────────────────────────────

@app.route("/api/objects", methods=["GET"])
@login_required
def api_objects_list():
    return jsonify({"objects": list_objects(current_user())})


@app.route("/api/objects/<path:name>", methods=["GET"])
@login_required
def api_objects_read(name):
    try:
        content = read_object(current_user(), name)
    except FileNotFoundError:
        return jsonify({"error": "no existe"}), 404
    except Exception as e:  # noqa: BLE001
        return jsonify({"error": str(e)}), 400
    ext = Path(name).suffix.lower().lstrip(".") or ("md" if name.startswith("doc:") else "txt")
    return jsonify({"name": name, "ext": ext, "content": content})


# ─── routes: conversion md <-> html (para importar/exportar) ─────────────

@app.route("/api/convert", methods=["POST"])
@login_required
def api_convert():
    data = request.get_json() or {}
    content = (data.get("content") or "")[:MAX_DOC_CHARS]
    to = (data.get("to") or "").lower()
    if to == "html":  # markdown/txt -> html
        if _markdown is not None:
            out_html = _markdown.markdown(content, extensions=["extra", "sane_lists", "nl2br"])
        else:
            out_html = "<p>" + content.replace("\n\n", "</p><p>").replace("\n", "<br>") + "</p>"
        return jsonify({"content": sanitize_html(out_html)})
    if to == "md":  # html -> markdown
        md = _html_to_md(content)
        if md is None:
            md = re.sub(r"<[^>]+>", "", content)
        return jsonify({"content": md})
    return jsonify({"error": "usa to=html o to=md"}), 400


# ─── routes: generadores ─────────────────────────────────────────────────

@app.route("/api/markov", methods=["POST"])
@login_required
@rate_limit(RL_GEN, scope="user")
def api_markov():
    data = request.get_json() or {}
    text = (data.get("text") or "").strip()[:MAX_CORPUS_CHARS]
    modelo = (data.get("modelo") or "")[:200] or None
    seed = (data.get("seed") or "")[:100] or None
    sentences = _clamp_int(data.get("sentences"), 1, 20, 3)
    state_size = _clamp_int(data.get("state_size"), 1, 4, 2)
    if not text and not modelo:
        return jsonify({"error": "necesito texto de entrenamiento o un modelo .json"}), 400
    try:
        result = markov_generate(
            text=text or None, model_name=modelo, sentences=sentences, state_size=state_size, seed=seed
        )
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:  # noqa: BLE001
        return jsonify({"error": f"markov: {e}"}), 400
    return jsonify({"result": result})


@app.route("/api/tracery", methods=["POST"])
@login_required
@rate_limit(RL_GEN, scope="user")
def api_tracery():
    data = request.get_json() or {}
    grammar = data.get("grammar")
    if len(json.dumps(grammar)) > MAX_GRAMMAR_CHARS:
        return jsonify({"error": "gramatica demasiado grande"}), 413
    if isinstance(grammar, str):
        try:
            grammar = json.loads(grammar)
        except Exception as e:  # noqa: BLE001
            return jsonify({"error": f"JSON invalido: {e}"}), 400
    origin = (data.get("origin") or "#origin#")[:500]
    n = _clamp_int(data.get("n"), 1, 20, 3)
    try:
        lines = [tracery_flatten(grammar, origin) for _ in range(n)]
    except Exception as e:  # noqa: BLE001
        return jsonify({"error": f"tracery: {e}"}), 400
    return jsonify({"result": "\n\n".join(lines), "lines": lines})


@app.route("/api/leer-url", methods=["POST"])
@login_required
@rate_limit(RL_READER, scope="user")
def api_leer_url():
    if not READER_ENABLED:
        return jsonify({"error": "el lector web esta deshabilitado"}), 403
    data = request.get_json() or {}
    url = (data.get("url") or "").strip()
    if not url:
        return jsonify({"error": "falta la url"}), 400
    if not re.match(r"(?i)^https?://", url):
        url = "https://" + url
    try:
        result = read_web(url)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except requests.RequestException as e:
        return jsonify({"error": f"no se pudo leer: {e}"}), 502
    except Exception as e:  # noqa: BLE001
        return jsonify({"error": f"lector: {e}"}), 500
    return jsonify(result)


@app.route("/api/ai", methods=["POST"])
@login_required
@rate_limit(RL_AI, scope="user")
def api_ai():
    data = request.get_json() or {}
    provider = (data.get("provider") or "claude").lower()
    prompt = (data.get("prompt") or "").strip()[:MAX_PROMPT_CHARS]
    if not prompt:
        return jsonify({"error": "prompt vacio"}), 400

    try:
        image = parse_image(data.get("image"))
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    ok, used, limit = ai_quota_check_and_incr(current_user())
    if not ok:
        return jsonify({"error": f"llegaste al limite diario de IA ({limit}). vuelve manana."}), 429

    include_editor = bool(data.get("include_editor"))
    editor_text = (data.get("editor_text") or "").strip()[:MAX_EDITOR_CHARS]
    use_tools = data.get("use_tools", True)

    user_content = prompt
    if include_editor and editor_text:
        user_content = f"Texto actual del editor:\n\n{editor_text}\n\n---\n\nInstrucciones: {prompt}"

    ctx = {
        "user": current_user(),
        "use_tools": bool(use_tools),
        "editor_text": editor_text,
        "image": image,
        "transcript": [],
        "actions": [],
    }
    try:
        if provider == "claude":
            result, model = run_anthropic(SYSTEM_PROMPT, user_content, ctx)
        elif provider == "openai":
            result, model = run_openai_style(
                OPENAI_BASE_URL, OPENAI_API_KEY, OPENAI_MODEL, SYSTEM_PROMPT, user_content, ctx, "openai"
            )
        elif provider in ("hf", "huggingface"):
            result, model = run_openai_style(
                HF_BASE_URL, HF_API_KEY, HF_MODEL, SYSTEM_PROMPT, user_content, ctx, "huggingface"
            )
        else:
            return jsonify({"error": f"proveedor desconocido: {provider}"}), 400
    except ProviderError as e:
        return jsonify({"error": str(e), "transcript": ctx["transcript"], "actions": ctx["actions"]}), e.status

    return jsonify({
        "result": result,
        "provider": provider,
        "model": model,
        "transcript": ctx["transcript"],
        "actions": ctx["actions"],
    })


# ─── main ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    init_db()
    OBJETOS_DIR.mkdir(exist_ok=True)
    if not USERS_FILE.exists():
        print(f"[!] no encontre {USERS_FILE} — copia users.example.json y agrega hashes")
    if _SECRET_EPHEMERAL:
        print("[!] FLASK_SECRET_KEY sin definir — usando secreto EFIMERO (las sesiones se")
        print("    caen al reiniciar). Define FLASK_SECRET_KEY en produccion.")
    if not _HTTPS:
        print("[!] CONSOLA_HTTPS off — las cookies NO son Secure. Actívalo detras de TLS.")
    print(f"[*] cuota IA por usuarie/dia: {AI_DAILY_LIMIT or 'ilimitada'}")
    active = [k for k, v in providers_status().items() if isinstance(v, dict) and v.get("ok")]
    if active:
        print(f"[*] proveedores de IA activos: {', '.join(active)}")
    else:
        print("[!] ningun proveedor de IA configurado (CLAUDE_API_KEY / OPENAI_API_KEY / HF_API_KEY)")
    port = int(os.environ.get("PORT", "5000"))
    print(f"[*] consola corriendo en http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
