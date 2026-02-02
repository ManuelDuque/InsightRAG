from pydantic import BaseModel

class AskRequest(BaseModel):
    query: str
    model_name: str = "models/gemini-2.5-flash" # Valor por defecto

class AskResponse(BaseModel):
    answer: str
    sources: list[str]

class ModelListResponse(BaseModel):
    models: list[str]
