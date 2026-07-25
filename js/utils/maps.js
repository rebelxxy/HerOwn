const GOOGLE_MAPS_SEARCH_URL = "https://www.google.com/maps/search/?api=1";
const GOOGLE_MAPS_DIRECTIONS_URL = "https://www.google.com/maps/dir/?api=1";
const GOOGLE_MAPS_HOME_URL = "https://www.google.com/maps";
const MAX_MAPS_URL_LENGTH = 1900;

function normalizeCoordinate(value, min, max) {
  if (typeof value === "boolean") return null;
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) return null;
  return String(Number(number.toFixed(6)));
}

function coordinatePair(lat, lng) {
  const latitude = normalizeCoordinate(lat, -90, 90);
  const longitude = normalizeCoordinate(lng, -180, 180);
  if (!latitude || !longitude) return null;
  return `${latitude},${longitude}`;
}

function safeTravelMode(mode) {
  const normalized = String(mode || "walking").trim().toLowerCase();
  return ["driving", "walking", "bicycling", "transit"].includes(normalized) ? normalized : "walking";
}

export function hasValidCoordinates(point = {}) {
  return Boolean(coordinatePair(point.lat, point.lng));
}

export function buildGoogleMapsLocationUrl({ lat, lng, label = "" } = {}) {
  const pair = coordinatePair(lat, lng);
  if (!pair) return null;

  // Coordinates are used instead of fictional labels so prototype places open as areas, not verified venues.
  return `${GOOGLE_MAPS_SEARCH_URL}&query=${encodeURIComponent(pair)}`;
}

export function buildGoogleMapsSearchUrl({ query = "" } = {}) {
  const normalizedQuery = String(query || "").trim();
  if (!normalizedQuery) return GOOGLE_MAPS_HOME_URL;
  return `${GOOGLE_MAPS_SEARCH_URL}&query=${encodeURIComponent(normalizedQuery)}`;
}

export function buildGoogleMapsDirectionsUrl({
  originLat,
  originLng,
  destinationLat,
  destinationLng,
  waypoints = [],
  travelMode = "walking",
} = {}) {
  const origin = coordinatePair(originLat, originLng);
  const destination = coordinatePair(destinationLat, destinationLng);
  if (!origin || !destination) return null;

  const baseParams = [
    `origin=${encodeURIComponent(origin)}`,
    `destination=${encodeURIComponent(destination)}`,
    `travelmode=${encodeURIComponent(safeTravelMode(travelMode))}`,
  ];

  const waypointPairs = waypoints
    .map((point) => coordinatePair(point.lat, point.lng))
    .filter(Boolean);

  const withWaypoints = waypointPairs.length
    ? `${GOOGLE_MAPS_DIRECTIONS_URL}&${[...baseParams, `waypoints=${encodeURIComponent(waypointPairs.join("|"))}`].join("&")}`
    : `${GOOGLE_MAPS_DIRECTIONS_URL}&${baseParams.join("&")}`;

  if (withWaypoints.length <= MAX_MAPS_URL_LENGTH) return withWaypoints;
  return `${GOOGLE_MAPS_DIRECTIONS_URL}&${baseParams.join("&")}`;
}
