import { state, PICTURE_ROOT } from '../state.js';
import { categoryIcons, categoryMap, placeCategories, placeExperienceFilters } from '../data.js';
import { t } from '../i18n.js';
import { pageShell, sectionHead } from '../components/layout.js';
import { filterChip } from '../components/cards.js';
import { buildGoogleMapsLocationUrl } from '../utils/maps.js';

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

function formatText(key, values = {}) {
  return Object.entries(values).reduce((text, [name, value]) => {
    return text.replaceAll(`{${name}}`, value);
  }, t(key));
}

function catalogIndex(place) {
  return state.catalogs.places.findIndex((item) => item.id === place?.id);
}

function placeImage(place, index = null) {
  const fallbackImages = ["037_place_01.png", "038_place_02.png", "039_place_03.png", "040_place_04.png", "041_place_05.png"];
  const fallbackIndex = Number.isInteger(index) ? index : catalogIndex(place);
  const safeIndex = fallbackIndex >= 0 ? fallbackIndex : 0;
  return `${PICTURE_ROOT}${place.image || fallbackImages[safeIndex % fallbackImages.length]}`;
}

function popoverVisual(place) {
  const categoryImageMap = {
    Cafe: "037_place_01.png",
    Bookstore: "038_place_02.png",
    "Flower Shop": "039_place_03.png",
    Park: "040_place_04.png",
    Museum: "041_place_05.png",
  };
  const expectedImage = categoryImageMap[place?.category];

  if (expectedImage && place?.image === expectedImage) {
    return `<img class="popover-place-image" src="${PICTURE_ROOT}${expectedImage}" alt="" />`;
  }

  return `
    <div class="popover-category-icon" aria-hidden="true">
      ${categoryIcons[place?.category] || "⌖"}
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
  return point ? formatText("placesDistanceFrom", { distance: place.distance, point }) : place.distance;
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
    ? `<div class="tag-row">${tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>`
    : "";
}

function reasonMarkup(place) {
  const reasons = asArray(place.whyRecommended || place.reason);
  return reasons.length
    ? `
      <ul class="place-reason-list">
        ${reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}
      </ul>
    `
    : `<p>${escapeHtml(place.reason || "Recommended for a gentle solo visit.")}</p>`;
}

function emptyMessage(rawQuery, hasSearch, hasCategoryLimit, activeExperiences) {
  if (hasSearch) return `No place found for “${escapeHtml(rawQuery)}”.`;
  if (hasCategoryLimit && activeExperiences.length) {
    return `No place found for ${escapeHtml(activeExperiences.join(", "))} in ${escapeHtml(state.selectedPlaceCategory)}.`;
  }
  if (hasCategoryLimit) return `No place found in ${escapeHtml(state.selectedPlaceCategory)}.`;
  if (activeExperiences.length) return `No place found for ${escapeHtml(activeExperiences.join(", "))}.`;
  return "No places available yet.";
}

function placeCard(place, index, selected) {
  const selectedClass = selected ? " is-selected" : "";
  return `
    <button class="mini-card place-pick places-mvp-card${selectedClass}" type="button" data-place="${escapeHtml(place.id)}">
      <img class="mini-thumb image-thumb" src="${placeImage(place, index)}" alt="" />
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
      <section class="map-panel product-map places-prototype-map ${areaClass(activeArea)}" aria-label="${escapeHtml(`${t("mapsPrototypeMap")} ${areaLabel(activeArea)}`)}">
        <img class="map-art" src="${PICTURE_ROOT}035_ui_map_panel.png" alt="" />
        ${mapBadges(activeArea)}
        <p class="map-disclosure">${t("mapsIllustrativeDisclosure")}</p>
        <article class="map-place-popover places-empty-popover">
          <div>
            <h3>${t("mapsUnavailable")}</h3>
            <p>${t("placesMapEmptyCopy")}</p>
          </div>
        </article>
      </section>
    `;
  }

  const selectedMapsUrl = mapUrlForPlace(selected);

  return `
    <section class="map-panel product-map places-prototype-map ${areaClass(activeArea)}" aria-label="${escapeHtml(`${t("mapsPrototypeMap")} ${areaLabel(activeArea)}`)}">
      <img class="map-art" src="${PICTURE_ROOT}035_ui_map_panel.png" alt="" />
      ${mapBadges(activeArea)}
      ${mapPlaces
        .map((place) => `
          <button class="map-pin place-pin ${selected && place.id === selected.id ? "is-selected" : ""}" type="button" data-place="${escapeHtml(place.id)}" style="${escapeHtml(pinStyle(place))}" aria-label="${escapeHtml(`${place.name}, ${areaLabel(place.area)}`)}">
            ${categoryIcons[place.category] || "⌖"}
          </button>
        `)
        .join("")}
      <p class="map-disclosure">${t("mapsIllustrativeDisclosure")}</p>
      ${
        selected
          ? `
            <article class="map-place-popover places-map-card">
              ${popoverVisual(selected)}
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
    </section>
  `;
}

function detailPanel(selected) {
  if (!selected) {
    return `
      <article class="surface place-detail-panel places-empty-detail">
        <p class="eyebrow">Place detail</p>
        <h2>Select a place</h2>
        <p>Choose a card to see why it might fit your solo day.</p>
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
        <img src="${placeImage(selected)}" alt="" />
      </div>
      <div class="places-detail-grid">
        <div>
          <strong>Opening hours</strong>
          <span>${escapeHtml(selected.openingHours || selected.hours || "Prototype hours")}</span>
        </div>
        <div>
          <strong>Price range</strong>
          <span>${escapeHtml(selected.priceRange || selected.budget || "Prototype price")}</span>
        </div>
      </div>
      <div class="places-detail-block">
        <strong>Experience tags</strong>
        ${tagMarkup(experienceTags)}
      </div>
      <div class="places-detail-block">
        <strong>Practical tags</strong>
        ${tagMarkup(practicalTags)}
      </div>
      <div class="places-detail-block">
        <strong>Why recommended</strong>
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
            ? `<button class="soft-button is-saved" type="button" disabled>Saved</button>`
            : `<button class="soft-button" type="button" data-save-place="${escapeHtml(selected.id)}">Save Place</button>`
        }
        ${
          addedToDraft
            ? `<button class="button is-saved" type="button" disabled>Added to HER Day</button>`
            : `<button class="button" type="button" data-add-place-day="${escapeHtml(selected.id)}">Add to HER Day</button>`
        }
        <button class="text-button" type="button" data-place-back>Back</button>
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
    hasCategoryLimit || activeExperiences.length ? { label: "Category", values: [state.selectedPlaceCategory] } : null,
    activeExperiences.length ? { label: "Experience", values: activeExperiences } : null,
  ].filter(Boolean);
  const noResultMessage = emptyMessage(rawQuery, hasSearch, hasCategoryLimit, activeExperiences);

  return pageShell(`
    ${sectionHead(
      "HER Places",
      "Find places where you can comfortably be yourself.",
      "Browse fictional prototype places by experience, category, or the kind of solo moment you want today."
    )}
    <div class="places-product places-mvp">
      <form class="search-bar places-search" data-place-search-form>
        <input type="search" name="placeSearch" value="${escapeHtml(state.placeSearch)}" placeholder="Search by place, area, experience, or mood" aria-label="Search places" />
        <button type="submit" aria-label="Search">⌕</button>
      </form>

      <section class="surface places-filter-panel">
        <div class="places-filter-head">
          <div>
            <p class="eyebrow">Experience filters</p>
            <h3>What kind of place feels right?</h3>
          </div>
          ${
            hasActiveFilters
              ? `<button class="text-button" type="button" data-clear-place-filters>Clear filters</button>`
              : ""
          }
        </div>
        <div class="filter-list horizontal places-experience-list">
          ${placeExperienceFilters
            .map((filter) => filterChip(filter, activeExperiences.includes(filter), `data-place-experience="${escapeHtml(filter)}"`))
            .join("")}
        </div>
        <div class="places-filter-group">
          <p class="eyebrow">Category filters</p>
          <div class="filter-list horizontal">
            ${placeCategories
              .map((category) => filterChip(category, category === state.selectedPlaceCategory, `data-place-category="${escapeHtml(category)}"`))
              .join("")}
          </div>
        </div>
        ${
          activeSummary.length || hasSearch
            ? `
              <div class="active-filter-row">
                <span>Current conditions</span>
                ${activeSummary.map((group) => `
                  <span class="condition-group">
                    <strong>${escapeHtml(group.label)}:</strong>
                    ${group.values.map((value) => `<span class="tag">${escapeHtml(value)}</span>`).join("")}
                  </span>
                `).join("")}
                ${hasSearch ? `<span class="tag">Search: ${escapeHtml(rawQuery)}</span>` : ""}
                ${hasSearch ? `<button class="text-button" type="button" data-clear-place-search>Clear Search</button>` : ""}
              </div>
            `
            : ""
        }
      </section>

      <div class="places-map-layout places-mvp-layout">
        <section class="surface places-list-panel">
          <div class="places-subhead">
            <h3>${hasSearch ? `Search results for “${escapeHtml(rawQuery)}”` : "Places for you"}</h3>
            <span class="pill">${visiblePlaces.length} places</span>
          </div>
          ${
            visiblePlaces.length
              ? `
                <div class="places-card-list">
                  ${visiblePlaces.map((place, index) => placeCard(place, index, selected && place.id === selected.id)).join("")}
                </div>
              `
              : `
                <div class="surface living-empty-state places-empty-state">
                  <strong>${noResultMessage}</strong>
                  <p>Try another keyword, category, or experience filter.</p>
                  <div class="button-row">
                    ${hasSearch ? `<button class="text-button" type="button" data-clear-place-search>Clear Search</button>` : ""}
                    ${hasActiveFilters ? `<button class="text-button" type="button" data-clear-place-filters>Clear filters</button>` : ""}
                  </div>
                </div>
              `
          }
        </section>
        ${mapPanel(visiblePlaces, selected)}
      </div>

      ${detailPanel(selected)}
    </div>
  `, "places-page");
}
