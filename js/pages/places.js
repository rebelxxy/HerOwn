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
  const query = state.placeSearch.trim().toLowerCase();
  const filtered = places.filter((place) => {
    const matchesCategory = mappedCategory === "All" || mappedCategory === "More" || place.category === mappedCategory;
    const matchesSearch = !query || [place.name, place.category, place.area, place.address].join(" ").toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });
  const visiblePlaces = filtered.length ? filtered : places;
  if (!visiblePlaces.some((place) => place.id === state.selectedPlace)) {
    state.selectedPlace = visiblePlaces[0].id;
  }
  const selected = places.find((place) => place.id === state.selectedPlace);
  const saved = state.savedPlaces.includes(selected.id);
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
          ${visiblePlaces
            .map(
              (place, index) => `
                <button class="map-pin place-pin pin-${index % 8} ${place.id === selected.id ? "is-selected" : ""}" type="button" data-place="${place.id}" aria-label="${place.name}">
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
        </section>
      </div>
      <div class="section-head places-subhead">
        <h3>${t("topPicks")}</h3>
        <button class="text-button" type="button" data-place-category="All">${t("viewAll")} →</button>
      </div>
      <div class="mini-grid">
        ${visiblePlaces
          .slice(0, 3)
          .map(
            (place) => placePickCard(place, `${PICTURE_ROOT}${placeImageMap[places.indexOf(place) % placeImageMap.length]}`, {
              selected: place.id === selected.id,
              saved: state.savedPlaces.includes(place.id),
            })
          )
          .join("")}
      </div>
    </div>
  `);
}
