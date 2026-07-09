import {
  favoritePlaceIds,
  livingGuides,
  places,
  safetyGuides,
  savedDayPlans,
} from './data.js';

export const state = {
  page: "home",
  lang: localStorage.getItem("herOwnLanguage") || "en",
  user: {
    id: 1,
    name: "Xiao",
    email: "xiao@herown.app",
    city: "Tokyo",
    language: "English / Japanese",
    budget: "3000 yen",
    preferences: ["Quiet", "Women friendly", "Solo friendly"],
    locationEnabled: true,
  },
  authMode: "register",
  selectedSafe: "train",
  selectedCaller: "mom",
  selectedTimer: "now",
  sosRevealed: false,
  selectedLivingCategory: "Rent",
  selectedGuide: "toilet",
  selectedPlaceCategory: "Cafe",
  selectedPlace: "mori-cafe",
  placeSearch: "",
  dayMood: "Peace",
  dayTime: "Half day",
  dayBudget: "3000 yen",
  dayArea: "Kichijoji",
  dayPlan: [],
  myTab: "Places",
  notes: [
    {
      id: "note-1",
      title: "Move-in checklist",
      text: "Check entrance lighting, spare key rules, and nearest convenience store before signing.",
    },
  ],
  assistantOpen: false,
  assistantMessages: [
    {
      role: "assistant",
      text: "Hi, I'm HER. If this is urgent, move toward people and call 110. Otherwise, tell me what is happening.",
    },
  ],
  catalogs: {
    places,
    safetyGuides,
    livingGuides,
  },
  favoritePlaces: places.filter((place) => favoritePlaceIds.includes(place.id)),
  savedPlaces: [...favoritePlaceIds],
  savedDays: savedDayPlans.map((plan) => ({ ...plan, stops: [...plan.stops] })),
};

export const ASSET_ROOT = "images/";
export const PICTURE_ROOT = `${ASSET_ROOT}pictures/`;
