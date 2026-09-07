import { initAssistant } from './components/assistant.js';
import {
  fetchDayPlans,
  fetchFavorites,
  fetchLivingGuides,
  fetchPlaces,
  fetchSafetyGuides,
} from './api.js';
import { initRouter } from './router.js?v=20260907-ja-type-3';
import { state } from './state.js';
import { loadCurrentDayDraft, loadSavedDays, loadSavedPlaces, mergeDayPlans } from './storage.js';

async function hydrateApiData() {
  const [places, safetyGuides, livingGuides, favorites, dayPlans] = await Promise.all([
    fetchPlaces(),
    fetchSafetyGuides(),
    fetchLivingGuides(),
    fetchFavorites(state.user.id),
    fetchDayPlans(state.user.id),
  ]);

  state.catalogs.places = places;
  state.catalogs.safetyGuides = safetyGuides;
  state.catalogs.livingGuides = livingGuides;

  const localSavedPlaceIds = loadSavedPlaces();
  state.favoritePlaces = localSavedPlaceIds
    ? localSavedPlaceIds
      .map((placeId) => places.find((place) => place.id === placeId))
      .filter(Boolean)
    : favorites.map((favorite) => (
      places.find((place) => place.id === favorite.id || place.name === favorite.name) || favorite
    ));
  state.savedPlaces = state.favoritePlaces.map((place) => place.id);
  state.savedDays = mergeDayPlans(loadSavedDays(), state.savedDays, dayPlans);

  const currentDraft = loadCurrentDayDraft();
  if (currentDraft) {
    state.currentDayDraft = currentDraft;
    state.dayPlan = currentDraft.stops;
    state.dayArea = currentDraft.area || state.dayArea;
    state.dayTime = currentDraft.duration || state.dayTime;
    state.dayBudget = currentDraft.budget || state.dayBudget;
    state.dayStartTime = currentDraft.startTime || state.dayStartTime;
    state.dayPreference = currentDraft.preference || state.dayPreference;
  }

  document.dispatchEvent(new CustomEvent('herown:data-ready'));
}

initAssistant();
initRouter();
void hydrateApiData();
