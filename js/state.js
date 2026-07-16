import {
  favoritePlaceIds,
  livingGuides,
  places,
  safetyGuides,
  savedDayPlans,
} from './data.js';
import { loadNotes, loadSavedDays, loadSavedGuides, loadSavedPlaces, mergeDayPlans } from './storage.js';

const initialSavedPlaceIds = loadSavedPlaces() || favoritePlaceIds;

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
  selectedLivingCategory: "",
  selectedGuide: "",
  livingSearch: "",
  livingStepProgress: {},
  savedGuideIds: loadSavedGuides(),
  selectedPlaceCategory: "Cafe",
  selectedPlace: "mori-cafe",
  placeSearch: "",
  dayMood: "Peace",
  dayTime: "Half day",
  dayBudget: "3000 yen",
  dayArea: "Kichijoji",
  dayPlan: [],
  selectedDaySuggestion: "",
  dayPreference: "Calm and slow",
  dayStartTime: "11:00",
  dayAdjustOpen: false,
  pendingDeleteDayId: "",
  pendingRemoveGuideId: "",
  pendingRemovePlaceId: "",
  editingNoteId: "",
  expandedNoteId: "",
  pendingDeleteNoteId: "",
  myTab: "Places",
  notes: loadNotes(),
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
  favoritePlaces: places.filter((place) => initialSavedPlaceIds.includes(place.id)),
  savedPlaces: [...initialSavedPlaceIds],
  savedDays: mergeDayPlans(loadSavedDays(), savedDayPlans),
};

export const ASSET_ROOT = "images/";
export const PICTURE_ROOT = `${ASSET_ROOT}pictures/`;
