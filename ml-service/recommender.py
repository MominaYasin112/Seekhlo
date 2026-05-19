"""Hybrid recommender: 60% collaborative filtering + 40% content-based."""

import json
import math
from pathlib import Path

DIFFICULTY_WEIGHT = {"Beginner": 1.0, "Intermediate": 1.2, "Advanced": 1.5}

# Simulated peer performance vectors for collaborative filtering
PEER_VECTORS = [
    {"id": "peer1", "scores": {"Data Structures": 0.9, "Algorithms": 0.7}},
    {"id": "peer2", "scores": {"Data Structures": 0.6, "Algorithms": 0.85}},
    {"id": "peer3", "scores": {"Data Structures": 0.75, "Algorithms": 0.55}},
    {"id": "peer4", "scores": {"Data Structures": 0.4, "Algorithms": 0.9}},
    {"id": "peer5", "scores": {"Data Structures": 0.85, "Algorithms": 0.4}},
]


def load_catalog() -> list[dict]:
    path = Path(__file__).parent / "data" / "modules.json"
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def cosine_similarity(a: dict[str, float], b: dict[str, float]) -> float:
    topics = set(a) | set(b)
    if not topics:
        return 0.0
    dot = sum(a.get(t, 0) * b.get(t, 0) for t in topics)
    mag_a = math.sqrt(sum(a.get(t, 0) ** 2 for t in topics))
    mag_b = math.sqrt(sum(b.get(t, 0) ** 2 for t in topics))
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return dot / (mag_a * mag_b)


def collaborative_filter(user_scores: dict[str, float], catalog: list[dict]) -> dict[int, float]:
    """Score modules based on similar students' implied preferences."""
    similarities = [
        (cosine_similarity(user_scores, peer["scores"]), peer["scores"])
        for peer in PEER_VECTORS
    ]
    similarities.sort(key=lambda x: x[0], reverse=True)
    top_neighbours = similarities[:5]

    module_scores: dict[int, float] = {m["id"]: 0.0 for m in catalog}
    total_weight = 0.0

    for sim, peer_scores in top_neighbours:
        if sim <= 0:
            continue
        total_weight += sim
        for mod in catalog:
            topic_score = peer_scores.get(mod["topic"], 0.5)
            gap = 1 - user_scores.get(mod["topic"], 0.5)
            module_scores[mod["id"]] += sim * gap * topic_score

    if total_weight > 0:
        for mid in module_scores:
            module_scores[mid] /= total_weight

    return module_scores


def content_filter(
    user_scores: dict[str, float],
    catalog: list[dict],
    completed_ids: set[int],
) -> dict[int, float]:
    """Prioritize modules with topic gaps where prerequisites are met."""
    scores: dict[int, float] = {}
    for mod in catalog:
        topic_score = user_scores.get(mod["topic"], 0.0)
        gap = 1 - topic_score
        prereqs_met = all(p in completed_ids for p in mod.get("prerequisites", []))
        weight = DIFFICULTY_WEIGHT.get(mod["difficulty"], 1.0)
        scores[mod["id"]] = gap * weight if prereqs_met else 0.0
    return scores


def default_path(catalog: list[dict], completed_ids: set[int], skipped_ids: set[int]) -> list[dict]:
    """Fallback when ML is unavailable: sort by difficulty then id."""
    order = {"Beginner": 0, "Intermediate": 1, "Advanced": 2}
    available = [
        m for m in catalog
        if m["id"] not in completed_ids and m["id"] not in skipped_ids
    ]
    available.sort(key=lambda m: (order.get(m["difficulty"], 9), m["id"]))
    return available[:10]


def recommend(
    user_scores: dict[str, float],
    completed_ids: list[int] | None = None,
    skipped_ids: list[int] | None = None,
    limit: int = 10,
) -> list[dict]:
    catalog = load_catalog()
    completed = set(completed_ids or [])
    skipped = set(skipped_ids or [])

    available = [m for m in catalog if m["id"] not in completed and m["id"] not in skipped]
    if not available:
        return []

    cf = collaborative_filter(user_scores, catalog)
    cb = content_filter(user_scores, catalog, completed)

    combined: list[tuple[float, dict]] = []
    for mod in available:
        mid = mod["id"]
        score = 0.6 * cf.get(mid, 0) + 0.4 * cb.get(mid, 0)
        combined.append((score, {**mod, "confidence": round(score, 3)}))

    combined.sort(key=lambda x: x[0], reverse=True)
    return [item[1] for item in combined[:limit]]
