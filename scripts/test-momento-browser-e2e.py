#!/usr/bin/env python3
"""NEXO: teste de ponta a ponta EM NAVEGADOR REAL com respostas apenas sintéticas.

Testa a interface Astro compilada no Chromium, do convite à confirmação.
As respostas clínicas NÃO deixam o processo local de CI: todas as rotas
/api/momento/* são interceptadas; nenhuma conta/passkey/D1 real é usada.
"""
from __future__ import annotations

import functools
import http.server
import json
import pathlib
import re
import threading
import traceback
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright, expect

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
CONSENT_TEXT = (ROOT / "src/data/momento-instruments.ts").read_text(encoding="utf-8")
CONSENT_VERSION = re.search(r"CLINICAL_CONSENT_VERSION\s*=\s*'([^']+)'", CONSENT_TEXT).group(1)


def assert_correct_payload(payload, expanded):
    assert payload["consent"]["accepted"] is True
    assert payload["consent"]["adult"] is True
    assert payload["consent"]["version"] == CONSENT_VERSION
    assert payload["completion"]["kind"] == "complete"
    assert payload["context"]["privacy"] == "yes"
    assert len(payload["phq9"]) == 9 and len(payload["gad7"]) == 7
    assert payload["reflectionMode"] == ("extended" if expanded else "basic")
    if expanded:
        assert payload["reflectionSensitiveAccepted"] is True
        assert payload["reflectionTopics"] == ["genero", "crencas"]
        assert payload["reflectionAnswers"]["demanda"]["status"] == "answered"
        assert "mudanças importantes" in payload["reflectionAnswers"]["demanda"]["text"]
        assert payload["reflectionAnswers"]["episodio"] == {"status": "later"}
        assert payload["reflectionAnswers"]["recursos"] == {"status": "unsure"}
        assert payload["reflectionAnswers"]["identidade-vinculos"] == {"status": "later"}
        assert payload["reflectionAnswers"]["expectativas"] == {"status": "prefer-not"}
    else:
        assert payload["reflectionSensitiveAccepted"] is False
        assert payload["reflectionTopics"] == []
        assert payload["reflectionAnswers"] == {}
    assert "audio" not in payload
    assert "voice" not in payload
    assert all("audio" not in str(x).lower() for x in payload["reflectionAnswers"].values())


def run_case(browser, port, expanded):
    context = browser.new_context(
        viewport={"width": 1280 if expanded else 390, "height": 800 if expanded else 844},
        locale="pt-BR",
        reduced_motion="reduce",
    )
    page = context.new_page()
    page.set_default_timeout(8000)
    print('INICIO:', 'aprofundado' if expanded else 'essencial', flush=True)
    payloads = []
    issues = []
    page.on("pageerror", lambda error: issues.append(str(error)))
    page.on("crash", lambda: print('ALERTA: renderizador Chromium encerrou inesperadamente', flush=True))

    def intercept(route):
        request = route.request
        part = urlsplit(request.url).path
        def send(code, payload):
            route.fulfill(status=code, body=json.dumps(payload), content_type="application/json",
                          headers={"Cache-Control": "no-store"})
        if part.endswith("/status"):
            send(200, {"enabled": True, "consentVersion": CONSENT_VERSION})
        elif part.endswith("/participant"):
            send(401, {"error": "access_denied"})  # No session before redeem
        elif part.endswith("/invitations/redeem"):
            data = request.post_data_json
            assert data == {"code": "CONVITE-FICTICIO-2026"}, data
            send(200, {"csrf": "synthetic-csrf-not-a-secret", "consentVersion": CONSENT_VERSION})
        elif part.endswith("/submissions"):
            assert request.headers.get("x-nexo-csrf") == "synthetic-csrf-not-a-secret"
            payloads.append(request.post_data_json)
            send(200, {"saved": True, "id": "registro-sintetico-nao-persistente", "notificationSent": True})
        elif part.endswith("/participant/end"):
            send(200, {"ended": True})
        else:
            raise AssertionError("Unanticipated API route: " + part)

    page.route("**/api/momento/**", intercept)
    try:
        page.goto(f"http://127.0.0.1:{port}/conhecendo-meu-momento/responder/", wait_until="networkidle")
        expect(page.locator('[data-mc-stage="access"]')).to_be_visible()
        expect(page.locator('[data-mc-action="redeem"]')).to_be_enabled()
        page.locator("#mc-code").fill("CONVITE-FICTICIO-2026")
        page.locator('[data-mc-action="redeem"]').click()
        expect(page.locator('[data-mc-stage="consent"]')).to_be_visible()
        assert len(payloads) == 0
        page.locator("#mc-adult").check()
        page.locator("#mc-accept").check()
        page.locator('[data-mc-stage="consent"] [data-mc-action="next"]').click()
        expect(page.locator('[data-mc-stage="profile"]')).to_be_visible()
        page.locator("#mc-nickname").fill("Participante sintético")
        page.locator('[data-mc-stage="profile"] [data-mc-action="next"]').click()
        expect(page.locator('[data-mc-stage="privacy"]')).to_be_visible()
        page.locator('input[name="mc-privacy"][value="yes"]').check()
        # Single source of truth for the accompanying professional modality
        page.locator('input[name="mc-accompaniment"][value="with-professional" ]' if expanded else 'input[name="mc-accompaniment"][value="alone"]').check()
        page.locator('[data-mc-stage="privacy"] [data-mc-action="next"]').click()
        expect(page.locator('[data-mc-stage="choice"]')).to_be_visible()
        print('ETAPA: escolha', flush=True)
        page.locator(f'input[name="mc-journey"][value="{"extended" if expanded else "basic"}"]').check()
        if expanded:
            page.locator('[data-mc-stage="choice"] [data-mc-action="next"]').click()
            expect(page.locator('[data-mc-stage="choice"]')).to_be_visible()
            expect(page.locator("#mc-error")).to_contain_text("autorização")
            assert len(payloads) == 0
            page.locator("#mc-sensitive-accept").check()
        page.locator('[data-mc-stage="choice"] [data-mc-action="next"]').click()
        expect(page.locator('[data-mc-stage="questions"]')).to_be_visible()
        print('ETAPA: questionario', flush=True)
        # Repeat a true human browser interaction across every screening/author item.
        for step_number in range(32):
            if not page.locator('[data-mc-stage="questions"]').is_visible():
                break
            print('QUESTIONARIO:', step_number+1, page.locator("#mc-question-title").inner_text(), flush=True)
            page.locator('[data-mc-stage="questions"] [data-mc-action="skip"]').click()
        else:
            raise AssertionError("Questionnaire did not advance to the next stage")
        assert len(payloads) == 0
        if expanded:
            expect(page.locator('[data-mc-stage="reflection"]')).to_be_visible()
            print('ETAPA: narrativas', flush=True)
            # 1 - narrative via text
            page.locator("#mc-reflection-text").fill("Quero compreender mudanças importantes no meu cotidiano.")
            page.locator('[data-mc-stage="reflection"] [data-mc-action="next"]').click()
            # 2 - reserve for the session
            page.locator('input[name="mc-reflection-choice"][value="later"]').check()
            page.locator('[data-mc-stage="reflection"] [data-mc-action="next"]').click()
            # 3 - honest uncertainty
            page.locator('input[name="mc-reflection-choice"][value="unsure"]').check()
            page.locator('[data-mc-stage="reflection"] [data-mc-action="next"]').click()
            # 4 - sensitive topic selector, preference reversal without losing explicit choice
            expect(page.locator("#mc-reflection-topics")).to_be_visible()
            page.locator('input[name="mc-reflection-topic"][value="genero"]').check()
            page.locator('input[name="mc-reflection-topic"][value="crencas"]').check()
            page.locator('input[name="mc-reflection-choice"][value="prefer-not"]').check()
            assert page.locator('input[name="mc-reflection-topic"]:checked').count() == 0
            page.locator('input[name="mc-reflection-choice"][value="later"]').check()
            page.locator('input[name="mc-reflection-topic"][value="genero"]').check()
            page.locator('input[name="mc-reflection-topic"][value="crencas"]').check()
            page.locator('[data-mc-stage="reflection"] [data-mc-action="next"]').click()
            # 5 - explicit refusal
            page.locator('input[name="mc-reflection-choice"][value="prefer-not"]').check()
            page.locator('[data-mc-stage="reflection"] [data-mc-action="next"]').click()
        expect(page.locator('[data-mc-stage="summary"]')).to_be_visible()
        print('ETAPA: resumo', flush=True)
        assert len(payloads) == 0, "Never send before explicit final confirmation"
        page.locator("#mc-send-confirm").check()
        page.locator('[data-mc-stage="summary"] [data-mc-action="submit"]').click()
        expect(page.locator('[data-mc-stage="submitted"]')).to_be_visible()
        expect(page.locator("#mc-receipt-id")).to_have_text("registro-sintetico-nao-persistente")
        assert len(payloads) == 1
        assert_correct_payload(payloads[0], expanded)
        assert not issues, "Browser JS errors: " + repr(issues)
        # Accessible responsive layout should not overflow at tested viewport.
        width = page.evaluate("({scroll: document.documentElement.scrollWidth, view: window.innerWidth})")
        assert width["scroll"] <= width["view"] + 3, width
        print("PASS: " + ("Aprofundado, consentimento e temas sensíveis" if expanded else "Essencial, celular") +
              " |  convite → privacidade → respostas → envio sintético → confirmação.")
    except Exception:
        traceback.print_exc()
        print("BROWSER ERRORS:", repr(issues), flush=True)
        print("CURRENT URL:", page.url, flush=True)
        try:
            print("CURRENT STAGE:", page.evaluate("Array.from(document.querySelectorAll('[data-mc-stage]')).filter(x => !x.hidden).map(x => x.dataset.mcStage)"), flush=True)
            print("CURRENT ERROR:", page.locator("#mc-error").inner_text(timeout=2000), flush=True)
        except Exception as investigation_error:
            print("BROWSER DETAIL UNAVAILABLE:", str(investigation_error), flush=True)
        raise
    finally:
        context.close()


def main():
    assert (DIST / "conhecendo-meu-momento/responder/index.html").exists(), "Run pnpm build first"
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(DIST))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    server_thread = threading.Thread(target=server.serve_forever, daemon=True)
    server_thread.start()
    try:
        with sync_playwright() as pw:
            for expanded in [False, True]:
                browser = pw.chromium.launch(headless=True, args=['--disable-gpu','--disable-webgl','--disable-accelerated-2d-canvas'])
                try:
                    run_case(browser, server.server_port, expanded=expanded)
                finally:
                    browser.close()
    finally:
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    main()
