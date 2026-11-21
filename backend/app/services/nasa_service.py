"""NASA POWER field advisory service.

NASA POWER publishes satellite- and model-based daily data for any land point.
The API is public and needs no key. All requests happen on the backend, so the
browser never contacts NASA directly and no secret is exposed in the frontend.

Important limitation: these are grid-cell estimates, not a soil test, a field
boundary map, or crop-specific advice. The advisory codes below are simple,
 labelled checks in this app; they are not claims made by NASA.
"""

from __future__ import annotations

import time
from datetime import date, datetime, timedelta, timezone
from typing import Any

import httpx2

POWER_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"
REQUEST_TIMEOUT = 20
CACHE_TTL_SECONDS = 6 * 60 * 60
SOURCE_URL = "https://power.larc.nasa.gov/"

# Parameter codes are the official NASA POWER daily point parameter names.
PARAMETERS = {
    "GWETTOP": "topsoil_wetness",
    "GWETROOT": "rootzone_wetness",
    "PRECTOTCORR": "rainfall_mm",
    "T2M": "temperature_c",
    "RH2M": "humidity_percent",
    "WS10M": "wind_ms",
    "ALLSKY_SFC_SW_DWN": "solar_mj",
}

# Simple app-level flags. They are deliberately generic and are never presented
# as crop thresholds or as official NASA advice.
DRY_TOPSOIL = 0.25
WET_TOPSOIL = 0.75
DRY_ROOTZONE = 0.30
HEAVY_RAIN_DAY = 75.0
HEAVY_RAIN_WEEK = 150.0
LOW_RAIN_WEEK = 10.0
HOT_AVERAGE = 35.0
HOT_MAXIMUM = 40.0

_cache: dict[tuple[float, float, str, str], tuple[float, dict[str, Any]]] = {}


def _number(value: Any, default: float | None = None) -> float | None:
    """Convert a NASA value, treating its fill value as missing."""
    try:
        number = float(value)
    except (TypeError, ValueError):
        return default
    if number <= -999:
        return default
    return number


def _rounded(value: float | None, digits: int = 1) -> float | None:
    if value is None:
        return None
    return round(value, digits)


def _date_window() -> tuple[str, str]:
    """Use a recent completed 14-day window; NASA daily data can lag a day."""
    end = date.today() - timedelta(days=1)
    start = end - timedelta(days=13)
    return start.strftime("%Y%m%d"), end.strftime("%Y%m%d")


def _display_date(value: str) -> str:
    if len(value) != 8 or not value.isdigit():
        return value
    return f"{value[:4]}-{value[4:6]}-{value[6:]}"


def fetch_nasa_data(latitude: float, longitude: float) -> dict[str, Any]:
    """Fetch the raw NASA POWER daily point response, with a short cache."""
    start, end = _date_window()
    cache_key = (round(latitude, 2), round(longitude, 2), start, end)
    cached = _cache.get(cache_key)
    if cached and time.monotonic() - cached[0] < CACHE_TTL_SECONDS:
        return cached[1]

    params = {
        "parameters": ",".join(PARAMETERS),
        "community": "AG",
        "longitude": longitude,
        "latitude": latitude,
        "start": start,
        "end": end,
        "format": "JSON",
    }
    response = httpx2.get(POWER_URL, params=params, timeout=REQUEST_TIMEOUT)
    response.raise_for_status()
    raw = response.json()
    _cache[cache_key] = (time.monotonic(), raw)
    return raw


def _series(raw: dict[str, Any], code: str) -> dict[str, float]:
    parameter = raw.get("properties", {}).get("parameter", {})
    values = parameter.get(code, {})
    return {
        str(key): number
        for key, value in values.items()
        if (number := _number(value)) is not None
    }


def _average(values: list[float]) -> float | None:
    usable = [value for value in values if value is not None]
    if not usable:
        return None
    return sum(usable) / len(usable)


def build_advisories(latest: dict[str, Any], summary: dict[str, Any]) -> list[dict[str, Any]]:
    """Turn NASA values into neutral advisory codes and display values."""
    advisories: list[dict[str, Any]] = []
    topsoil = latest.get("topsoil_wetness")
    rootzone = latest.get("rootzone_wetness")
    rain_total = summary.get("rainfall_total_mm")
    rain_max = summary.get("max_daily_rain_mm")
    temp_avg = summary.get("temperature_avg_c")
    temp_max = summary.get("temperature_max_c")

    if topsoil is not None and topsoil < DRY_TOPSOIL:
        advisories.append(
            {
                "code": "topsoil_dry",
                "severity": "warning",
                "values": {"wetness": f"{round(topsoil * 100)}%", "date": latest.get("date", "")},
            }
        )
    elif topsoil is not None and topsoil > WET_TOPSOIL:
        advisories.append(
            {
                "code": "topsoil_wet",
                "severity": "warning",
                "values": {"wetness": f"{round(topsoil * 100)}%", "date": latest.get("date", "")},
            }
        )

    if rootzone is not None and rootzone < DRY_ROOTZONE:
        advisories.append(
            {
                "code": "rootzone_dry",
                "severity": "warning",
                "values": {"wetness": f"{round(rootzone * 100)}%"},
            }
        )

    if rain_total is not None and (rain_total >= HEAVY_RAIN_WEEK or (rain_max or 0) >= HEAVY_RAIN_DAY):
        advisories.append(
            {
                "code": "heavy_rain",
                "severity": "warning",
                "values": {
                    "rain": f"{round(rain_total)} mm",
                    "days": summary.get("valid_days", 0),
                    "threshold": f"{int(HEAVY_RAIN_DAY)} mm",
                },
            }
        )
    elif (
        rain_total is not None
        and rain_total < LOW_RAIN_WEEK
        and topsoil is not None
        and topsoil < DRY_TOPSOIL + 0.10
    ):
        advisories.append(
            {
                "code": "low_rain",
                "severity": "warning",
                "values": {"rain": f"{round(rain_total)} mm", "days": summary.get("valid_days", 0)},
            }
        )

    if temp_avg is not None and (temp_avg >= HOT_AVERAGE or (temp_max or 0) >= HOT_MAXIMUM):
        advisories.append(
            {
                "code": "high_heat",
                "severity": "warning",
                "values": {"avg": f"{round(temp_avg)}°C", "max": f"{round(temp_max or temp_avg)}°C"},
            }
        )

    if not advisories:
        advisories.append({"code": "favorable", "severity": "info", "values": {}})
    return advisories


def normalize_nasa_data(raw: dict[str, Any], latitude: float, longitude: float) -> dict[str, Any]:
    """Convert the NASA response into a small, predictable shape for the UI."""
    series = {name: _series(raw, code) for code, name in PARAMETERS.items()}
    dates = sorted(set().union(*(set(values) for values in series.values())))
    rows: list[dict[str, Any]] = []
    for stamp in dates:
        rows.append(
            {
                "date": _display_date(stamp),
                "topsoil_wetness": _rounded(series["topsoil_wetness"].get(stamp), 3),
                "rootzone_wetness": _rounded(series["rootzone_wetness"].get(stamp), 3),
                "rainfall_mm": _rounded(series["rainfall_mm"].get(stamp)),
                "temperature_c": _rounded(series["temperature_c"].get(stamp)),
                "humidity_percent": _rounded(series["humidity_percent"].get(stamp)),
                "wind_ms": _rounded(series["wind_ms"].get(stamp)),
                "solar_mj": _rounded(series["solar_mj"].get(stamp)),
            }
        )

    with_topsoil = [row for row in rows if row["topsoil_wetness"] is not None]
    latest = with_topsoil[-1] if with_topsoil else (rows[-1] if rows else {})
    rain_values = [row["rainfall_mm"] for row in rows]
    temp_values = [row["temperature_c"] for row in rows]
    solar_values = [row["solar_mj"] for row in rows]

    summary = {
        "valid_days": len(with_topsoil),
        "topsoil_wetness_avg": _rounded(_average([row["topsoil_wetness"] for row in with_topsoil]), 3),
        "rootzone_wetness_avg": _rounded(
            _average([row["rootzone_wetness"] for row in rows if row["rootzone_wetness"] is not None]), 3
        ),
        "rainfall_total_mm": _rounded(sum(value for value in rain_values if value is not None)),
        "max_daily_rain_mm": _rounded(max((value for value in rain_values if value is not None), default=None)),
        "temperature_avg_c": _rounded(_average(temp_values)),
        "temperature_max_c": _rounded(max((value for value in temp_values if value is not None), default=None)),
        "solar_avg_mj": _rounded(_average(solar_values)),
    }
    if not summary["valid_days"]:
        raise ValueError("NASA response contained no usable soil data")

    header = raw.get("header", {})
    geometry = raw.get("geometry", {}).get("coordinates", [])
    elevation = geometry[2] if len(geometry) > 2 else None

    return {
        "is_demo": False,
        "source": "NASA POWER daily point API",
        "source_url": SOURCE_URL,
        "dataset": header.get("title", "NASA/POWER Source Native Resolution Daily Data"),
        "location": {
            "latitude": latitude,
            "longitude": longitude,
            "grid_latitude": geometry[1] if len(geometry) > 1 else None,
            "grid_longitude": geometry[0] if geometry else None,
            "elevation_m": _rounded(elevation),
        },
        "period": {
            "start": _display_date(str(header.get("start", ""))),
            "end": _display_date(str(header.get("end", ""))),
        },
        "latest": latest,
        "summary": summary,
        "series": rows,
        "advisories": build_advisories(latest, summary),
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def demo_nasa_field_advisory(crop: str | None = None) -> dict[str, Any]:
    """Return a clearly labelled empty response; never invent satellite values."""
    return {
        "is_demo": True,
        "source": "NASA data unavailable",
        "source_url": SOURCE_URL,
        "dataset": "",
        "crop": crop or "",
        "location": None,
        "period": {},
        "latest": {},
        "summary": {},
        "series": [],
        "advisories": [{"code": "data_unavailable", "severity": "warning", "values": {}}],
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def get_field_advisory(latitude: float, longitude: float, crop: str | None = None) -> dict[str, Any]:
    """Return a NASA field advisory for one coordinate pair."""
    raw = fetch_nasa_data(latitude, longitude)
    data = normalize_nasa_data(raw, latitude, longitude)
    data["crop"] = crop or ""
    return data
