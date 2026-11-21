// Clean, separate sample data for demo mode.
// Nothing here is real-world information. Real data arrives from the backend
// in later phases; the rest of the app reads only from this file right now.

export const mockData = {
  note: "Demo data — not real-world information",

  languages: [
    { code: "en", label: "English" },
    { code: "te", label: "తెలుగు" },
    { code: "hi", label: "हिन्दी" },
    { code: "ta", label: "தமிழ்" },
    { code: "mr", label: "मराठी" },
  ],

  features: [
    {
      id: "dashboard",
      icon: "sprout",
      tone: "green",
      titleKey: "cardDashboardTitle",
      descKey: "cardDashboardDesc",
      route: "#/dashboard",
      phase: 3,
    },
    {
      id: "weather",
      icon: "cloudSun",
      tone: "sky",
      titleKey: "cardWeatherTitle",
      descKey: "cardWeatherDesc",
      route: "#/weather",
      phase: 2,
    },
    {
      id: "nasaAdvisory",
      icon: "mapPin",
      tone: "sky",
      titleKey: "cardNasaTitle",
      descKey: "cardNasaDesc",
      route: "#/nasa-advisory",
      phase: 13,
    },
    {
      id: "schemes",
      icon: "landmark",
      tone: "amber",
      titleKey: "cardSchemesTitle",
      descKey: "cardSchemesDesc",
      route: "#/schemes",
      phase: 9,
    },
    {
      id: "community",
      icon: "users",
      tone: "violet",
      titleKey: "cardCommunityTitle",
      descKey: "cardCommunityDesc",
      route: "#/community",
      phase: 4,
    },
    {
      id: "smartFarming",
      icon: "lightbulb",
      tone: "green",
      titleKey: "cardSmartFarmingTitle",
      descKey: "cardSmartFarmingDesc",
      route: "#/smart-farming",
      phase: 7,
    },
    {
      id: "equipment",
      icon: "tractor",
      tone: "sky",
      titleKey: "cardEquipmentTitle",
      descKey: "cardEquipmentDesc",
      route: "#/equipment",
      phase: 5,
    },
    {
      id: "marketplace",
      icon: "basket",
      tone: "amber",
      titleKey: "cardMarketplaceTitle",
      descKey: "cardMarketplaceDesc",
      route: "#/marketplace",
      phase: 6,
    },
    {
      id: "videos",
      icon: "video",
      tone: "violet",
      titleKey: "cardVideosTitle",
      descKey: "cardVideosDesc",
      route: "#/videos",
      phase: 8,
    },
  ],

  weatherQuickPlaces: [
    "Hyderabad",
    "Vijayawada",
    "Visakhapatnam",
    "Tirupati",
    "Warangal",
    "Guntur",
  ],

  // Stable stored values with translated labels. Interests reuse existing card
  // titles so they stay consistent across the whole app.
  profileInterests: [
    { value: "weather", key: "cardWeatherTitle" },
    { value: "schemes", key: "cardSchemesTitle" },
    { value: "community", key: "cardCommunityTitle" },
    { value: "videos", key: "cardVideosTitle" },
    { value: "smart", key: "cardSmartFarmingTitle" },
    { value: "equipment", key: "cardEquipmentTitle" },
    { value: "marketplace", key: "cardMarketplaceTitle" },
  ],

  landSizeOptions: [
    { value: "under1", key: "landUnder1" },
    { value: "1to3", key: "land1to3" },
    { value: "3to10", key: "land3to10" },
    { value: "over10", key: "landOver10" },
  ],

  soilTypeOptions: [
    { value: "loam", key: "soilLoam" },
    { value: "clay", key: "soilClay" },
    { value: "sandy", key: "soilSandy" },
    { value: "red", key: "soilRed" },
    { value: "black", key: "soilBlack" },
  ],

  irrigationOptions: [
    { value: "canal", key: "irrCanal" },
    { value: "well", key: "irrWell" },
    { value: "rainfed", key: "irrRainfed" },
    { value: "drip", key: "irrDrip" },
    { value: "sprinkler", key: "irrSprinkler" },
  ],

  // Teaser cards only. No invented scheme names, products or sellers.
  dashboardTeasers: [
    { id: "schemes", icon: "landmark", headingKey: "schemesHeading", bodyKey: "schemesTeaser", route: "#/schemes", phase: 9 },
    { id: "community", icon: "users", headingKey: "communityHeading", bodyKey: "communityTeaser", route: "#/community", phase: 4 },
    { id: "videos", icon: "video", headingKey: "videosHeading", bodyKey: "videosTeaser", route: "#/videos", phase: 8 },
    { id: "smart", icon: "lightbulb", headingKey: "smartHeading", bodyKey: "smartTeaser", route: "#/smart-farming", phase: 7 },
  ],

  videoCategories: [
    { value: "soil", key: "vidSoil" },
    { value: "water", key: "vidWater" },
    { value: "crops", key: "vidCrops" },
    { value: "pests", key: "vidPests" },
    { value: "schemes", key: "vidSchemes" },
    { value: "equipment", key: "vidEquipment" },
  ],

  videoContent: {
    "demo-video-soil-prep": { title: "vidSoilPrepTitle", summary: "vidSoilPrepDesc" },
    "demo-video-soil-testing": { title: "vidSoilTestTitle", summary: "vidSoilTestDesc" },
    "demo-video-irrigation": { title: "vidIrrigationTitle", summary: "vidIrrigationDesc" },
    "demo-video-rain-check": { title: "vidRainTitle", summary: "vidRainDesc" },
    "demo-video-seed-selection": { title: "vidSeedTitle", summary: "vidSeedDesc" },
    "demo-video-pest-checks": { title: "vidPestTitle", summary: "vidPestDesc" },
    "demo-video-scheme-info": { title: "vidSchemeTitle", summary: "vidSchemeDesc" },
    "demo-video-tool-care": { title: "vidToolTitle", summary: "vidToolDesc" },
  },

  voiceCommandCategories: [
    { value: "navigation", key: "vcNavigation" },
    { value: "reading", key: "vcReading" },
    { value: "help", key: "vcHelpCategory" },
  ],

  // Spoken keywords and the action each one triggers. The phrase key is looked
  // up in the active language; matching happens in the assistant page.
  voiceCommandContent: {
    "nav-home": { phraseKey: "vcHome", route: "#/" },
    "nav-weather": { phraseKey: "vcWeather", route: "#/weather" },
    "nav-schemes": { phraseKey: "vcSchemes", route: "#/schemes" },
    "nav-community": { phraseKey: "vcCommunity", route: "#/community" },
    "nav-videos": { phraseKey: "vcVideos", route: "#/videos" },
    "nav-marketplace": { phraseKey: "vcMarketplace", route: "#/marketplace" },
    "nav-equipment": { phraseKey: "vcEquipment", route: "#/equipment" },
    "nav-smart": { phraseKey: "vcSmart", route: "#/smart-farming" },
    "nav-dashboard": { phraseKey: "vcDashboard", route: "#/dashboard" },
    "read-page": { phraseKey: "vcRead", action: "read" },
    "stop-reading": { phraseKey: "vcStop", action: "stop" },
    help: { phraseKey: "vcHelp", action: "help" },
  },

  schemeCategories: [
    { value: "official", key: "schOfficial" },
    { value: "eligibility", key: "schEligibility" },
    { value: "documents", key: "schDocuments" },
    { value: "application", key: "schApplication" },
    { value: "help", key: "schHelp" },
  ],

  schemeContent: {
    "finding-official-info": { title: "schFindTitle", steps: ["schFind1", "schFind2", "schFind3"] },
    "avoiding-fake-claims": { title: "schFakeTitle", steps: ["schFake1", "schFake2", "schFake3"] },
    "checking-eligibility": { title: "schEligibilityTitle", steps: ["schEligibility1", "schEligibility2", "schEligibility3"] },
    documents: { title: "schDocumentsTitle", steps: ["schDocuments1", "schDocuments2", "schDocuments3"] },
    "application-steps": { title: "schApplyTitle", steps: ["schApply1", "schApply2", "schApply3"] },
    "where-to-ask": { title: "schWhereTitle", steps: ["schWhere1", "schWhere2", "schWhere3"] },
    "checking-status": { title: "schStatusTitle", steps: ["schStatus1", "schStatus2", "schStatus3"] },
  },

  smartTopicCategories: [
    { value: "soil", key: "sfSoil" },
    { value: "water", key: "sfWater" },
    { value: "crops", key: "sfCrops" },
    { value: "pests", key: "sfPests" },
    { value: "records", key: "sfRecords" },
    { value: "weather", key: "sfWeather" },
  ],

  smartTopicContent: {
    "soil-health": { title: "sfTopicSoilTitle", steps: ["sfTopicSoil1", "sfTopicSoil2", "sfTopicSoil3"] },
    "irrigation-planning": { title: "sfTopicWaterTitle", steps: ["sfTopicWater1", "sfTopicWater2", "sfTopicWater3"] },
    "crop-rotation": { title: "sfTopicCropsTitle", steps: ["sfTopicCrops1", "sfTopicCrops2", "sfTopicCrops3"] },
    "pest-prevention": { title: "sfTopicPestsTitle", steps: ["sfTopicPests1", "sfTopicPests2", "sfTopicPests3"] },
    "record-keeping": { title: "sfTopicRecordsTitle", steps: ["sfTopicRecords1", "sfTopicRecords2", "sfTopicRecords3"] },
    "weather-planning": { title: "sfTopicWeatherTitle", steps: ["sfTopicWeather1", "sfTopicWeather2", "sfTopicWeather3"] },
  },

  marketplaceCategories: [
    { value: "grains", key: "mkGrains" },
    { value: "pulses", key: "mkPulses" },
    { value: "vegetables", key: "mkVegetables" },
    { value: "fruits", key: "mkFruits" },
    { value: "oils", key: "mkOils" },
    { value: "spices", key: "mkSpices" },
    { value: "other", key: "mkOther" },
  ],

  marketplaceDistricts: [
    "Guntur",
    "Warangal",
    "Mahbubnagar",
    "Vijayawada",
    "Tirupati",
    "Nalgonda",
    "Anantapur",
  ],

  equipmentCategories: [
    { value: "tractors", key: "catTractors" },
    { value: "tillage", key: "catTillage" },
    { value: "harvesting", key: "catHarvesting" },
    { value: "irrigation", key: "catIrrigation" },
    { value: "spraying", key: "catSpraying" },
    { value: "transport", key: "catTransport" },
    { value: "other", key: "catOther" },
  ],

  equipmentDistricts: [
    "Guntur",
    "Warangal",
    "Vijayawada",
    "Hyderabad",
    "Tirupati",
    "Nalgonda",
    "Anantapur",
  ],

  communityCategories: [
    { value: "general", key: "catGeneral" },
    { value: "weather", key: "catWeather" },
    { value: "crops", key: "catCrops" },
    { value: "irrigation", key: "catIrrigation" },
    { value: "schemes", key: "catSchemes" },
    { value: "equipment", key: "catEquipment" },
    { value: "marketplace", key: "catMarketplace" },
  ],

  nav: [
    { id: "home", route: "#/", icon: "home", key: "navHome" },
    { id: "weather", route: "#/weather", icon: "cloudSun", key: "navWeather" },
    { id: "schemes", route: "#/schemes", icon: "landmark", key: "navSchemes" },
    { id: "community", route: "#/community", icon: "users", key: "navCommunity" },
    { id: "assistant", route: "#/assistant", icon: "mic", key: "navAssistant" },
  ],
};
