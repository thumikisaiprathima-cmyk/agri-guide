"""NASA POWER field advisory endpoints."""

from typing import Any

from fastapi import APIRouter, Query

from app.services import nasa_service

router = APIRouter(prefix="/nasa", tags=["nasa"])


@router.get("/field-advisory")
def get_field_advisory(
    lat: float | None = Query(None, ge=-90, le=90, description="Field latitude"),
    lon: float | None = Query(None, ge=-180, le=180, description="Field longitude"),
    crop: str | None = Query(None, max_length=40, description="Optional crop name"),
) -> dict[str, Any]:
    """Return NASA POWER soil and weather values for a field location.

    Without coordinates, or when NASA is unavailable, the response is clearly
    labelled as demo/empty. No satellite values are invented.
    """
    if lat is None or lon is None:
        return nasa_service.demo_nasa_field_advisory(crop)

    try:
        return nasa_service.get_field_advisory(lat, lon, crop)
    except Exception:
        data = nasa_service.demo_nasa_field_advisory(crop)
        data["source"] = "NASA data unavailable right now"
        return data
