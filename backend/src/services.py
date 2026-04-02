"""Compatibility service bridge.

This module preserves the previous import path while delegating to the
application service layer where business logic now lives.
"""

from .application_services import (  # noqa: F401
    list_available_models,
    process_pdf,
    query_rag,
    reset_vector_database,
)
