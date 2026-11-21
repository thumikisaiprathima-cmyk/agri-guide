import { initState, state, subscribe, setLanguage, setRoute, toggleVoicePanel, closeVoicePanel } from "./state.js";
import { startRouter } from "./router.js";
import { renderHeader } from "./components/header.js";
import { renderLanguagePicker } from "./components/languagePicker.js";
import { renderBottomNav } from "./components/bottomNav.js";
import { renderVoiceButton } from "./components/voiceButton.js";
import { renderVoicePanel } from "./components/voicePanel.js";
import { renderHome } from "./pages/home.js";
import { renderAdmin, initAdmin } from "./pages/admin.js";
import { renderAssistant, initAssistant } from "./pages/assistant.js";
import { renderSchemes, initSchemes } from "./pages/schemes.js";
import { renderVideos, initVideos } from "./pages/videos.js";
import { renderSmartFarming, initSmartFarming } from "./pages/smartFarming.js";
import { renderMarketplace, initMarketplace } from "./pages/marketplace.js";
import { renderEquipment, initEquipment } from "./pages/equipment.js";
import { renderCommunity, initCommunity } from "./pages/community.js";
import { renderDashboard, initDashboard } from "./pages/dashboard.js";
import { renderWeather, initWeather } from "./pages/weather.js";
import { renderNasaAdvisory, initNasaAdvisory } from "./pages/nasaAdvisory.js";
import { renderPlaceholder } from "./pages/placeholder.js";
import { translate } from "./i18n/index.js";
import { speak, stopSpeaking } from "./services/speech.js";

const app = document.querySelector("#app");

const pageMounts = {
  "#/admin": initAdmin,
  "#/assistant": initAssistant,
  "#/schemes": initSchemes,
  "#/videos": initVideos,
  "#/smart-farming": initSmartFarming,
  "#/marketplace": initMarketplace,
  "#/equipment": initEquipment,
  "#/community": initCommunity,
  "#/dashboard": initDashboard,
  "#/weather": initWeather,
  "#/nasa-advisory": initNasaAdvisory,
};

function pageForRoute(route, language) {
  if (route === "#/" || route === "#") return renderHome(language);
  if (route === "#/admin") return renderAdmin(language);
  if (route === "#/assistant") return renderAssistant(language);
  if (route === "#/schemes") return renderSchemes(language);
  if (route === "#/videos") return renderVideos(language);
  if (route === "#/smart-farming") return renderSmartFarming(language);
  if (route === "#/marketplace") return renderMarketplace(language);
  if (route === "#/equipment") return renderEquipment(language);
  if (route === "#/community") return renderCommunity(language);
  if (route === "#/dashboard") return renderDashboard(language);
  if (route === "#/weather") return renderWeather(language);
  if (route === "#/nasa-advisory") return renderNasaAdvisory(language);
  return renderPlaceholder(route, language);
}

function attachEvents() {
  document.querySelectorAll("[data-language]").forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.language));
  });

  document.querySelector("#voice-button")?.addEventListener("click", toggleVoicePanel);

  document.querySelector("#voice-panel-close")?.addEventListener("click", () => {
    stopSpeaking();
    closeVoicePanel();
  });

  document.querySelector("#read-aloud")?.addEventListener("click", () => {
    const text = document.querySelector("#page-content")?.innerText ?? "";
    const status = document.querySelector("#speech-status");
    const supported = speak(text, state.language);
    if (status) {
      status.textContent = supported ? "" : translate(state.language, "speechUnsupported");
    }
  });

  document.querySelector("#stop-reading")?.addEventListener("click", () => {
    stopSpeaking();
    const status = document.querySelector("#speech-status");
    if (status) status.textContent = "";
  });
}

function render() {
  const { language, route, voicePanelOpen } = state;
  document.documentElement.lang = language;
  stopSpeaking();

  app.innerHTML = `
    <div class="app-shell">
      ${renderHeader(language)}
      ${renderLanguagePicker(language)}
      <div id="page-content" class="page-content">${pageForRoute(route, language)}</div>
      ${renderVoiceButton(language)}
      ${renderVoicePanel(language, voicePanelOpen)}
      ${renderBottomNav(language, route)}
    </div>
  `;

  attachEvents();
  pageMounts[route]?.(language);
}

initState();
subscribe(render);
startRouter(setRoute);
render();
