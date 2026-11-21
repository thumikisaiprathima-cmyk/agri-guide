import { translate } from "../i18n/index.js";
import { API_BASE_URL } from "../config.js";
import { state as appState } from "../state.js";

const FIELDS_KEY = "agriguide.nasaFields";
const WEATHER_LOCATION_KEY = "agriguide.location";

const advisoryMap = {
  topsoil_dry: ["adviceTopsoilDryTitle", "adviceTopsoilDryBody"],
  topsoil_wet: ["adviceTopsoilWetTitle", "adviceTopsoilWetBody"],
  rootzone_dry: ["adviceRootzoneDryTitle", "adviceRootzoneDryBody"],
  heavy_rain: ["adviceHeavyRainTitle", "adviceHeavyRainBody"],
  low_rain: ["adviceLowRainTitle", "adviceLowRainBody"],
  high_heat: ["adviceHighHeatTitle", "adviceHighHeatBody"],
  favorable: ["adviceFavorableTitle", "adviceFavorableBody"],
  data_unavailable: ["adviceDataUnavailableTitle", "adviceDataUnavailableBody"],
};

const nasaState = {
  loading: false,
  error: "",
  data: null,
  fields: [],
  selectedId: "",
  lat: null,
  lon: null,
  name: "",
};

function t(language, key, values = {}) {
  let text = translate(language, key);
  for (const [name, value] of Object.entries(values)) {
    text = text.replaceAll(`{${name}}`, String(value));
  }
  return text;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatWetness(value) {
  if (value === null || value === undefined) return "—";
  return `${Math.round(Number(value) * 100)}%`;
}

function formatValue(value, suffix = "") {
  if (value === null || value === undefined || value === "") return "—";
  return `${value}${suffix}`;
}

function loadFields() {
  try {
    const parsed = JSON.parse(localStorage.getItem(FIELDS_KEY) ?? "[]");
    nasaState.fields = Array.isArray(parsed)
      ? parsed.filter(
          (field) =>
            field &&
            typeof field.id === "string" &&
            typeof field.name === "string" &&
            Number.isFinite(Number(field.lat)) &&
            Number.isFinite(Number(field.lon)),
        )
      : [];
  } catch {
    nasaState.fields = [];
  }
}

function saveFields() {
  try {
    localStorage.setItem(FIELDS_KEY, JSON.stringify(nasaState.fields));
  } catch {
    // Storage is optional; the page still works for the current session.
  }
}

function renderFields(language) {
  if (nasaState.fields.length === 0) {
    return `<p class="weather-status">${t(language, "nasaNoFields")}</p>`;
  }
  return nasaState.fields
    .map(
      (field) => `
        <button type="button" class="chip${field.id === nasaState.selectedId ? " is-selected" : ""}" data-nasa-field="${escapeHtml(field.id)}">
          ${escapeHtml(field.name)}
        </button>
      `,
    )
    .join("");
}

function metric(language, labelKey, value) {
  return `<div class="metric"><span>${t(language, labelKey)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function renderAdvice(language, advisory) {
  const [titleKey, bodyKey] = advisoryMap[advisory.code] ?? advisoryMap.favorable;
  const warningClass = advisory.severity === "warning" ? " is-warning" : "";
  return `
    <article class="advice-card${warningClass}">
      <h3>${t(language, titleKey)}</h3>
      <p>${t(language, bodyKey, advisory.values ?? {})}</p>
    </article>
  `;
}

function renderBody(language) {
  if (nasaState.loading) {
    return `<p class="weather-status">${t(language, "nasaLoading")}</p>`;
  }
  if (nasaState.error) {
    return `<div class="error-box">${escapeHtml(nasaState.error)}</div>`;
  }
  if (!nasaState.data) {
    return `<p class="weather-status">${t(language, "nasaNoData")}</p>`;
  }

  const data = nasaState.data;
  if (data.is_demo) {
    return `
      <p class="demo-badge">${t(language, "nasaDataUnavailable")}</p>
      ${(data.advisories ?? []).map((item) => renderAdvice(language, item)).join("")}
    `;
  }

  const latest = data.latest ?? {};
  const summary = data.summary ?? {};
  const sourceUrl = data.source_url || "https://power.larc.nasa.gov/";
  const sourceLabel = data.source || "NASA POWER";
  const series = (data.series ?? [])
    .map(
      (row) => `
        <div class="daily-row">
          <span class="daily-date">${escapeHtml(row.date)}</span>
          <span>${formatWetness(row.topsoil_wetness)}</span>
          <span>${escapeHtml(row.rainfall_mm ?? "—")} mm</span>
          <span>${escapeHtml(row.temperature_c ?? "—")}°C</span>
        </div>
      `,
    )
    .join("");

  return `
    <section class="current-card">
      <h3 class="section-heading">${t(language, "nasaLatestHeading")}</h3>
      <div class="metric-grid">
        ${metric(language, "nasaDate", latest.date ?? "—")}
        ${metric(language, "nasaTopsoilWetness", formatWetness(latest.topsoil_wetness))}
        ${metric(language, "nasaRootzoneWetness", formatWetness(latest.rootzone_wetness))}
        ${metric(language, "nasaRainfallToday", formatValue(latest.rainfall_mm, " mm"))}
        ${metric(language, "nasaTemperature", formatValue(latest.temperature_c, "°C"))}
        ${metric(language, "nasaHumidity", formatValue(latest.humidity_percent, "%"))}
        ${metric(language, "nasaWind", formatValue(latest.wind_ms, " m/s"))}
        ${metric(language, "nasaSolar", formatValue(latest.solar_mj, " MJ/m²"))}
      </div>
    </section>

    <section class="weather-section">
      <h3>${t(language, "nasaSummaryHeading")}</h3>
      <div class="metric-grid">
        ${metric(language, "nasaTopsoilAverage", formatWetness(summary.topsoil_wetness_avg))}
        ${metric(language, "nasaRootzoneAverage", formatWetness(summary.rootzone_wetness_avg))}
        ${metric(language, "nasaRainfallTotal", formatValue(summary.rainfall_total_mm, " mm"))}
        ${metric(language, "nasaTemperatureAverage", formatValue(summary.temperature_avg_c, "°C"))}
        ${metric(language, "nasaTemperatureMax", formatValue(summary.temperature_max_c, "°C"))}
        ${metric(language, "nasaSolarAverage", formatValue(summary.solar_avg_mj, " MJ/m²"))}
        ${metric(language, "nasaDaysWithData", summary.valid_days ?? "—")}
      </div>
    </section>

    <section class="weather-section">
      <h3>${t(language, "nasaSeriesHeading")}</h3>
      <div class="daily-list">${series}</div>
      <p class="advice-disclaimer">${t(language, "nasaHistoryNote")}</p>
    </section>

    <section class="weather-section">
      <h3>${t(language, "nasaAdviceHeading")}</h3>
      ${(data.advisories ?? []).map((item) => renderAdvice(language, item)).join("")}
      <p class="advice-disclaimer">${t(language, "nasaGeneralOnly")}</p>
    </section>

    <p class="source-note">${t(language, "nasaSource")}: <a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(sourceLabel)}</a> · ${escapeHtml(data.dataset ?? "")}</p>
    <p class="advice-disclaimer">${t(language, "nasaGridNote")}</p>
  `;
}

function updateContent(language) {
  const target = document.querySelector("#nasa-content");
  if (target) target.innerHTML = renderBody(language);
}

function updateFields(language) {
  const target = document.querySelector("#nasa-fields");
  if (target) target.innerHTML = renderFields(language);
}

function updateSelection(language) {
  const label = document.querySelector("#nasa-selection");
  if (label) {
    label.textContent = nasaState.lat !== null && nasaState.lon !== null
      ? `${t(language, "nasaSelectedField")}: ${nasaState.name || `${nasaState.lat.toFixed(4)}, ${nasaState.lon.toFixed(4)}`}`
      : `${t(language, "nasaCoordinates")}: —`;
  }
  const latInput = document.querySelector("#nasa-lat");
  const lonInput = document.querySelector("#nasa-lon");
  if (latInput && nasaState.lat !== null) latInput.value = String(nasaState.lat);
  if (lonInput && nasaState.lon !== null) lonInput.value = String(nasaState.lon);
}

function setStatus(language, message) {
  const target = document.querySelector("#nasa-status");
  if (target) target.textContent = message ? t(language, message) : "";
}

function readInputs(language) {
  const latText = document.querySelector("#nasa-lat")?.value?.trim() ?? "";
  const lonText = document.querySelector("#nasa-lon")?.value?.trim() ?? "";
  const lat = Number(latText);
  const lon = Number(lonText);
  if (!latText || !lonText || !Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    setStatus(language, "nasaNoData");
    return null;
  }
  return { lat, lon };
}

function selectField(field, shouldLoad = true) {
  nasaState.selectedId = field.id;
  nasaState.lat = Number(field.lat);
  nasaState.lon = Number(field.lon);
  nasaState.name = field.name;
  nasaState.error = "";
  nasaState.data = null;
  updateSelection(appState.language);
  updateFields(appState.language);
  if (shouldLoad) loadAdvisory(appState.language);
}

function saveFieldFromForm(language) {
  const name = document.querySelector("#nasa-name")?.value?.trim() ?? "";
  const coords = readInputs(language);
  if (!coords || !name) {
    setStatus(language, "nasaNoData");
    return;
  }

  const field = {
    id: globalThis.crypto?.randomUUID?.() ?? `field-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: name.slice(0, 60),
    lat: coords.lat,
    lon: coords.lon,
  };
  nasaState.fields.push(field);
  saveFields();
  setStatus(language, "");
  selectField(field);
}

function useWeatherLocation(language) {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(WEATHER_LOCATION_KEY) ?? "null");
  } catch {
    saved = null;
  }
  if (!saved || !Number.isFinite(Number(saved.lat)) || !Number.isFinite(Number(saved.lon))) {
    setStatus(language, "nasaNoData");
    return;
  }
  nasaState.selectedId = "";
  nasaState.lat = Number(saved.lat);
  nasaState.lon = Number(saved.lon);
  nasaState.name = saved.name || t(language, "nasaUseSavedLocation");
  nasaState.error = "";
  nasaState.data = null;
  updateSelection(language);
  updateFields(language);
  loadAdvisory(language);
}

function useMyLocation(language) {
  if (!navigator.geolocation) {
    nasaState.error = t(language, "nasaError");
    updateContent(language);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      nasaState.selectedId = "";
      nasaState.lat = position.coords.latitude;
      nasaState.lon = position.coords.longitude;
      nasaState.name = t(language, "nasaUseMyLocation");
      nasaState.error = "";
      nasaState.data = null;
      updateSelection(language);
      updateFields(language);
      loadAdvisory(language);
    },
    () => {
      nasaState.error = t(language, "nasaError");
      updateContent(language);
    },
    { timeout: 10000, maximumAge: 600000 },
  );
}

async function loadAdvisory(language) {
  const coords = readInputs(language);
  if (!coords) return;

  nasaState.lat = coords.lat;
  nasaState.lon = coords.lon;
  nasaState.loading = true;
  nasaState.error = "";
  setStatus(language, "");
  updateContent(language);

  const params = new URLSearchParams({ lat: String(coords.lat), lon: String(coords.lon) });
  try {
    const response = await fetch(`${API_BASE_URL}/api/nasa/field-advisory?${params.toString()}`);
    if (!response.ok) throw new Error("NASA request failed");
    nasaState.data = await response.json();
  } catch {
    nasaState.data = null;
    nasaState.error = t(language, "nasaError");
  } finally {
    nasaState.loading = false;
    updateContent(appState.language);
  }
}

export function renderNasaAdvisory(language) {
  return `
    <section class="weather-page">
      <section class="location-card">
        <h2 class="section-heading">${t(language, "nasaTitle")}</h2>
        <p>${t(language, "nasaIntro")}</p>
        <p class="equipment-note smart-disclaimer">${t(language, "nasaDisclaimer")}</p>
        <form id="nasa-field-form">
          <label class="crop-label" for="nasa-name">${t(language, "nasaFieldName")}</label>
          <input id="nasa-name" type="text" maxlength="60" placeholder="${t(language, "nasaFieldNamePlaceholder")}" />
          <label class="crop-label" for="nasa-lat">${t(language, "nasaLatitude")}</label>
          <input id="nasa-lat" type="number" step="any" min="-90" max="90" />
          <label class="crop-label" for="nasa-lon">${t(language, "nasaLongitude")}</label>
          <input id="nasa-lon" type="number" step="any" min="-180" max="180" />
          <div class="location-actions">
            <button type="submit" class="primary-button">${t(language, "nasaSaveField")}</button>
            <button type="button" id="nasa-use-location" class="secondary-button">${t(language, "nasaUseMyLocation")}</button>
            <button type="button" id="nasa-use-saved-location" class="secondary-button">${t(language, "nasaUseSavedLocation")}</button>
            <button type="button" id="nasa-get-data" class="secondary-button">${t(language, "nasaGetData")}</button>
          </div>
        </form>
        <p id="nasa-selection" class="selected-place">${t(language, "nasaCoordinates")}: —</p>
        <p id="nasa-status" class="success-message" role="status"></p>
        <h3 class="section-heading">${t(language, "nasaSavedFields")}</h3>
        <div id="nasa-fields" class="community-chips">${renderFields(language)}</div>
      </section>
      <div id="nasa-content">${renderBody(language)}</div>
    </section>
  `;
}

export function initNasaAdvisory() {
  loadFields();
  updateFields(appState.language);
  updateSelection(appState.language);

  document.querySelector("#nasa-field-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    saveFieldFromForm(appState.language);
  });
  document.querySelector("#nasa-use-location")?.addEventListener("click", () => useMyLocation(appState.language));
  document.querySelector("#nasa-use-saved-location")?.addEventListener("click", () => useWeatherLocation(appState.language));
  document.querySelector("#nasa-get-data")?.addEventListener("click", () => loadAdvisory(appState.language));

  document.querySelector("#nasa-fields")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-nasa-field]");
    if (!button) return;
    const field = nasaState.fields.find((item) => item.id === button.dataset.nasaField);
    if (field) selectField(field);
  });

  if (nasaState.fields.length > 0 && !nasaState.data) {
    selectField(nasaState.fields[0]);
  }
}
