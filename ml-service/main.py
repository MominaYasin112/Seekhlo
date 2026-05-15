"""Seekh Lo ML Personalized Learning Path Recommender — FastAPI microservice."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from recommender import default_path, load_catalog, recommend

app = FastAPI(title="Seekh Lo ML Recommender", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RecommendRequest(BaseModel):
    scores: dict[str, float] = Field(
        default_factory=dict,
        description="Per-topic performance scores 0–1",
    )
    completed_module_ids: list[int] = Field(default_factory=list)
    skipped_module_ids: list[int] = Field(default_factory=list)
    limit: int = Field(default=10, ge=1, le=20)


class RecommendResponse(BaseModel):
    modules: list[dict]
    source: str  # "ml" or "default"


@app.get("/health")
def health():
    return {"status": "ok", "service": "ml-recommender"}


@app.get("/catalog")
def catalog():
    return {"modules": load_catalog()}


@app.post("/recommend", response_model=RecommendResponse)
def get_recommendations(body: RecommendRequest):
    try:
        modules = recommend(
            body.scores,
            body.completed_module_ids,
            body.skipped_module_ids,
            body.limit,
        )
        return RecommendResponse(modules=modules, source="ml")
    except Exception:
        modules = default_path(
            load_catalog(),
            set(body.completed_module_ids),
            set(body.skipped_module_ids),
        )
        return RecommendResponse(modules=modules[: body.limit], source="default")


@app.post("/recommend/fallback", response_model=RecommendResponse)
def get_fallback(body: RecommendRequest):
    modules = default_path(
        load_catalog(),
        set(body.completed_module_ids),
        set(body.skipped_module_ids),
    )
    return RecommendResponse(modules=modules[: body.limit], source="default")
