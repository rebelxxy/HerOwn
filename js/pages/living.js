import { state, PICTURE_ROOT } from '../state.js';
import { livingCategories } from '../data.js';
import { t } from '../i18n.js';
import { pageShell } from '../components/layout.js';
import { categoryButton, stepItem } from '../components/cards.js';

export function renderLiving() {
  const livingGuides = state.catalogs.livingGuides;
  let filtered = livingGuides.filter((guide) => guide.category === state.selectedLivingCategory);
  if (filtered.length === 0) {
    state.selectedLivingCategory = livingGuides[0].category;
    filtered = livingGuides.filter((guide) => guide.category === state.selectedLivingCategory);
  }
  const selected = livingGuides.find((guide) => guide.id === state.selectedGuide) || filtered[0];
  if (!filtered.some((guide) => guide.id === selected.id)) {
    state.selectedGuide = filtered[0].id;
  }
  const activeGuide = livingGuides.find((guide) => guide.id === state.selectedGuide);
  return pageShell(`
    <div class="living-head-product">
      <div>
        <p class="eyebrow">HER OWN</p>
        <h1 class="section-title">${t("livingTitle")}</h1>
        <p class="section-copy">${t("livingSubtitle")}</p>
      </div>
      <img src="${PICTURE_ROOT}004_large_laundry_room.png" alt="" />
    </div>
    <div class="living-layout">
      <aside class="surface">
        <p class="eyebrow">Categories</p>
        <div class="category-list">
          ${livingCategories
            .map(
              (category) => categoryButton(category, category === state.selectedLivingCategory, `data-living-category="${category}"`)
            )
            .join("")}
        </div>
      </aside>
      <section class="guide-grid">
        ${filtered
          .map(
            (guide) => `
              <button class="guide-card ${guide.id === state.selectedGuide ? "is-selected" : ""}" type="button" data-guide="${guide.id}">
                <h3>${guide.title}</h3>
                <p>${guide.problem}</p>
                <div class="guide-meta">
                  <span class="tag">Risk ${guide.risk}</span>
                  <span class="pill">${guide.time}</span>
                  <span class="score">DIY ${guide.diy}</span>
                </div>
              </button>
            `
          )
          .join("")}
      </section>
      <article class="detail-panel">
        <p class="eyebrow">${activeGuide.category}</p>
        <h2 style="margin:0 0 12px;">${activeGuide.title}</h2>
        <p class="section-copy" style="margin:0 0 16px;">${activeGuide.problem}</p>
        <div class="guide-meta">
          <span class="tag">Risk ${activeGuide.risk}</span>
          <span class="pill">${activeGuide.time}</span>
          <span class="score">Can I do it myself? ${activeGuide.diy}</span>
        </div>
        <div class="steps">
          ${stepItem("What you need", activeGuide.tools.join(", "))}
          ${activeGuide.steps.map((step, index) => stepItem(`Step ${index + 1}`, step)).join("")}
          ${stepItem("When to call a professional", activeGuide.warning)}
          ${stepItem("Useful Japanese phrases", activeGuide.phrases.join(" / "))}
        </div>
      </article>
    </div>
  `);
}
