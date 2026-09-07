import { state, PICTURE_ROOT } from '../state.js';
import { categoryMap, placeCategories, placeExperienceFilters } from '../data.js';
import { labelFor, t, tf } from '../i18n.js';
import { pageShell } from '../components/layout.js';
import { filterChip } from '../components/cards.js';
import { buildGoogleMapsLocationUrl } from '../utils/maps.js';

let mapView = 'map';
let mapZoom = 1;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function asArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return [value];
}

const areaLabelKeys = {
  Kichijoji: "placesAreaKichijoji",
  Shinjuku: "placesAreaShinjuku",
  Shimokitazawa: "placesAreaShimokitazawa",
  Ueno: "placesAreaUeno",
  Tokyo: "placesAreaTokyoOverview",
};

const areaClassNames = {
  Kichijoji: "area-kichijoji",
  Shinjuku: "area-shinjuku",
  Shimokitazawa: "area-shimokitazawa",
  Ueno: "area-ueno",
  Tokyo: "area-tokyo-overview",
};

const stationKeys = {
  Kichijoji: "placeStationKichijoji",
  Shinjuku: "placeStationShinjuku",
  Shimokitazawa: "placeStationShimokitazawa",
  Ueno: "placeStationUeno",
};

const categoryIconPaths = {
  Cafe: `
    <path d="M5 9h10v4.6A4.4 4.4 0 0 1 10.6 18H9.4A4.4 4.4 0 0 1 5 13.6V9Z" />
    <path d="M15 10h2.1a2.5 2.5 0 0 1 0 5H15" />
    <path d="M4 20h13" />
    <path d="M8 6.2c-.8-1 .8-1.7 0-2.8M11 6.2c-.8-1 .8-1.7 0-2.8" />
  `,
  Bookstore: `
    <path d="M4.5 5.7A2.7 2.7 0 0 1 7.2 3H12v16H7.2a2.7 2.7 0 0 0-2.7 2.7V5.7Z" />
    <path d="M19.5 5.7A2.7 2.7 0 0 0 16.8 3H12v16h4.8a2.7 2.7 0 0 1 2.7 2.7V5.7Z" />
    <path d="M15.5 6.5h2" />
  `,
  Restaurant: `
    <ellipse cx="12" cy="14.5" rx="7.5" ry="3.5" />
    <path d="M4.5 14.5c.6 3.5 3.2 5.2 7.5 5.2s6.9-1.7 7.5-5.2" />
    <path d="M5 9.5h14M7.5 7.1h9" />
  `,
  "Flower Shop": `
    <path d="M12 11v9M8.7 20h6.6" />
    <path d="M12 11c-3.8 0-5.5-2.2-4.1-4.2 1.2-1.7 3.6-.9 4.1 1.7.5-2.6 2.9-3.4 4.1-1.7 1.4 2-.3 4.2-4.1 4.2Z" />
    <path d="M12 11c0-3.1 2.2-4.9 4.2-3.6 1.8 1.2 1.1 3.7-1.4 4.5 2.5-.8 4.2 1.2 3.1 3-1 1.7-3.6 1.4-4.8-.9" />
    <path d="M12 15c-1.1-2.3-3.8-2.6-4.8-.9-1.1 1.8.6 3.8 3.1 3" />
  `,
  Park: `
    <path d="M12 4v16M8.5 20h7" />
    <path d="M12 5.5c-2.8-2.3-6.2-.4-5.5 2.5-2.8.4-3.2 4.1-.9 5.2-1.2 2.7 2.2 4.9 4.5 3.1 1.9 2.4 5.4.8 4.8-1.9 2.6-.9 2.1-4.7-.6-5.1.7-2.9-2.2-4.8-4.3-3.8Z" />
  `,
  Museum: `
    <path d="M3.5 9.5h17M5.5 9.5v9M9 9.5v9M15 9.5v9M18.5 9.5v9M3.5 18.5h17" />
    <path d="m4 7 8-4 8 4v2H4V7Z" />
  `,
  Activity: `
    <path d="m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3Z" />
    <path d="M19 17v4M17 19h4" />
  `,
  Gym: `
    <path d="M4 10v4M7 8v8M17 8v8M20 10v4M7 12h10" />
    <path d="M3 10h2v4H3zM19 10h2v4h-2z" />
  `,
};

function categoryIconMarkup(category, className = "") {
  const path = categoryIconPaths[category] || categoryIconPaths.Activity;
  return `<svg class="category-icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}

function placeImageSrc(place) {
  return place?.image ? `${PICTURE_ROOT}${place.image}` : "";
}

function placeVisualMarkup(place, className, fallbackClass = "") {
  const imageSrc = placeImageSrc(place);
  if (imageSrc) {
    return `<img class="${className}" src="${escapeHtml(imageSrc)}" alt="" />`;
  }

  return `
    <div class="${className} place-visual-fallback ${fallbackClass}" aria-hidden="true">
      ${categoryIconMarkup(place?.category, "place-fallback-icon")}
    </div>
  `;
}

function placeTags(place) {
  return [...asArray(place.experienceTags), ...asArray(place.practicalTags)];
}

function mapUrlForPlace(place) {
  if (!place) return null;
  return buildGoogleMapsLocationUrl({
    lat: place.lat,
    lng: place.lng,
    label: place.area || place.name,
  });
}

function primaryTags(place) {
  return placeTags(place).slice(0, 3);
}

function areaLabel(area) {
  return t(areaLabelKeys[area] || "placesAreaTokyoOverview");
}

function areaClass(area) {
  return areaClassNames[area] || areaClassNames.Tokyo;
}

function stationLabel(place) {
  const key = stationKeys[place?.area];
  return key ? t(key) : place?.distanceFrom || place?.area || "";
}

function distanceLabel(place) {
  if (!place?.distance) return "";
  const point = stationLabel(place);
  return point ? tf("placesDistanceFrom", { distance: place.distance, point }) : place.distance;
}

function placeMeta(place, options = {}) {
  const includeDistance = options.includeDistance !== false;
  return [
    place.category,
    place.area,
    includeDistance ? distanceLabel(place) : "",
  ].filter(Boolean).join(" · ");
}

function searchText(place) {
  return [
    place.name,
    place.category,
    place.area,
    place.description,
    ...asArray(place.experienceTags),
    ...asArray(place.practicalTags),
  ].join(" ");
}

function matchesExperience(place, activeExperiences) {
  if (!activeExperiences.length) return true;
  const tags = placeTags(place).map(normalize);
  return activeExperiences.every((filter) => tags.includes(normalize(filter)));
}

function tagMarkup(tags) {
  return tags.length
    ? `<div class="tag-row">${tags.map((tag) => `<span class="tag">${escapeHtml(labelFor(tag))}</span>`).join("")}</div>`
    : "";
}

function experienceFilterMarkup(activeExperiences) {
  const defaultCount = 5;
  const primaryFilters = placeExperienceFilters.slice(0, defaultCount);
  const overflowFilters = placeExperienceFilters.slice(defaultCount);
  const overflowHasSelection = overflowFilters.some((filter) => activeExperiences.includes(filter));

  return `
    <div class="filter-list horizontal places-experience-list">
      ${primaryFilters
        .map((filter) => filterChip(labelFor(filter), activeExperiences.includes(filter), `data-place-experience="${escapeHtml(filter)}"`))
        .join("")}
      ${
        overflowFilters.length
          ? `
            <details class="places-more-filters"${overflowHasSelection ? " open" : ""}>
              <summary>
                <span>${t("placesMoreFilters")}</span>
                <span>${overflowFilters.length}</span>
              </summary>
              <div class="places-more-filter-list">
                ${overflowFilters
                  .map((filter) => filterChip(labelFor(filter), activeExperiences.includes(filter), `data-place-experience="${escapeHtml(filter)}"`))
                  .join("")}
              </div>
            </details>
          `
          : ""
      }
    </div>
  `;
}

function reasonMarkup(place) {
  const reasons = asArray(place.whyRecommended || place.reason);
  return reasons.length
    ? `
      <ul class="place-reason-list">
        ${reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}
      </ul>
    `
    : `<p>${escapeHtml(place.reason || t("placesFallbackReason"))}</p>`;
}

function emptyMessage(rawQuery, hasSearch, hasCategoryLimit, activeExperiences) {
  const experience = activeExperiences.map(labelFor).join(", ");
  const category = labelFor(state.selectedPlaceCategory);
  if (hasSearch) return tf("placesNoSearchResults", { query: rawQuery });
  if (hasCategoryLimit && activeExperiences.length) {
    return tf("placesNoCategoryExperienceResults", { experience, category });
  }
  if (hasCategoryLimit) return tf("placesNoCategoryResults", { category });
  if (activeExperiences.length) return tf("placesNoExperienceResults", { experience });
  return t("placesNoPlaces");
}

function placeCard(place, selected) {
  const selectedClass = selected ? " is-selected" : "";
  return `
    <button class="mini-card place-pick places-mvp-card${selectedClass}" type="button" data-place="${escapeHtml(place.id)}">
      ${placeVisualMarkup(place, "mini-thumb image-thumb", "place-card-visual")}
      <div class="places-card-copy">
        <strong>${escapeHtml(place.name)}</strong>
        <p>${escapeHtml(placeMeta(place))}</p>
        <span>${escapeHtml(place.description || place.reason || "")}</span>
        ${tagMarkup(primaryTags(place))}
      </div>
      <span class="card-arrow">→</span>
    </button>
  `;
}

function clampPercent(value, fallback, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function fallbackMapPosition(place) {
  const seed = String(place?.id || place?.name || "place");
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (Math.imul(31, hash) + seed.charCodeAt(index)) | 0;
  }
  const positive = Math.abs(hash);
  return {
    x: 24 + (positive % 44),
    y: 30 + ((positive >> 4) % 34),
  };
}

function mapPosition(place) {
  const fallback = fallbackMapPosition(place);
  return {
    x: clampPercent(place?.mapPosition?.x, fallback.x, 18, 82),
    y: clampPercent(place?.mapPosition?.y, fallback.y, 24, 78),
  };
}

function pinStyle(place) {
  const position = mapPosition(place);
  return `--pin-x: ${position.x}%; --pin-y: ${position.y}%;`;
}

function activeMapArea(visiblePlaces, selected) {
  return selected?.area || visiblePlaces[0]?.area || "Tokyo";
}

function mapBadges(area) {
  return `
    <div class="map-badge-stack">
      <span class="prototype-badge">${t("mapsPrototypeMap")}</span>
      <span class="area-badge">${escapeHtml(areaLabel(area))}</span>
    </div>
  `;
}

function mapPanel(visiblePlaces, selected) {
  const activeArea = activeMapArea(visiblePlaces, selected);
  const mapPlaces = activeArea === "Tokyo"
    ? []
    : visiblePlaces.filter((place) => place.area === activeArea);

  if (!visiblePlaces.length) {
    return `
      <div class="places-map-shell">
        <section class="map-panel product-map places-prototype-map ${areaClass(activeArea)}" aria-label="${escapeHtml(`${t("mapsPrototypeMap")} ${areaLabel(activeArea)}`)}">
          <img class="map-art" src="${PICTURE_ROOT}places-map-background.png" alt="" />
          ${mapBadges(activeArea)}
          <p class="map-disclosure">${t("mapsIllustrativeDisclosure")}</p>
        </section>
        <article class="map-place-popover places-empty-popover">
          <div>
            <h3>${t("mapsUnavailable")}</h3>
            <p>${t("placesMapEmptyCopy")}</p>
          </div>
        </article>
      </div>
    `;
  }

  const selectedMapsUrl = mapUrlForPlace(selected);

  return `
    <div class="places-map-shell">
      <section class="map-panel product-map places-prototype-map ${areaClass(activeArea)}" aria-label="${escapeHtml(`${t("mapsPrototypeMap")} ${areaLabel(activeArea)}`)}">
        <div class="places-map-scene" style="--map-zoom: ${mapZoom}">
          <img class="map-art" src="${PICTURE_ROOT}places-map-background.png" alt="" />
          <div class="places-map-markers">
            ${mapPlaces.map((place) => `
              <button class="map-pin place-pin ${selected && place.id === selected.id ? "is-selected" : ""}" type="button" data-place="${escapeHtml(place.id)}" style="${escapeHtml(pinStyle(place))}" aria-pressed="${Boolean(selected && place.id === selected.id)}" aria-label="${escapeHtml(`${place.name}, ${areaLabel(place.area)}`)}" title="${escapeHtml(place.name)}">
                ${placeVisualMarkup(place, "map-pin-art")}
              </button>
            `).join("")}
          </div>
        </div>
        ${mapBadges(activeArea)}
        <div class="places-map-controls">
          ${mapControl('reset', 'rotate-ccw', 'placesMapReset')}
          ${mapControl('in', 'plus', 'placesMapZoomIn')}
          ${mapControl('out', 'minus', 'placesMapZoomOut')}
        </div>
        <p class="map-disclosure">${t("mapsIllustrativeDisclosure")}</p>
      </section>
      ${
        selected
          ? `
            <article class="map-place-popover places-map-card">
              ${placeVisualMarkup(selected, "popover-place-image", "popover-place-visual")}
              <div>
                <h3>${escapeHtml(selected.name)}</h3>
                <p>${escapeHtml(placeMeta(selected, { includeDistance: false }))}</p>
                ${tagMarkup(primaryTags(selected).slice(0, 2))}
              </div>
              ${
                selectedMapsUrl
                  ? `<a class="text-button map-popover-link" href="${escapeHtml(selectedMapsUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(`${t("mapsOpenAreaA11y")}: ${selected.area}. ${t("mapsOpensExternal")}`)}">${t("mapsViewInMaps")} →</a>`
                  : ""
              }
            </article>
          `
          : ""
      }
    </div>
  `;
}

function mapControl(action, icon, labelKey) {
  return `<button type="button" data-map-zoom="${action}" title="${t(labelKey)}" aria-label="${t(labelKey)}"${(action === 'in' && mapZoom >= 1.4) || (action === 'out' && mapZoom <= 1) ? ' disabled' : ''}><img src="${PICTURE_ROOT}map-control-${icon}.svg" alt="" /></button>`;
}

function mapToolbar() {
  return `
    <div class="places-map-toolbar">
      <div class="places-view-switch" role="group" aria-label="${t('placesMapViewLabel')}">
        <button type="button" data-places-view="map" aria-pressed="${mapView === 'map'}">${t('placesMapView')}</button>
        <button type="button" data-places-view="list" aria-pressed="${mapView === 'list'}">${t('placesListView')}</button>
      </div>
      <form class="search-bar places-search" data-place-search-form>
        <input type="search" name="placeSearch" value="${escapeHtml(state.placeSearch)}" placeholder="${t('placesSearchPlaceholder')}" aria-label="${t('placesSearchA11y')}" />
        <button type="submit" aria-label="${t('placesSearchA11y')}" title="${t('placesSearchA11y')}"><img src="${PICTURE_ROOT}map-control-search.svg" alt="" /></button>
      </form>
    </div>
  `;
}

// Presentation-only controls retain the existing catalog, filter and selection state.
export function bindPlacesMapEvents(root) {
  root.querySelectorAll('[data-places-view]').forEach((button) => {
    button.addEventListener('click', () => {
      mapView = button.dataset.placesView;
      root.querySelector('.places-explorer').dataset.view = mapView;
      root.querySelectorAll('[data-places-view]').forEach((option) => {
        option.setAttribute('aria-pressed', String(option.dataset.placesView === mapView));
      });
    });
  });
  root.querySelectorAll('[data-map-zoom]').forEach((button) => {
    button.addEventListener('click', () => {
      mapZoom = button.dataset.mapZoom === 'reset' ? 1 : Math.min(1.4, Math.max(1, Number((mapZoom + (button.dataset.mapZoom === 'in' ? 0.2 : -0.2)).toFixed(1))));
      root.querySelector('.places-map-scene')?.style.setProperty('--map-zoom', mapZoom);
      root.querySelectorAll('[data-map-zoom]').forEach((control) => {
        control.disabled = (control.dataset.mapZoom === 'in' && mapZoom >= 1.4) || (control.dataset.mapZoom === 'out' && mapZoom <= 1);
      });
    });
  });
}

function detailPanel(selected) {
  if (!selected) {
    return `
      <article class="surface place-detail-panel places-empty-detail">
        <p class="eyebrow">${t("placesDetailEyebrow")}</p>
        <h2>${t("placesSelectPlaceTitle")}</h2>
        <p>${t("placesSelectPlaceCopy")}</p>
      </article>
    `;
  }

  const saved = state.savedPlaces.includes(selected.id);
  const draftStops = state.currentDayDraft?.stops || [];
  const addedToDraft = draftStops.some((stop) => stop.placeId === selected.id);
  const experienceTags = asArray(selected.experienceTags);
  const practicalTags = asArray(selected.practicalTags);
  const mapsUrl = mapUrlForPlace(selected);

  return `
    <article class="surface place-detail-panel places-detail-panel">
      <div class="places-detail-head">
        <div>
          <p class="eyebrow">${escapeHtml(placeMeta(selected))}</p>
          <h2>${escapeHtml(selected.name)}</h2>
          <p>${escapeHtml(selected.description || selected.reason || "")}</p>
        </div>
        ${placeVisualMarkup(selected, "places-detail-image", "places-detail-visual")}
      </div>
      <div class="places-detail-grid">
        <div>
          <strong>${t("placesOpeningHours")}</strong>
          <span>${escapeHtml(selected.openingHours || selected.hours || t("placesPrototypeHours"))}</span>
        </div>
        <div>
          <strong>${t("placesPriceRange")}</strong>
          <span>${escapeHtml(selected.priceRange || selected.budget || t("placesPrototypePrice"))}</span>
        </div>
      </div>
      <div class="places-detail-block places-experience-tags">
        <strong>${t("placesExperienceTags")}</strong>
        ${tagMarkup(experienceTags)}
      </div>
      <div class="places-detail-block places-practical-tags">
        <strong>${t("placesPracticalTags")}</strong>
        ${tagMarkup(practicalTags)}
      </div>
      <div class="places-detail-block">
        <strong>${t("placesWhyRecommended")}</strong>
        ${reasonMarkup(selected)}
      </div>
      ${
        selected.prototypeData
          ? `<p class="prototype-note">${t("mapsPrototypeDisclosure")}</p>`
          : ""
      }
      <div class="day-detail-actions places-detail-actions">
        ${
          mapsUrl
            ? `<a class="soft-button map-action-link" href="${escapeHtml(mapsUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(`${t("mapsOpenAreaA11y")}: ${selected.area}. ${t("mapsOpensExternal")}`)}">${t("mapsOpenAreaInMaps")}</a>`
            : `<button class="soft-button" type="button" disabled>${t("mapsUnavailable")}</button>`
        }
        ${
          saved
            ? `<button class="soft-button is-saved" type="button" disabled>${t("placesSaved")}</button>`
            : `<button class="soft-button" type="button" data-save-place="${escapeHtml(selected.id)}">${t("placesSavePlace")}</button>`
        }
        <button class="soft-button" type="button" data-open-safe-route-place="${escapeHtml(selected.id)}">${t("safetyCallOpenSafeRoute")}</button>
        ${
          addedToDraft
            ? `<button class="button is-saved" type="button" disabled>${t("placesAddedToDay")}</button>`
            : `<button class="button" type="button" data-add-place-day="${escapeHtml(selected.id)}">${t("placesAddToDay")}</button>`
        }
        <button class="text-button places-back-action" type="button" data-place-back>${t("placesBackToResults")}</button>
      </div>
    </article>
  `;
}

export function renderPlaces() {
  const places = state.catalogs.places;
  const activeExperiences = Array.isArray(state.selectedPlaceExperiences) ? state.selectedPlaceExperiences : [];
  const mappedCategory = categoryMap[state.selectedPlaceCategory] || state.selectedPlaceCategory;
  const rawQuery = state.placeSearch.trim();
  const query = normalize(rawQuery);
  const hasSearch = query.length > 0;
  const hasCategoryLimit = mappedCategory !== "All";
  const hasActiveFilters = hasCategoryLimit || activeExperiences.length > 0;

  const visiblePlaces = places.filter((place) => {
    const matchesCategory = !hasCategoryLimit || place.category === mappedCategory;
    const matchesSearch = !query || normalize(searchText(place)).includes(query);
    return matchesCategory && matchesSearch && matchesExperience(place, activeExperiences);
  });

  let selected = visiblePlaces.find((place) => place.id === state.selectedPlace) || null;
  if (!selected && visiblePlaces.length) {
    state.selectedPlace = visiblePlaces[0].id;
    selected = visiblePlaces[0];
  }
  if (!visiblePlaces.length) {
    selected = null;
  }

  const activeSummary = [
    hasCategoryLimit || activeExperiences.length ? { label: t("placesConditionCategory"), values: [labelFor(state.selectedPlaceCategory)] } : null,
    activeExperiences.length ? { label: t("placesConditionExperience"), values: activeExperiences.map(labelFor) } : null,
  ].filter(Boolean);
  const noResultMessage = emptyMessage(rawQuery, hasSearch, hasCategoryLimit, activeExperiences);

  return pageShell(`
    <div class="places-head-product">
      <div>
        <p class="eyebrow">${t("placesHeroEyebrow")}</p>
        <h1 class="section-title" lang="en">${t("placesTitle")}</h1>
        <p class="section-copy">${t("placesHeroCopy")}</p>
        <p class="product-hero-note">${t("placesHeroNote")}</p>
      </div>
      <img src="images/herplace.png" alt="" />
    </div>
    <div class="places-product places-mvp">
      <section class="surface places-filter-panel">
        <div class="places-filter-head">
          <div>
            <p class="eyebrow">${t("placesExperienceFilters")}</p>
            <h3>${t("placesExperiencePrompt")}</h3>
          </div>
          ${
            hasActiveFilters
              ? `<button class="text-button" type="button" data-clear-place-filters>${t("placesClearFilters")}</button>`
              : ""
          }
        </div>
        ${experienceFilterMarkup(activeExperiences)}
        <div class="places-filter-group">
          <p class="eyebrow">${t("placesCategoryFilters")}</p>
          <div class="filter-list horizontal">
            ${placeCategories
              .map((category) => filterChip(labelFor(category), category === state.selectedPlaceCategory, `data-place-category="${escapeHtml(category)}"`))
              .join("")}
          </div>
        </div>
        ${
          activeSummary.length || hasSearch
            ? `
              <div class="active-filter-row">
                <span>${t("placesCurrentConditions")}</span>
                ${activeSummary.map((group) => `
                  <span class="condition-group">
                    <strong>${escapeHtml(group.label)}:</strong>
                    ${group.values.map((value) => `<span class="tag">${escapeHtml(value)}</span>`).join("")}
                  </span>
                `).join("")}
                ${hasSearch ? `<span class="tag">${t("placesConditionSearch")}: ${escapeHtml(rawQuery)}</span>` : ""}
                ${hasSearch ? `<button class="text-button" type="button" data-clear-place-search>${t("placesClearSearch")}</button>` : ""}
              </div>
            `
            : ""
        }
      </section>

      <div class="places-explorer" data-view="${mapView}">
      ${mapToolbar()}
      <div class="places-map-layout places-mvp-layout">
        <section class="surface places-list-panel">
          <div class="places-subhead">
            <h3>${hasSearch ? tf("placesSearchResultsFor", { query: rawQuery }) : t("placesForYou")}</h3>
            <span class="pill">${tf("placesCount", { count: visiblePlaces.length })}</span>
          </div>
          ${
            visiblePlaces.length
              ? `
                <div class="places-card-list">
                  ${visiblePlaces.map((place) => placeCard(place, selected && place.id === selected.id)).join("")}
                </div>
              `
              : `
                <div class="surface living-empty-state places-empty-state">
                  <strong>${escapeHtml(noResultMessage)}</strong>
                  <p>${t("placesEmptyHint")}</p>
                  <div class="button-row">
                    ${hasSearch ? `<button class="text-button" type="button" data-clear-place-search>${t("placesClearSearch")}</button>` : ""}
                    ${hasActiveFilters ? `<button class="text-button" type="button" data-clear-place-filters>${t("placesClearFilters")}</button>` : ""}
                  </div>
                </div>
              `
          }
        </section>
        ${mapPanel(visiblePlaces, selected)}
      </div>
      </div>

      ${detailPanel(selected)}
    </div>
  `, "places-page");
}
