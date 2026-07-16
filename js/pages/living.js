import { state, PICTURE_ROOT } from '../state.js';
import { livingCategories } from '../data.js';
import { pageShell } from '../components/layout.js';
import { categoryButton } from '../components/cards.js';

const PROFESSIONAL_WARNING = "Stop and contact your landlord, building management, utility company, or emergency service.";

function guideSummary(guide) {
  return guide.summary || guide.problem || "";
}

function guideRisk(guide) {
  return guide.riskLevel || guide.risk || "Low";
}

function guideBefore(guide) {
  return guide.beforeYouStart || (guide.problem ? [guide.problem] : []);
}

function guideTools(guide) {
  return guide.tools || [];
}

function guideSteps(guide) {
  return guide.steps || [];
}

function guideStopHelp(guide) {
  return guide.stopAndAskForHelp || guide.warning || PROFESSIONAL_WARNING;
}

function guidePhrases(guide) {
  return guide.japanesePhrases || guide.phrases || [];
}

function guideKeywords(guide) {
  return guide.keywords || [];
}

function isProfessionalOnly(guide) {
  const text = [
    guide.title,
    guide.category,
    guideSummary(guide),
    guideStopHelp(guide),
    ...guideKeywords(guide),
  ].join(" ").toLowerCase();

  return ["electricity", "gas", "major water leakage", "fire", "dangerous appliance fault", "breaker", "burning", "sparks"].some((term) => text.includes(term));
}

function matchesSearch(guide, query) {
  if (!query) return true;
  const haystack = [
    guide.title,
    guide.category,
    guideSummary(guide),
    ...guideKeywords(guide),
  ].join(" ").toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export function getLivingGuide(id = state.selectedGuide) {
  return state.catalogs.livingGuides.find((guide) => guide.id === id) || null;
}

export function getFilteredLivingGuides() {
  return state.catalogs.livingGuides.filter((guide) => {
    const categoryMatch = !state.selectedLivingCategory || guide.category === state.selectedLivingCategory;
    return categoryMatch && matchesSearch(guide, state.livingSearch.trim());
  });
}

function guideCard(guide) {
  const saved = state.savedGuideIds.includes(guide.id);
  return `
    <button class="guide-card living-guide-card" type="button" data-guide="${guide.id}">
      <div>
        <p class="eyebrow">${guide.category}</p>
        <h3>${guide.title}</h3>
        <p>${guideSummary(guide)}</p>
      </div>
      <div class="guide-meta">
        <span class="tag">Risk ${guideRisk(guide)}</span>
        <span class="pill">${guide.time || "Guide"}</span>
        ${saved ? `<span class="score">Saved</span>` : ""}
      </div>
    </button>
  `;
}

function renderLivingHome() {
  const filtered = getFilteredLivingGuides();
  const searchQuery = state.livingSearch.trim();
  const hasSearch = searchQuery.length > 0;
  const filterLabel = hasSearch ? `Search results for “${searchQuery}”` : state.selectedLivingCategory || "Popular Guides";
  const clearLabel = hasSearch ? "Clear Search" : "Clear filters";

  return `
    <div class="living-home-layout">
      <section class="surface living-search-panel">
        <form class="living-search-form" data-living-search-form>
          <label for="livingSearch">What do you need help with?</label>
          <div>
            <input id="livingSearch" name="livingSearch" value="${state.livingSearch}" placeholder="washing machine, electricity, toilet, hospital..." autocomplete="off" />
            <button class="button" type="submit">Search</button>
          </div>
        </form>
      </section>

      <aside class="surface living-category-panel">
        <p class="eyebrow">Scenes</p>
        <div class="category-list">
          ${livingCategories
            .map((category) => categoryButton(category, category === state.selectedLivingCategory, `data-living-category="${category}"`))
            .join("")}
        </div>
        ${state.selectedLivingCategory || hasSearch ? `<button class="text-button" type="button" data-clear-living-filters>${clearLabel}</button>` : ""}
      </aside>

      <section class="living-results-panel">
        <div class="section-head places-subhead">
          <div>
            <p class="eyebrow">${filterLabel}</p>
            <h3>${filtered.length ? `${filtered.length} guides ready` : "Nothing matched yet"}</h3>
          </div>
        </div>
        ${
          filtered.length
            ? `<div class="guide-grid living-guide-grid">${filtered.map(guideCard).join("")}</div>`
            : `
              <div class="surface living-empty-state">
                <strong>${hasSearch ? `No guide found for “${searchQuery}”.` : "No guide found."}</strong>
                <p>Try words like washing machine, electricity, toilet, hospital, moving, rent, or cleaning.</p>
                ${hasSearch ? `<button class="text-button" type="button" data-clear-living-filters>Clear Search</button>` : ""}
              </div>
            `
        }
      </section>
    </div>
  `;
}

function checklistItem(guide, step, index) {
  const checked = state.livingStepProgress[guide.id]?.includes(index) || false;
  return `
    <label class="living-check-step">
      <input type="checkbox" data-living-step="${index}" ${checked ? "checked" : ""} />
      <span>
        <strong>Step ${index + 1}</strong>
        ${step}
      </span>
    </label>
  `;
}

function renderGuideDetail(guide) {
  const saved = state.savedGuideIds.includes(guide.id);
  const warning = isProfessionalOnly(guide) ? PROFESSIONAL_WARNING : guideStopHelp(guide);

  return `
    <article class="living-detail-view">
      <div class="surface living-detail-main">
        <button class="text-button" type="button" data-living-back>← Back to HER Living</button>
        <div class="detail-heading">
          <p class="eyebrow">${guide.category}</p>
          <h2>${guide.title}</h2>
          <p class="section-copy">${guideSummary(guide)}</p>
          <div class="guide-meta">
            <span class="tag">Risk ${guideRisk(guide)}</span>
            <span class="pill">${guide.time || "Guide"}</span>
            <span class="score">HER Living</span>
          </div>
        </div>

        <section class="living-detail-section">
          <h3>Before You Start</h3>
          <div class="steps">
            ${guideBefore(guide).map((item) => `<div class="step"><span>${item}</span></div>`).join("")}
          </div>
        </section>

        <section class="living-detail-section">
          <h3>Step-by-step instructions</h3>
          <div class="living-checklist">
            ${guideSteps(guide).map((step, index) => checklistItem(guide, step, index)).join("")}
          </div>
        </section>

        <section class="living-detail-section">
          <h3>What You Need</h3>
          <div class="guide-meta">
            ${guideTools(guide).map((tool) => `<span class="pill">${tool}</span>`).join("")}
          </div>
        </section>

        <section class="living-detail-section warning-section">
          <h3>When to Stop and Ask for Help</h3>
          <p>${warning}</p>
        </section>

        ${
          guidePhrases(guide).length
            ? `
              <section class="living-detail-section">
                <h3>Useful Japanese phrases</h3>
                <div class="steps">
                  ${guidePhrases(guide).map((phrase) => `<div class="step"><span>${phrase}</span></div>`).join("")}
                </div>
              </section>
            `
            : ""
        }

        <div class="day-detail-actions">
          <button class="button ${saved ? "is-saved" : ""}" type="button" data-save-guide="${guide.id}" ${saved ? "disabled aria-disabled=\"true\"" : ""}>${saved ? "Saved" : "Save Guide"}</button>
          <button class="text-button" type="button" data-living-back>Back to HER Living</button>
        </div>
      </div>

      <aside class="surface living-detail-side">
        <p class="eyebrow">Guide Focus</p>
        <h3>${guideRisk(guide)} risk</h3>
        <p>${guideSummary(guide)}</p>
        ${isProfessionalOnly(guide) ? `<div class="living-risk-note">${PROFESSIONAL_WARNING}</div>` : ""}
      </aside>
    </article>
  `;
}

export function renderLiving() {
  const activeGuide = getLivingGuide();

  return pageShell(`
    <div class="living-head-product">
      <div>
        <p class="eyebrow">HER OWN</p>
        <h1 class="section-title">HER Living</h1>
        <p class="section-copy">Practical guides for independent living.</p>
      </div>
      <img src="${PICTURE_ROOT}004_large_laundry_room.png" alt="" />
    </div>
    ${activeGuide ? renderGuideDetail(activeGuide) : renderLivingHome()}
  `);
}
