# NASA field advisor

This is a separate, additive feature. Weather, profile, dashboard, community,
equipment, schemes, videos and smart farming are unchanged.

## What it does

The **NASA field advisor** page (`#/nasa-advisory`) lets a farmer:

1. Save one or more field locations by name, latitude and longitude.
2. Use the device GPS or the location already saved by the Weather page.
3. Request NASA POWER daily values for that point.
4. See surface soil wetness, root-zone wetness, rainfall, temperature, humidity,
   wind and solar energy, plus simple app-level field checks. The source shown
   on the page links to the official NASA POWER site.

Field names and coordinates stay in the browser under
`agriguide.nasaFields`. Nothing about a field is uploaded or stored in the
database.

## NASA source

- Provider: **NASA POWER** (Prediction Of Worldwide Energy Resources).
- Endpoint: `https://power.larc.nasa.gov/api/temporal/daily/point`
- Community: `AG`; format: `JSON`; window: the last 14 completed days.
- Parameters used:
  - `GWETTOP` — surface soil wetness (fraction)
  - `GWETROOT` — root-zone soil wetness (fraction)
  - `PRECTOTCORR` — corrected daily rainfall (mm/day)
  - `T2M` — temperature at 2 m (°C)
  - `RH2M` — relative humidity at 2 m (%)
  - `WS10M` — wind speed at 10 m (m/s)
  - `ALLSKY_SFC_SW_DWN` — surface shortwave radiation (MJ/m²/day)

NASA POWER is public and needs no API key. All calls are made by the backend;
the browser only calls `/api/nasa/field-advisory`. No key is placed in the
frontend, and CORS/CSP settings are unchanged.

Source documentation: <https://power.larc.nasa.gov/> and
<https://power.larc.nasa.gov/docs/methodology/data/sources_hydrology/>.

## What it does not do

- It does **not** draw or detect field boundaries.
- It does **not** provide a laboratory soil test, soil texture or NPK values.
- It does **not** give crop-specific irrigation or fertiliser recommendations.
- It does **not** claim that the advisory text comes from NASA. The advisory
  codes are simple rules of thumb in this app and are labelled as such.
- It never invents satellite values. If NASA is unavailable, the response is
  clearly labelled and no numbers are shown.

NASA POWER values describe a grid cell, not a single farmer's plot. Local
verification is always required before acting.

## Backend API

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/nasa/field-advisory?lat=...&lon=...` | NASA daily values and app-level advisory codes |
| `GET` | `/api/nasa/field-advisory` | Clearly labelled empty/unavailable response |

The response uses neutral codes such as `topsoil_dry`, `topsoil_wet`,
`rootzone_dry`, `heavy_rain`, `low_rain`, `high_heat`, `favorable` and
`data_unavailable`. All human wording lives in
`frontend/src/i18n/nasaStrings.js` in five languages.

The service caches each rounded coordinate pair for six hours to avoid
repeated calls for the same daily data.

## Files added

- `backend/app/services/nasa_service.py`
- `backend/app/routers/nasa.py`
- `backend/tests/test_nasa.py`
- `frontend/src/pages/nasaAdvisory.js`
- `frontend/src/i18n/nasaStrings.js`
- this document

Small additive wiring only: the NASA router is registered in
`backend/app/main.py`, the page route is registered in `frontend/src/app.js`,
the strings are merged in `frontend/src/i18n/index.js`, and one home card is
added to `frontend/src/services/mockData.js`.
