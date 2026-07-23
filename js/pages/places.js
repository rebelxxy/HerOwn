import { state, PICTURE_ROOT } from '../state.js';
import { categoryIcons, categoryMap, placeCategories, placeExperienceFilters } from '../data.js';
import { pageShell, sectionHead } from '../components/layout.js';
import { filterChip } from '../components/cards.js';

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

function placeImage(place, index) {
  const fallbackImages = ["037_place_01.png", "038_place_02.png", "039_place_03.png", "040_place_04.png", "041_place_05.png"];
  return `${PICTURE_ROOT}${place.image || fallbackImages[index % fallbackImages.length]}`;
}

function placeTags(place) {
  return [...asArray(place.experienceTags), ...asArray(place.practicalTags)];
}

function primaryTags(place) {
  return placeTags(place).slice(0, 3);
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
        <p>${escapeHtml(place.category)} · ${escapeHtml(place.area)} · ${escapeHtml(place.distance)}</p>
        <span>${escapeHtml(place.description || place.reason || "")}</span>
        ${tagMarkup(primaryTags(place))}
      </div>
      <span class="card-arrow">→</span>
    </button>
  `;
}

function mapPanel(visiblePlaces, selected) {
  if (!visiblePlaces.length) {
    return `
      <section class="map-panel product-map places-prototype-map" aria-label="HER Places prototype map">
        <img class="map-art" src="${PICTURE_ROOT}035_ui_map_panel.png" alt="" />
        <span class="prototype-badge">Prototype map</span>
        <article class="map-place-popover places-empty-popover">
          <div>
            <h3>No matching places on this prototype map.</h3>
            <p>Try clearing search or filters to see demo places again.</p>
          </div>
        </article>
      </section>
    `;
  }

  return `
    <section class="map-panel product-map places-prototype-map" aria-label="HER Places prototype map">
      <img class="map-art" src="${PICTURE_ROOT}035_ui_map_panel.png" alt="" />
      <span class="prototype-badge">Prototype map</span>
      ${visiblePlaces
        .map((place, index) => `
          <button class="map-pin place-pin pin-${index % 8} ${selected && place.id === selected.id ? "is-selected" : ""}" type="button" data-place="${escapeHtml(place.id)}" aria-label="${escapeHtml(place.name)}">
            ${categoryIcons[place.category] || "⌖"}
          </button>
        `)
        .join("")}
      ${
        selected
          ? `
            <article class="map-place-popover places-map-card">
              <img class="popover-place-image" src="${placeImage(selected, visiblePlaces.indexOf(selected))}" alt="" />
              <div>
                <h3>${escapeHtml(selected.name)}</h3>
                <p>${escapeHtml(selected.category)} · ${escapeHtml(selected.area)} · ${escapeHtml(selected.distance)}</p>
                ${tagMarkup(primaryTags(selected))}
              </div>
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

  return `
    <article class="surface place-detail-panel places-detail-panel">
      <div class="places-detail-head">
        <div>
          <p class="eyebrow">${escapeHtml(selected.category)} · ${escapeHtml(selected.area)} · ${escapeHtml(selected.distance)}</p>
          <h2>${escapeHtml(selected.name)}</h2>
          <p>${escapeHtml(selected.description || selected.reason || "")}</p>
        </div>
        <img src="${placeImage(selected, 0)}" alt="" />
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
          ? `<p class="prototype-note">Prototype data: this is a fictional demo place for product testing, not a verified real-world safety claim.</p>`
          : ""
      }
      <div class="day-detail-actions places-detail-actions">
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
