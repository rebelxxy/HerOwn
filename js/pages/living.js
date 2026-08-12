import { state } from '../state.js';
import { livingCategories } from '../data.js';
import { livingGuideField, t, tf } from '../i18n.js';
import { pageShell } from '../components/layout.js';
import { categoryButton } from '../components/cards.js';

const categoryKeyMap = {
  "Home Basics": "livingCategoryHomeBasics",
  "Money & Budget": "livingCategoryMoneyBudget",
  "Food & Health": "livingCategoryFoodHealth",
  Cleaning: "livingCategoryCleaning",
  Moving: "livingCategoryMoving",
  Emergency: "livingCategoryEmergency",
};

function htmlEscape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function categoryLabel(category) {
  return t(categoryKeyMap[category]) || category;
}

function guideTitle(guide) {
  return livingGuideField(guide, "title", guide.title || "");
}

function guideSummary(guide) {
  return livingGuideField(guide, "summary", guide.summary || guide.problem || "");
}

function guideRisk(guide) {
  return guide.riskLevel || guide.risk || "Low";
}

function guideRiskLabel(guide) {
  return t(`livingRisk${guideRisk(guide)}`) || guideRisk(guide);
}

function guideTime(guide) {
  const time = String(guide.time || "").trim();
  if (!time) return t("livingGuideFallback");
  if (/^immediate$/i.test(time)) return t("livingImmediate");
  const minutes = time.match(/^(\d+)\s*min$/i);
  if (minutes) return tf("livingMinutes", { count: minutes[1] });
  return time;
}

function guideDifficulty(guide) {
  const difficulty = String(guide.diy || "").trim().toLowerCase();
  const difficultyMap = {
    "limited": "livingDifficultyLimited",
    "admin only": "livingDifficultyAdminOnly",
    "observe only": "livingDifficultyObserveOnly",
    "yes": "livingDifficultyYes",
    "no forced entry": "livingDifficultyNoForcedEntry",
    "no": "livingDifficultyProfessionalOnly",
    "no wiring": "livingDifficultyNoWiring",
  };

  return t(difficultyMap[difficulty]) || guide.diy || guideRiskLabel(guide);
}

function guideBefore(guide) {
  return livingGuideField(guide, "before", guide.beforeYouStart || (guide.problem ? [guide.problem] : []));
}

function guideTools(guide) {
  return livingGuideField(guide, "tools", guide.tools || []);
}

function guideSteps(guide) {
  return livingGuideField(guide, "steps", guide.steps || []);
}

function guideStopHelp(guide) {
  return livingGuideField(guide, "stop", guide.stopAndAskForHelp || guide.warning || t("livingProfessionalWarning"));
}

function guidePhrases(guide) {
  return guide.japanesePhrases || guide.phrases || [];
}

function guideKeywords(guide) {
  return [
    ...(guide.keywords || []),
    ...livingGuideField(guide, "keywords", []),
  ];
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
    guideTitle(guide),
    guide.category,
    categoryLabel(guide.category),
    guideSummary(guide),
    ...guideKeywords(guide),
  ].join(" ").toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
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
  const progress = guideProgress(guide);
  return `
    <button class="guide-card living-guide-card" type="button" data-guide="${guide.id}">
      <div>
        <p class="eyebrow">${htmlEscape(categoryLabel(guide.category))}</p>
        <h3>${htmlEscape(guideTitle(guide))}</h3>
        <p>${htmlEscape(guideSummary(guide))}</p>
      </div>
      <div class="guide-meta">
        <span class="tag">${htmlEscape(t("livingRisk"))} ${htmlEscape(guideRiskLabel(guide))}</span>
        <span class="pill">${htmlEscape(guideTime(guide))}</span>
        ${progress.total && progress.completed ? `<span class="tag">${htmlEscape(progress.countLabel)}</span>` : ""}
        ${saved ? `<span class="score">${htmlEscape(t("livingSavedBadge"))}</span>` : ""}
      </div>
    </button>
  `;
}

function guideProgress(guide) {
  const total = guideSteps(guide).length;
  const completed = (state.livingStepProgress[guide.id] || []).filter((index) => index < total).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    percent,
    countLabel: total ? tf("livingProgressCount", { completed, total }) : t("livingProgressNoSteps"),
    percentLabel: total ? tf("livingProgressPercent", { percent }) : t("livingProgressNoSteps"),
    complete: total > 0 && completed === total,
  };
}

function renderLivingHome() {
  const filtered = getFilteredLivingGuides();
  const searchQuery = state.livingSearch.trim();
  const hasSearch = searchQuery.length > 0;
  const filterLabel = hasSearch ? tf("livingSearchResultsFor", { query: searchQuery }) : (state.selectedLivingCategory ? categoryLabel(state.selectedLivingCategory) : t("popularGuides"));
  const clearLabel = hasSearch ? t("livingClearSearch") : t("livingClearFilters");
  const countLabel = filtered.length === 1 ? t("livingGuideCountOne") : tf("livingGuideCount", { count: filtered.length });

  return `
    <div class="living-home-layout">
      <section class="surface living-search-panel">
        <form class="living-search-form" data-living-search-form>
          <label for="livingSearch">${htmlEscape(t("livingSearchLabel"))}</label>
          <div>
            <input id="livingSearch" name="livingSearch" value="${htmlEscape(state.livingSearch)}" placeholder="${htmlEscape(t("livingSearchPlaceholder"))}" autocomplete="off" />
            <button class="button" type="submit">${htmlEscape(t("livingSearchButton"))}</button>
          </div>
        </form>
      </section>

      <aside class="surface living-category-panel">
        <p class="eyebrow">${htmlEscape(t("livingScenes"))}</p>
        <div class="category-list">
          ${livingCategories
            .map((category) => categoryButton(
              htmlEscape(categoryLabel(category)),
              category === state.selectedLivingCategory,
              `data-living-category="${htmlEscape(category)}" aria-pressed="${category === state.selectedLivingCategory}"`
            ))
            .join("")}
        </div>
        ${state.selectedLivingCategory || hasSearch ? `<button class="text-button" type="button" data-clear-living-filters>${clearLabel}</button>` : ""}
      </aside>

      <section class="living-results-panel">
        <div class="section-head places-subhead">
          <div>
            <p class="eyebrow">${htmlEscape(filterLabel)}</p>
            <h3>${htmlEscape(filtered.length ? countLabel : t("livingNothingMatched"))}</h3>
          </div>
        </div>
        ${
          filtered.length
            ? `<div class="guide-grid living-guide-grid">${filtered.map(guideCard).join("")}</div>`
            : `
              <div class="surface living-empty-state">
                <strong>${htmlEscape(hasSearch ? tf("livingNoGuideFoundFor", { query: searchQuery }) : t("livingNoGuideFound"))}</strong>
                <p>${htmlEscape(t("livingNoResultsHint"))}</p>
                ${hasSearch ? `<button class="text-button" type="button" data-clear-living-filters>${htmlEscape(t("livingClearSearch"))}</button>` : ""}
              </div>
            `
        }
      </section>
    </div>
  `;
}

function checklistItem(guide, step, index) {
  const checked = state.livingStepProgress[guide.id]?.includes(index) || false;
  const id = `living-step-${guide.id}-${index}`;
  return `
    <label class="living-check-step ${checked ? "is-complete" : ""}" for="${htmlEscape(id)}">
      <input id="${htmlEscape(id)}" type="checkbox" data-living-step="${index}" ${checked ? "checked" : ""} />
      <span>
        <strong>${htmlEscape(tf("livingStepLabel", { number: index + 1 }))}</strong>
        ${htmlEscape(step)}
      </span>
    </label>
  `;
}

function renderGuideDetail(guide) {
  const saved = state.savedGuideIds.includes(guide.id);
  const warning = isProfessionalOnly(guide) ? t("livingProfessionalWarning") : guideStopHelp(guide);
  const steps = guideSteps(guide);
  const before = guideBefore(guide);
  const tools = guideTools(guide);
  const progress = guideProgress(guide);

  return `
    <article class="living-detail-view">
      <div class="surface living-detail-main">
        <button class="text-button" type="button" data-living-back>← ${htmlEscape(t("livingBack"))}</button>
        <div class="detail-heading">
          <p class="eyebrow">${htmlEscape(categoryLabel(guide.category))}</p>
          <h2>${htmlEscape(guideTitle(guide))}</h2>
          <p class="section-copy">${htmlEscape(guideSummary(guide))}</p>
          <div class="guide-meta">
            <span class="tag">${htmlEscape(t("livingRisk"))} ${htmlEscape(guideRiskLabel(guide))}</span>
            <span class="pill">${htmlEscape(guideTime(guide))}</span>
            <span class="score">HER Living</span>
          </div>
        </div>

        <section class="living-progress-summary ${progress.complete ? "is-complete" : ""}" aria-live="polite">
          <div>
            <strong>${htmlEscape(progress.countLabel)}</strong>
            <span>${htmlEscape(progress.complete ? t("livingProgressComplete") : progress.percentLabel)}</span>
          </div>
          <div class="living-progress-track" aria-hidden="true">
            <span style="width: ${progress.percent}%"></span>
          </div>
        </section>

        <section class="living-detail-section">
          <h3>${htmlEscape(t("livingBeforeStart"))}</h3>
          <div class="steps">
            ${before.length ? before.map((item) => `<div class="step"><span>${htmlEscape(item)}</span></div>`).join("") : `<div class="step"><span>${htmlEscape(t("livingNoChecklistCopy"))}</span></div>`}
          </div>
        </section>

        <section class="living-detail-section">
          <h3>${htmlEscape(t("livingInstructions"))}</h3>
          <div class="living-checklist">
            ${steps.length ? steps.map((step, index) => checklistItem(guide, step, index)).join("") : `
              <div class="surface living-empty-state">
                <strong>${htmlEscape(t("livingNoChecklistTitle"))}</strong>
                <p>${htmlEscape(t("livingNoChecklistCopy"))}</p>
              </div>
            `}
          </div>
        </section>

        <section class="living-detail-section">
          <h3>${htmlEscape(t("livingWhatYouNeed"))}</h3>
          <div class="guide-meta">
            ${tools.length ? tools.map((tool) => `<span class="pill">${htmlEscape(tool)}</span>`).join("") : `<span class="pill">${htmlEscape(t("livingNoTools"))}</span>`}
          </div>
        </section>

        <section class="living-detail-section warning-section">
          <h3>${htmlEscape(t("livingStopHelp"))}</h3>
          <p>${htmlEscape(warning)}</p>
        </section>

        ${
          guidePhrases(guide).length
            ? `
              <section class="living-detail-section">
                <h3>${htmlEscape(t("livingUsefulPhrases"))}</h3>
                <div class="steps living-phrase-list">
                  ${guidePhrases(guide).map((phrase, index) => `
                    <div class="step living-phrase-row">
                      <span>${htmlEscape(phrase)}</span>
                      <button class="soft-button living-phrase-play" type="button" data-living-play-phrase="${index}" aria-label="${htmlEscape(t("livingPlayPhrase"))}">
                        ${htmlEscape(t("safePlay"))}
                      </button>
                    </div>
                  `).join("")}
                </div>
              </section>
            `
            : ""
        }

        <div class="day-detail-actions">
          <button class="button living-save-button ${saved ? "is-saved" : ""}" type="button" data-save-guide="${guide.id}" aria-pressed="${saved}" ${saved ? "disabled aria-disabled=\"true\"" : ""}>${htmlEscape(saved ? t("livingSaved") : t("livingSaveGuide"))}</button>
          <button class="text-button" type="button" data-living-back>${htmlEscape(t("livingBack"))}</button>
        </div>
      </div>

      <aside class="surface living-detail-side">
        <p class="eyebrow">${htmlEscape(t("livingGuideFocus"))}</p>
        <h3>${htmlEscape(guideRiskLabel(guide))} ${htmlEscape(t("livingRisk"))}</h3>
        <p>${htmlEscape(guideSummary(guide))}</p>
        <div class="living-focus-rows">
          <div class="living-focus-row">
            <span>${htmlEscape(t("livingFocusTime"))}</span>
            <strong>${htmlEscape(guideTime(guide))}</strong>
          </div>
          <div class="living-focus-row">
            <span>${htmlEscape(t("livingFocusDifficulty"))}</span>
            <strong>${htmlEscape(guideDifficulty(guide))}</strong>
          </div>
          <div class="living-focus-row">
            <span>${htmlEscape(t("livingFocusRequiredItems"))}</span>
            <strong>${htmlEscape(tools.length ? tf("livingRequiredItemsCount", { count: tools.length }) : t("livingRequiredItemsNone"))}</strong>
          </div>
        </div>
        ${isProfessionalOnly(guide) ? `<div class="living-risk-note">${htmlEscape(t("livingProfessionalWarning"))}</div>` : ""}
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
        <p class="section-copy">${htmlEscape(t("livingSubtitle"))}</p>
      </div>
      <img src="images/living.png" alt="" />
    </div>
    ${activeGuide ? renderGuideDetail(activeGuide) : renderLivingHome()}
  `);
}
