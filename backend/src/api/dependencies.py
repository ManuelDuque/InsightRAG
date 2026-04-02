"""FastAPI dependency definitions for auth and infrastructure access."""

from fastapi import Depends, Header, HTTPException, Request

from .. import config
from ..providers import RAGProviders


def verify_api_key(x_api_key: str | None = Header(default=None, alias="X-API-Key")) -> None:
    if not config.AUTH_REQUIRED:
        return

    if x_api_key != config.INSIGHTRAG_API_KEY:
        raise HTTPException(status_code=401, detail="Credenciales invalidas.")


def get_providers(request: Request) -> RAGProviders:
    providers = getattr(request.app.state, "providers", None)
    if providers is None:
        raise HTTPException(status_code=500, detail="Providers no inicializados")
    return providers


RequireAuth = Depends(verify_api_key)
