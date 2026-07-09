import { state, ASSET_ROOT, PICTURE_ROOT } from '../state.js';
import { t } from '../i18n.js';
import { sectionHead } from '../components/layout.js';
import { featureMiniCard, placeMiniCard } from '../components/cards.js';

export function renderHome() {
  const places = state.catalogs.places;
  const placeImages = ["037_place_01.png", "038_place_02.png", "039_place_03.png", "040_place_04.png"];
  const hotPlaces = places.slice(0, 3)
    .map((place) => placeMiniCard(place, `${PICTURE_ROOT}${placeImages[places.indexOf(place) % placeImages.length]}`))
    .join("");

  return `
    <section class="page hero">
      <div class="hero-inner">
        <div class="hero-copy">
          <h1>${t("heroTitle")}</h1>
          <p class="hero-tagline">${t("heroLine1")}<br />${t("heroLine2")}</p>
          <p class="hero-subtitle">
            ${t("heroSubtitle")}
          </p>
          <div class="hero-actions">
            <button class="button" type="button" data-page="auth">${t("getStarted")} <span aria-hidden="true">→</span></button>
          </div>
        </div>
        <img class="hero-illustration" src="${ASSET_ROOT}hero.png" alt="" />
      </div>
      <div class="hero-strip">
        <div class="mini-grid feature-mini-grid">
          ${[
            [t("safeCard"), t("safeCardCopy"), "safe", "006_feature_card_01.png"],
            [t("placesCard"), t("placesCardCopy"), "places", "007_feature_card_02.png"],
            [t("dayCard"), t("dayCardCopy"), "day", "008_feature_card_03.png"],
            [t("livingCard"), t("livingCardCopy"), "living", "009_feature_card_04.png"],
            [t("assistantName"), t("assistantCardCopy"), "safe", "005_large_woman_phone_avatar.png"],
          ]
            .map(
              ([title, copy, page, image]) => featureMiniCard(title, copy, page, `${PICTURE_ROOT}${image}`)
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="page section compact">
      ${sectionHead(
        t("popularNearby"),
        t("gentlePlaces"),
        t("placesCopy"),
        `<button class="text-button" type="button" data-page="places">${t("viewAll")} →</button>`
      )}
      <div class="mini-grid">${hotPlaces}</div>
    </section>
  `;
}
