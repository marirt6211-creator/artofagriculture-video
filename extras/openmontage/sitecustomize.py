# Cloud VM: the network proxy injects the real ElevenLabs key itself.
# Drop the placeholder header so the proxy can add the real one.
try:
    import requests.sessions as _s
    _orig = _s.Session.request
    def _req(self, method, url, *a, **kw):
        h = kw.get("headers")
        if h and h.get("xi-api-key") == "injected-by-cloud-proxy":
            kw["headers"] = {k: v for k, v in h.items() if k != "xi-api-key"}
        return _orig(self, method, url, *a, **kw)
    _s.Session.request = _req
except Exception:
    pass
