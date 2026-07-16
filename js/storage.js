export const SAVED_DAYS_KEY = "herOwnSavedDays";
export const SAVED_GUIDES_KEY = "herOwnSavedGuides";
export const SAVED_PLACES_KEY = "herOwnSavedPlaces";
export const NOTES_KEY = "herOwnNotes";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function safeLocalStorage() {
  try {
    return globalThis.localStorage || null;
  } catch (error) {
    return null;
  }
}

function stopText(stop) {
  if (typeof stop === "string") return stop.trim();
  const time = stop.time || String(stop.start_time || "").slice(0, 5);
  const title = stop.title || stop.place_name || stop.category || "Stop";
  return `${time} ${title}`.trim();
}

export function dayPlanFingerprint(plan) {
  const stops = (plan.stops || []).map(stopText);
  return [
    plan.title || "",
    plan.mood || "",
    plan.area || "",
    plan.duration || "",
    plan.budget || plan.budget_yen || "",
    plan.preference || "",
    stops.join("|"),
  ].join("::").toLowerCase();
}

function hashText(text) {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (Math.imul(31, hash) + text.charCodeAt(index)) | 0;
  }
  return Math.abs(hash).toString(36);
}

export function ensureDayPlanIdentity(plan) {
  const normalized = {
    ...clone(plan),
    stops: Array.isArray(plan.stops) ? plan.stops.map(stopText) : [],
  };
  const fingerprint = plan.fingerprint || dayPlanFingerprint(normalized);
  return {
    ...normalized,
    id: String(plan.id || `day-${hashText(fingerprint)}`),
    fingerprint,
  };
}

export function mergeDayPlans(...groups) {
  const merged = [];
  const seen = new Set();

  groups.flat().filter(Boolean).forEach((plan) => {
    const normalized = ensureDayPlanIdentity(plan);
    const keys = [normalized.id, normalized.fingerprint].filter(Boolean);
    if (keys.some((key) => seen.has(key))) return;
    keys.forEach((key) => seen.add(key));
    merged.push(normalized);
  });

  return merged;
}

export function loadSavedDays() {
  const storage = safeLocalStorage();
  if (!storage) return [];

  try {
    const parsed = JSON.parse(storage.getItem(SAVED_DAYS_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return mergeDayPlans(parsed);
  } catch (error) {
    console.warn("Could not read saved HER Day plans from localStorage.");
    return [];
  }
}

export function persistSavedDays(plans) {
  const storage = safeLocalStorage();
  const normalized = mergeDayPlans(plans);
  if (!storage) return normalized;

  try {
    storage.setItem(SAVED_DAYS_KEY, JSON.stringify(normalized));
  } catch (error) {
    console.warn("Could not save HER Day plans to localStorage.");
  }

  return normalized;
}

export function hasSavedDayPlan(plans, plan) {
  const candidate = ensureDayPlanIdentity(plan);
  return plans.some((savedPlan) => {
    const normalized = ensureDayPlanIdentity(savedPlan);
    return normalized.id === candidate.id || normalized.fingerprint === candidate.fingerprint;
  });
}

export function loadSavedGuides() {
  const storage = safeLocalStorage();
  if (!storage) return [];

  try {
    const parsed = JSON.parse(storage.getItem(SAVED_GUIDES_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.map(String))];
  } catch (error) {
    console.warn("Could not read saved HER Living guides from localStorage.");
    return [];
  }
}

export function persistSavedGuides(guideIds) {
  const storage = safeLocalStorage();
  const normalized = [...new Set((guideIds || []).map(String))];
  if (!storage) return normalized;

  try {
    storage.setItem(SAVED_GUIDES_KEY, JSON.stringify(normalized));
  } catch (error) {
    console.warn("Could not save HER Living guides to localStorage.");
  }

  return normalized;
}

export function loadSavedPlaces() {
  const storage = safeLocalStorage();
  if (!storage) return null;

  try {
    const value = storage.getItem(SAVED_PLACES_KEY);
    if (value === null) return null;
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return null;
    return [...new Set(parsed.map(String))];
  } catch (error) {
    console.warn("Could not read saved HER Places from localStorage.");
    return null;
  }
}

export function persistSavedPlaces(placeIds) {
  const storage = safeLocalStorage();
  const normalized = [...new Set((placeIds || []).map(String))];
  if (!storage) return normalized;

  try {
    storage.setItem(SAVED_PLACES_KEY, JSON.stringify(normalized));
  } catch (error) {
    console.warn("Could not save HER Places to localStorage.");
  }

  return normalized;
}

function normalizeNote(note) {
  const now = new Date().toISOString();
  const content = note.content ?? note.text ?? "";
  return {
    id: String(note.id || `note-${Date.now()}`),
    title: String(note.title || "").trim() || (String(content).trim() ? "Untitled note" : ""),
    content: String(content || ""),
    createdAt: note.createdAt || now,
    updatedAt: note.updatedAt || note.createdAt || now,
  };
}

export function loadNotes() {
  const storage = safeLocalStorage();
  if (!storage) return [];

  try {
    const parsed = JSON.parse(storage.getItem(NOTES_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeNote).filter((note) => note.title || note.content);
  } catch (error) {
    console.warn("Could not read HER OWN notes from localStorage.");
    return [];
  }
}

export function persistNotes(notes) {
  const storage = safeLocalStorage();
  const normalized = (notes || []).map(normalizeNote).filter((note) => note.title || note.content);
  if (!storage) return normalized;

  try {
    storage.setItem(NOTES_KEY, JSON.stringify(normalized));
  } catch (error) {
    console.warn("Could not save HER OWN notes to localStorage.");
  }

  return normalized;
}
