import { state } from '../state.js';
import { areas, budgets, dayRules, daySuggestions } from '../data.js';
import { t, tf } from '../i18n.js';
import { pageShell } from '../components/layout.js';
import { choiceChip } from '../components/cards.js';
import { ensureDayPlanIdentity, hasSavedDayPlan } from '../storage.js';
import { buildGoogleMapsDirectionsUrl, buildGoogleMapsLocationUrl } from '../utils/maps.js';

export const dayDurationOptions = [
  { labelKey: "dayDurationTwoHours", value: "2h" },
  { labelKey: "dayDurationHalfDay", value: "Half day" },
  { labelKey: "dayDurationFullDay", value: "Full day" },
];

export const dayPreferences = ["Indoor first", "Less walking", "Calm and slow", "Try something new"];

const dayPreferenceLabelKeys = {
  "Indoor first": "dayPreferenceIndoorFirst",
  "Less walking": "dayPreferenceLessWalking",
  "Calm and slow": "dayPreferenceCalmSlow",
  "Try something new": "dayPreferenceTryNew",
};

const durationStopCounts = {
  "2h": 2,
  "Half day": 3,
  "Full day": 4,
};

const durationIntervals = {
  "2h": 60,
  "Half day": 105,
  "Full day": 120,
};

const indoorCategories = ["Cafe", "Bookstore", "Museum", "Gym", "Clinic", "Solo Restaurant", "Flower Shop"];
const calmCategories = ["Cafe", "Bookstore", "Flower Shop", "Park", "Museum"];
const exploratoryCategories = ["Museum", "Gym", "Clinic", "Solo Restaurant", "Night Walk Spot", "Park"];

export function displayDuration(value) {
  const option = dayDurationOptions.find((item) => item.value === value);
  return option ? t(option.labelKey) : value;
}

export function normalizeDuration(value) {
  return dayDurationOptions.find((option) => t(option.labelKey) === value || option.value === value)?.value || value;
}

function displayPreference(value) {
  return t(dayPreferenceLabelKeys[value]) || value;
}

function toMinutes(time) {
  const [hours = "11", minutes = "00"] = String(time || "11:00").split(":");
  return Number(hours) * 60 + Number(minutes);
}

function fromMinutes(totalMinutes) {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = String(Math.floor(normalized / 60)).padStart(2, "0");
  const minutes = String(normalized % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function categoryAlias(type) {
  const aliases = {
    Flower: "Flower Shop",
    "Healthy Cafe": "Cafe",
    "Vintage Store": "Bookstore",
    "Convenience Store": "Night Walk Spot",
    "Safe Route": "Night Walk Spot",
  };
  return aliases[type] || type;
}

function budgetNumber(value) {
  return Number.parseInt(String(value).replace(/[^\d]/g, ""), 10) || 0;
}

function placeBudgetScore(place) {
  const numbers = String(place.budget || "").match(/\d+/g)?.map(Number) || [];
  if (!numbers.length) return 0;
  return Math.max(...numbers);
}

function stopDescription(place, type) {
  if (place?.reason) return place.reason;
  return tf("dayFallbackStopDescription", {
    type,
    preference: displayPreference(state.dayPreference),
    area: state.dayArea,
  });
}

function normalizeStop(stop) {
  return {
    time: stop.time || state.dayStartTime,
    title: stop.title || stop.name || stop.type,
    type: categoryAlias(stop.type || stop.category),
    area: stop.area || state.dayArea,
    description: stop.description || stop.reason || stopDescription(null, stop.type || "gentle"),
    placeId: stop.placeId || stop.id || "",
    budget: stop.budget || "",
    distance: stop.distance || "",
    lat: stop.lat ?? "",
    lng: stop.lng ?? "",
  };
}

function placeToStop(place, type, index) {
  const normalizedType = categoryAlias(type || place.category);
  return {
    time: nextPlanTime(index),
    title: place.name,
    type: place.category || normalizedType,
    area: place.area,
    description: stopDescription(place, normalizedType),
    placeId: place.id,
    budget: place.budget,
    distance: place.distance,
    lat: place.lat,
    lng: place.lng,
  };
}

function fallbackStop(type, index) {
  const normalizedType = categoryAlias(type);
  return {
    time: nextPlanTime(index),
    title: normalizedType,
    type: normalizedType,
    area: state.dayArea,
    description: stopDescription(null, normalizedType),
    placeId: "",
    budget: state.dayBudget,
    distance: "",
    lat: "",
    lng: "",
  };
}

function normalizeLookup(value) {
  return String(value || "").trim().toLowerCase();
}

function resolveStopPlace(stop) {
  if (!stop) return null;
  const placeId = stop.placeId || stop.id || "";
  if (placeId) {
    const byId = state.catalogs.places.find((place) => place.id === placeId);
    if (byId) return byId;
  }

  const title = normalizeLookup(stop.title || stop.name);
  if (!title) return null;
  return state.catalogs.places.find((place) => normalizeLookup(place.name) === title) || null;
}

function mapPointForStop(stop) {
  const directUrl = buildGoogleMapsLocationUrl({
    lat: stop.lat,
    lng: stop.lng,
    label: stop.area || stop.title,
  });
  if (directUrl) {
    return {
      lat: stop.lat,
      lng: stop.lng,
      area: stop.area,
      url: directUrl,
    };
  }

  const place = resolveStopPlace(stop);
  const placeUrl = buildGoogleMapsLocationUrl({
    lat: place?.lat,
    lng: place?.lng,
    label: place?.area || place?.name,
  });
  if (!placeUrl) return null;

  return {
    lat: place.lat,
    lng: place.lng,
    area: place.area || stop.area,
    url: placeUrl,
  };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderStopMapAction(stop) {
  const point = mapPointForStop(stop);
  if (!point) return `<span class="day-stop-map-unavailable">${t("dayStopMapUnavailable")}</span>`;
  return `
    <a class="text-button day-stop-map-link" href="${escapeHtml(point.url)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(`${t("mapsViewStopA11y")}: ${point.area || stop.title}. ${t("mapsOpensExternal")}`)}">
      ${t("mapsViewInMaps")} →
    </a>
  `;
}

function routeUrlForPlan(plan) {
  const points = plan.map((stop) => mapPointForStop(stop)).filter(Boolean);
  if (points.length < 2) return null;

  const origin = points[0];
  const destination = points[points.length - 1];
  return buildGoogleMapsDirectionsUrl({
    originLat: origin.lat,
    originLng: origin.lng,
    destinationLat: destination.lat,
    destinationLng: destination.lng,
    waypoints: points.slice(1, -1),
    travelMode: "walking",
  });
}

function preferenceScore(place, type) {
  const normalizedType = categoryAlias(type);
  const budgetLimit = budgetNumber(state.dayBudget);
  const estimatedBudget = placeBudgetScore(place);
  let score = 0;

  if (place.category === normalizedType) score += 48;
  if (place.area === state.dayArea) score += state.dayPreference === "Less walking" ? 42 : 24;
  if (!estimatedBudget || estimatedBudget <= budgetLimit) score += 18;
  if (state.dayPreference === "Indoor first" && indoorCategories.includes(place.category)) score += 24;
  if (state.dayPreference === "Less walking" && place.area === state.dayArea) score += 24;
  if (state.dayPreference === "Calm and slow" && calmCategories.includes(place.category)) score += 18;
  if (state.dayPreference === "Calm and slow") score += Math.round((place.solo || 80) / 12);
  if (state.dayPreference === "Try something new" && exploratoryCategories.includes(place.category)) score += 20;

  return score;
}

function rankedPlaces(type, usedIds = []) {
  const normalizedType = categoryAlias(type);
  return [...state.catalogs.places]
    .filter((place) => !usedIds.includes(place.id))
    .filter((place) => {
      const sameType = place.category === normalizedType;
      const preferenceMatch =
        (state.dayPreference === "Indoor first" && indoorCategories.includes(place.category)) ||
        (state.dayPreference === "Less walking" && place.area === state.dayArea) ||
        (state.dayPreference === "Calm and slow" && calmCategories.includes(place.category)) ||
        (state.dayPreference === "Try something new" && exploratoryCategories.includes(place.category));
      return sameType || preferenceMatch;
    })
    .sort((a, b) => preferenceScore(b, normalizedType) - preferenceScore(a, normalizedType));
}

function dayTypeSequence() {
  const suggestion = getDaySuggestion();
  const ruleTypes = dayRules[state.dayMood] || [];
  const suggestionTypes = suggestion.includes || [];
  const preferenceTypes = {
    "Indoor first": indoorCategories,
    "Less walking": ruleTypes,
    "Calm and slow": calmCategories,
    "Try something new": exploratoryCategories,
  }[state.dayPreference] || ruleTypes;

  return [...new Set([...suggestionTypes, ...ruleTypes, ...preferenceTypes])];
}

export function reflowDayPlan(plan = getDayPlan()) {
  const start = state.dayStartTime || plan[0]?.time || "11:00";
  const interval = durationIntervals[normalizeDuration(state.dayTime)] || 105;
  const first = toMinutes(start);
  return plan.map((stop, index) => ({
    ...normalizeStop(stop),
    time: fromMinutes(first + index * interval),
  }));
}

export function normalizeSuggestionPlan(suggestion) {
  return suggestion.stops.map((stop) => normalizeStop(stop));
}

export function buildDayStops() {
  const base = [...(dayRules[state.dayMood] || [])];
  const rotated = [...base.slice(1), base[0]].filter(Boolean);
  const selected = state.dayBudget === "1000 yen" ? base : state.dayBudget === "5000 yen" ? rotated : base;
  return selected.map((type, index) => fallbackStop(type, index));
}

export function generateAdjustedDayPlan() {
  const count = durationStopCounts[normalizeDuration(state.dayTime)] || 3;
  const types = dayTypeSequence();
  const usedIds = [];
  const stops = [];

  for (let index = 0; index < count; index += 1) {
    const type = types[index % types.length] || "Cafe";
    const place = rankedPlaces(type, usedIds)[0];
    if (place) {
      usedIds.push(place.id);
      stops.push(placeToStop(place, type, index));
    } else {
      stops.push(fallbackStop(type, index));
    }
  }

  return reflowDayPlan(stops);
}

export function createAdditionalDayStop(plan = getDayPlan()) {
  const usedIds = plan.map((stop) => stop.placeId).filter(Boolean);
  const types = dayTypeSequence();
  const type = types[plan.length % types.length] || "Cafe";
  const place = rankedPlaces(type, usedIds)[0];
  return place ? placeToStop(place, type, plan.length) : fallbackStop(type, plan.length);
}

export function replacementOptions(stop, index = 0) {
  const plan = getDayPlan();
  const usedIds = plan
    .filter((_, stopIndex) => stopIndex !== index)
    .map((item) => item.placeId)
    .filter(Boolean);
  return rankedPlaces(stop.type, usedIds).slice(0, 3);
}

export function getDaySuggestion(id = state.selectedDaySuggestion) {
  return daySuggestions.find((suggestion) => suggestion.id === id) || daySuggestions[0];
}

export function getDayPlan() {
  if (state.dayPlan.length) return state.dayPlan.map((stop) => normalizeStop(stop));
  return normalizeSuggestionPlan(getDaySuggestion());
}

export function nextPlanTime(index) {
  const interval = durationIntervals[normalizeDuration(state.dayTime)] || 105;
  return fromMinutes(toMinutes(state.dayStartTime || "11:00") + index * interval);
}

export function createCurrentDayPlan(suggestion = getDaySuggestion()) {
  const planStops = getDayPlan();
  const stopDetails = planStops.map((stop, index) => ({
    stop_order: index + 1,
    time: stop.time,
    title: stop.title,
    type: stop.type,
    category: stop.type,
    area: stop.area,
    placeId: stop.placeId || "",
    description: stop.description || "",
    lat: stop.lat || "",
    lng: stop.lng || "",
  }));

  return ensureDayPlanIdentity({
    title: suggestion.title,
    sourceSuggestionId: suggestion.id,
    mood: state.dayMood,
    area: state.dayArea,
    duration: state.dayTime,
    budget: state.dayBudget,
    preference: state.dayPreference,
    startTime: state.dayStartTime,
    includes: [...new Set(planStops.map((stop) => stop.type))],
    stops: planStops.map((stop) => `${stop.time} ${stop.title}`),
    stopDetails,
    savedAt: new Date().toISOString(),
  });
}

export function createDraftDayPlan() {
  const planStops = getDayPlan();
  const stopDetails = planStops.map((stop, index) => ({
    stop_order: index + 1,
    time: stop.time,
    title: stop.title,
    type: stop.type,
    category: stop.type,
    area: stop.area,
    placeId: stop.placeId || "",
    description: stop.description || "",
    lat: stop.lat || "",
    lng: stop.lng || "",
  }));

  return ensureDayPlanIdentity({
    title: state.currentDayDraft?.title || t("dayDefaultDraftTitle"),
    sourceSuggestionId: "current-draft",
    mood: state.dayMood,
    area: state.currentDayDraft?.area || state.dayArea,
    duration: state.currentDayDraft?.duration || state.dayTime,
    budget: state.currentDayDraft?.budget || state.dayBudget,
    preference: state.currentDayDraft?.preference || state.dayPreference,
    startTime: state.currentDayDraft?.startTime || state.dayStartTime,
    includes: [...new Set(planStops.map((stop) => stop.type))],
    stops: planStops.map((stop) => `${stop.time} ${stop.title}`),
    stopDetails,
    savedAt: new Date().toISOString(),
  });
}

export function createDayPlanApiPayload(plan) {
  const stopDetails = Array.isArray(plan.stopDetails) ? plan.stopDetails : [];
  return {
    title: plan.title,
    mood: plan.mood,
    duration: plan.duration,
    budget_yen: budgetNumber(plan.budget),
    area: plan.area,
    notes: plan.preference ? `Preference: ${plan.preference}` : "",
    stops: stopDetails.map((stop, index) => ({
      stop_order: stop.stop_order || index + 1,
      start_time: `${stop.time || String(plan.stops?.[index] || "").slice(0, 5) || "11:00"}:00`,
      title: stop.title || "Stop",
      category: stop.category || stop.type || "",
      area: stop.area || plan.area,
      place_id: stop.placeId !== "" && Number.isInteger(Number(stop.placeId)) ? Number(stop.placeId) : "",
      note: stop.description || "",
    })),
  };
}

function suggestionCard(suggestion) {
  return `
    <button class="surface her-day-suggestion-card" type="button" data-day-suggestion="${suggestion.id}">
      <div>
        <p class="eyebrow">${suggestion.mood} · ${suggestion.area}</p>
        <h3>${suggestion.title}</h3>
        <p>${suggestion.description}</p>
      </div>
      <div class="suggestion-meta">
        <span class="pill">${displayDuration(suggestion.duration)}</span>
        <span class="pill">${suggestion.budget}</span>
      </div>
      <div class="suggestion-includes" aria-label="${t("dayIncludedPlaceTypes")}">
        ${suggestion.includes.map((type) => `<span>${type}</span>`).join("")}
      </div>
      <strong class="suggestion-card-action">${t("dayViewPlan")} →</strong>
    </button>
  `;
}

function renderSuggestionList() {
  return `
    <section class="day-suggestions-section">
      <div class="section-head places-subhead">
        <div>
          <p class="eyebrow">${t("dayTodaysSuggestions")}</p>
          <h3>${t("daySuggestionsHeading")}</h3>
        </div>
        <button class="soft-button" type="button" data-create-my-day>${t("dayCreateMyDay")}</button>
      </div>
      <div class="her-day-suggestion-grid">
        ${daySuggestions.map(suggestionCard).join("")}
      </div>
    </section>
  `;
}

function renderAdjustPanel() {
  if (!state.dayAdjustOpen) return "";

  return `
    <section class="day-adjust-panel" aria-label="${t("dayAdjustThisDay")}">
      <div class="day-adjust-header">
        <div>
          <p class="eyebrow">${t("dayAdjustThisDay")}</p>
          <h3>${t("dayAdjustHeading")}</h3>
        </div>
        <button class="text-button" type="button" data-toggle-day-adjust>${t("dayClose")}</button>
      </div>
      <div class="day-adjust-grid">
        <div class="field day-start-field">
          <label for="dayStartTime">${t("dayStartTime")}</label>
          <input id="dayStartTime" type="time" value="${state.dayStartTime}" data-day-start-time />
        </div>
        <fieldset class="day-adjust-group">
          <legend>${t("dayDuration")}</legend>
          <div class="choice-grid">
            ${dayDurationOptions.map((option) => choiceChip(t(option.labelKey), normalizeDuration(state.dayTime) === option.value, `data-adjust-day-time="${option.value}"`)).join("")}
          </div>
        </fieldset>
        <fieldset class="day-adjust-group">
          <legend>${t("dayBudget")}</legend>
          <div class="choice-grid">
            ${budgets.map((budget) => choiceChip(budget, state.dayBudget === budget, `data-adjust-day-budget="${budget}"`)).join("")}
          </div>
        </fieldset>
        <fieldset class="day-adjust-group">
          <legend>${t("dayArea")}</legend>
          <div class="choice-grid">
            ${areas.map((area) => choiceChip(area, state.dayArea === area, `data-adjust-day-area="${area}"`)).join("")}
          </div>
        </fieldset>
        <fieldset class="day-adjust-group wide">
          <legend>${t("dayPreference")}</legend>
          <div class="choice-grid">
            ${dayPreferences.map((preference) => choiceChip(displayPreference(preference), state.dayPreference === preference, `data-adjust-day-preference="${preference}"`)).join("")}
          </div>
        </fieldset>
      </div>
      <button class="button" type="button" data-apply-day-adjust>${t("dayApplyChanges")}</button>
    </section>
  `;
}

function renderStopActions(stop, index, planLength) {
  const replacements = replacementOptions(stop, index);
  return `
    <div class="day-stop-actions">
      <details class="replace-picker">
        <summary>${t("dayReplace")}</summary>
        <div class="replace-options">
          ${
            replacements.length
              ? replacements
                .map(
                  (place) => `
                    <button class="replace-option" type="button" data-replace-stop="${index}" data-replace-place="${place.id}">
                      <strong>${place.name}</strong>
                      <span>${place.category} · ${place.area}</span>
                    </button>
                  `
                )
                .join("")
              : `<span class="section-copy">${t("dayNoReplacement")}</span>`
          }
        </div>
      </details>
      <details class="day-more-actions">
        <summary>${t("dayMoreActions")}</summary>
        <div class="day-more-menu">
          <button type="button" data-day-move-up="${index}" ${index === 0 ? `disabled title="${t("dayActionUnavailable")}"` : ""}>${t("dayMoveUp")}</button>
          <button type="button" data-day-move-down="${index}" ${index === planLength - 1 ? `disabled title="${t("dayActionUnavailable")}"` : ""}>${t("dayMoveDown")}</button>
          <button class="is-destructive-text" type="button" data-day-remove-stop="${index}" ${planLength <= 1 ? `disabled title="${t("dayActionUnavailable")}"` : ""}>${t("dayRemove")}</button>
          ${planLength <= 1 ? `<span class="day-action-note">${t("dayOneStopActionNote")}</span>` : ""}
        </div>
      </details>
    </div>
  `;
}

function renderOpenRouteAction(routeUrl) {
  if (!routeUrl) return "";
  return `
    <a class="soft-button route-map-link" href="${escapeHtml(routeUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(`${t("mapsOpenRouteA11y")}. ${t("mapsOpensExternal")}`)}">
      ${t("mapsOpenRouteInMaps")}
    </a>
  `;
}

function renderRouteOverview(plan, routeUrl) {
  const mappedCount = plan.map((stop) => mapPointForStop(stop)).filter(Boolean).length;
  const routeMessage = !routeUrl
    ? `<p class="route-overview-message">${mappedCount < 2 ? t("dayAddMappedStopForRoute") : t("dayNoRouteAvailable")}</p>`
    : "";

  return `
    <aside class="surface route-overview" aria-label="${t("dayRouteOverview")}">
      <p class="eyebrow">${t("dayRouteOverview")}</p>
      <h3>${t("dayRouteOverviewHeading")}</h3>
      ${
        plan.length
          ? `
            <ol class="route-summary-list">
              ${plan.map((stop) => `
                <li>
                  <time>${escapeHtml(stop.time)}</time>
                  <span>${escapeHtml(stop.title)}</span>
                </li>
              `).join("")}
            </ol>
          `
          : `<p class="route-overview-message">${t("dayNoRouteAvailable")}</p>`
      }
      ${routeMessage}
    </aside>
  `;
}

function renderSuggestionDetail(suggestion) {
  const plan = getDayPlan();
  const includedTypes = [...new Set(plan.map((stop) => stop.type))];
  const routeUrl = routeUrlForPlan(plan);
  const currentPlan = createCurrentDayPlan(suggestion);
  const isSaved = hasSavedDayPlan(state.savedDays, currentPlan);

  return `
    <section class="day-detail-layout">
      <div class="surface">
        <div class="detail-heading">
          <p class="eyebrow">${state.dayMood} · ${state.dayArea}</p>
          <h2>${suggestion.title}</h2>
          <p class="section-copy">${suggestion.description}</p>
          <div class="suggestion-meta">
            <span class="pill">${displayDuration(state.dayTime)}</span>
            <span class="pill">${state.dayBudget}</span>
            <span class="pill">${displayPreference(state.dayPreference)}</span>
            ${includedTypes.map((type) => `<span class="tag">${type}</span>`).join("")}
          </div>
        </div>

        <div class="section-head places-subhead">
          <div>
            <p class="eyebrow">${t("dayTodaysPlan")}</p>
            <h3>${tf("dayGentleStopsInOrder", { count: plan.length })}</h3>
          </div>
        </div>

        <div class="timeline">
          ${plan
            .map(
              (stop, index) => `
                <article class="timeline-card her-day-stop">
                  <time>${stop.time}</time>
                  <div>
                    <strong>${stop.title}</strong>
                    <span>${stop.type} · ${stop.area}</span>
                    <p>${stop.description}</p>
                    ${renderStopMapAction(stop)}
                  </div>
                  ${renderStopActions(stop, index, plan.length)}
                </article>
              `
            )
            .join("")}
        </div>

        <div class="day-stop-footer">
          <button class="soft-button" type="button" data-add-day-stop>${t("dayAddStop")}</button>
        </div>

        ${renderAdjustPanel()}

        <div class="day-detail-actions">
          <button class="button ${isSaved ? "is-saved" : ""}" type="button" data-save-day-suggestion="${suggestion.id}" ${isSaved ? "disabled aria-disabled=\"true\"" : ""}>${isSaved ? t("daySaved") : t("daySaveToMyDays")}</button>
          ${renderOpenRouteAction(routeUrl)}
          <button class="soft-button" type="button" data-toggle-day-adjust>${t("dayAdjustThisDay")}</button>
          <button class="text-button" type="button" data-day-back>${t("dayBackToSuggestions")}</button>
        </div>
      </div>

      ${renderRouteOverview(plan, routeUrl)}
    </section>
  `;
}

function renderCurrentDraft() {
  const draft = state.currentDayDraft;
  if (!draft) return "";

  const plan = getDayPlan();
  const includedTypes = [...new Set(plan.map((stop) => stop.type))];
  const routeUrl = routeUrlForPlan(plan);

  return `
    <section class="day-detail-layout current-day-draft">
      <div class="surface">
        <div class="detail-heading">
          <p class="eyebrow">${t("dayCurrentDraft")}</p>
          <h2>${draft.title || t("dayDefaultDraftTitle")}</h2>
          <p class="section-copy">${t("dayCurrentDraftCopy")}</p>
          <div class="suggestion-meta">
            <span class="pill">${displayDuration(state.dayTime)}</span>
            <span class="pill">${state.dayBudget}</span>
            <span class="pill">${state.dayArea}</span>
            <span class="pill">${displayPreference(state.dayPreference)}</span>
            ${includedTypes.map((type) => `<span class="tag">${type}</span>`).join("")}
          </div>
        </div>

        <div class="section-head places-subhead">
          <div>
            <p class="eyebrow">${t("dayCurrentStops")}</p>
            <h3>${tf("dayStopsInDraft", { count: plan.length })}</h3>
          </div>
        </div>

        <div class="timeline">
          ${plan
            .map(
              (stop, index) => `
                <article class="timeline-card her-day-stop">
                  <time>${stop.time}</time>
                  <div>
                    <strong>${stop.title}</strong>
                    <span>${stop.type} · ${stop.area}</span>
                    <p>${stop.description}</p>
                    ${renderStopMapAction(stop)}
                  </div>
                  ${renderStopActions(stop, index, plan.length)}
                </article>
              `
            )
            .join("")}
        </div>

        <div class="day-stop-footer">
          <button class="soft-button" type="button" data-add-day-stop>${t("dayAddStop")}</button>
        </div>

        ${renderAdjustPanel()}

        <div class="day-detail-actions">
          <button class="button" type="button" data-save-current-day-draft>${t("daySaveToMyDays")}</button>
          ${renderOpenRouteAction(routeUrl)}
          <button class="soft-button" type="button" data-toggle-day-adjust>${t("dayAdjustThisDay")}</button>
          <button class="text-button is-destructive-text" type="button" data-request-discard-day-draft>${t("dayDiscardDraft")}</button>
        </div>
        ${
          state.pendingDiscardDayDraft
            ? `
              <div class="delete-confirm">
                <span>${t("dayDiscardConfirm")}</span>
                <button class="soft-button" type="button" data-confirm-discard-day-draft>${t("dayConfirm")}</button>
                <button class="text-button" type="button" data-cancel-discard-day-draft>${t("dayCancel")}</button>
              </div>
            `
            : ""
        }
      </div>

      ${renderRouteOverview(plan, routeUrl)}
    </section>
  `;
}

export function renderDay() {
  const selectedSuggestion = state.selectedDaySuggestion ? getDaySuggestion() : null;

  return pageShell(`
    <div class="day-head-product">
      <div>
        <p class="eyebrow">${t("dayTitle")}</p>
        <h1 class="section-title">${t("dayTitle")}</h1>
        <p class="section-copy">${t("daySubtitle")}</p>
      </div>
      <img src="images/herday.png" alt="" />
    </div>
    ${state.currentDayDraft ? renderCurrentDraft() : selectedSuggestion ? renderSuggestionDetail(selectedSuggestion) : renderSuggestionList()}
  `, "day-page");
}
