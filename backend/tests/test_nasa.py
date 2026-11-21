"""Tests for the NASA POWER field advisory (no network required)."""

from fastapi.testclient import TestClient

from app.main import app
from app.services import nasa_service

client = TestClient(app)

FAKE_RAW = {
    "type": "Feature",
    "geometry": {"type": "Point", "coordinates": [80.647, 16.507, 45.43]},
    "header": {
        "title": "NASA/POWER Source Native Resolution Daily Data",
        "fill_value": -999.0,
        "start": "20261101",
        "end": "20261102",
    },
    "properties": {
        "parameter": {
            "GWETTOP": {"20261101": 0.18, "20261102": 0.22},
            "GWETROOT": {"20261101": 0.28, "20261102": 0.29},
            "PRECTOTCORR": {"20261101": 0.0, "20261102": 2.0},
            "T2M": {"20261101": 36.0, "20261102": 37.0},
            "RH2M": {"20261101": 40.0, "20261102": 45.0},
            "WS10M": {"20261101": 2.0, "20261102": 3.0},
            "ALLSKY_SFC_SW_DWN": {"20261101": 20.0, "20261102": 18.0},
        }
    },
}


class FakeResponse:
    def __init__(self, payload: dict) -> None:
        self.payload = payload

    def raise_for_status(self) -> None:
        return None

    def json(self) -> dict:
        return self.payload


def test_normalize_nasa_data_uses_real_values_and_neutral_codes() -> None:
    data = nasa_service.normalize_nasa_data(FAKE_RAW, 16.50745, 80.6466)
    codes = {item["code"] for item in data["advisories"]}

    assert data["is_demo"] is False
    assert data["source"] == "NASA POWER daily point API"
    assert data["latest"]["topsoil_wetness"] == 0.22
    assert data["summary"]["rainfall_total_mm"] == 2.0
    assert data["summary"]["valid_days"] == 2
    assert len(data["series"]) == 2
    assert {"topsoil_dry", "rootzone_dry", "low_rain", "high_heat"}.issubset(codes)
    assert all(set(item["values"]).issubset({"wetness", "date", "rain", "days", "avg", "max"}) for item in data["advisories"])


def test_demo_response_never_invents_satellite_values() -> None:
    data = nasa_service.demo_nasa_field_advisory("rice")

    assert data["is_demo"] is True
    assert data["series"] == []
    assert data["latest"] == {}
    assert data["summary"] == {}
    assert data["advisories"][0]["code"] == "data_unavailable"


def test_fetch_nasa_data_calls_public_power_endpoint(monkeypatch) -> None:
    captured: dict = {}

    def fake_get(url: str, params: dict, timeout: int) -> FakeResponse:
        captured.update(url=url, params=params, timeout=timeout)
        return FakeResponse(FAKE_RAW)

    monkeypatch.setattr(nasa_service.httpx2, "get", fake_get)
    nasa_service._cache.clear()

    data = nasa_service.fetch_nasa_data(16.5, 80.6)

    assert captured["url"] == nasa_service.POWER_URL
    assert captured["params"]["community"] == "AG"
    assert "GWETTOP" in captured["params"]["parameters"]
    assert data == FAKE_RAW


def test_field_advisory_endpoint_without_coordinates_is_labelled() -> None:
    response = client.get("/api/nasa/field-advisory")

    assert response.status_code == 200
    body = response.json()
    assert body["is_demo"] is True
    assert body["advisories"][0]["code"] == "data_unavailable"


def test_field_advisory_endpoint_returns_service_data(monkeypatch) -> None:
    expected = nasa_service.normalize_nasa_data(FAKE_RAW, 16.50745, 80.6466)
    monkeypatch.setattr(nasa_service, "get_field_advisory", lambda lat, lon, crop: expected)

    response = client.get("/api/nasa/field-advisory?lat=16.50745&lon=80.6466&crop=rice")

    assert response.status_code == 200
    assert response.json()["latest"]["topsoil_wetness"] == 0.22
    assert response.json()["is_demo"] is False
