"""InsightRAG Backend - FastAPI application entrypoint."""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from . import config
from .api.routes import router as api_router
from .domain.exceptions import AppError
from .providers import RAGProviders


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.providers = RAGProviders()
    try:
        yield
    finally:
        app.state.providers.dispose()

app = FastAPI(title="InsightRAG API", lifespan=lifespan)


@app.exception_handler(AppError)
async def handle_app_error(_: Request, exc: AppError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "code": exc.code},
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)