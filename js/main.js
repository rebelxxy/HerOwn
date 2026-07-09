import { initAssistant } from './components/assistant.js';
import {
  fetchDayPlans,
  fetchFavorites,
  fetchLivingGuides,
  fetchPlaces,
  fetchSafetyGuides,
} from './api.js';
import { initRouter } from './router.js';
import { state } from './state.js';

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

  state.favoritePlaces = favorites.map((favorite) => (
    places.find((place) => place.id === favorite.id || place.name === favorite.name) || favorite
  ));
  state.savedPlaces = state.favoritePlaces.map((place) => place.id);
  state.savedDays = dayPlans;

  document.dispatchEvent(new CustomEvent('herown:data-ready'));
}

initAssistant();
initRouter();
void hydrateApiData();
