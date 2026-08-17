"""Smoke test de la CONSOLA: auth, CRUD de docs aislados, sanitizacion XSS y anti-SSRF.

Correr (desde este directorio):
    python -m unittest test_smoke -v

No toca users.json/consola.db reales: usa un directorio temporal y envs.
"""
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path

_TMP = tempfile.mkdtemp(prefix="consola_test_")
os.environ["CONSOLA_USERS_FILE"] = os.path.join(_TMP, "users.json")
os.environ["CONSOLA_DB_FILE"] = os.path.join(_TMP, "consola.db")
os.environ["CONSOLA_OBJETOS_DIR"] = os.path.join(_TMP, "objetos")
os.environ["CONSOLA_READER"] = "1"
os.environ["FLASK_SECRET_KEY"] = "test-secret-fijo"

sys.path.insert(0, os.path.dirname(__file__))
import server  # noqa: E402  (debe importarse despues de setear las envs)
from werkzeug.security import generate_password_hash  # noqa: E402


class ConsolaSmokeTest(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        server.app.testing = True
        Path(os.environ["CONSOLA_OBJETOS_DIR"]).mkdir(exist_ok=True)
        with open(os.environ["CONSOLA_USERS_FILE"], "w", encoding="utf-8") as f:
            json.dump({
                "users": [
                    {"username": "alice", "password_hash": generate_password_hash("pass-a")},
                    {"username": "bob", "password_hash": generate_password_hash("pass-b")},
                ]
            }, f)
        server.init_db()

    def setUp(self):
        server.app.testing = True
        # clientes frescos por test: cada test arranca sin sesion
        self.a = server.app.test_client()
        self.b = server.app.test_client()

    def _login(self, client, user, pwd):
        return client.post("/login", json={"username": user, "password": pwd})

    # ── auth ────────────────────────────────────────────────────────────
    def test_me_sin_sesion_401(self):
        r = self.a.get("/me")
        self.assertEqual(r.status_code, 401)

    def test_docs_sin_auth_401(self):
        r = self.a.get("/api/docs")
        self.assertEqual(r.status_code, 401)

    def test_login_credenciales_invalidas_401(self):
        r = self._login(self.a, "alice", "mal")
        self.assertEqual(r.status_code, 401)

    def test_login_ok_y_me(self):
        r = self._login(self.a, "alice", "pass-a")
        self.assertEqual(r.status_code, 200)
        self.assertTrue(r.get_json()["ok"])
        me = self.a.get("/me").get_json()
        self.assertEqual(me["user"], "alice")

    # ── CRUD de documentos ──────────────────────────────────────────────
    def test_crud_doc(self):
        self._login(self.a, "alice", "pass-a")
        created = self.a.post("/api/docs", json={"title": "mi texto", "body": "<p>hola</p>"}).get_json()
        doc_id = created["id"]

        lst = self.a.get("/api/docs").get_json()["docs"]
        self.assertTrue(any(d["id"] == doc_id for d in lst))

        got = self.a.get(f"/api/docs/{doc_id}").get_json()
        self.assertEqual(got["title"], "mi texto")
        self.assertEqual(got["body"], "<p>hola</p>")

        upd = self.a.put(f"/api/docs/{doc_id}", json={"title": "renombrado"}).get_json()
        self.assertTrue(upd["ok"])
        self.assertEqual(self.a.get(f"/api/docs/{doc_id}").get_json()["title"], "renombrado")

        self.assertTrue(self.a.delete(f"/api/docs/{doc_id}").get_json()["ok"])
        self.assertEqual(self.a.get(f"/api/docs/{doc_id}").status_code, 404)

    def test_aislamiento_entre_usuarios(self):
        self._login(self.a, "alice", "pass-a")
        self._login(self.b, "bob", "pass-b")
        doc_id = self.a.post("/api/docs", json={"title": "secreto de alice", "body": "<p>privado</p>"}).get_json()["id"]

        lista_bob = self.b.get("/api/docs").get_json()["docs"]
        self.assertFalse(any(d["id"] == doc_id for d in lista_bob), "bob ve el doc de alice")

        r = self.b.get(f"/api/docs/{doc_id}")
        self.assertEqual(r.status_code, 404, "bob deberia recibir 404 al leer el doc de alice")

        r = self.b.delete(f"/api/docs/{doc_id}")
        self.assertEqual(r.status_code, 404, "bob no deberia poder borrar el doc de alice")

    # ── sanitizacion XSS ────────────────────────────────────────────────
    def test_xss_limpiado(self):
        self._login(self.a, "alice", "pass-a")
        evil = '<script>alert(1)</script><img src=x onerror=alert(2)><p onclick="x()">ok</p>'
        doc_id = self.a.post("/api/docs", json={"title": "x", "body": evil}).get_json()["id"]
        body = self.a.get(f"/api/docs/{doc_id}").get_json()["body"]
        self.assertNotIn("<script", body)
        self.assertNotIn("onerror", body)
        self.assertNotIn("onclick", body)
        self.assertIn("<p>ok</p>", body)

    # ── anti-SSRF del lector web ────────────────────────────────────────
    def test_lector_bloquea_ip_privada(self):
        self._login(self.a, "alice", "pass-a")
        for url in ("http://127.0.0.1:80/x", "http://169.254.169.254/latest/meta-data/", "http://localhost/"):
            r = self.a.post("/api/leer-url", json={"url": url})
            self.assertEqual(r.status_code, 400, f"se deberia bloquear {url}")
            self.assertIn("host no permitido", r.get_json()["error"])

    def test_lector_bloquea_scheme_invalido(self):
        self._login(self.a, "alice", "pass-a")
        r = self.a.post("/api/leer-url", json={"url": "ftp://example.com/x"})
        self.assertEqual(r.status_code, 400)


if __name__ == "__main__":
    unittest.main()
