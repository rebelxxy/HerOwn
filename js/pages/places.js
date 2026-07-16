import { state, PICTURE_ROOT } from '../state.js';
import { placeCategories, categoryMap, categoryIcons } from '../data.js';
import { t } from '../i18n.js';
import { pageShell, sectionHead } from '../components/layout.js';
import { categoryButton, filterChip, placePickCard, scoreText } from '../components/cards.js';

export function renderPlaces() {
  const places = state.catalogs.places;
  const categoryImageMap = {
    All: "024_category_01.png",
    Cafe: "029_category_06.png",
    Bookstore: "030_category_07.png",
    Flower: "031_category_08.png",
    Park: "032_category_09.png",
    Gym: "033_category_10.png",
    More: "034_category_11.png",
  };
  const placeImageMap = ["037_place_01.png", "038_place_02.png", "039_place_03.png", "040_place_04.png", "041_place_05.png"];
  const mappedCategory = categoryMap[state.selectedPlaceCategory] || state.selectedPlaceCategory;
  const rawQuery = state.placeSearch.trim();
  const query = rawQuery.toLowerCase();
  const hasSearch = query.length > 0;
  const hasCategoryLimit = mappedCategory !== "All" && mappedCategory !== "More";
  const filtered = places.filter((place) => {
    const matchesCategory = mappedCategory === "All" || mappedCategory === "More" || place.category === mappedCategory;
    const matchesSearch = !query || [place.name, place.category, place.area, place.address].join(" ").toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });
  const visiblePlaces = filtered;
  let selected = visiblePlaces.find((place) => place.id === state.selectedPlace) || null;
  if (!selected && visiblePlaces.length) {
    state.selectedPlace = visiblePlaces[0].id;
    selected = visiblePlaces[0];
  }
  const saved = selected ? state.savedPlaces.includes(selected.id) : false;
  const emptyMessage = hasSearch
    ? `No place found for “${rawQuery}”.`
    : hasCategoryLimit
      ? `No place found in “${state.selectedPlaceCategory}”.`
      : "No places available yet.";
  return pageShell(`
    ${sectionHead(
      t("placesTitle"),
      t("placesSubtitle"),
      t("placesCopy")
    )}
    <div class="places-product">
      <form class="search-bar" data-place-search-form>
        <input type="search" name="placeSearch" value="${state.placeSearch}" placeholder="${t("searchPlaceholder")}" aria-label="Search places" />
        <button type="submit" aria-label="Search">⌕</button>
      </form>
      <div class="filter-list horizontal">
        ${placeCategories
          .map(
            (category) => filterChip(category, category === state.selectedPlaceCategory, `data-place-category="${category}"`)
          )
          .join("")}
      </div>
      <div class="places-map-layout">
        <aside class="surface side-filter">
          ${placeCategories
            .map(
              (category) => `
                ${categoryButton(category, category === state.selectedPlaceCategory, `data-place-category="${category}"`, `<img src="${PICTURE_ROOT}${categoryImageMap[category]}" alt="" />`)}
              `
            )
            .join("")}
        </aside>
        <section class="map-panel product-map" aria-label="HER Places map">
          <img class="map-art" src="${PICTURE_ROOT}035_ui_map_panel.png" alt="" />
          ${
            visiblePlaces.length
              ? `
                ${visiblePlaces
                  .map(
                    (place, index) => `
                      <button class="map-pin place-pin pin-${index % 8} ${selected && place.id === selected.id ? "is-selected" : ""}" type="button" data-place="${place.id}" aria-label="${place.name}">
                        ${categoryIcons[place.category === "Flower Shop" ? "Flower" : place.category] || "⌖"}
                      </button>
                    `
                  )
                  .join("")}
                <article class="map-place-popover">
                  <img class="popover-place-image" src="${PICTURE_ROOT}036_ui_flower_shop_card.png" alt="" />
                  <div>
                    <h3>${selected.name}</h3>
                    <p>${selected.category} · ${selected.distance}</p>
                    <div class="place-meta">
                      <span>${scoreText("Safe", selected.safe)}</span>
                      <span>${scoreText("Solo", selected.solo)}</span>
                    </div>
                  </div>
                  <button type="button" data-save-place="${selected.id}" aria-label="Save place">${saved ? "◆" : "◇"}</button>
                </article>
              `
              : `
                <article class="map-place-popover places-empty-popover">
                  <div>
                    <h3>${emptyMessage}</h3>
                    <p>Try another keyword or clear the current filter.</p>
                    ${hasSearch ? `<button class="text-button" type="button" data-clear-place-search>Clear Search</button>` : ""}
                    ${!hasSearch && hasCategoryLimit ? `<button class="text-button" type="button" data-place-category="All">Clear filter</button>` : ""}
                  </div>
                </article>
              `
          }
        </section>
      </div>
      <div class="section-head places-subhead">
        <h3>${t("topPicks")}</h3>
        <button class="text-button" type="button" data-place-category="All">${t("viewAll")} →</button>
      </div>
      ${
        visiblePlaces.length
          ? `
            <div class="mini-grid">
              ${visiblePlaces
                .slice(0, 3)
                .map(
                  (place) => placePickCard(place, `${PICTURE_ROOT}${placeImageMap[places.indexOf(place) % placeImageMap.length]}`, {
                    selected: selected ? place.id === selected.id : false,
                    saved: state.savedPlaces.includes(place.id),
                  })
                )
                .join("")}
            </div>
          `
          : `
            <div class="surface living-empty-state">
              <strong>${emptyMessage}</strong>
              <p>Try another keyword or clear the current filter.</p>
              <div class="button-row">
                ${hasSearch ? `<button class="text-button" type="button" data-clear-place-search>Clear Search</button>` : ""}
                ${!hasSearch && hasCategoryLimit ? `<button class="text-button" type="button" data-place-category="All">Clear filter</button>` : ""}
              </div>
            </div>
          `
      }
    </div>
  `);
}
