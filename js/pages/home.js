import { state, ASSET_ROOT, PICTURE_ROOT } from '../state.js';
import { daySuggestions } from '../data.js';
import { t } from '../i18n.js';

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function greetingKey() {
  const hour = new Date().getHours();
  if (hour < 12) return "homeGoodMorning";
  if (hour < 18) return "homeGoodAfternoon";
  return "homeGoodEvening";
}

function formatBudget(value) {
  const amount = Number.parseInt(String(value || "").replace(/[^\d]/g, ""), 10);
  if (!amount) return escapeHtml(value || "");
  return `¥${amount.toLocaleString("en-US")}`;
}

function homeDuration(value) {
  const durationMap = {
    "2h": t("homeAboutTwoHours"),
    "Half day": t("homeAboutThreeHours"),
    "Full day": t("homeAboutFiveHours"),
  };
  return durationMap[value] || escapeHtml(value || "");
}

function stopCountLabel(count) {
  return `${count} ${t(count === 1 ? "homeStopSingular" : "homeStopPlural")}`;
}

function welcomeMarkup() {
  return escapeHtml(t("homeWelcome")).replace(/\s+/, "<br />");
}

function firstTodaySuggestion() {
  return daySuggestions.find((suggestion) => suggestion.id === "gentle-kichijoji-reset") || daySuggestions[0];
}

function savedOrSuggestedPlace() {
  const places = state.catalogs.places || [];
  const savedPlace = places.find((place) => state.savedPlaces?.includes(place.id));
  return savedPlace || places.find((place) => place.experienceTags?.includes("Women-friendly")) || places[0];
}

function livingPreviewGuide() {
  const guides = state.catalogs.livingGuides || [];
  const progressGuideId = Object.keys(state.livingStepProgress || {})[0];
  return guides.find((guide) => guide.id === progressGuideId) || guides.find((guide) => guide.id === "washing-machine-drain") || guides[0];
}

function renderGoIntent() {
  return `
    <article class="surface home-intent-card home-intent-card-primary">
      <div>
        <h2>${t("homeIntentGoTitle")}</h2>
        <p>${t("homeIntentGoCopy")}</p>
      </div>
      <div class="home-choice-list">
        <button class="soft-button home-choice-button" type="button" data-page="day">
          <span>HER Day</span>
          <small>${t("homeIntentDayChoice")}</small>
        </button>
        <button class="soft-button home-choice-button" type="button" data-page="places">
          <span>HER Places</span>
          <small>${t("homeIntentPlacesChoice")}</small>
        </button>
      </div>
    </article>
  `;
}

function renderIntentCard(title, copy, cta, page) {
  return `
    <article class="surface home-intent-card">
      <div>
        <h2>${title}</h2>
        <p>${copy}</p>
      </div>
      <button class="text-button" type="button" data-page="${page}">${cta} →</button>
    </article>
  `;
}

function renderTodayCard() {
  const draft = state.currentDayDraft;
  if (draft) {
    const count = draft.stops?.length || state.dayPlan?.length || 0;
    return `
      <section class="home-today-section" aria-label="${t("homeContinueDay")}">
        <p class="eyebrow">${t("homeContinueDay")}</p>
        <article class="surface home-today-card is-draft">
          <div>
            <h2>${escapeHtml(draft.title || "My HER Day")}</h2>
            <p>${t("homeDraftCopy")}</p>
            <div class="home-meta-row">
              <span class="pill">${stopCountLabel(count)}</span>
              <span class="pill">${escapeHtml(draft.duration || state.dayTime)}</span>
              <span class="pill">${escapeHtml(draft.area || state.dayArea)}</span>
            </div>
          </div>
          <button class="button" type="button" data-page="day">${t("homeContinuePlanning")}</button>
        </article>
      </section>
    `;
  }

  const suggestion = firstTodaySuggestion();
  return `
    <section class="home-today-section" aria-label="${t("homeForToday")}">
      <p class="eyebrow">${t("homeForToday")}</p>
      <article class="surface home-today-card">
        <div>
          <h2>${t("homeSuggestionTitle")}</h2>
          <p>${t("homeSuggestionCopy")}</p>
          <div class="home-meta-row">
            <span class="pill">${homeDuration(suggestion?.duration)}</span>
            <span class="pill">${formatBudget(suggestion?.budget)}</span>
            ${(suggestion?.includes || []).slice(0, 2).map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join("")}
          </div>
        </div>
        <button class="button" type="button" data-page="day">${t("homeMakeDay")}</button>
      </article>
    </section>
  `;
}

function renderLittleEasier() {
  const guide = livingPreviewGuide();
  const place = savedOrSuggestedPlace();
  const hasProgress = Boolean(Object.keys(state.livingStepProgress || {}).length);
  const placeTags = (place?.experienceTags || place?.practicalTags || []).slice(0, 3);

  return `
    <section class="home-easier-section" aria-label="${t("homeEasierTitle")}">
      <div class="home-section-head">
        <p class="eyebrow">${t("homeEasierTitle")}</p>
      </div>
      <div class="home-editorial-grid">
        <article class="surface home-editorial-card">
          <p class="eyebrow">${t("homeLivingEyebrow")}</p>
          <h3>${hasProgress ? t("homeLivingProgressTitle") : t("homeLivingTitle")}</h3>
          <p>${hasProgress ? t("homeLivingProgressCopy") : escapeHtml(guide?.summary || t("homeLivingDefaultCopy"))}</p>
          <button class="text-button" type="button" data-page="living">${t("homeOpenLiving")} →</button>
        </article>

        <article class="surface home-editorial-card">
          <p class="eyebrow">${t("homePlacesEyebrow")}</p>
          <h3>${escapeHtml(place?.name || t("homePlacesTitle"))}</h3>
          <p>${escapeHtml(place?.reason || place?.description || t("homePlacesDefaultCopy"))}</p>
          ${place ? `<img class="home-place-thumb" src="${PICTURE_ROOT}${escapeHtml(place.image || "037_place_01.png")}" alt="" />` : ""}
          <div class="home-tag-row">
            ${placeTags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
          </div>
          <button class="text-button" type="button" data-page="places">${t("homeOpenPlaces")} →</button>
        </article>

        <article class="surface home-editorial-card">
          <p class="eyebrow">${t("homeSafeEyebrow")}</p>
          <h3>${t("homeSafeTitle")}</h3>
          <p>${t("homeSafeCopy")}</p>
          <button class="text-button" type="button" data-page="safe">${t("homeOpenSafe")} →</button>
        </article>
      </div>
    </section>
  `;
}

export function renderHome() {
  return `
    <section class="page hero home-hero" aria-label="${t("navHome")}">
      <div class="hero-inner">
        <div class="hero-copy home-hero-copy-v2">
          <p class="eyebrow">${t(greetingKey())}</p>
          <h1>${welcomeMarkup()}</h1>
          <p class="home-hero-question">${t("homeNeedToday")}</p>
        </div>
        <img class="hero-illustration" src="${ASSET_ROOT}hero.png" alt="" />
      </div>
    </section>

    <section class="page section compact home-page">
      <section class="home-intent-grid" aria-label="${t("homeIntentLabel")}">
        ${renderGoIntent()}
        ${renderIntentCard(t("homeIntentLivingTitle"), t("homeIntentLivingCopy"), t("homeIntentLivingCta"), "living")}
        ${renderIntentCard(t("homeIntentSafeTitle"), t("homeIntentSafeCopy"), t("homeIntentSafeCta"), "safe")}
      </section>

      ${renderTodayCard()}
      ${renderLittleEasier()}

      <section class="home-brand-moment" aria-label="${t("homeBrandLabel")}">
        <div class="home-brand-copy">
          <p class="eyebrow">${t("homeBrandLabel")}</p>
          <blockquote>${t("homeBrandLine1")}<br />${t("homeBrandLine2")}</blockquote>
        </div>
        <div class="home-brand-sketch" aria-hidden="true">
          <span class="home-sketch-window"></span>
          <span class="home-sketch-line"></span>
          <span class="home-sketch-note home-sketch-note-room">${t("homeBrandRoom")}</span>
          <span class="home-sketch-note home-sketch-note-city">${t("homeBrandCity")}</span>
        </div>
      </section>
    </section>
  `;
}
