import { state, ASSET_ROOT, PICTURE_ROOT } from '../state.js';
import { t } from '../i18n.js';
import { pageShell } from '../components/layout.js';
import { featureActionCard, stepItem } from '../components/cards.js';

export function renderSafe() {
  const safetyGuides = state.catalogs.safetyGuides;
  const selected = safetyGuides.find((guide) => guide.id === state.selectedSafe) || safetyGuides[0];
  state.selectedSafe = selected.id;
  return pageShell(`
    <div class="safe-product-hero">
      <div>
        <p class="eyebrow">HER OWN</p>
        <h1 class="section-title">${t("safeTitle")}</h1>
        <p class="section-copy">${t("safeSubtitle")}</p>
      </div>
      <img class="safe-night-hero" src="${ASSET_ROOT}nightwalk.png" alt="" />
    </div>
    <div class="safe-action-grid">
      ${[
        ["006_feature_card_01.png", "Safety Guide", "Tips for everyday situations.", "safe"],
        ["007_feature_card_02.png", "Fake Call", "Get an incoming call when you need it.", "fakeCall"],
        ["008_feature_card_03.png", "SOS", "Send your location and get help.", "sos"],
        ["009_feature_card_04.png", "Nearby Help", "Police station, hospital and more.", "sos"],
      ].map(([image, title, copy, page]) => `
        ${featureActionCard(`${PICTURE_ROOT}${image}`, title, copy, page)}
      `).join("")}
    </div>
    <div class="safe-topics-layout">
      <section>
        <h3>${t("safetyTopics")}</h3>
        <div class="safe-grid compact-safe-grid">
          ${safetyGuides
            .map(
              (guide) => `
                <button class="safe-card ${selected.id === guide.id ? "is-selected" : ""}" type="button" data-safe="${guide.id}">
                  <span class="safe-icon">${guide.icon}</span>
                  <span>
                    <h3>${guide.title}</h3>
                    <p>${guide.subtitle}</p>
                  </span>
                  <span class="card-arrow">›</span>
                </button>
              `
            )
            .join("")}
        </div>
      </section>
      <article class="detail-panel safe-detail-panel">
        <p class="eyebrow">${selected.icon} ${selected.title}</p>
        <h2>Stay visible. Stay moving.</h2>
        <div class="steps">
          ${selected.steps
            .slice(0, 3)
            .map(([title, copy]) => stepItem(title, copy))
            .join("")}
        </div>
        <div class="phrase">${selected.phrase}</div>
      </article>
    </div>
  `);
}
