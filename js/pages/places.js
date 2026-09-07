import { state, PICTURE_ROOT } from '../state.js';
import { categoryIcons, categoryMap, placeCategories, placeExperienceFilters } from '../data.js';
import { labelFor, t, tf } from '../i18n.js';
import { pageShell } from '../components/layout.js';
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
        <img src="${placeImage(selected)}" alt="" />
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
        <h1 class="section-title">${t("placesTitle")}</h1>
        <p class="section-copy">${t("placesHeroCopy")}</p>
        <p class="product-hero-note">${t("placesHeroNote")}</p>
      </div>
      <img src="images/herplace.png" alt="" />
    </div>
    <div class="places-product places-mvp">
      <form class="search-bar places-search" data-place-search-form>
        <input type="search" name="placeSearch" value="${escapeHtml(state.placeSearch)}" placeholder="${t("placesSearchPlaceholder")}" aria-label="${t("placesSearchA11y")}" />
        <button type="submit" aria-label="${t("placesSearchA11y")}">⌕</button>
      </form>

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
                  ${visiblePlaces.map((place, index) => placeCard(place, index, selected && place.id === selected.id)).join("")}
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

      ${detailPanel(selected)}
    </div>
  `, "places-page");
}
