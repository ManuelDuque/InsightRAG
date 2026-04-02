"""Domain exceptions for backend application services."""


class AppError(Exception):
    """Base application error with HTTP-friendly metadata."""

    def __init__(self, detail: str, status_code: int = 500, code: str = "app_error") -> None:
        super().__init__(detail)
        self.detail = detail
        self.status_code = status_code
        self.code = code


class ValidationError(AppError):
    """Raised when user input does not satisfy domain constraints."""

    def __init__(self, detail: str, code: str = "validation_error") -> None:
        super().__init__(detail=detail, status_code=400, code=code)


class ProcessingError(AppError):
    """Raised when ingestion or retrieval processing fails."""

    def __init__(self, detail: str, code: str = "processing_error") -> None:
        super().__init__(detail=detail, status_code=500, code=code)


class InfrastructureError(AppError):
    """Raised when infrastructure dependencies are unavailable or unstable."""

    def __init__(self, detail: str, code: str = "infrastructure_error") -> None:
        super().__init__(detail=detail, status_code=500, code=code)
