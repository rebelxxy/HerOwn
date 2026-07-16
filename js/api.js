import {
  favoritePlaceIds,
  livingGuides as localLivingGuides,
  places as localPlaces,
  safetyGuides as localSafetyGuides,
  savedDayPlans as localSavedDayPlans,
} from './data.js';

const API_ROOT = new URL('../backend/api/', import.meta.url);
const FALLBACK_MESSAGE = 'API unavailable, using local fallback data.';
const REQUEST_TIMEOUT_MS = 3500;
let fallbackWarningShown = false;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function warnFallback() {
  if (!fallbackWarningShown) {
    console.warn(FALLBACK_MESSAGE);
    fallbackWarningShown = true;
  }
}

async function request(endpoint, options = {}) {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(new URL(endpoint, API_ROOT), {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const payload = await response.json();
    if (!payload || payload.success !== true || !Object.prototype.hasOwnProperty.call(payload, 'data')) {
      throw new Error('Invalid API response format');
    }

    return payload.data;
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

async function withFallback(loader, fallback) {
  try {
    return await loader();
  } catch (error) {
    warnFallback();
    return clone(fallback);
  }
}

function asPercentScore(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return 0;
  return score <= 5 ? Math.round(score * 20) : Math.round(score);
}

function normalizePlace(place) {
  return {
    id: String(place.id),
    name: place.name,
    category: place.category === 'Flower' ? 'Flower Shop' : place.category,
    distance: place.distance || 'Nearby',
    budget: place.price_note || place.budget || (place.average_price_yen ? `${place.average_price_yen} yen` : ''),
    open: place.open ?? Boolean(Number(place.is_active ?? 1)),
    safe: asPercentScore(place.safe_score ?? place.safe),
    solo: asPercentScore(place.solo_friendly_score ?? place.solo),
    women: asPercentScore(place.women_friendly_score ?? place.women),
    area: place.area || '',
    address: place.address || '',
    hours: place.hours || place.opening_hours || '',
    reason: place.recommended_reason || place.reason || '',
    womenFriendly: place.women_friendly_notes || place.womenFriendly || '',
    soloReason: place.solo_notes || place.soloReason || '',
    review: place.review || '',
    imageUrl: place.image_url || place.imageUrl || '',
    favoriteId: place.favorite_id ? String(place.favorite_id) : null,
    favoriteNote: place.favorite_note || '',
  };
}

function normalizeSafetyGuide(guide) {
  const identity = {
    'train-harassment': ['train', '🚇'],
    'being-followed': ['followed', '🚶'],
    'walking-home': ['night', '🌃'],
    'stranger-at-door': ['door', '🏠'],
    'unsafe-ride': ['ride', '🚕'],
    emergency: ['emergency', '🆘'],
  }[guide.slug] || [String(guide.id), '◇'];

  return {
    id: identity[0],
    icon: identity[1],
    title: guide.title,
    subtitle: guide.summary || '',
    phrase: guide.say_it_loudly || '',
    steps: (guide.steps || []).map((step) => [step.title, step.body]),
  };
}

function normalizeLivingGuide(guide) {
  return {
    id: guide.slug || String(guide.id),
    category: guide.category,
    title: guide.title,
    risk: guide.risk_level ? `${guide.risk_level.charAt(0).toUpperCase()}${guide.risk_level.slice(1)}` : 'Low',
    time: guide.estimated_time_minutes ? `${guide.estimated_time_minutes} min` : '',
    diy: Boolean(Number(guide.can_do_myself)) ? 'Yes' : 'Mostly',
    tools: Array.isArray(guide.tools_needed) ? guide.tools_needed : [],
    problem: guide.summary || '',
    steps: (guide.steps || []).map((step) => step.body),
    warning: guide.warning || '',
    phrases: Array.isArray(guide.japanese_phrases) ? guide.japanese_phrases : [],
  };
}

function normalizeDayPlan(plan) {
  const preference = plan.preference || String(plan.notes || '').match(/^Preference:\s*(.+)$/)?.[1] || '';
  return {
    id: String(plan.id),
    title: plan.title,
    mood: plan.mood || '',
    area: plan.area || '',
    duration: plan.duration || '',
    budget: plan.budget || (plan.budget_yen ? `${plan.budget_yen} yen` : ''),
    preference,
    stops: (plan.stops || []).map((stop) => {
      const time = String(stop.start_time || '').slice(0, 5);
      const title = stop.title || stop.place_name || stop.category || 'Stop';
      return `${time} ${title}`.trim();
    }),
  };
}

export async function fetchPlaces(filters = {}) {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value);
    }
  });

  const queryString = query.toString();
  const endpoint = `places.php${queryString ? `?${queryString}` : ''}`;
  return withFallback(async () => {
    const data = await request(endpoint);
    if (!Array.isArray(data) || data.length === 0) throw new Error('Places data is empty');
    return data.map(normalizePlace);
  }, localPlaces);
}

export async function fetchSafetyGuides() {
  return withFallback(async () => {
    const data = await request('safety-guides.php');
    if (!Array.isArray(data) || data.length === 0) throw new Error('Safety guide data is empty');
    return data.map(normalizeSafetyGuide);
  }, localSafetyGuides);
}

export async function fetchLivingGuides() {
  return withFallback(async () => {
    const data = await request('living-guides.php');
    if (!Array.isArray(data) || data.length === 0) throw new Error('Living guide data is empty');
    return data.map(normalizeLivingGuide);
  }, localLivingGuides);
}

export async function fetchFavorites(userId) {
  const localFavorites = localPlaces.filter((place) => favoritePlaceIds.includes(place.id));
  return withFallback(async () => {
    const data = await request(`favorites.php?user_id=${encodeURIComponent(userId)}`);
    if (!Array.isArray(data)) throw new Error('Invalid favorites data');
    return data.map(normalizePlace);
  }, localFavorites);
}

export async function fetchDayPlans(userId) {
  return withFallback(async () => {
    const data = await request(`day-plans.php?user_id=${encodeURIComponent(userId)}`);
    if (!Array.isArray(data)) throw new Error('Invalid day plan data');
    return data.map(normalizeDayPlan);
  }, localSavedDayPlans);
}

export async function saveFavoritePlace(userId, placeId) {
  return withFallback(
    () => {
      const numericPlaceId = Number(placeId);
      if (!Number.isInteger(numericPlaceId) || numericPlaceId < 1) {
        throw new Error('Local place does not have a backend id');
      }
      return request('favorites.php', {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId,
          place_id: numericPlaceId,
        }),
      });
    },
    { userId, placeId, savedLocally: true }
  );
}

export async function saveDayPlan(userId, plan) {
  return withFallback(
    () => request('day-plans.php', {
      method: 'POST',
      body: JSON.stringify({
        ...plan,
        user_id: userId,
      }),
    }),
    { ...plan, userId, savedLocally: true }
  );
}
